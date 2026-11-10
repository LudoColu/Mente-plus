/* Pure game logic: testable and usable without a framework. */
(function (root) {
  'use strict';

  function randomInt(min, max, randomFn = Math.random) {
    return Math.floor(randomFn() * (max - min + 1)) + min;
  }

  function clamp(value, lower, upper) {
    return Math.max(lower, Math.min(upper, value));
  }

  function makeProblem(level, randomFn = Math.random) {
    const ranges = [
      { add: [2, 20], sub: [3, 20], mul: [2, 10], div: [2, 10] },
      { add: [15, 99], sub: [20, 99], mul: [3, 15], div: [3, 15] },
      { add: [55, 399], sub: [65, 300], mul: [8, 25], div: [8, 25] }
    ];
    const d = ranges[clamp(level, 0, 2)];
    const operators = ['+', '-', '×', '÷'];
    const operator = operators[randomInt(0, operators.length - 1, randomFn)];
    let a, b, answer;

    if (operator === '+') {
      a = randomInt(...d.add, randomFn);
      b = randomInt(...d.add, randomFn);
      answer = a + b;
    } else if (operator === '-') {
      a = randomInt(...d.sub, randomFn);
      b = randomInt(...d.sub, randomFn);
      // Easy and intermediate levels avoid negative answers.
      if (level < 2 && a < b) [a, b] = [b, a];
      answer = a - b;
    } else if (operator === '×') {
      a = randomInt(...d.mul, randomFn);
      b = randomInt(...d.mul, randomFn);
      answer = a * b;
    } else {
      const divisorRange = level === 0 ? [2, 10] : level === 1 ? [2, 12] : [3, 18];
      b = randomInt(...divisorRange, randomFn);
      const quotient = randomInt(...d.div, randomFn);
      a = b * quotient;
      answer = quotient;
    }

    return { a, b, operator, answer, label: `${a} ${operator} ${b}` };
  }

  function localDateStamp(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function dayDifference(from, to) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) return null;
    const start = Date.parse(`${from}T00:00:00Z`);
    const end = Date.parse(`${to}T00:00:00Z`);
    return Math.round((end - start) / 86400000);
  }

  function updateDailyStreak(stats, today) {
    const gap = stats.lastDay ? dayDifference(stats.lastDay, today) : null;
    if (gap === 0) return;
    if (gap === 1) stats.dailyStreak += 1;
    else stats.dailyStreak = 1;
    stats.lastDay = today;
  }

  const api = { clamp, randomInt, makeProblem, localDateStamp, dayDifference, updateDailyStreak };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.CalcoloEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
