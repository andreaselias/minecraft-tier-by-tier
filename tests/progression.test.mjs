import test from 'node:test';
import assert from 'node:assert/strict';
import { TIERS } from '../src/content.ts';
import { tierStats, isTierUnlocked, nextGoal } from '../src/progression.ts';

const mark = (goals) => Object.fromEntries(goals.map((goal, i) => [goal.id, i + 1]));

test('metade das fazendas arredonda para cima e qualquer fazenda conta', () => {
  const tier = TIERS[0];
  const farms = tier.goals.filter((goal) => goal.category === 'farm');
  const mandatory = tier.goals.filter((goal) => goal.category !== 'farm' && !goal.optional);
  const minimum = Math.ceil(farms.length / 2);
  assert.equal(minimum, 5); // nine Tier 1 farms
  const justBefore = tierStats(tier, mark([...mandatory, ...farms.slice(-minimum + 1)]));
  assert.equal(justBefore.ready, false);
  assert.equal(justBefore.farmDone, minimum - 1);
  const withAnyFarms = tierStats(tier, mark([...mandatory, ...farms.slice(-minimum)]));
  assert.equal(withAnyFarms.ready, true);
  assert.equal(withAnyFarms.percent, 100);
});

test('apenas as fazendas não bastam para liberar era seguinte', () => {
  const tier = TIERS[0];
  const farms = tier.goals.filter((goal) => goal.category === 'farm');
  const mandatory = tier.goals.filter((goal) => goal.category !== 'farm' && !goal.optional);
  const completed = mark([...farms, ...mandatory.slice(0, -1)]);
  assert.equal(isTierUnlocked(2, completed), false);
  assert.equal(nextGoal(tier, completed)?.id, mandatory.at(-1)?.id);
});

test('fazendas excedentes são bônus; etapa seguinte desbloqueia sem extras', () => {
  const tier = TIERS[0];
  const farms = tier.goals.filter((goal) => goal.category === 'farm');
  const mandatory = tier.goals.filter((goal) => goal.category !== 'farm' && !goal.optional);
  const completed = mark([...mandatory, ...farms.slice(0, 5)]);
  assert.equal(isTierUnlocked(2, completed), true);
  assert.equal(isTierUnlocked(3, completed), false);
  assert.equal(nextGoal(tier, completed), undefined);
  assert.equal(tierStats(tier, mark([...mandatory, ...farms])).bonusDone, 4);
});

test('eras sem fazendas precisariam apenas dos objetivos mandatórios', () => {
  const tier = { ...TIERS[0], goals: TIERS[0].goals.filter((goal) => goal.category !== 'farm') };
  const mandatory = tier.goals.filter((goal) => !goal.optional);
  const stats = tierStats(tier, mark(mandatory));
  assert.equal(stats.farmMinimum, 0);
  assert.equal(stats.ready, true);
});
