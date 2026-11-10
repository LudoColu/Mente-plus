(function () {
  'use strict';
  const E = window.CalcoloEngine;
  const app = document.getElementById('app');
  const KEY = 'menteplus-stats-v1';
  const PREF_KEY = 'menteplus-preferences-v1';
  const LEVELS = ['Base', 'Intermedio', 'Avanzato'];
  const tips = [
    'Per sommare 49 + 28, prova 50 + 28 - 1. Arrotondare può rendere i calcoli più veloci.',
    'Per moltiplicare per 9, moltiplica per 10 e sottrai una volta il numero.',
    'Per calcolare 15 × 6, puoi fare 10 × 6 + 5 × 6.',
    'Per sottrarre 98, sottrai prima 100 e poi aggiungi 2.'
  ];
  const defaultStats = { sessions: 0, totalCorrect: 0, totalAnswered: 0, bestSprint: 0, dailyStreak: 0, lastDay: '', xp: 0 };

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw && JSON.parse(raw);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
    } catch (_) { return fallback; }
  }
  const stored = load(KEY, defaultStats);
  const stats = { ...defaultStats };
  for (const k of ['sessions', 'totalCorrect', 'totalAnswered', 'bestSprint', 'dailyStreak', 'xp']) {
    if (Number.isSafeInteger(stored[k]) && stored[k] >= 0) stats[k] = stored[k];
  }
  if (typeof stored.lastDay === 'string') stats.lastDay = stored.lastDay;

  const prefs = load(PREF_KEY, { mode: 'practice', level: 0 });
  const state = {
    screen: 'home',
    mode: prefs.mode === 'sprint' ? 'sprint' : 'practice',
    level: Number.isInteger(prefs.level) ? E.clamp(prefs.level, 0, 2) : 0,
    game: null,
    lastResult: null
  };

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(stats)); } catch (_) { /* Private browsing or storage disabled. */ }
  }
  function savePrefs() {
    try { localStorage.setItem(PREF_KEY, JSON.stringify({ mode: state.mode, level: state.level })); } catch (_) {}
  }
  function percent(n, total) { return total ? Math.round(n / total * 100) : 0; }
  function pad2(number) { return String(number).padStart(2, '0'); }
  function timeText(seconds) { return `${pad2(Math.floor(seconds / 60))}:${pad2(seconds % 60)}`; }
  function visibleDailyStreak() {
    const gap = stats.lastDay ? E.dayDifference(stats.lastDay, E.localDateStamp()) : null;
    return gap !== null && gap >= 0 && gap <= 1 ? stats.dailyStreak : 0;
  }
  function topbar(subtitle = '') {
    return `<div class="topbar"><div class="brand"><span class="brand-icon" aria-hidden="true">+</span><span>Mente<span style="color:var(--mint)">+</span></span></div><span class="topbar-right">${subtitle || 'ALLENAMENTO MENTALE'}</span></div>`;
  }

  function renderHome() {
    const accuracy = percent(stats.totalCorrect, stats.totalAnswered);
    const tip = tips[(new Date().getDate() - 1) % tips.length];
    return `${topbar()}
      <main>
      <div class="home-hero">
        <div class="eyebrow">PICCOLI ESERCIZI, GRANDI PROGRESSI</div>
        <h1>La mente<br>si <span class="highlight">allena.</span></h1>
        <p class="subheading">Dieci domande al giorno per diventare più rapido, preciso e sicuro con i numeri.</p>
        <div class="hero-art" aria-hidden="true"><span class="math-pill one">÷</span><span class="math-pill two">+</span><span class="math-pill three">×</span></div>
      </div>
      <div class="section-heading"><h2>I tuoi progressi</h2><span class="section-caption">Sul tuo iPhone</span></div>
      <div class="stats-grid">
        <div class="stat"><div class="stat-icon" aria-hidden="true">🔥</div><div class="stat-value">${visibleDailyStreak()}</div><div class="stat-label">giorni di fila</div></div>
        <div class="stat"><div class="stat-icon" aria-hidden="true">🎯</div><div class="stat-value">${accuracy}%</div><div class="stat-label">precisione</div></div>
        <div class="stat"><div class="stat-icon" aria-hidden="true">⚡</div><div class="stat-value">${stats.xp}</div><div class="stat-label">punti XP</div></div>
      </div>
      <div class="section-heading"><h2>Scegli la sfida</h2></div>
      <div class="mode-grid" role="group" aria-label="Modalità di allenamento">
        <button class="mode-card ${state.mode === 'practice' ? 'selected' : ''}" data-action="mode" data-value="practice" aria-pressed="${state.mode === 'practice'}"><div class="mode-icon" aria-hidden="true">🧠</div><div class="mode-title">Allenamento</div><div class="mode-desc">10 esercizi, senza fretta</div></button>
        <button class="mode-card ${state.mode === 'sprint' ? 'selected' : ''}" data-action="mode" data-value="sprint" aria-pressed="${state.mode === 'sprint'}"><div class="mode-icon" aria-hidden="true">⏱️</div><div class="mode-title">Sprint</div><div class="mode-desc">Più risposte in 60 secondi</div></button>
      </div>
      <div class="section-heading"><h2>Da dove partiamo?</h2><span class="section-caption">Si adatta ai risultati</span></div>
      <div class="level-row" role="group" aria-label="Difficoltà iniziale">
        ${LEVELS.map((x, i) => `<button class="level-btn ${state.level === i ? 'selected' : ''}" data-action="level" data-value="${i}" aria-pressed="${state.level === i}">${x}</button>`).join('')}
      </div>
      <button class="primary-btn" data-action="start">Inizia ad allenarti <span aria-hidden="true">→</span></button>
      <aside class="tip-card"><strong>Trucco mentale del giorno</strong>${tip}</aside>
      <div class="footer">Nessun account richiesto · Dati salvati su questo dispositivo</div>
      </main>`;
  }

  function renderGame() {
    const g = state.game;
    const isSprint = g.mode === 'sprint';
    const left = isSprint ? Math.max(0, Math.ceil((g.deadline - Date.now()) / 1000)) : 0;
    const progress = isSprint ? ((60 - left) / 60 * 100) : (g.attempted / 10 * 100);
    return `<main>
      <div class="game-header">
        <button class="icon-btn" aria-label="Torna alla home" data-action="exit">←</button>
        <div><div class="game-mode-title">${isSprint ? 'Sprint mentale' : 'Allenamento quotidiano'}</div><div class="game-mode-subtitle">Livello ${LEVELS[g.currentLevel].toLowerCase()}</div></div>
        <span class="topbar-right">+${g.correct * 10} XP</span>
      </div>
      <div class="game-summary">
        <span class="game-metric">${isSprint ? `Corrette <strong>${g.correct}</strong>` : `Domanda <strong>${Math.min(g.attempted + 1, 10)}/10</strong>`}</span>
        <span id="timer" class="game-metric timer ${left <= 10 && isSprint ? 'meter-warn' : ''}">${isSprint ? timeText(left) : `✓ ${g.correct} corrette`}</span>
      </div>
      <div class="progress-track" role="progressbar" aria-label="Progresso sessione" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress)}"><div id="progress-fill" class="progress-fill" style="width:${progress}%"></div></div>
      <div class="problem-card">
        <div class="problem-kicker">Quanto fa?</div>
        <div class="equation">${g.problem.label} <span style="color:var(--mint)">=</span></div>
        <div class="answer-box" aria-live="polite">${g.input ? g.input.replace('-', '−') : '<span class="placeholder">?</span>'}</div>
      </div>
      <div class="feedback ${g.feedbackKind || ''}" role="status" aria-live="polite">${g.feedback || 'Scrivi la risposta qui sotto'}</div>
      <div class="keypad" aria-label="Tastierino numerico">
        ${['1','2','3','4','5','6','7','8','9','±','0','⌫'].map(k => `<button class="key ${k === '±' || k === '⌫' ? 'special' : ''}" data-action="key" data-value="${k}" aria-label="${k === '±' ? 'Cambia segno' : k === '⌫' ? 'Cancella ultima cifra' : k}">${k}</button>`).join('')}
      </div>
      <button class="primary-btn submit-btn" data-action="submit" ${!g.input || g.input === '-' ? 'disabled' : ''}>Conferma risposta <span aria-hidden="true">→</span></button>
      <div class="game-small-note">${isSprint ? 'Il tempo continua anche quando cambi app.' : 'Tre risposte giuste consecutive possono alzare il livello.'}</div>
    </main>`;
  }

  function renderResult() {
    const r = state.lastResult;
    const acc = percent(r.correct, r.attempted);
    return `${topbar(`SESSIONE #${stats.sessions}`)}
      <main>
      <div class="result-intro"><div class="result-icon" aria-hidden="true">★</div>
        <h1>${r.correct >= 8 ? 'Grandissimo!' : r.correct >= 4 ? 'Ottimo lavoro!' : 'Ben fatto!'}</h1>
        <p>Hai concluso ${r.mode === 'sprint' ? 'uno sprint da 60 secondi' : 'il tuo allenamento'}. Ogni sessione ti rende più veloce.</p>
      </div>
      <section class="result-panel" aria-label="Risultato della sessione">
        <div class="result-score">${r.correct}</div>
        <div class="result-score-caption">risposte corrette ${r.mode === 'practice' ? 'su 10' : ''}</div>
        <div class="result-divider"></div>
        <div class="result-metrics">
          <div><div class="result-metric-value">${acc}%</div><div class="result-metric-label">Precisione</div></div>
          <div><div class="result-metric-value">+${r.xp}</div><div class="result-metric-label">XP guadagnati</div></div>
        </div>
      </section>
      ${r.newRecord ? '<div class="result-newbest">🏆 Nuovo record personale nello sprint!</div>' : ''}
      <div class="result-actions"><button class="primary-btn" data-action="start">Allenati ancora <span aria-hidden="true">→</span></button><button class="secondary-btn" data-action="home">Torna alla home</button></div>
      <div class="footer">${stats.sessions} sessioni completate · Record sprint: ${stats.bestSprint} corrette</div>
      </main>`;
  }

  function render() {
    app.innerHTML = state.screen === 'home' ? renderHome() : state.screen === 'game' ? renderGame() : renderResult();
  }

  function start() {
    const mode = state.mode;
    const currentLevel = state.level;
    state.game = {
      mode, baseLevel: state.level, currentLevel, problem: E.makeProblem(currentLevel),
      input: '', attempted: 0, correct: 0,
      consecutiveCorrect: 0, consecutiveWrong: 0,
      feedback: '', feedbackKind: '', deadline: mode === 'sprint' ? Date.now() + 60000 : null
    };
    state.screen = 'game';
    render();
  }

  function enterKey(value) {
    const g = state.game;
    if (!g || state.screen !== 'game') return;
    if (value === '⌫') g.input = g.input.slice(0, -1);
    else if (value === '±') {
      g.input = g.input.startsWith('-') ? g.input.slice(1) : '-' + (g.input || '');
    } else if (/^\d$/.test(value)) {
      if (g.input.replace('-', '').length >= 6) return;
      if (g.input === '0') g.input = value;
      else if (g.input === '-0') g.input = '-' + value;
      else g.input += value;
    }
    // Update only the answer display to avoid replacing the entire keypad on every tap.
    const box = app.querySelector('.answer-box');
    if (box) box.textContent = g.input ? g.input.replace('-', '−') : '?';
    if (box) box.classList.toggle('placeholder', !g.input);
    const submit = app.querySelector('[data-action="submit"]');
    if (submit) submit.disabled = !g.input || g.input === '-';
  }

  function submit() {
    const g = state.game;
    if (state.screen !== 'game' || !g || !g.input || g.input === '-') return;
    if (g.mode === 'sprint' && Date.now() >= g.deadline) { finish(); return; }
    const value = Number(g.input);
    const isCorrect = value === g.problem.answer;
    g.attempted += 1;
    if (isCorrect) {
      g.correct += 1;
      g.consecutiveCorrect += 1;
      g.consecutiveWrong = 0;
      g.feedback = '✓ Esatto! Continua così.';
      g.feedbackKind = 'good';
      if (g.consecutiveCorrect >= 3) {
        g.currentLevel = E.clamp(g.currentLevel + 1, 0, 2);
        g.consecutiveCorrect = 0;
      }
    } else {
      g.consecutiveWrong += 1;
      g.consecutiveCorrect = 0;
      g.feedback = `La risposta era ${g.problem.answer}. Riprova con il prossimo!`;
      g.feedbackKind = 'bad';
      if (g.consecutiveWrong >= 2) {
        g.currentLevel = E.clamp(g.currentLevel - 1, 0, 2);
        g.consecutiveWrong = 0;
      }
    }
    if (g.mode === 'practice' && g.attempted >= 10) { finish(); return; }
    g.problem = E.makeProblem(g.currentLevel);
    g.input = '';
    render();
  }

  function finish() {
    if (state.screen !== 'game' || !state.game) return;
    const g = state.game;
    const earnedXP = g.correct * 10 + 5;
    const newRecord = g.mode === 'sprint' && g.correct > stats.bestSprint;
    stats.sessions += 1;
    stats.totalCorrect += g.correct;
    stats.totalAnswered += g.attempted;
    stats.xp += earnedXP;
    E.updateDailyStreak(stats, E.localDateStamp());
    if (newRecord) stats.bestSprint = g.correct;
    persist();
    state.lastResult = { correct: g.correct, attempted: g.attempted, mode: g.mode, xp: earnedXP, newRecord };
    state.game = null;
    state.screen = 'result';
    render();
  }

  function tick() {
    const g = state.game;
    if (state.screen !== 'game' || !g || g.mode !== 'sprint') return;
    const timeLeft = Math.max(0, Math.ceil((g.deadline - Date.now()) / 1000));
    if (timeLeft <= 0) { finish(); return; }
    const timer = document.getElementById('timer');
    if (timer) {
      timer.textContent = timeText(timeLeft);
      timer.classList.toggle('meter-warn', timeLeft <= 10);
    }
    const progress = document.getElementById('progress-fill');
    if (progress) {
      progress.style.width = `${((60 - timeLeft) / 60) * 100}%`;
      progress.parentElement.setAttribute('aria-valuenow', String(Math.round((60 - timeLeft) / 60 * 100)));
    }
  }

  app.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'mode') { state.mode = button.dataset.value; savePrefs(); render(); }
    else if (action === 'level') { state.level = Number(button.dataset.value); savePrefs(); render(); }
    else if (action === 'start') start();
    else if (action === 'home' || action === 'exit') { state.game = null; state.screen = 'home'; render(); }
    else if (action === 'key') enterKey(button.dataset.value);
    else if (action === 'submit') submit();
  });
  document.addEventListener('keydown', event => {
    if (state.screen !== 'game' || event.altKey || event.ctrlKey || event.metaKey) return;
    if (/^\d$/.test(event.key)) enterKey(event.key);
    else if (event.key === 'Backspace') { event.preventDefault(); enterKey('⌫'); }
    else if (event.key === '-') enterKey('±');
    else if (event.key === 'Enter') submit();
  });
  document.addEventListener('visibilitychange', tick);
  setInterval(tick, 250);
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
  render();
})();
