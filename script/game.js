const GOAL_SCORE = 500;

// Inimigos: HP bem mais alto para exigir muito mais cliques até a meta de 500.
const ENEMIES = [
  { name: 'GOBLIN VERMELHO', img: IMG_ENEMY1, hp: 260, penalty: 10 },
  { name: 'TIKI GUERREIRO',  img: IMG_ENEMY2, hp: 340, penalty: 15 },
  { name: 'GOBLIN VERMELHO+',img: IMG_ENEMY1, hp: 430, penalty: 20 },
  { name: 'TIKI ANCIÃO',     img: IMG_ENEMY2, hp: 540, penalty: 25 },
  { name: 'GOBLIN REI',      img: IMG_ENEMY1, hp: 680, penalty: 30 },
];

// Upgrades: dano inicial bem baixo (1) para tornar o caminho até 500 mais longo.
const UPGRADES = [
  { id: 'orcrist',      name: 'Orcrist',        cost: 15,  dmg: 2,  desc: 'Espada Élfica' },
  { id: 'aerondight',   name: 'Aerondight',      cost: 35,  dmg: 3,  desc: 'Espada de Prata' },
  { id: 'dreamseeker',  name: 'Dreamseeker',     cost: 70,  dmg: 5,  desc: 'Lâmina Ancestral' },
  { id: 'bladeofchaos', name: 'Blade of Chaos',  cost: 120, dmg: 7,  desc: 'Garras do Caos' },
  { id: 'soulreaver',   name: 'Soul Reaver',     cost: 200, dmg: 10, desc: 'Lâmina das Almas' },
];

let state = {
  score: 0,
  enemyIndex: 0,
  enemyHp: 0,
  enemyMaxHp: 0,
  owned: new Set(),
  lastClick: 0,
  isDead: false,
  goalReached: false,      
  paused: false,           
  attackInProgress: false,
  attackTimer: null,
  dodgeWindow: false,
  dodgeDir: null,
};

const scoreEl        = document.getElementById('score-display');
const enemyNameEl    = document.getElementById('enemy-name-display');
const enemyLifeBar   = document.getElementById('enemy-life-bar');
const enemySprite    = document.getElementById('enemy-sprite');
const playerSprite   = document.getElementById('player-sprite');
const attackWarning  = document.getElementById('attack-warning');
const dodgePrompt    = document.getElementById('dodge-prompt');
const upgradesList   = document.getElementById('upgrades-list');
const victoryFlash   = document.getElementById('victory-flash');
const victoryScreen  = document.getElementById('victory-screen');
const victoryScoreEl = document.getElementById('victory-score');
const arena          = document.getElementById('arena');
const mainEl         = document.getElementById('main');

function getDamage() {
  let dmg = 1;
  for (let i = UPGRADES.length - 1; i >= 0; i--) {
    if (state.owned.has(UPGRADES[i].id)) { dmg = UPGRADES[i].dmg; break; }
  }
  return dmg;
}

function updateHud() {
  scoreEl.textContent = '★ ' + state.score;
  const e = ENEMIES[state.enemyIndex % ENEMIES.length];
  enemyNameEl.textContent = e.name;
  enemyLifeBar.style.width = Math.max(0, state.enemyHp / state.enemyMaxHp * 100) + '%';
}

function spawnEnemy() {
  const e = ENEMIES[state.enemyIndex % ENEMIES.length];
  state.enemyHp = e.hp; state.enemyMaxHp = e.hp;
  enemySprite.src = e.img;
  enemySprite.classList.remove('attacking', 'windup', 'hurt');
  enemySprite.classList.add('idle');
  updateHud();
}

