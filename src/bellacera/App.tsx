import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  ArrowRight, BookOpen, Boxes, Building2, Castle, Check, CheckCircle2,
  ChevronRight, Compass, Copy, Download, Factory, Flame, Hammer, Home, Landmark,
  MapPin, Pickaxe, Plus, Search, Settings2, ShieldCheck, Sparkles,
  Trash2, Upload, Wheat, X, Calculator, Flag, Layers3,
} from 'lucide-react';
import { CHAPTERS, GOALS, PRODUCTIONS, PROJECTS, GOAL_MAP, PRODUCTION_MAP } from './data.ts';
import type { Domain, Goal, ProjectStatus } from './data.ts';
import { chapterProgress, concreteRecipe, nextGoals, projectState, unmetRequirements, worldProgress } from './logic.ts';
import { exportBackup, loadWorld, NEW_WORLD, saveWorld, validateBackup } from './model.ts';
import type { Dimension, Location, LocationKind, View, World } from './model.ts';

const NAV = [
  {id:'painel',label:'Visão geral',icon:Home},
  {id:'jornada',label:'Jornada',icon:Flag},
  {id:'producao',label:'Produção',icon:Factory},
  {id:'cidade',label:'Cidade',icon:Building2},
  {id:'materiais',label:'Materiais',icon:Boxes},
  {id:'atlas',label:'Atlas',icon:MapPin},
] as const;
const CATEGORY:Record<Domain,{label:string,icon:typeof Home}> = {
  survival:{label:'Sobrevivência',icon:ShieldCheck},
  construcao:{label:'Construção',icon:Hammer},
  producao:{label:'Produção',icon:Wheat},
  exploracao:{label:'Exploração',icon:Compass},
  marco:{label:'Conquista',icon:Sparkles},
};
const PRIORITY:Record<string,string>={essencial:'Essencial',alta:'Alta',media:'Média',tardia:'Tardia'};
const DIMENSIONS:Record<Dimension,string>={overworld:'Overworld',nether:'Nether',end:'End'};
const KINDS:Record<LocationKind,string>={base:'Casa / base',farm:'Farm',portal:'Portal',structure:'Construção',other:'Outro'};

function pct(value:number){return Math.max(0,Math.min(100,value));}
function Bar({value}:{value:number}){return <div className="progress-track" role="progressbar" aria-valuenow={pct(value)} aria-valuemin={0} aria-valuemax={100}><span style={{width:pct(value)+'%'}}/></div>;}
function SectionTitle({eyebrow,title,description,action}:{eyebrow:string,title:string,description?:string,action?:ReactNode}) {
  return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{description&&<p>{description}</p>}</div>{action}</div>;
}
function GoalCard({goal,world,onToggle,onNavigate}:{goal:Goal,world:World,onToggle:(id:string)=>void,onNavigate:(id:string)=>void}) {
  const checked=Boolean(world.completed[goal.id]);
  const missing=unmetRequirements(goal,world);
  const CategoryIcon=CATEGORY[goal.domain].icon;
  return <article className={'goal-card '+(checked?'goal-checked':'')}>
    <button type="button" className={'goal-check '+(checked?'is-checked':'')} onClick={()=>onToggle(goal.id)} aria-label={(checked?'Desmarcar: ':'Concluir: ')+goal.title} aria-pressed={checked}>{checked&&<Check size={16}/>}</button>
    <div className="goal-main">
      <div className="goal-meta"><span><CategoryIcon size={14}/> {CATEGORY[goal.domain].label}</span>{goal.optional&&<span className="muted-label">Opcional</span>}</div>
      <h3>{goal.title}</h3><p>{goal.description}</p>
      <details className="goal-detail"><summary>Dica e dependências</summary><p>{goal.tip}</p>
        {missing.length>0&&<p className="requirements">Antes, vale fazer: {missing.map((item,index)=><button type="button" key={item.id} onClick={()=>onNavigate(item.id)}>{index>0?' · ':''}{item.title}</button>)}</p>}
      </details>
    </div>
    {checked&&<CheckCircle2 className="completed-icon" size={19}/>}
  </article>;
}
function IconForChapter({id}:{id:number}){
  const Icon=[Home,Pickaxe,Landmark,Flame,Factory,Sparkles,Castle][id-1]||Home;
  return <Icon size={20}/>;
}
function SeedBadge({seed}:{seed:string}) {
  return <button type="button" className="seed-chip" onClick={()=>{void navigator.clipboard?.writeText(seed)}} title="Copiar seed"><span>SEED</span><strong>{seed}</strong><Copy size={13}/></button>;
}

