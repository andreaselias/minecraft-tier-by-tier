export type Category = 'build' | 'farm' | 'explore' | 'boss' | 'achievement';
export type View = 'overview' | 'journey' | 'wheel' | 'atlas' | 'rules';
export type Dimension = 'overworld' | 'nether' | 'end';
export type Difficulty = 'guided' | 'strict';

export interface Objective {
  id: string;
  title: string;
  description: string;
  tip: string;
  category: Category;
  optional: boolean;
}

export interface Tier {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  theme: string;
  tagline: string;
  equipment: string;
  unlocks: string[];
  goals: Objective[];
}

export interface WheelChallenge {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export interface WheelHistoryEntry {
  id: string;
  challengeId: string;
  timestamp: number;
  completed: boolean;
}

export interface MapLocation {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  dimension: Dimension;
  kind: 'base' | 'farm' | 'portal' | 'structure' | 'other';
  notes: string;
  createdAt: number;
}

export interface AppState {
  version: 1;
  worldName: string;
  seed: string;
  difficulty: Difficulty;
  activeTier: number;
  completed: Record<string, number>;
  wheelHistory: WheelHistoryEntry[];
  locations: MapLocation[];
}
