import { TIERS } from './content.ts';
import type { AppState, Tier } from './types';

/** The series requires every mandatory non-farm objective and half the available farms.
 * Farm selection is free: no individual farm is mandatory, regardless of its old tag.
 * Non-farm extras remain optional. The calculations derive from saved objective IDs,
 * so existing worlds and JSON backups need no migration.
 */
export function tierStats(tier: Tier, completed: AppState['completed']) {
  const mandatory = tier.goals.filter((goal) => goal.category !== 'farm' && !goal.optional);
  const farms = tier.goals.filter((goal) => goal.category === 'farm');
  const extras = tier.goals.filter((goal) => goal.category !== 'farm' && goal.optional);
  const mandatoryDone = mandatory.filter((goal) => Boolean(completed[goal.id])).length;
  const farmDone = farms.filter((goal) => Boolean(completed[goal.id])).length;
  const farmMinimum = Math.ceil(farms.length / 2);
  const done = mandatoryDone + Math.min(farmDone, farmMinimum);
  const total = mandatory.length + farmMinimum;
  const ready = mandatoryDone === mandatory.length && farmDone >= farmMinimum;
  const bonusDone = extras.filter((goal) => Boolean(completed[goal.id])).length + Math.max(0, farmDone - farmMinimum);
  const bonusTotal = extras.length + farms.length - farmMinimum;
  return {
    done, total, percent: total ? Math.round(done * 100 / total) : 100,
    ready, mandatoryDone, mandatoryTotal: mandatory.length,
    farmDone, farmTotal: farms.length, farmMinimum,
    bonusDone, bonusTotal,
  };
}

export function isTierUnlocked(tierId: number, completed: AppState['completed']) {
  return TIERS.filter((tier) => tier.id < tierId).every((tier) => tierStats(tier, completed).ready);
}

/** Next meaningful unfinished task, preferring mandatory tasks before the farm quota. */
export function nextGoal(tier: Tier, completed: AppState['completed']) {
  const mandatory = tier.goals.find((goal) => goal.category !== 'farm' && !goal.optional && !completed[goal.id]);
  if (mandatory) return mandatory;
  if (tierStats(tier, completed).farmDone < tierStats(tier, completed).farmMinimum) {
    return tier.goals.find((goal) => goal.category === 'farm' && !completed[goal.id]);
  }
  return undefined;
}
