import test from 'node:test';
import assert from 'node:assert/strict';
import { TIERS, WHEEL_CHALLENGES, CATEGORIES } from '../src/content.ts';
import { NEW_WORLD, validateBackup } from '../src/store.ts';

test('jornada contém cinco eras e objetivos identificáveis', () => {
  assert.equal(TIERS.length, 5);
  const goals = TIERS.flatMap((tier) => tier.goals);
  assert.ok(goals.length > 100);
  assert.equal(new Set(goals.map((goal) => goal.id)).size, goals.length);
  assert.ok(TIERS.every((tier) => tier.goals.some((goal) => !goal.optional)));
  assert.ok(goals.every((goal) => goal.title && goal.description && goal.tip));
  assert.ok(goals.every((goal) => CATEGORIES.some((category) => category.id === goal.category)));
});

test('roleta possui desafios distintos', () => {
  assert.equal(WHEEL_CHALLENGES.length, 10);
  assert.equal(new Set(WHEEL_CHALLENGES.map((challenge) => challenge.id)).size, 10);
});

test('importação de backup preserva dados válidos e rejeita formatos incompatíveis', () => {
  const saved = { ...NEW_WORLD, worldName: 'Meu castelo', completed: { 't1-build-1': 12345 }, locations: [] };
  const imported = validateBackup(JSON.parse(JSON.stringify(saved)));
  assert.equal(imported.worldName, 'Meu castelo');
  assert.equal(imported.completed['t1-build-1'], 12345);
  assert.throws(() => validateBackup({ version: 2, completed: {} }), /incompatível/);
  assert.deepEqual(validateBackup({ ...NEW_WORLD, completed: { bad: 100, 't1-farm-1': 200 } }).completed, { 't1-farm-1': 200 });
});
