import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType, CSSProperties, FormEvent } from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, Box, Castle, Check, CheckCircle2,
  ChevronDown, ChevronRight, Compass, Copy, Download, Dices, Flag, Info,
  Layers3, LockKeyhole, Map, MapPin, MoreHorizontal, Mountain, Pickaxe, Plus,
  RotateCcw, Search, Settings2, Shield, ShieldCheck, Sparkles, Swords, Target, Trash2,
  Trophy, Upload, Wheat, X,
} from 'lucide-react';
import { CATEGORIES, TIERS, WHEEL_CHALLENGES } from './content';
import { isTierUnlocked, nextGoal, tierStats } from './progression';
import { downloadBackup, loadWorld, NEW_WORLD, saveWorld, validateBackup } from './store';
import type { AppState, Category, Dimension, MapLocation, Objective, Tier, View, WheelChallenge } from './types';

type SimpleIcon = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
const CATEGORY_ICONS: Record<Category, SimpleIcon> = {
  build: Castle, farm: Wheat, explore: Compass, boss: Swords, achievement: Trophy,
};
const NAV: { id: View; label: string; caption: string; icon: SimpleIcon }[] = [
  { id: 'overview', label: 'Visão geral', caption: 'Seu mundo', icon: Layers3 },
  { id: 'journey', label: 'Jornada', caption: 'Objetivos', icon: Target },
  { id: 'atlas', label: 'Atlas', caption: 'Coordenadas', icon: Map },
  { id: 'wheel', label: 'Roleta', caption: 'Desafios', icon: Dices },
  { id: 'rules', label: 'Regras', caption: 'Como jogar', icon: BookOpen },
];
const DIMENSIONS: Record<Dimension, string> = { overworld: 'Overworld', nether: 'Nether', end: 'End' };
const KIND_LABELS: Record<MapLocation['kind'], string> = {
  base: 'Base', farm: 'Fazenda', portal: 'Portal', structure: 'Estrutura', other: 'Ponto de interesse',
};
const KIND_ICONS: Record<MapLocation['kind'], string> = { base: '⌂', farm: '✿', portal: '◇', structure: '▣', other: '✧' };

