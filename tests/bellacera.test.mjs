import test from 'node:test';
import assert from 'node:assert/strict';
import {CHAPTERS,GOALS,GOAL_MAP,PRODUCTIONS,PROJECTS,SEED} from '../src/bellacera/data.ts';
import {NEW_WORLD,validateBackup} from '../src/bellacera/model.ts';
import {chapterProgress,concreteRecipe,nextGoals,projectState,unmetRequirements,worldProgress} from '../src/bellacera/logic.ts';

test('sete capítulos livres, objetivos únicos e referências válidas',()=>{
  assert.equal(CHAPTERS.length,7);
  assert.equal(CHAPTERS.map(c=>c.id).join(','),'1,2,3,4,5,6,7');
  assert.equal(NEW_WORLD.seed,SEED);
  const ids=new Set(GOALS.map(g=>g.id));
  assert.equal(ids.size,GOALS.length);
  assert.ok(GOALS.length>=60);
  for(const goal of GOALS){
    assert.ok(CHAPTERS.some(c=>c.id===goal.chapter));
    assert.ok(goal.title&&goal.description&&goal.tip);
    for(const dep of goal.requires)assert.ok(ids.has(dep),goal.id+' requer objetivo inexistente '+dep);
  }
  for(const production of PRODUCTIONS){
    assert.ok(ids.has(production.goalId));
    for(const dep of production.requires)assert.ok(ids.has(dep));
  }
  for(const project of PROJECTS){
    assert.ok(ids.has(project.goalId));
    for(const prod of project.productionIds)assert.ok(PRODUCTIONS.some(p=>p.id===prod),project.id+' usa produção inexistente');
  }
  assert.ok(PROJECTS.some(p=>p.id==='ikea'));
  assert.ok(PROJECTS.some(p=>p.id==='witch'));
});

test('marcos são livres, dependências não impedem a marcação',()=>{
  const world={...NEW_WORLD,completed:{}};
  const ahead=GOAL_MAP['c6-dragon'];
  assert.ok(unmetRequirements(ahead,world).length>0);
  const completed={...world,completed:{'c6-dragon':123}};
  assert.equal(worldProgress(completed).complete,1);
  assert.ok(nextGoals(completed).every(g=>g.id!=='c6-dragon'));
  const ch6=chapterProgress(CHAPTERS[5],completed);
  assert.equal(ch6.complete,1);
  assert.ok(ch6.percent>0);
});

test('receita de concreto é arredondada por lotes de 8',()=>{
  assert.deepEqual(concreteRecipe(1000),{requested:1000,crafts:125,powder:1000,sand:500,gravel:500,dye:125,extra:0});
  assert.deepEqual(concreteRecipe(9),{requested:9,crafts:2,powder:16,sand:8,gravel:8,dye:2,extra:7});
  assert.equal(concreteRecipe(-100).sand,0);
});

test('backup v1 preserva atlas e histórico antigo, convertendo marcos compatíveis',()=>{
  const old={version:1,worldName:'Mundo antigo',seed:'123',completed:{'t1-build-1':1234,'t2-farm-3':1500,'t5-build-100':999},wheelHistory:[{id:'old',timestamp:300}],locations:[{id:'x',name:'Mina',x:120,y:64,z:-72,dimension:'overworld',kind:'farm',notes:'perto',createdAt:42}]};
  const migrated=validateBackup(old);
  assert.equal(migrated.version,2);
  assert.equal(migrated.worldName,'Mundo antigo');
  assert.equal(migrated.completed['c1-home'],1234);
  assert.equal(migrated.completed['c2-iron'],1500);
  assert.equal(migrated.locations[0].z,-72);
  assert.deepEqual(migrated.legacyArchive,old);
});

test('backup v2 descarta entradas incorretas e preserva progresso',()=>{
  const input={...NEW_WORLD,worldName:'Bellacera 2',completed:{'c1-world':125,unsafe:200},projects:{founder:'em-obra',unknown:'concluido'},
    targetConcrete:999,locations:[]};
  const copy=validateBackup(input);
  assert.deepEqual(copy.completed,{'c1-world':125});
  assert.deepEqual(copy.projects,{founder:'em-obra'});
  assert.equal(copy.targetConcrete,999);
  assert.equal(projectState('founder',copy),'em-obra');
  assert.equal(projectState('not-there',copy),'planejado');
  assert.throws(()=>validateBackup({version:3,completed:{}}),/incompatível/);
});
