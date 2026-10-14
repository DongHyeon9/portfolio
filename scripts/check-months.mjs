// node scripts/check-months.mjs — 경력 계산 자체 점검 (Node 23.6+ 타입 제거로 .ts 직접 import)
import assert from 'node:assert/strict';
import { formatMonths, totalMonths } from '../app/months.ts';

const now = 2026 * 12 + 9; // 2026.10
assert.equal(totalMonths([{ start: '2025.12', end: '2026.10' }], now), 11);
assert.equal(totalMonths([{ start: '2024.02', end: '2025.05' }, { start: '2025.05', end: '2025.11' }], now), 22); // 겹친 2025.05는 1번
assert.equal(totalMonths([{ start: '2026.08' }], now), 3); // 진행 중
assert.equal(formatMonths(53), '4년 5개월');
assert.equal(formatMonths(12), '1년');
assert.equal(formatMonths(7), '7개월');
console.log('months ok');
