import type { AppState, Difficulty, MapLocation, WheelHistoryEntry } from './types';

export const STORAGE_KEY = 'minecraft-tier-by-tier:world:v1';
export const NEW_WORLD: AppState = {
  version: 1,
  worldName: 'Meu mundo Survival',
  seed: '',
  difficulty: 'guided',
  activeTier: 1,
  completed: {},
  wheelHistory: [],
  locations: [],
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

// A validação impede estados quebrados após importar backups antigos ou editados.
export function validateBackup(raw: unknown): AppState {
  if (!isObject(raw) || raw.version !== 1 || !isObject(raw.completed)) {
    throw new Error('Arquivo incompatível. Selecione um backup Tier by Tier (versão 1).');
  }
  const completed: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw.completed)) {
    if (/^t[1-5]-(build|farm|explore|boss|achievement)-\d+$/.test(key) &&
      typeof value === 'number' && Number.isFinite(value) && value > 0) {
      completed[key] = value;
    }
  }
  const worldName = typeof raw.worldName === 'string' ? raw.worldName.slice(0, 80) : NEW_WORLD.worldName;
  const seed = typeof raw.seed === 'string' ? raw.seed.slice(0, 100) : '';
  const difficulty: Difficulty = raw.difficulty === 'strict' ? 'strict' : 'guided';
  const activeTier = typeof raw.activeTier === 'number' ? Math.min(5, Math.max(1, Math.round(raw.activeTier))) : 1;
  const wheelHistory = Array.isArray(raw.wheelHistory)
    ? raw.wheelHistory.filter((entry): entry is WheelHistoryEntry => isObject(entry) &&
      typeof entry.id === 'string' && typeof entry.challengeId === 'string' &&
      typeof entry.timestamp === 'number' && typeof entry.completed === 'boolean').slice(-200)
    : [];
  const locations = Array.isArray(raw.locations)
    ? raw.locations.filter((entry): entry is MapLocation => isObject(entry) &&
      typeof entry.id === 'string' && typeof entry.name === 'string' &&
      typeof entry.x === 'number' && Number.isFinite(entry.x) &&
      typeof entry.y === 'number' && Number.isFinite(entry.y) &&
      typeof entry.z === 'number' && Number.isFinite(entry.z) &&
      (entry.dimension === 'overworld' || entry.dimension === 'nether' || entry.dimension === 'end') &&
      (entry.kind === 'base' || entry.kind === 'farm' || entry.kind === 'portal' || entry.kind === 'structure' || entry.kind === 'other') &&
      typeof entry.notes === 'string' && typeof entry.createdAt === 'number')
      .slice(0, 300).map((entry) => ({ ...entry, name: entry.name.slice(0, 90), notes: entry.notes.slice(0, 700) }))
    : [];
  return { version: 1, worldName, seed, difficulty, activeTier, completed, wheelHistory, locations };
}

export function loadWorld(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? validateBackup(JSON.parse(raw) as unknown) : { ...NEW_WORLD };
  } catch {
    return { ...NEW_WORLD };
  }
}

export function saveWorld(value: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function downloadBackup(world: AppState) {
  const date = new Date().toISOString().slice(0, 10);
  const file = new Blob([JSON.stringify(world, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tier-by-tier-${date}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}