function spawnFloat(text, x, y, cls) {
  const el = document.createElement('div');
  el.className = cls;
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  arena.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function spawnDustAt(x, y) {
  const el = document.createElement('div');
  el.className = 'dust-puff';
  el.style.left = (x - 7) + 'px';
  el.style.top  = (y - 7) + 'px';
  arena.appendChild(el);
  setTimeout(() => el.remove(), 420);
}

function spawnImpactRing(x, y) {
  const el = document.createElement('div');
  el.className = 'impact-ring';
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  arena.appendChild(el);
  setTimeout(() => el.remove(), 460);
}

function shakeScreen() {
  mainEl.classList.remove('shake');
  void mainEl.offsetWidth;
  mainEl.classList.add('shake');
  setTimeout(() => mainEl.classList.remove('shake'), 400);
}

function attackEnemy(e) {
  if (state.isDead || state.paused) return;
  // Importante: o jogador SEMPRE pode clicar para causar dano,
  // mesmo enquanto o inimigo está no meio do seu próprio ataque —
  // mas isso NÃO cancela nem atrasa o ataque do inimigo.
  const now = Date.now();
  if (now - state.lastClick < 160) return;
  state.lastClick = now;

  const dmg = getDamage();
  state.enemyHp -= dmg;
  state.score += dmg;

  const r = arena.getBoundingClientRect();
  spawnFloat('-' + dmg, e.clientX - r.left, e.clientY - r.top - 20, 'dmg-number');

  enemySprite.classList.remove('hurt');
  void enemySprite.offsetWidth;
  enemySprite.classList.add('hurt');
  setTimeout(() => enemySprite.classList.remove('hurt'), 350);

  if (state.enemyHp <= 0) {
    state.enemyHp = 0;
    updateHud();
    defeatEnemy();
  } else {
    updateHud();
  }

  checkGoal();
}

function defeatEnemy() {
  victoryFlash.style.display = 'block';
  setTimeout(() => victoryFlash.style.display = 'none', 500);

  state.enemyIndex = (state.enemyIndex + 1) % ENEMIES.length;
  setTimeout(() => {
    if (state.isDead || state.paused) return;
    spawnEnemy();
    renderUpgrades();
  }, 700);
}
// o inimigo ataca, independentemente de o jogador clicar ou não.
function scheduleEnemyAttack() {
  if (state.isDead || state.paused) return;
  clearTimeout(state.attackTimer);
  const delay = 2200 + Math.random() * 1800;
  state.attackTimer = setTimeout(startEnemyAttack, delay);
}

function startEnemyAttack() {
  if (state.isDead || state.paused) return;
  state.dodgeWindow = true;
  state.dodgeDir = null;

  enemySprite.classList.remove('idle');
  enemySprite.classList.remove('windup');
  void enemySprite.offsetWidth;
  enemySprite.classList.add('windup');

  attackWarning.style.display = 'block';
  dodgePrompt.style.display = 'flex';

  setTimeout(() => {
    attackWarning.style.display = 'none';
    dodgePrompt.style.display = 'none';

    enemySprite.classList.remove('windup');
    enemySprite.classList.remove('attacking');
    void enemySprite.offsetWidth;
    enemySprite.classList.add('attacking');

    setTimeout(() => {
      enemySprite.classList.remove('attacking');
      enemySprite.classList.add('idle');
      resolveEnemyAttack();
    }, 480);
  }, 1100);
}

function resolveEnemyAttack() {
  if (state.isDead) return;
  const e = ENEMIES[state.enemyIndex % ENEMIES.length];
  const r = arena.getBoundingClientRect();
  const cx = r.width / 2, cy = r.height * 0.62;

  if (state.dodgeDir !== null) {
    spawnFloat('MISS', cx - 16, cy - 30, 'dmg-number miss');
  } else {
    // Penaliza pontuação (nunca abaixo de zero) em vez de "matar" o jogador
    const penalty = e.penalty;
    if (state.score > 0) {
      state.score = Math.max(0, state.score - penalty);
    }
    spawnFloat('-' + penalty + ' ★', cx - 24, cy - 30, 'score-penalty');
    spawnImpactRing(cx, cy);
    shakeScreen();

    playerSprite.classList.remove('hit-taken');
    void playerSprite.offsetWidth;
    playerSprite.classList.add('hit-taken');
    setTimeout(() => playerSprite.classList.remove('hit-taken'), 450);

    updateHud();
  }

  state.dodgeWindow = false;
  state.dodgeDir = null;

  if (!state.paused) scheduleEnemyAttack();
}

function dodge(dir) {
  if (!state.dodgeWindow || state.dodgeDir !== null || state.isDead || state.paused) return;
  state.dodgeDir = dir;
  playerSprite.src = dir === 'left' ? IMG_PLAYER_LEFT : IMG_PLAYER_RIGHT;
  playerSprite.className = dir === 'left' ? 'dodge-left' : 'dodge-right';

  const r = arena.getBoundingClientRect();
  const px = r.width / 2 + (dir === 'left' ? -60 : 60);
  const py = r.height - 110;
  spawnDustAt(px, py);

  setTimeout(() => {
    playerSprite.src = IMG_PLAYER_FRONT;
    playerSprite.className = '';
  }, 350);
}
// Meta de 500 pontos
function checkGoal() {
  if (!state.goalReached && state.score >= GOAL_SCORE) {
    state.goalReached = true;
    triggerVictory();
  }
}

function triggerVictory() {
  state.paused = true;
  clearTimeout(state.attackTimer);
  attackWarning.style.display = 'none';
  dodgePrompt.style.display = 'none';

  victoryScoreEl.textContent = 'Pontuação final: ★ ' + state.score;
  victoryScreen.style.display = 'flex';
  spawnVictorySparks();
}

function spawnVictorySparks() {
  const colors = ['#ffd700', '#ffae00', '#fff3b0'];
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'victory-spark';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDelay = (Math.random() * 0.4) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2200);
    }, i * 40);
  }
}

