import { CHAPTERS, GOAL_MAP, PROJECTS, SEED } from './data.ts';
import type { ProjectStatus } from './data.ts';

export type View = 'painel' | 'jornada' | 'producao' | 'cidade' | 'materiais' | 'atlas';
export type Dimension = 'overworld' | 'nether' | 'end';
export type LocationKind = 'base' | 'farm' | 'portal' | 'structure' | 'other';

export interface Location {
  id:string; name:string; x:number; y:number; z:number;
  dimension:Dimension; kind:LocationKind; notes:string; createdAt:number;
}
export interface World {
  version:2; worldName:string; seed:string; edition:'java';
  activeChapter:number; completed:Record<string,number>;
  projects:Record<string,ProjectStatus>; locations:Location[];
  targetConcrete:number; concreteColor:string; legacyArchive?:unknown;
}

export const STORAGE_KEY='bellacera:world:v2';
export const LEGACY_KEY='minecraft-tier-by-tier:world:v1';
export const NEW_WORLD:World = {
  version:2,worldName:'Bellacera',seed:SEED,edition:'java',activeChapter:1,
  completed:{},projects:{},locations:[],targetConcrete:1024,concreteColor:'branco'
};

function object(v:unknown):v is Record<string,unknown> {return v!==null && typeof v==='object' && !Array.isArray(v);}
function safeText(v:unknown,defaultValue:string,max=100) {return typeof v==='string'?v.slice(0,max):defaultValue;}
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const digits=(v:unknown,min:number,max:number,d:number)=>finite(v)?Math.min(max,Math.max(min,Math.round(v))):d;
const allowedKinds:LocationKind[]=['base','farm','portal','structure','other'];
const allowedDims:Dimension[]=['overworld','nether','end'];
const allowedStatuses:ProjectStatus[]=['planejado','em-obra','concluido'];

function cleanLocations(raw:unknown):Location[] {
  if(!Array.isArray(raw)) return [];
  return raw.slice(0,400).filter(object).flatMap(v=>{
    if(!finite(v.x)||!finite(v.y)||!finite(v.z)||!allowedDims.includes(v.dimension as Dimension)||!allowedKinds.includes(v.kind as LocationKind)) return [];
    if(typeof v.id!=='string'||typeof v.name!=='string') return [];
    return [{
      id:v.id.slice(0,100),name:v.name.slice(0,90),
      x:Math.round(v.x),y:Math.round(v.y),z:Math.round(v.z),
      dimension:v.dimension as Dimension,kind:v.kind as LocationKind,
      notes:safeText(v.notes,'',700),createdAt:finite(v.createdAt)?v.createdAt:Date.now()
    }];
  });
}
function cleanCompleted(v:unknown):Record<string,number> {
  if(!object(v)) return {};
  const result:Record<string,number>={};
  for(const [id,time] of Object.entries(v))if(GOAL_MAP[id]&&finite(time)&&time>0)result[id]=time;
  return result;
}
function cleanProjects(v:unknown):Record<string,ProjectStatus> {
  if(!object(v))return {};
  const ids=new Set(PROJECTS.map(p=>p.id));
  const result:Record<string,ProjectStatus>={};
  for(const [id,status] of Object.entries(v))if(ids.has(id)&&allowedStatuses.includes(status as ProjectStatus))result[id]=status as ProjectStatus;
  return result;
}

const OLD_TO_NEW:Record<string,string> = {
  't1-build-1':'c1-home','t1-build-3':'c1-path','t1-build-4':'c2-mine',
  't1-farm-1':'c1-food','t1-farm-5':'c1-food','t1-farm-6':'c1-food',
  't2-build-2':'c2-storage','t2-build-3':'c4-portal',
  't2-farm-1':'c1-wood','t2-farm-3':'c2-iron','t2-farm-4':'c2-sugar',
  't2-farm-11':'c2-dyes','t3-boss-1':'c6-dragon',
  't3-build-2':'c7-hub','t3-build-4':'c6-enchant',
  't4-explore-2':'c6-elytra','t4-farm-6':'c5-concrete',
};
export function validateBackup(raw:unknown):World {
  if(!object(raw)||!object(raw.completed)|| (raw.version!==1&&raw.version!==2))throw new Error('Backup incompatível: use um backup Bellacera v2 ou Tier by Tier v1.');
  if(raw.version===1){
    const completed:Record<string,number>={};
    for(const [id,time] of Object.entries(raw.completed))if(OLD_TO_NEW[id]&&finite(time)&&time>0){
      const goalId=OLD_TO_NEW[id];
      completed[goalId]=Math.max(completed[goalId]||0,time);
    }
    return {...NEW_WORLD,worldName:safeText(raw.worldName,NEW_WORLD.worldName,80),
      seed:safeText(raw.seed,NEW_WORLD.seed,100),completed,locations:cleanLocations(raw.locations),
      legacyArchive:raw};
  }
  return {...NEW_WORLD,worldName:safeText(raw.worldName,NEW_WORLD.worldName,80),
    seed:safeText(raw.seed,NEW_WORLD.seed,100),
    activeChapter:digits(raw.activeChapter,1,CHAPTERS.length,1),
    completed:cleanCompleted(raw.completed),projects:cleanProjects(raw.projects),
    locations:cleanLocations(raw.locations),targetConcrete:digits(raw.targetConcrete,1,1000000,1024),
    concreteColor:safeText(raw.concreteColor,'branco',30),
    ...(Object.prototype.hasOwnProperty.call(raw,'legacyArchive')?{legacyArchive:raw.legacyArchive}:{})
  };
}
export function loadWorld():World {
  try {
    const current=localStorage.getItem(STORAGE_KEY);
    if(current)return validateBackup(JSON.parse(current));
    const legacy=localStorage.getItem(LEGACY_KEY);
    if(legacy)return validateBackup(JSON.parse(legacy));
  }catch { /* Um backup danificado não deve impedir o carregamento do aplicativo. */ }
  return {...NEW_WORLD,completed:{},projects:{},locations:[]};
}
export function saveWorld(world:World) {
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(world));return true;}catch{return false;}
}
export function exportBackup(world:World) {
  const date=new Date().toISOString().slice(0,10);
  const file=new Blob([JSON.stringify(world,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(file);
  const link=document.createElement('a');link.href=url;
  link.download='bellacera-'+date+'.json';document.body.appendChild(link);link.click();link.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),5000);
}