export default function BellaceraApp(){
  const [world,setWorld]=useState<World>(loadWorld);
  const [view,setView]=useState<View>('painel');
  const [chapterId,setChapterId]=useState(world.activeChapter);
  const [productionFilter,setProductionFilter]=useState('todas');
  const [cityFilter,setCityFilter]=useState('todos');
  const [atlasFilter,setAtlasFilter]=useState('todas');
  const [search,setSearch]=useState('');
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [addingLocation,setAddingLocation]=useState(false);
  const [notice,setNotice]=useState('');
  const [locationName,setLocationName]=useState('');
  const [x,setX]=useState(''); const [y,setY]=useState('64'); const [z,setZ]=useState('');
  const [dimension,setDimension]=useState<Dimension>('overworld');
  const [kind,setKind]=useState<LocationKind>('other');
  const [notes,setNotes]=useState('');
  const importRef=useRef<HTMLInputElement>(null);

  useEffect(()=>{saveWorld(world);},[world]);
  const stats=worldProgress(world);
  const next=nextGoals(world,4);
  const recipe=concreteRecipe(world.targetConcrete);
  const chapter=CHAPTERS.find(ch=>ch.id===chapterId)||CHAPTERS[0];

  const toggleGoal=(id:string)=>{
    setWorld(previous=>{
      const completed={...previous.completed};
      const projects={...previous.projects};
      if(completed[id])delete completed[id];else completed[id]=Date.now();
      const project=PROJECTS.find(p=>p.goalId===id);
      if(project)projects[project.id]=completed[id]?'concluido':'planejado';
      return {...previous,completed,projects};
    });
  };
  const focusGoal=(id:string)=>{
    const goal=GOAL_MAP[id];if(!goal)return;
    setChapterId(goal.chapter);setWorld(w=>({...w,activeChapter:goal.chapter}));setView('jornada');
    window.scrollTo({top:0,behavior:'smooth'});
  };
  const navigate=(page:View)=>{setView(page);setSearch('');window.scrollTo({top:0,behavior:'smooth'});};
  const setProject=(id:string,status:ProjectStatus)=>{
    setWorld(previous=>{
      const completed={...previous.completed};const projects={...previous.projects,[id]:status};
      const project=PROJECTS.find(p=>p.id===id);
      if(project){if(status==='concluido')completed[project.goalId]=Date.now();
      else if(completed[project.goalId])delete completed[project.goalId];}
      return {...previous,projects,completed};
    });
  };
  const importBackup=async(file:File|undefined)=>{
    if(!file)return;
    try{
      const raw=JSON.parse(await file.text()) as unknown;
      const nextWorld=validateBackup(raw);
      if(!window.confirm('Importar o backup de "'+nextWorld.worldName+'"? O progresso atual neste navegador será substituído.'))return;
      setWorld(nextWorld);setChapterId(nextWorld.activeChapter);setSettingsOpen(false);setNotice('Backup importado. Dados e coordenadas preservados.');
    }catch(error){setNotice(error instanceof Error?error.message:'Não foi possível importar o backup.');}
    finally{if(importRef.current)importRef.current.value='';}
  };
  const addLocation=(e:FormEvent)=>{
    e.preventDefault();
    const entries=[x,y,z].map(v=>Number(v));if(!locationName.trim()||[x,y,z].some(v=>!v.trim()||!/^[-]?\d+$/.test(v.trim()))||!entries.every(Number.isFinite)){setNotice('Informe nome e coordenadas inteiras válidas.');return;}
    const location:Location={id:typeof crypto!=='undefined'&&'randomUUID' in crypto?crypto.randomUUID():String(Date.now()),
      name:locationName.trim().slice(0,90),x:entries[0],y:entries[1],z:entries[2],
      dimension,kind,notes:notes.trim().slice(0,700),createdAt:Date.now()};
    setWorld(w=>({...w,locations:[location,...w.locations]}));setLocationName('');setX('');setY('64');setZ('');setNotes('');setAddingLocation(false);
    setNotice('Local salvo no Atlas.');
  };

  const shownGoals=useMemo(()=>GOALS.filter(g=>g.chapter===chapter.id&&
    (g.title+' '+g.description).toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))),[chapter.id,search]);
  const shownProduction=PRODUCTIONS.filter(p=>(productionFilter==='todas'||p.priority===productionFilter)&&
    (p.name+' '+p.outputs.join(' ')).toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
  const shownProjects=PROJECTS.filter(p=>(cityFilter==='todos'||projectState(p.id,world)===cityFilter)&&
    (p.name+' '+p.district+' '+p.description).toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
  const shownLocations=world.locations.filter(l=>atlasFilter==='todas'||l.dimension===atlasFilter);

  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand" onClick={()=>navigate('painel')} aria-label="Ir ao painel"><span className="brand-logo"><Castle size={25}/></span><span><strong>Bellacera</strong><small>SURVIVAL & CITY BUILDER</small></span></button>
      <div className="sidebar-label">SEU MUNDO</div>
      <nav className="sidebar-nav" aria-label="Menu principal">{NAV.map(item=>{const Icon=item.icon;return <button key={item.id} onClick={()=>navigate(item.id)} className={'nav-link '+(view===item.id?'active':'')}><Icon size={18}/><span>{item.label}</span>{view===item.id&&<span className="nav-dot"/>}</button>})}</nav>
      <div className="sidebar-bottom">
        <div className="sidebar-world"><span className="eyebrow">UM MUNDO PARA CONSTRUIR</span><strong>{world.worldName}</strong><div className="aside-progress"><span>Jornada</span><b>{stats.percent}%</b></div><Bar value={stats.percent}/><small>{stats.complete} de {stats.total} marcos principais</small></div>
        <button className="side-settings" onClick={()=>setSettingsOpen(true)}><Settings2 size={17}/> Configurações</button>
        <span className="sidebar-note">Minecraft Java · Progresso local</span>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <div className="breadcrumb"><span>MEU MUNDO</span><ChevronRight size={14}/><strong>{NAV.find(n=>n.id===view)?.label}</strong></div>
        <div className="top-actions"><span className="edition"><i/> JAVA EDITION</span><button className="world-button" onClick={()=>setSettingsOpen(true)}><Settings2 size={16}/><span>{world.worldName}</span></button></div>
      </header>
      <nav className="mobile-nav" aria-label="Menu principal para celular">{NAV.map(item=>{const Icon=item.icon;return <button key={item.id} onClick={()=>navigate(item.id)} className={view===item.id?'active':''}><Icon size={17}/>{item.label}</button>})}</nav>
      <div className="content">
        {view==='painel'&&<>
          <section className="hero-panel">
            <div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> A JORNADA DE UMA CIDADE</div>
              <h1>Uma vila nasce.<br/><em>Uma história cresce.</em></h1>
              <p>Construa Bellacera à beira do lago, um projeto de cada vez. O Survival fornece os recursos; a arquitetura dá sentido às conquistas.</p>
              <div className="hero-actions"><button className="button primary" onClick={()=>navigate('jornada')}>Continuar jornada <ArrowRight size={17}/></button><button className="button secondary" onClick={()=>navigate('cidade')}>Explorar projetos</button></div>
              <SeedBadge seed={world.seed}/>
            </div>
            <div className="hero-art" aria-hidden="true"><span className="art-sun"/><span className="art-mountain mountain-far"/><span className="art-mountain mountain-near"/><span className="art-lake"/><span className="art-castle"><i/><b/></span><span className="art-house"><i/><b/></span><span className="art-tree tree-left"/><span className="art-tree tree-right"/></div>
          </section>
          <div className="stats-grid">
            <div className="stat"><div className="stat-icon"><Flag size={19}/></div><span>Marcos concluídos</span><strong>{stats.complete} <small>/ {stats.total}</small></strong></div>
            <div className="stat"><div className="stat-icon"><Wheat size={19}/></div><span>Produções prontas</span><strong>{stats.productionDone} <small>/ {PRODUCTIONS.length}</small></strong></div>
            <div className="stat"><div className="stat-icon"><Building2 size={19}/></div><span>Projetos finalizados</span><strong>{stats.buildDone} <small>/ {PROJECTS.length}</small></strong></div>
            <div className="stat"><div className="stat-icon"><MapPin size={19}/></div><span>Locais registrados</span><strong>{world.locations.length}</strong></div>
          </div>
          <div className="columns">
            <section className="panel wide-panel"><SectionTitle eyebrow="O PRÓXIMO PASSO" title="Sua lista para agora" description="Sugestões, não bloqueios. Marque quando concluir." action={<button className="text-button" onClick={()=>navigate('jornada')}>Ver jornada <ArrowRight size={15}/></button>}/><div className="goal-list">{next.map(g=><GoalCard key={g.id} goal={g} world={world} onToggle={toggleGoal} onNavigate={focusGoal}/>)}</div></section>
            <section className="panel"><SectionTitle eyebrow="MAPA DE EVOLUÇÃO" title="Capítulos" description="Escolha livremente em qual fase trabalhar."/><div className="chapter-compact">{CHAPTERS.map(ch=>{const p=chapterProgress(ch,world);return <button key={ch.id} className={'compact-chapter '+(ch.id===world.activeChapter?'selected':'')} onClick={()=>{setChapterId(ch.id);setWorld(w=>({...w,activeChapter:ch.id}));navigate('jornada');}}><span className="compact-index">{String(ch.id).padStart(2,'0')}</span><span className="compact-body"><strong>{ch.name}</strong><Bar value={p.percent}/></span><span className="compact-count">{p.complete}/{p.total}</span></button>})}</div></section>
          </div>
          <section className="panel feature-project"><div><span className="eyebrow">PRIMEIRO GRANDE PROJETO</span><h2>Casa do Fundador</h2><p>Uma casa alpina de dois pavimentos, com paredes claras, estrutura de pinheiro, base de pedra e espaço preparado para encantamentos.</p><button className="button secondary" onClick={()=>navigate('cidade')}>Abrir catálogo de construções <ArrowRight size={16}/></button></div><div className="feature-graphic" aria-hidden="true"><Home size={85}/><span>VILA ALPINA FANTASY</span></div></section>
        </>}
        {view==='jornada'&&<>
          <SectionTitle eyebrow="EVOLUÇÃO SEM REGRAS ARTIFICIAIS" title="Jornada de Bellacera" description="Nenhuma era bloqueia a próxima. Dependências são sugestões práticas, não permissões."/>
          <div className="chapters-grid">{CHAPTERS.map(ch=>{const p=chapterProgress(ch,world);return <button className={'chapter-tile '+(chapter.id===ch.id?'active':'')} onClick={()=>{setChapterId(ch.id);setWorld(w=>({...w,activeChapter:ch.id}));setSearch('');}} key={ch.id}><div className="chapter-top"><span>{String(ch.id).padStart(2,'0')}</span><IconForChapter id={ch.id}/></div><strong>{ch.name}</strong><small>{ch.subtitle}</small><Bar value={p.percent}/><span className="tile-count">{p.complete} / {p.total} marcos</span></button>})}</div>
          <section className="panel"><div className="chapter-intro"><div><span className="eyebrow">CAPÍTULO {String(chapter.id).padStart(2,'0')}</span><h2>{chapter.name}</h2><p>{chapter.description}</p><blockquote>{chapter.motto}</blockquote></div><div className="chapter-intro-count"><strong>{chapterProgress(chapter,world).percent}%</strong><span>essenciais concluídos</span></div></div>
            <div className="list-toolbar"><div className="search-box"><Search size={17}/><input aria-label="Buscar objetivos" placeholder="Pesquisar tarefas deste capítulo..." value={search} onChange={e=>setSearch(e.target.value)}/></div><span className="muted-note">{shownGoals.filter(g=>!g.optional).length} marcos · {shownGoals.filter(g=>g.optional).length} opcionais</span></div>
            <div className="goal-list spacious">{shownGoals.map(g=><GoalCard key={g.id} goal={g} world={world} onToggle={toggleGoal} onNavigate={focusGoal}/>)}</div>
          </section>
        </>}
        {view==='producao'&&<>
          <SectionTitle eyebrow="PRODUZIR PARA CONSTRUIR" title="Farms e recursos" description="Cada farm existe porque ajuda em uma obra. Comece pelo necessário; automatize quando fizer sentido."/>
          <div className="toolbar"><div className="pills">{['todas','essencial','alta','media','tardia'].map(v=><button key={v} className={productionFilter===v?'active':''} onClick={()=>setProductionFilter(v)}>{v==='todas'?'Todas':PRIORITY[v]}</button>)}</div><div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar recurso..." aria-label="Buscar produção"/></div></div>
          <div className="catalog-grid">{shownProduction.map(p=>{const checked=Boolean(world.completed[p.goalId]);return <article className="catalog-card" key={p.id}><div className="catalog-head"><span className={'priority priority-'+p.priority}>{PRIORITY[p.priority]}</span><span className="muted-note">Capítulo {p.chapter} · {p.kind==='farm'?'Farm':p.kind==='coleta'?'Coleta':'Processo'}</span></div><h3>{p.name}</h3><p>{p.description}</p><div className="resource-tags">{p.outputs.map(s=><span key={s}>{s}</span>)}</div><div className="catalog-foot"><span><Factory size={15}/> {p.cityUse}</span><button className={'small-action '+(checked?'finished':'')} onClick={()=>toggleGoal(p.goalId)}>{checked?<><Check size={15}/> Pronta</>:<>Marcar pronta <Check size={15}/></>}</button></div>{p.requires.filter(id=>!world.completed[id]).length>0&&<small className="hint">Recomendado antes: {p.requires.filter(id=>!world.completed[id]).map(id=>GOAL_MAP[id]?.title).filter(Boolean).join(', ')}</small>}</article>})}</div>
        </>}
        {view==='cidade'&&<>
          <SectionTitle eyebrow="ARQUITETURA COM PROPÓSITO" title="Projetos da cidade" description="Casas, infraestrutura e comércio crescem junto com o Survival. Dimensões são pontos de partida, não blueprints definitivos."/>
          <div className="toolbar"><div className="pills">{[{id:'todos',name:'Todos'},{id:'planejado',name:'Planejados'},{id:'em-obra',name:'Em obra'},{id:'concluido',name:'Concluídos'}].map(v=><button key={v.id} className={cityFilter===v.id?'active':''} onClick={()=>setCityFilter(v.id)}>{v.name}</button>)}</div><div className="search-box"><Search size={16}/><input aria-label="Buscar projeto" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar obra ou distrito..."/></div></div>
          <div className="catalog-grid city-catalog">{shownProjects.map(p=>{const state=projectState(p.id,world);return <article className="catalog-card project-card" key={p.id}><div className="catalog-head"><span className="area-tag"><Landmark size={14}/> {p.district}</span><span className="muted-note">Capítulo {p.chapter}</span></div><h3>{p.name}</h3><p>{p.description}</p><div className="project-spec"><span><Layers3 size={14}/> {p.size}</span><span><Hammer size={14}/> {p.type}</span></div><div className="project-style">{p.style}</div><div className="resource-tags">{p.resources.map(s=><span key={s}>{s}</span>)}</div>{p.productionIds.length>0&&<div className="project-farms"><span>Produção relacionada</span><div>{p.productionIds.map(id=>{const f=PRODUCTION_MAP[id];return f?<button key={id} onClick={()=>navigate('producao')}><span className={world.completed[f.goalId]?'dot-ready':'dot-pending'}/>{f.name}</button>:null;})}</div></div>}<div className="status-buttons" role="group" aria-label={'Estado: '+p.name}>{([{value:'planejado',label:'Planejado'},{value:'em-obra',label:'Em obra'},{value:'concluido',label:'Pronto'}] as const).map(s=><button key={s.value} className={state===s.value?'active':''} onClick={()=>setProject(p.id,s.value)} aria-pressed={state===s.value}>{s.value==='concluido'&&<Check size={13}/>} {s.label}</button>)}</div></article>})}</div>
        </>}
        {view==='materiais'&&<>
          <SectionTitle eyebrow="PRODUÇÃO SOB DEMANDA" title="Planejador de materiais" description="Calcule antes de minerar. O concreto é uma cadeia de recursos, não um bloco grátis."/>
          <div className="materials-grid"><section className="panel concrete-panel"><div className="icon-bubble"><Calculator size={26}/></div><h2>Calculadora de concreto</h2><p>Você escolhe a quantidade de blocos sólidos desejada; a receita calcula lotes inteiros de 8 pós.</p><div className="form-two"><label>Blocos desejados<input type="number" min={1} max={1000000} value={world.targetConcrete} onChange={e=>setWorld(w=>({...w,targetConcrete:Math.max(1,Math.min(1000000,Math.round(Number(e.target.value)||1)))}))}/></label><label>Cor do concreto<select value={world.concreteColor} onChange={e=>setWorld(w=>({...w,concreteColor:e.target.value}))}>{['branco','cinza-claro','cinza','preto','marrom','vermelho','laranja','amarelo','verde','verde-lima','azul','azul-claro','ciano','roxo','magenta','rosa'].map(c=><option value={c} key={c}>{c}</option>)}</select></label></div><div className="recipe"><div><strong>{recipe.sand.toLocaleString('pt-BR')}</strong><span>areia</span></div><div><strong>{recipe.gravel.toLocaleString('pt-BR')}</strong><span>cascalho</span></div><div><strong>{recipe.dye.toLocaleString('pt-BR')}</strong><span>corante</span></div><div><strong>{recipe.powder.toLocaleString('pt-BR')}</strong><span>pó produzido</span></div></div><p className="recipe-note">Serão {recipe.crafts} receitas (4 areia + 4 cascalho + 1 corante = 8 pós), com {recipe.extra} bloco(s) excedente(s) de pó. Hidrate para formar concreto.</p></section>
          <section className="panel"><SectionTitle eyebrow="SEQUÊNCIA RECOMENDADA" title="Como abastecer a obra"/><div className="supply-steps"><div><span>01</span><strong>Planeje o volume</strong><p>Calcule as fachadas antes de extrair materiais.</p></div><div><span>02</span><strong>Areia longe do lago</strong><p>Proteja a paisagem principal de Bellacera.</p></div><div><span>03</span><strong>Cascalho e corantes</strong><p>Estoques de mineração, piglins e jardins.</p></div><div><span>04</span><strong>Converta sob demanda</strong><p>Comece manual; automatize quando valer a pena.</p></div></div></section></div>
          <section className="panel"><SectionTitle eyebrow="PROJETOS E CADEIAS" title="Materiais por construção" description="Listas orientativas. As quantidades exatas dependem do blueprint final."/><div className="material-project-list">{PROJECTS.slice(0,9).map(p=><div key={p.id}><div><strong>{p.name}</strong><small>{p.district}</small></div><div className="resource-tags">{p.resources.map(r=><span key={r}>{r}</span>)}</div></div>)}</div></section>
        </>}
        {view==='atlas'&&<>
          <SectionTitle eyebrow="SEU MAPA PESSOAL" title="Atlas de coordenadas" description="Registre casas, farms, portais e pontos estratégicos nas três dimensões." action={<button className="button primary" onClick={()=>setAddingLocation(v=>!v)}>{addingLocation?<X size={16}/>:<Plus size={16}/>} {addingLocation?'Cancelar':'Adicionar local'}</button>}/>
          {addingLocation&&<section className="panel atlas-form"><h3>Novo ponto de interesse</h3><form onSubmit={addLocation}><label>Nome<input value={locationName} onChange={e=>setLocationName(e.target.value)} placeholder="Ex.: Casa do Fundador" required maxLength={90}/></label><div className="form-two"><label>Dimensão<select value={dimension} onChange={e=>setDimension(e.target.value as Dimension)}>{Object.entries(DIMENSIONS).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label><label>Tipo<select value={kind} onChange={e=>setKind(e.target.value as LocationKind)}>{Object.entries(KINDS).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label></div><div className="form-three"><label>X<input type="number" step="1" value={x} onChange={e=>setX(e.target.value)} required/></label><label>Y<input type="number" step="1" value={y} onChange={e=>setY(e.target.value)} required/></label><label>Z<input type="number" step="1" value={z} onChange={e=>setZ(e.target.value)} required/></label></div><label>Observações<textarea value={notes} maxLength={700} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Rota, lembretes, recursos próximos..."/></label><button type="submit" className="button primary">Salvar no Atlas <Check size={16}/></button></form></section>}
          <div className="toolbar"><div className="pills">{[{value:'todas',label:'Todas'},{value:'overworld',label:'Overworld'},{value:'nether',label:'Nether'},{value:'end',label:'End'}].map(item=><button key={item.value} className={atlasFilter===item.value?'active':''} onClick={()=>setAtlasFilter(item.value)}>{item.label}</button>)}</div><span className="muted-note">{shownLocations.length} locais</span></div>
          {shownLocations.length===0?<div className="empty-state"><MapPin size={34}/><h3>Nenhum local por enquanto</h3><p>Seu mapa começa com a casa, o lago e o primeiro portal.</p></div>:<div className="atlas-grid">{shownLocations.map(l=><article className="catalog-card" key={l.id}><div className="catalog-head"><span className="area-tag">{KINDS[l.kind]}</span><span className="muted-note">{DIMENSIONS[l.dimension]}</span></div><h3>{l.name}</h3><div className="coordinates">{l.x} / {l.y} / {l.z}</div>{l.notes&&<p>{l.notes}</p>}<div className="catalog-foot"><button className="small-action" onClick={()=>{void navigator.clipboard?.writeText(l.x+' '+l.y+' '+l.z);setNotice('Coordenadas copiadas.')}}><Copy size={15}/> Copiar</button><button className="icon-action" aria-label={'Apagar '+l.name} onClick={()=>{if(window.confirm('Excluir "'+l.name+'" do Atlas?'))setWorld(w=>({...w,locations:w.locations.filter(item=>item.id!==l.id)}));}}><Trash2 size={16}/></button></div></article>)}</div>}
        </>}
      </div>
      <footer className="footer"><span>✦ BELLACERA</span><span>Construir devagar também é progresso. · Dados salvos neste navegador.</span></footer>
    </main>
    {notice&&<div className="toast" role="status"><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Fechar aviso"><X size={16}/></button></div>}
    {settingsOpen&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSettingsOpen(false);}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div className="modal-head"><div><span className="eyebrow">AJUSTES DO MUNDO</span><h2 id="settings-title">Configurações</h2></div><button className="icon-action" onClick={()=>setSettingsOpen(false)} aria-label="Fechar"><X size={20}/></button></div><div className="modal-content"><label>Nome do mundo<input maxLength={80} value={world.worldName} onChange={e=>setWorld(w=>({...w,worldName:e.target.value}))}/></label><label>Seed<input maxLength={100} value={world.seed} onChange={e=>setWorld(w=>({...w,seed:e.target.value}))}/></label><p className="info-note"><BookOpen size={18}/> Edição Java. Nenhuma tarefa está bloqueada: os capítulos apenas sugerem uma ordem.</p><div className="modal-separator"/><h3>Segurança dos dados</h3><p>O progresso fica no navegador, sem sincronização automática. Exporte backups regularmente. Backups Tier by Tier v1 também podem ser importados; os objetivos antigos não mapeados ficam arquivados.</p><div className="backup-row"><button className="button secondary" onClick={()=>exportBackup(world)}><Download size={16}/> Exportar JSON</button><button className="button secondary" onClick={()=>importRef.current?.click()}><Upload size={16}/> Importar JSON</button></div><input ref={importRef} type="file" accept=".json,application/json" hidden onChange={e=>void importBackup(e.target.files?.[0])}/><button className="danger-link" onClick={()=>{if(window.confirm('Reiniciar Bellacera? Isto substitui o progresso da nova versão neste navegador. Exporte um backup primeiro.')){setWorld({...NEW_WORLD,completed:{},projects:{},locations:[]});setChapterId(1);setSettingsOpen(false);setNotice('Mundo reiniciado.');}}}><Trash2 size={16}/> Reiniciar progresso local</button></div></section></div>}
  </div>;
}