function formatDate(time: number) { return new Date(time).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }); }
function formatCoords(location: MapLocation) { return `${location.x}, ${location.y}, ${location.z}`; }
function randomIndex(max: number): number {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return value[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function CategoryIcon({ category, size = 18 }: { category: Category; size?: number }) {
  const Icon = CATEGORY_ICONS[category]; return <Icon size={size} strokeWidth={2} />;
}
function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return <div className={`progress-track ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
    <div className="progress-fill" style={{ width: `${value}%` }} />
  </div>;
}
function EraNumber({ tier }: { tier: Tier }) {
  return <span className={`era-number theme-${tier.theme}`}>{String(tier.id).padStart(2, '0')}</span>;
}
function PixelScene() {
  return <div className="pixel-scene" aria-hidden="true">
    <div className="pixel-orbit orbit-one" /><div className="pixel-orbit orbit-two" />
    <div className="pixel-sun" /><div className="pixel-cloud cloud-a" /><div className="pixel-cloud cloud-b" />
    <div className="scene-mountain mountain-back" /><div className="scene-mountain mountain-front" />
    <div className="pixel-tree tree-one"><span /><i /></div>
    <div className="pixel-tree tree-two"><span /><i /></div>
    <div className="pixel-grass" />
    <div className="pixel-house"><div className="pixel-roof" /><div className="pixel-window" /><div className="pixel-door" /></div>
    <div className="scene-sparkle sparkle-one">✦</div><div className="scene-sparkle sparkle-two">✦</div>
  </div>;
}

function LocationModal({ onClose, onAdd }: { onClose: () => void; onAdd: (location: MapLocation) => void }) {
  const [name, setName] = useState('');
  const [x, setX] = useState('');
  const [y, setY] = useState('64');
  const [z, setZ] = useState('');
  const [dimension, setDimension] = useState<Dimension>('overworld');
  const [kind, setKind] = useState<MapLocation['kind']>('other');
  const [notes, setNotes] = useState('');
  const valid = name.trim().length > 0 && [x, y, z].every((value) => value.trim() !== '' && Number.isFinite(Number(value)) && /^-?\d+$/.test(value.trim()));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    onAdd({ id: crypto.randomUUID(), name: name.trim().slice(0, 90), x: Number(x), y: Number(y), z: Number(z),
      dimension, kind, notes: notes.trim().slice(0, 700), createdAt: Date.now() });
  };
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="location-title">
      <div className="modal-head"><div><span className="eyebrow">ATLAS DO MUNDO</span><h2 id="location-title">Novo local</h2></div><button className="icon-button" aria-label="Fechar" onClick={onClose}><X size={20} /></button></div>
      <form onSubmit={submit} className="modal-body form-stack">
        <label>Nome do local<input autoFocus maxLength={90} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Castelo da montanha" required /></label>
        <div className="form-row">
          <label>Dimensão<select value={dimension} onChange={(event) => setDimension(event.target.value as Dimension)}><option value="overworld">Overworld</option><option value="nether">Nether</option><option value="end">End</option></select></label>
          <label>Tipo<select value={kind} onChange={(event) => setKind(event.target.value as MapLocation['kind'])}><option value="base">Base</option><option value="farm">Fazenda</option><option value="portal">Portal</option><option value="structure">Estrutura</option><option value="other">Ponto de interesse</option></select></label>
        </div>
        <div className="form-row coordinates"><label>X<input type="number" step="1" value={x} onChange={(event) => setX(event.target.value)} placeholder="120" required /></label><label>Y<input type="number" step="1" value={y} onChange={(event) => setY(event.target.value)} required /></label><label>Z<input type="number" step="1" value={z} onChange={(event) => setZ(event.target.value)} placeholder="-350" required /></label></div>
        <label>Observações <small>(opcional)</small><textarea rows={3} maxLength={700} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Como chegar, materiais ou o que fazer aqui..." /></label>
        <button className="button primary full-width" disabled={!valid} type="submit"><MapPin size={18} /> Salvar no Atlas</button>
      </form>
    </section>
  </div>;
}

function SettingsModal({ world, onChange, onReset, onImport, onClose, notify }: {
  world: AppState; onChange: (patch: Partial<AppState>) => void; onReset: () => void;
  onImport: (value: AppState) => void; onClose: () => void; notify: (message: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const importFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const contents = await file.text();
      const data = validateBackup(JSON.parse(contents) as unknown);
      if (!window.confirm(`Substituir o mundo atual pelo backup de "${data.worldName}"?`)) return;
      onImport(data);
      onClose(); notify('Backup importado com sucesso.');
    } catch (error) { notify(error instanceof Error ? error.message : 'Não foi possível importar o backup.'); }
    finally { if (fileRef.current) fileRef.current.value = ''; }
  };
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="modal-head"><div><span className="eyebrow">PREFERÊNCIAS</span><h2 id="settings-title">Configurações</h2></div><button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={20} /></button></div>
      <div className="modal-body form-stack">
        <label>Nome do mundo<input maxLength={80} value={world.worldName} onChange={(event) => onChange({ worldName: event.target.value })} /></label>
        <label>Seed do mundo <small>(opcional)</small><input maxLength={100} value={world.seed} onChange={(event) => onChange({ seed: event.target.value })} placeholder="Cole sua seed aqui" /></label>
        <div className="field-title">MODO DE PROGRESSÃO</div>
        <div className="setting-choices">
          <button type="button" className={`setting-choice ${world.difficulty === 'guided' ? 'active' : ''}`} onClick={() => onChange({ difficulty: 'guided' })}>
            <Compass size={20} /><span><strong>Livre</strong><small>Explore qualquer era. Você decide quando seguir as regras.</small></span><Check size={17} />
          </button>
          <button type="button" className={`setting-choice ${world.difficulty === 'strict' ? 'active' : ''}`} onClick={() => onChange({ difficulty: 'strict' })}>
            <LockKeyhole size={20} /><span><strong>Rigoroso</strong><small>Conclua as missões obrigatórias e metade das fazendas de cada era anterior.</small></span><Check size={17} />
          </button>
        </div>
        <div className="field-title">SEUS DADOS</div>
        <p className="subtle-paragraph">O progresso fica neste navegador. Para levar a jornada a outro dispositivo, exporte um backup e importe-o lá.</p>
        <div className="backup-actions"><button className="button secondary" onClick={() => downloadBackup(world)}><Download size={17} /> Exportar backup</button><button className="button secondary" onClick={() => fileRef.current?.click()}><Upload size={17} /> Importar backup</button></div>
        <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={(event) => void importFile(event.target.files?.[0])} />
        <button className="danger-link" onClick={() => { if (window.confirm('Apagar definitivamente todos os objetivos, locais e desafios salvos neste navegador?')) { onReset(); onClose(); notify('Mundo reiniciado.'); } }}><Trash2 size={16} /> Reiniciar meu mundo</button>
      </div>
    </section>
  </div>;
}

export default function App() {
  const [world, setWorld] = useState<AppState>(loadWorld);
  const [view, setView] = useState<View>('overview');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showIncomplete, setShowIncomplete] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [mapDimension, setMapDimension] = useState<Dimension>('overworld');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<WheelChallenge | null>(null);
  const [wheelEntryId, setWheelEntryId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const tier = TIERS.find((item) => item.id === world.activeTier) ?? TIERS[0];
  const tierProgress = TIERS.map((item) => tierStats(item, world.completed));
  const allDone = tierProgress.reduce((sum, stats) => sum + stats.done, 0);
  const allTotal = tierProgress.reduce((sum, stats) => sum + stats.total, 0);
  const overallPercent = allTotal ? Math.round(allDone * 100 / allTotal) : 100;
  const suggestedTier = TIERS.find((item) => !tierStats(item, world.completed).ready) ?? TIERS[TIERS.length - 1];
  const suggestedGoal = nextGoal(suggestedTier, world.completed);
  const completedTiers = tierProgress.filter((stats) => stats.ready).length;
  const strictLocked = world.difficulty === 'strict' && !isTierUnlocked(tier.id, world.completed);
  const currentProgress = tierStats(tier, world.completed);
  const filteredGoals = tier.goals.filter((goal) => {
    if (selectedCategory !== 'all' && goal.category !== selectedCategory) return false;
    if (showIncomplete && world.completed[goal.id]) return false;
    const query = search.trim().toLocaleLowerCase('pt-BR');
    return !query || `${goal.title} ${goal.description}`.toLocaleLowerCase('pt-BR').includes(query);
  });
  const locations = useMemo(() => world.locations.filter((item) => item.dimension === mapDimension), [world.locations, mapDimension]);
  const activeLocation = locations.find((item) => item.id === selectedLocation);
  const totalBonus = tierProgress.reduce((sum, stats) => sum + stats.bonusDone, 0);

  useEffect(() => {
    if (!saveWorld(world)) setToast('Não foi possível salvar. Verifique o armazenamento do navegador.');
  }, [world]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setSettingsOpen(false); setLocationOpen(false); } };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const goTo = (next: View) => { setView(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const chooseTier = (tierId: number) => {
    setWorld((previous) => ({ ...previous, activeTier: tierId }));
    setSelectedCategory('all'); setSearch(''); setShowIncomplete(false); setExpandedGoal(null);
    goTo('journey');
  };
  const toggleGoal = (goal: Objective, goalTier: Tier) => {
    if (world.difficulty === 'strict' && !isTierUnlocked(goalTier.id, world.completed)) {
      setToast('Conclua as missões obrigatórias e pelo menos metade das fazendas da era anterior.'); return;
    }
    setWorld((previous) => {
      const completed = { ...previous.completed };
      if (completed[goal.id]) delete completed[goal.id]; else completed[goal.id] = Date.now();
      return { ...previous, completed };
    });
  };
  const spinWheel = () => {
    if (spinning) return;
    const index = randomIndex(WHEEL_CHALLENGES.length);
    const angle = index * (360 / WHEEL_CHALLENGES.length) + 180 / WHEEL_CHALLENGES.length;
    setRotation((previous) => previous + 1800 + ((360 - ((previous + angle) % 360)) % 360));
    setSpinning(true); setWheelResult(null); setWheelEntryId(null);
    window.setTimeout(() => {
      const challenge = WHEEL_CHALLENGES[index];
      const entryId = crypto.randomUUID();
      setWheelResult(challenge); setWheelEntryId(entryId); setSpinning(false);
      setWorld((previous) => ({ ...previous, wheelHistory: [{ id: entryId, challengeId: challenge.id, timestamp: Date.now(), completed: false }, ...previous.wheelHistory].slice(0, 200) }));
    }, 4600);
  };
  const copyCoords = (location: MapLocation) => {
    void navigator.clipboard?.writeText(formatCoords(location)).then(() => setToast('Coordenadas copiadas.'), () => setToast('Não foi possível copiar automaticamente.'));
  };
  const changeWorld = (patch: Partial<AppState>) => setWorld((previous) => ({ ...previous, ...patch }));

  const brand = <div className="brand-block"><div className="brand-mark"><Pickaxe size={26} strokeWidth={2.6} /></div><div className="brand-text"><strong>TIER <span>BY</span> TIER</strong><small>MINECRAFT JOURNEY</small></div></div>;
  return <div className="app-layout">
    <aside className="sidebar">
      {brand}
      <div className="sidebar-divider" />
      <div className="nav-caption">MENU PRINCIPAL</div>
      <nav className="main-nav" aria-label="Navegação principal">
        {NAV.map((item) => { const Icon = item.icon; return <button key={item.id} className={`nav-item ${view === item.id ? 'active' : ''}`} onClick={() => goTo(item.id)}><Icon size={20} strokeWidth={1.9} /><span>{item.label}</span>{view === item.id && <span className="nav-active-dot" />}</button>; })}
      </nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-world">
        <div className="eyebrow">MUNDO ATUAL</div>
        <div className="sidebar-world-name"><Mountain size={17} /> {world.worldName || 'Sem nome'}</div>
        <div className="sidebar-world-stats"><span>Jornada concluída</span><strong>{overallPercent}%</strong></div>
        <ProgressBar value={overallPercent} />
        <div className="sidebar-world-foot">{allDone} de {allTotal} requisitos de avanço</div>
      </div>
      <button className="sidebar-settings" onClick={() => setSettingsOpen(true)}><Settings2 size={18} /> Configurações <ChevronRight size={16} /></button>
      <div className="sidebar-footer">Feito para Minecraft Bedrock <span>◆</span> v1.0</div>
    </aside>

    <div className="main-area">
      <header className="topbar"><div className="topbar-mobile">{brand}</div><div className="topbar-location"><span className="breadcrumb-root">MEU MUNDO</span><ChevronRight size={14} /><strong>{NAV.find((item) => item.id === view)?.label}</strong></div><div className="topbar-actions"><span className="bedrock-tag"><span /> BEDROCK</span><button className="topbar-world-button" onClick={() => setSettingsOpen(true)} title="Editar mundo"><Mountain size={17} /> <span>{world.worldName || 'Meu mundo'}</span><Settings2 size={15} /></button><button className="icon-button mobile-settings" aria-label="Configurações" onClick={() => setSettingsOpen(true)}><Settings2 size={20} /></button></div></header>
      <main className="page-content">
        {view === 'overview' && <>
          <section className="hero-panel"><div className="hero-copy"><div className="hero-kicker"><span className="spark-symbol">✦</span> SUA AVENTURA, SUA HISTÓRIA</div><h1>Um mundo.<br /><em>Infinitas conquistas.</em></h1><p>Transforme cada sessão no Minecraft em um novo capítulo. Evolua por eras, construa algo memorável e nunca fique sem ter o que fazer.</p><div className="hero-cta"><button className="button primary" onClick={() => chooseTier(suggestedTier.id)}><Target size={18} /> Continuar jornada <ArrowRight size={17} /></button><button className="button ghost" onClick={() => goTo('rules')}>Como funciona <ChevronRight size={17} /></button></div></div><PixelScene /><div className="hero-corner">SURVIVAL MODE · BEDROCK</div></section>
          <section className="stats-grid" aria-label="Resumo da jornada">
            <div className="stat-card"><div className="stat-icon orange"><Target size={21} /></div><div><span>PROGRESSO GERAL</span><strong>{overallPercent}<small>%</small></strong><div className="stat-foot">{allDone} / {allTotal} requisitos</div></div><ProgressBar value={overallPercent} /></div>
            <div className="stat-card"><div className="stat-icon green"><Layers3 size={21} /></div><div><span>ERAS CONCLUÍDAS</span><strong>{completedTiers}<small> / 5</small></strong><div className="stat-foot">Sua história em capítulos</div></div></div>
            <div className="stat-card"><div className="stat-icon purple"><Trophy size={21} /></div><div><span>EXTRAS COMPLETOS</span><strong>{totalBonus}</strong><div className="stat-foot">Desafios opcionais</div></div></div>
            <div className="stat-card"><div className="stat-icon blue"><MapPin size={21} /></div><div><span>LOCAIS DESCOBERTOS</span><strong>{world.locations.length}</strong><div className="stat-foot">Salvos no seu Atlas</div></div></div>
          </section>
          <section className="next-quest"><div className="quest-icon"><Flag size={22} /></div><div className="next-quest-text"><span className="eyebrow">SUA PRÓXIMA MISSÃO · ERA {suggestedTier.id}</span><h2>{suggestedGoal ? suggestedGoal.title : 'Você completou a jornada principal!'}</h2><p>{suggestedGoal ? suggestedGoal.description : 'Que tal revisitar os extras, expandir sua cidade ou criar seus próprios desafios?'}</p></div><button className="button secondary" onClick={() => chooseTier(suggestedTier.id)}>Ver objetivo <ArrowRight size={17} /></button></section>
          <div className="section-heading"><div><span className="eyebrow">CINCO CAPÍTULOS</span><h2>Seu caminho até o legado</h2><p>Cada era apresenta novas possibilidades, construções e desafios.</p></div><span className="heading-note"><ShieldCheck size={16} /> Missões obrigatórias + metade das fazendas</span></div>
          <section className="era-grid">
            {TIERS.map((item) => {
              const stats = tierStats(item, world.completed);
              const unlocked = isTierUnlocked(item.id, world.completed);
              return <button key={item.id} className={`era-card theme-${item.theme} ${stats.ready ? 'finished' : ''}`} onClick={() => chooseTier(item.id)}>
                <div className="era-card-top"><EraNumber tier={item} /><span className={`era-status ${stats.ready ? 'is-done' : ''}`}>{stats.ready ? <><CheckCircle2 size={13} /> Concluída</> : !unlocked ? <><LockKeyhole size={13} /> Futura</> : 'Em progresso'}</span></div>
                <div className="era-card-art"><span className="art-symbol">{['⛏','⚙','✧','⚔','♛'][item.id - 1]}</span><span className="art-grid" /></div>
                <div className="era-card-content"><span className="era-kicker">ERA {String(item.id).padStart(2, '0')}</span><h3>{item.name}</h3><p>{item.subtitle}</p><div className="era-progress-text"><span>{stats.done} de {stats.total} requisitos</span><strong>{stats.percent}%</strong></div><ProgressBar value={stats.percent} /><div className="era-card-footer"><span>{stats.farmDone}/{stats.farmMinimum} fazendas · {stats.bonusTotal} extras</span><ArrowRight size={18} /></div></div>
              </button>;
            })}
          </section>
          <div className="overview-bottom"><div className="bottom-info"><Dices size={27} /><div><h3>Uma aventura imprevisível</h3><p>Use a Roleta para criar desafios ocasionais quando quiser mudar o ritmo.</p></div><button className="button secondary" onClick={() => goTo('wheel')}>Abrir roleta <ArrowRight size={16} /></button></div><div className="bottom-info"><MapPin size={27} /><div><h3>Não perca seu caminho</h3><p>Salve bases, portais e coordenadas em um Atlas pessoal do seu mundo.</p></div><button className="button secondary" onClick={() => goTo('atlas')}>Abrir Atlas <ArrowRight size={16} /></button></div></div>
        </>}

        {view === 'journey' && <>
          <div className="page-title"><div><span className="eyebrow">SUA TRILHA DE PROGRESSÃO</span><h1>Jornada por eras</h1><p>Conclua as missões obrigatórias e escolha pelo menos metade das fazendas para avançar.</p></div><button className="button secondary" onClick={() => goTo('overview')}><ArrowLeft size={17} /> Visão geral</button></div>
          <div className="tier-switcher" aria-label="Selecionar era">{TIERS.map((item) => <button key={item.id} className={`tier-tab theme-${item.theme} ${tier.id === item.id ? 'selected' : ''}`} onClick={() => chooseTier(item.id)}><EraNumber tier={item} /><span><small>ERA {item.id}</small><strong>{item.name.replace('Era da ', '').replace('Era do ', '')}</strong></span>{tierStats(item, world.completed).ready ? <CheckCircle2 size={17} /> : isTierUnlocked(item.id, world.completed) ? <ChevronRight size={16} /> : <LockKeyhole size={14} />}</button>)}</div>
          <section className={`journey-hero theme-${tier.theme}`}><div className="journey-hero-left"><div className="era-chip">CAPÍTULO {String(tier.id).padStart(2, '0')} <span>•</span> {tier.subtitle}</div><h2>{tier.name}</h2><p>{tier.description}</p><div className="journey-motto">“{tier.tagline}”</div></div><div className="journey-hero-progress"><span>REQUISITOS DE AVANÇO</span><strong>{currentProgress.percent}<small>%</small></strong><ProgressBar value={currentProgress.percent} /><small>{currentProgress.done} de {currentProgress.total} requisitos · {currentProgress.farmDone}/{currentProgress.farmMinimum} fazendas</small></div></section>
          {strictLocked && <div className="notice-bar"><LockKeyhole size={18} /><span>Era bloqueada no modo rigoroso. Conclua os objetivos obrigatórios e 50% das fazendas de cada era anterior para marcar tarefas aqui.</span><button onClick={() => setSettingsOpen(true)}>Alterar modo <ChevronRight size={15} /></button></div>}
          <div className="journey-layout"><div className="journey-left"><div className="objectives-toolbar"><div className="objective-tabs"><button className={selectedCategory === 'all' ? 'selected' : ''} onClick={() => setSelectedCategory('all')}>Todas <span>{tier.goals.length}</span></button>{CATEGORIES.map((category) => { const count = tier.goals.filter((goal) => goal.category === category.id).length; return count ? <button key={category.id} className={selectedCategory === category.id ? 'selected' : ''} onClick={() => setSelectedCategory(category.id)}>{category.label} <span>{count}</span></button> : null; })}</div><div className="toolbar-bottom"><label className="search-input"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar objetivos..." aria-label="Buscar objetivos" /></label><button className={`filter-button ${showIncomplete ? 'selected' : ''}`} onClick={() => setShowIncomplete((value) => !value)}>{showIncomplete ? <Check size={16} /> : <MoreHorizontal size={16} />} Apenas pendentes</button></div></div>
            <div className="objective-list">{filteredGoals.length ? filteredGoals.map((goal) => {
              const checked = Boolean(world.completed[goal.id]); const expanded = expandedGoal === goal.id;
              return <article key={goal.id} className={`objective-item ${checked ? 'is-checked' : ''} ${expanded ? 'is-expanded' : ''}`}>
                <button className="objective-checkbox" aria-label={`${checked ? 'Desmarcar' : 'Concluir'} ${goal.title}`} aria-pressed={checked} disabled={strictLocked} onClick={() => toggleGoal(goal, tier)}>{checked && <Check size={18} strokeWidth={3} />}</button>
                <button className="objective-main" aria-expanded={expanded} onClick={() => setExpandedGoal(expanded ? null : goal.id)}><span className={`objective-icon cat-${goal.category}`}><CategoryIcon category={goal.category} size={19} /></span><span className="objective-text"><strong>{goal.title}</strong><span>{goal.description}</span></span><span className={`objective-type ${goal.optional || goal.category === 'farm' ? 'optional' : ''}`}>{goal.category === 'farm' ? 'META 50%' : goal.optional ? 'EXTRA' : 'OBRIGATÓRIO'}</span><ChevronDown className={`objective-chevron ${expanded ? 'rotated' : ''}`} size={18} /></button>
                {expanded && <div className="objective-detail"><div><Info size={16} /><span><strong>Dica:</strong> {goal.tip}</span></div>{(goal.category === 'build' || goal.category === 'farm') && <div><ShieldCheck size={16} /><span><strong>Critério de conclusão:</strong> deve funcionar, ter acabamento caprichado e estar integrada ao mundo.</span></div>}{goal.category === 'farm' && <div><Wheat size={16} /><span>Qualquer fazenda concluída contribui para a meta de {currentProgress.farmMinimum} nesta era.</span></div>}{checked && <div className="objective-completed"><CheckCircle2 size={15} /> Concluído em {formatDate(world.completed[goal.id])}</div>}<button className="button secondary mini" disabled={strictLocked} onClick={() => toggleGoal(goal, tier)}>{checked ? 'Desmarcar objetivo' : 'Marcar como concluído'}</button></div>}
              </article>;
            }) : <div className="empty-results"><Search size={32} /><strong>Nenhum objetivo encontrado</strong><p>Tente limpar a busca ou trocar o filtro.</p><button className="button secondary" onClick={() => { setSearch(''); setShowIncomplete(false); setSelectedCategory('all'); }}>Limpar filtros</button></div>}</div>
          </div><aside className="journey-right"><div className={`side-panel advancement-checklist ${currentProgress.ready ? 'advance-ready' : ''}`}><div className="side-panel-title"><ShieldCheck size={19} /><h3>Condições para avançar</h3></div><div className="advancement-metric"><span>Missões obrigatórias</span><strong>{currentProgress.mandatoryDone}/{currentProgress.mandatoryTotal}</strong></div><ProgressBar value={currentProgress.mandatoryTotal ? Math.round(100 * currentProgress.mandatoryDone / currentProgress.mandatoryTotal) : 100} /><div className="advancement-metric"><span>Fazendas à sua escolha (50%)</span><strong>{currentProgress.farmDone}/{currentProgress.farmMinimum}</strong></div><ProgressBar value={currentProgress.farmMinimum ? Math.min(100, Math.round(100 * currentProgress.farmDone / currentProgress.farmMinimum)) : 100} /><div className="advancement-status">{currentProgress.ready ? <><CheckCircle2 size={16} /> Requisitos de avanço concluídos</> : <><LockKeyhole size={16} /> Ainda faltam requisitos</>}</div></div><div className="side-panel"><div className="side-panel-title"><Box size={19} /><h3>Desbloqueios da era</h3></div><p className="muted">O que você pode usar ao chegar aqui.</p><div className="equipment-note"><Shield size={17} /> {tier.equipment}</div><ul className="unlock-list">{tier.unlocks.map((unlock) => <li key={unlock}><Check size={15} /> {unlock}</li>)}</ul></div><div className="side-panel"><div className="side-panel-title"><Trophy size={19} /><h3>Por categoria</h3></div>{CATEGORIES.map((category) => {
            const goals = tier.goals.filter((goal) => goal.category === category.id); if (!goals.length) return null;
            const done = goals.filter((goal) => world.completed[goal.id]).length;
            return <div className="category-stat" key={category.id}><div className="category-stat-top"><span><CategoryIcon category={category.id} size={16} /> {category.label}</span><strong>{done}/{goals.length}</strong></div><ProgressBar value={Math.round(done * 100 / goals.length)} /></div>;
          })}</div><div className="side-tip"><Sparkles size={19} /><div><strong>Dica de sobrevivência</strong><p>No modo Rigoroso, conclua todas as missões obrigatórias e 50% de todas as fazendas desta era. Você escolhe quais fazendas fazer.</p></div></div></aside></div>
          <div className="journey-bottom-nav"><button className="button secondary" disabled={tier.id === 1} onClick={() => chooseTier(tier.id - 1)}><ArrowLeft size={16} /> Era anterior</button><button className="button primary" disabled={tier.id === 5} onClick={() => chooseTier(tier.id + 1)}>Próxima era <ArrowRight size={16} /></button></div>
        </>}

        {view === 'wheel' && <>
          <div className="page-title"><div><span className="eyebrow">QUEBRE A ROTINA</span><h1>Roleta do destino</h1><p>Um desafio aleatório para quando sua aventura precisar de uma reviravolta. Todos são opcionais.</p></div><span className="page-decoration"><Dices size={32} /></span></div>
          <section className="wheel-layout"><div className="wheel-card"><div className="wheel-card-heading"><span className="eyebrow">DESAFIO ALEATÓRIO</span><span className="wheel-live"><span /> PRONTO PARA GIRAR</span></div>
            <div className="wheel-container"><div className="wheel-pointer" />
              <div className={`challenge-wheel ${spinning ? 'is-spinning' : ''}`} style={{ transform: `rotate(${rotation}deg)` }}>
                {WHEEL_CHALLENGES.map((challenge, index) => <span className="wheel-emoji" key={challenge.id} style={{ '--angle': `${index * 36 + 18}deg` } as CSSProperties}>{challenge.emoji}</span>)}
                <div className="wheel-hub"><Dices size={27} /><small>TIER BY TIER</small></div>
              </div>
            </div>
            <button className="button primary spin-button" disabled={spinning} onClick={spinWheel}><RotateCcw size={18} className={spinning ? 'loading-spin' : ''} /> {spinning ? 'Sorteando...' : 'Girar a roleta'}</button>
            <p className="wheel-hint">Use depois de uma derrota, no início de uma sessão ou sempre que quiser. Nenhuma penalidade é obrigatória.</p>
          </div><div className="wheel-sidebar"><div className={`wheel-result-panel ${wheelResult ? 'has-result' : ''}`}><div className="eyebrow">{wheelResult ? 'SEU DESAFIO' : 'O DESTINO AGUARDA'}</div><div className="wheel-result-icon">{wheelResult ? wheelResult.emoji : '✦'}</div><h2>{wheelResult ? wheelResult.name : 'Pronto para uma surpresa?'}</h2><p>{wheelResult ? wheelResult.description : 'Gire a roleta e receba uma missão para variar sua próxima sessão no Minecraft.'}</p>{wheelResult && <button className="button secondary" disabled={Boolean(world.wheelHistory.find((entry) => entry.id === wheelEntryId)?.completed)} onClick={() => {
              if (wheelEntryId) setWorld((previous) => ({ ...previous, wheelHistory: previous.wheelHistory.map((entry) => entry.id === wheelEntryId ? { ...entry, completed: true } : entry) }));
              setToast('Desafio registrado como concluído.');
            }}><CheckCircle2 size={17} /> Concluí o desafio</button>}</div>
            <div className="wheel-history"><div className="side-panel-title"><BookOpen size={18} /><h3>Últimos sorteios</h3></div>{world.wheelHistory.length ? world.wheelHistory.slice(0, 5).map((entry) => {
              const challenge = WHEEL_CHALLENGES.find((item) => item.id === entry.challengeId);
              return challenge ? <div className="history-row" key={entry.id}><span>{challenge.emoji}</span><div><strong>{challenge.name}</strong><small>{formatDate(entry.timestamp)}</small></div>{entry.completed ? <CheckCircle2 size={17} className="success-color" /> : <span className="history-pending">Pendente</span>}</div> : null;
            }) : <p className="history-empty">Seus desafios sorteados vão aparecer aqui.</p>}</div></div></section>
          <div className="section-heading compact"><div><span className="eyebrow">TODAS AS POSSIBILIDADES</span><h2>Os dez desafios</h2></div></div>
          <div className="challenge-grid">{WHEEL_CHALLENGES.map((challenge, index) => <div className="challenge-card" key={challenge.id}><div className="challenge-emoji">{challenge.emoji}</div><div><span>DESAFIO {String(index + 1).padStart(2, '0')}</span><h3>{challenge.name}</h3><p>{challenge.description}</p></div></div>)}</div>
        </>}

        {view === 'atlas' && <>
          <div className="page-title"><div><span className="eyebrow">CADA LUGAR CONTA UMA HISTÓRIA</span><h1>Atlas do mundo</h1><p>Registre construções, portais, fazendas e destinos para nunca perder uma descoberta.</p></div><button className="button primary" onClick={() => setLocationOpen(true)}><Plus size={18} /> Novo local</button></div>
          <div className="seed-rule-note"><Map size={17} /><span><strong>Mapa da seed:</strong> consulta livre entre eras. Durante uma era, a regra original pede um desafio da roleta.</span><button onClick={() => goTo('wheel')}>Abrir roleta <ArrowRight size={14} /></button></div><div className="atlas-summary"><div><MapPin size={19} /><strong>{world.locations.length}</strong><span>locais registrados</span></div><div><Mountain size={19} /><strong>{world.locations.filter((location) => location.dimension === 'overworld').length}</strong><span>no Overworld</span></div><div><Compass size={19} /><strong>{world.seed || '—'}</strong><span>seed do mundo</span></div></div>
          <section className="atlas-layout"><div className="atlas-left"><div className="atlas-map-header"><div><span className="eyebrow">MAPA ESQUEMÁTICO</span><h2>Seus pontos de referência</h2></div><div className="dimension-tabs">{(Object.keys(DIMENSIONS) as Dimension[]).map((dimension) => <button key={dimension} className={mapDimension === dimension ? 'selected' : ''} onClick={() => { setMapDimension(dimension); setSelectedLocation(null); }}>{DIMENSIONS[dimension]}</button>)}</div></div>
            <div className="atlas-map" aria-label={`Representação esquemática dos locais no ${DIMENSIONS[mapDimension]}`}>
              {locations.length ? (() => {
                const xCoords = locations.map((location) => location.x);
                const zCoords = locations.map((location) => location.z);
                const xMin = Math.min(...xCoords), xMax = Math.max(...xCoords);
                const zMin = Math.min(...zCoords), zMax = Math.max(...zCoords);
                const span = Math.max(200, xMax - xMin, zMax - zMin);
                const xCenter = (xMax + xMin) / 2, zCenter = (zMax + zMin) / 2;
                const project = (coordinate: number, center: number) => 50 + ((coordinate - center) / span) * 72;
                return <>
                  <div className="map-axis axis-top">− Z</div><div className="map-axis axis-right">+ X</div>
                  <div className="map-coord-label map-tl">X {Math.round(xCenter - span / 2)}<br />Z {Math.round(zCenter - span / 2)}</div>
                  <div className="map-coord-label map-br">X {Math.round(xCenter + span / 2)}<br />Z {Math.round(zCenter + span / 2)}</div>
                  {locations.map((location) => <button key={location.id} className={`map-marker ${location.id === selectedLocation ? 'selected' : ''} kind-${location.kind}`} style={{ left: `${project(location.x, xCenter)}%`, top: `${project(location.z, zCenter)}%` }} onClick={() => setSelectedLocation(location.id)} title={`${location.name}: ${formatCoords(location)}`} aria-label={location.name}><span>{KIND_ICONS[location.kind]}</span><small>{location.name}</small></button>)}
                </>;
              })() : <div className="atlas-empty-map"><div className="empty-map-symbol"><Compass size={48} strokeWidth={1.2} /></div><h3>Um mundo esperando ser mapeado</h3><p>Adicione seu primeiro local no {DIMENSIONS[mapDimension]} para visualizar os pontos neste mapa.</p><button className="button primary" onClick={() => setLocationOpen(true)}><Plus size={17} /> Adicionar local</button></div>}
              <div className="map-watermark">TIER BY TIER · ATLAS</div>
            </div>
            <div className="map-legend"><Info size={16} /> Este mapa mostra a posição relativa das coordenadas X/Z. Não representa terreno, biomas ou imagens da seed.</div>
          </div><aside className="atlas-side"><div className="side-panel"><div className="side-panel-title"><MapPin size={18} /><h3>{activeLocation ? 'Local selecionado' : 'Locais registrados'}</h3></div>{activeLocation ? <><button className="link-back" onClick={() => setSelectedLocation(null)}><ArrowLeft size={15} /> Voltar à lista</button><div className="selected-location-icon">{KIND_ICONS[activeLocation.kind]}</div><h3 className="location-name">{activeLocation.name}</h3><div className="location-type">{KIND_LABELS[activeLocation.kind]} · {DIMENSIONS[activeLocation.dimension]}</div><div className="coords-display"><span>COORDENADAS (X, Y, Z)</span><strong>{formatCoords(activeLocation)}</strong><button className="icon-button" title="Copiar coordenadas" aria-label="Copiar coordenadas" onClick={() => copyCoords(activeLocation)}><Copy size={18} /></button></div>{activeLocation.notes && <p className="location-notes">{activeLocation.notes}</p>}<button className="danger-link" onClick={() => { if (window.confirm(`Remover "${activeLocation.name}" do Atlas?`)) { setWorld((previous) => ({ ...previous, locations: previous.locations.filter((item) => item.id !== activeLocation.id) })); setSelectedLocation(null); } }}><Trash2 size={15} /> Excluir local</button></> : locations.length ? <div className="location-list">{[...locations].sort((a,b) => b.createdAt - a.createdAt).map((location) => <button className="location-row" key={location.id} onClick={() => setSelectedLocation(location.id)}><span className="location-row-icon">{KIND_ICONS[location.kind]}</span><span><strong>{location.name}</strong><small>{formatCoords(location)}</small></span><ChevronRight size={17} /></button>)}</div> : <div className="empty-location-list"><MapPin size={25} /><p>Nenhum local salvo nesta dimensão.</p></div>}</div><div className="side-tip"><Info size={19} /><div><strong>Uma dica</strong><p>Para converter distâncias entre Overworld e Nether, as coordenadas horizontais X e Z geralmente seguem a proporção 8:1.</p></div></div></aside></section>
        </>}

        {view === 'rules' && <>
          <div className="page-title"><div><span className="eyebrow">O MANUAL DA AVENTURA</span><h1>Como funciona</h1><p>Um conjunto flexível de regras para dar direção ao Survival, sem transformar diversão em obrigação.</p></div><span className="page-decoration"><BookOpen size={32} /></span></div>
          <section className="rules-intro"><div className="rules-intro-art"><Pickaxe size={51} strokeWidth={1.6} /><span>01 → 05</span></div><div><span className="eyebrow">O CONCEITO</span><h2>Progressão com propósito</h2><p>O Minecraft permite fazer quase tudo desde o começo. O Tier by Tier divide sua aventura em cinco eras, criando novos objetivos e liberando equipamentos e dimensões de forma gradual. As tarefas principais fazem a história avançar; as extras aprofundam cada capítulo.</p></div></section>
          <div className="rule-grid">
            <div className="rule-card"><div className="rule-number">01</div><Target size={27} /><h3>Conclua a era</h3><p>Complete todas as missões obrigatórias antes de avançar. Projetos extras não bloqueiam a jornada.</p></div>
            <div className="rule-card"><div className="rule-number">02</div><Castle size={27} /><h3>Construa com propósito</h3><p>Toda construção e fazenda concluída deve funcionar, ter acabamento caprichado e integrar-se ao mundo.</p></div>
            <div className="rule-card"><div className="rule-number">03</div><Wheat size={27} /><h3>Meta de 50% das fazendas</h3><p>Escolha livremente quais fazendas construir. Metade do catálogo da era é necessária; o restante é opcional.</p></div>
            <div className="rule-card"><div className="rule-number">04</div><LockKeyhole size={27} /><h3>Pode coletar, não usar</h3><p>Todo loot pode ser guardado, mas use equipamentos restritos apenas quando a era correspondente for desbloqueada.</p></div>
            <div className="rule-card"><div className="rule-number">05</div><Trophy size={27} /><h3>Guarde as lembranças</h3><p>Preserve itens de valor histórico, conquistas e troféus para criar seu museu nas eras futuras.</p></div>
            <div className="rule-card"><div className="rule-number">06</div><Mountain size={27} /><h3>Biomas grandes (opcional)</h3><p>O vídeo recomenda mundos Large Biomes para imersão e coerência visual. É uma sugestão, não uma exigência; verifique a disponibilidade na sua versão Bedrock.</p></div>
            <div className="rule-card"><div className="rule-number">07</div><Map size={27} /><h3>Mapa da seed e roleta</h3><p>Entre eras, a consulta ao mapa da seed é livre. Durante uma era, as regras do vídeo exigem pagar um desafio da roleta. Aqui, a escolha é manual e os desafios não são destrutivos.</p><button className="button secondary mini" onClick={() => goTo('wheel')}>Abrir roleta <ArrowRight size={15} /></button></div>
          </div>
          <div className="rules-timeline">{TIERS.map((item) => <button className={`rule-era theme-${item.theme}`} key={item.id} onClick={() => chooseTier(item.id)}><EraNumber tier={item} /><div><span>ERA {item.id}</span><h3>{item.name}</h3><p>{item.equipment}</p></div><ChevronRight size={20} /></button>)}</div>
          <section className="rules-faq"><div className="section-heading compact"><div><span className="eyebrow">PERGUNTAS FREQUENTES</span><h2>Antes de começar</h2></div></div><details open><summary>Posso jogar em qualquer mundo?</summary><p>Sim. O app foi planejado para Minecraft Bedrock no modo Survival, mas não se conecta ao jogo nem altera seu mundo. Você marca objetivos manualmente.</p></details><details><summary>Preciso zerar todas as fazendas para avançar?</summary><p>Não. É necessário construir pelo menos 50% das fazendas disponíveis na era. Você escolhe quais fazer, mesmo que algumas fossem marcadas como extras. O restante é opcional.</p></details><details><summary>O que acontece quando eu morrer?</summary><p>Nada é aplicado automaticamente. Se quiser adicionar um desafio à morte, abra a Roleta e gire. Não há penalidades destrutivas nem perda obrigatória de itens.</p></details><details><summary>O aplicativo sincroniza no celular?</summary><p>Ele funciona em telas pequenas e pode ser instalado como PWA, inclusive offline depois de carregado. Nesta versão, os dados ficam salvos localmente em cada navegador. Use Configurações → Exportar/Importar backup para transferir o progresso.</p></details><details><summary>O guia é para Bedrock ou Java?</summary><p>Prioriza Bedrock, incluindo ferramentas de cobre, Trial Chambers e mecânicas específicas de farms. Projetos automáticos podem variar conforme a versão instalada; confirme o tutorial antes de construir.</p></details></section>
          <div className="rules-credit"><ShieldCheck size={20} /><div><strong>As sete regras da série, adaptadas ao Bedrock</strong><p>Inspirado no conjunto de regras Tier by Tier mostrado no vídeo. A interface, o conteúdo das missões e os desafios não destrutivos são adaptações para jogar Bedrock no longo prazo.</p></div></div>
        </>}
      </main>
      <footer className="site-footer"><span>✦ TIER BY TIER</span><span>Seu mundo. Suas regras. Sua história.</span><span>Projeto independente · não afiliado à Mojang ou Microsoft</span></footer>
    </div>
    <nav className="mobile-nav" aria-label="Navegação inferior">{NAV.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => goTo(item.id)} className={view === item.id ? 'active' : ''}><Icon size={21} strokeWidth={1.9} /><span>{item.label}</span></button>; })}</nav>
    {toast && <div className="toast-message" role="status"><Info size={17} /> {toast}<button aria-label="Fechar aviso" onClick={() => setToast('')}><X size={16} /></button></div>}
    {settingsOpen && <SettingsModal world={world} onChange={changeWorld} onImport={setWorld} onReset={() => setWorld({ ...NEW_WORLD, completed: {}, wheelHistory: [], locations: [] })} onClose={() => setSettingsOpen(false)} notify={setToast} />}
    {locationOpen && <LocationModal onClose={() => setLocationOpen(false)} onAdd={(location) => { setWorld((previous) => ({ ...previous, locations: [...previous.locations, location] })); setMapDimension(location.dimension); setSelectedLocation(location.id); setLocationOpen(false); setToast('Local adicionado ao Atlas.'); }} />}
  </div>;
}