function continueAfterVictory() {
  victoryScreen.style.display = 'none';
  state.paused = false;
  scheduleEnemyAttack();
}

function stopAfterVictory() {
  victoryScreen.querySelector('.victory-buttons').innerHTML =
    '<div style="font-size:8px;color:#9080b0;max-width:300px;">Jornada encerrada com ★ ' + state.score + ' pontos. Obrigado por jogar! Recarregue a página para começar de novo, se quiser.</div>';
}
//lolja
function renderUpgrades() {
  upgradesList.innerHTML = '';
  UPGRADES.forEach((upg, i) => {
    const owned   = state.owned.has(upg.id);
    const locked  = i > 0 && !state.owned.has(UPGRADES[i - 1].id);
    const canAfford = state.score >= upg.cost;

    const div = document.createElement('div');
    div.className = 'upg-item' + (owned ? ' owned' : '') + (locked ? ' locked' : '');

    if (owned) {
      div.innerHTML = `<div class="upg-name">${upg.name}</div><div class="upg-owned-badge">✓ EQUIPADO</div><div class="upg-stats">+${upg.dmg} dano</div>`;
    } else if (locked) {
      div.innerHTML = `<div class="upg-name">${upg.name}</div><div class="upg-locked-msg">🔒 bloqueado</div><div class="upg-stats">+${upg.dmg} dano</div>`;
    } else {
      div.innerHTML = `
        <div class="upg-name">${upg.name}</div>
        <div class="upg-stats">+${upg.dmg} dano · ${upg.desc}</div>
        <div class="upg-cost" style="color:${canAfford ? '#ffd700' : '#553322'}">★ ${upg.cost}${canAfford ? ' ✓' : ' ✗'}</div>
      `;
      div.addEventListener('click', () => buyUpgrade(upg.id));
    }
    upgradesList.appendChild(div);
  });
}

function buyUpgrade(id) {
  const upg = UPGRADES.find(u => u.id === id);
  if (!upg || state.owned.has(id) || state.score < upg.cost) return;
  state.score -= upg.cost;
  state.owned.add(id);
  updateHud();
  renderUpgrades();
}

function restart() {
  state.score = 0;
  state.enemyIndex = 0;
  state.owned = new Set();
  state.isDead = false;
  state.goalReached = false;
  state.paused = false;
  state.attackInProgress = false;
  state.dodgeWindow = false;
  state.dodgeDir = null;
  clearTimeout(state.attackTimer);

  victoryScreen.style.display = 'none';
  attackWarning.style.display = 'none';
  dodgePrompt.style.display = 'none';
  playerSprite.src = IMG_PLAYER_FRONT;
  playerSprite.className = '';

  renderUpgrades();
  spawnEnemy();
  updateHud();
  scheduleEnemyAttack();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') dodge('left');
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') dodge('right');
});
enemySprite.addEventListener('click', attackEnemy);
document.getElementById('m-left').addEventListener('click', () => dodge('left'));
document.getElementById('m-right').addEventListener('click', () => dodge('right'));
document.getElementById('continue-btn').addEventListener('click', continueAfterVictory);
document.getElementById('stop-btn').addEventListener('click', stopAfterVictory);

function spawnFireflies() {
  const bg = document.getElementById('bg');
  const count = 14;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'firefly';
    el.style.left = (Math.random() * 100) + '%';
    el.style.top = (40 + Math.random() * 50) + '%';
    el.style.animationDelay = (Math.random() * 6) + 's';
    el.style.animationDuration = (5 + Math.random() * 4) + 's';
    bg.appendChild(el);
  }
}

playerSprite.src = IMG_PLAYER_FRONT;
spawnEnemy();
renderUpgrades();
updateHud();
scheduleEnemyAttack();
spawnFireflies();
