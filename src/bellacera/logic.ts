import { CHAPTERS, GOALS, GOAL_MAP, PRODUCTIONS, PROJECTS } from './data.ts';
import type { Chapter, Goal } from './data.ts';
import type { World } from './model.ts';

export const done=(world:World,id:string)=>Boolean(world.completed[id]);
export function chapterProgress(chapter:Chapter,world:World) {
  const goals=GOALS.filter(g=>g.chapter===chapter.id);
  const required=goals.filter(g=>!g.optional);
  const complete=required.filter(g=>done(world,g.id)).length;
  const optionalDone=goals.filter(g=>g.optional&&done(world,g.id)).length;
  return {complete,total:required.length,optionalDone,optionalTotal:goals.length-required.length,
    percent:required.length?Math.round(complete*100/required.length):100};
}
export function worldProgress(world:World) {
  const essential=GOALS.filter(g=>!g.optional);
  const complete=essential.filter(g=>done(world,g.id)).length;
  return {complete,total:essential.length,percent:Math.round(100*complete/essential.length),
    buildDone:PROJECTS.filter(p=>world.projects[p.id]==='concluido'||done(world,p.goalId)).length,
    productionDone:PRODUCTIONS.filter(p=>done(world,p.goalId)).length};
}
export function unmetRequirements(goal:Goal,world:World) {
  return goal.requires.filter(id=>GOAL_MAP[id]&&!done(world,id)).map(id=>GOAL_MAP[id]);
}
export function nextGoals(world:World,limit=5) {
  return GOALS.filter(g=>!done(world,g.id)).sort((a,b)=>{
    const aScore=(a.chapter===world.activeChapter?0:Math.abs(a.chapter-world.activeChapter)+3)*100+
      (a.optional?30:0)+unmetRequirements(a,world).length*10;
    const bScore=(b.chapter===world.activeChapter?0:Math.abs(b.chapter-world.activeChapter)+3)*100+
      (b.optional?30:0)+unmetRequirements(b,world).length*10;
    return aScore-bScore||GOALS.indexOf(a)-GOALS.indexOf(b);
  }).slice(0,limit);
}
export function concreteRecipe(blocks:number) {
  const requested=Number.isFinite(blocks)?Math.max(0,Math.ceil(blocks)):0;
  const crafts=Math.ceil(requested/8);
  return {requested,crafts,powder:crafts*8,sand:crafts*4,gravel:crafts*4,dye:crafts,extra:crafts*8-requested};
}
export function projectState(projectId:string,world:World) {
  const project=PROJECTS.find(p=>p.id===projectId);
  if(!project)return 'planejado';
  return world.projects[projectId]??(done(world,project.goalId)?'concluido':'planejado');
}
export function pendingProjects(world:World) {
  return PROJECTS.filter(p=>projectState(p.id,world)!=='concluido').sort((a,b)=>a.chapter-b.chapter);
}
export {CHAPTERS,GOALS,PRODUCTIONS,PROJECTS};
