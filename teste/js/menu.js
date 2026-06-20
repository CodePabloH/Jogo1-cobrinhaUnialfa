// MENU - menu.js
// salva a dificuldade escolhida e desenha a cobrinha animada decorativa

// quando o usuário muda o select, guarda a escolha pro jogo usar depois
const selectDificuldade = document.getElementById('select-dificuldade');

selectDificuldade.addEventListener('change', function () {
  const velocidade = selectDificuldade.value;
  const nome = selectDificuldade.options[selectDificuldade.selectedIndex].text;
  localStorage.setItem('velocidadeEscolhida', velocidade);
  localStorage.setItem('nivelEscolhido', nome);
});

// já salva o valor padrão (Médio) caso o usuário nem toque no select
if (!localStorage.getItem('velocidadeEscolhida')) {
  localStorage.setItem('velocidadeEscolhida', selectDificuldade.value);
  localStorage.setItem('nivelEscolhido', 'Médio');
}

// mostra a melhor pontuação salva
document.getElementById('melhor-pontuacao').textContent = localStorage.getItem('snakeBest') || 0;

// monta a lista com o histórico das últimas partidas jogadas
function mostrarHistorico() {
  var historico = JSON.parse(localStorage.getItem('snakeHistorico')) || [];
  var lista = document.getElementById('lista-historico');
  lista.innerHTML = '';

  if (historico.length === 0) {
    lista.innerHTML = '<li>Nenhuma partida ainda</li>';
    return;
  }

  historico.forEach(function (pontuacao, indice) {
    var item = document.createElement('li');
    item.innerHTML = '<span>Partida ' + (indice + 1) + '</span><span>' + pontuacao + ' pts</span>';
    lista.appendChild(item);
  });
}

mostrarHistorico();


// ─── cobra decorativa, andando em forma de S na área da direita ───
var areaEl = document.getElementById('area-cobra');
var canvas = document.getElementById('canvas-menu');
var ctx = canvas.getContext('2d');

canvas.width = areaEl.offsetWidth;
canvas.height = areaEl.offsetHeight;

var T = 16;
var COLS = Math.floor(canvas.width / T);
var ROWS = Math.floor(canvas.height / T);

var cobra = [];
var direcao = { x: 1, y: 0 };
var frameCount = 0;
var COMPRIMENTO = 12;

function buildWaypoints() {
  var r = ROWS - 2;
  var c = COLS - 2;
  return [
    { x: c, y: 1 },
    { x: c, y: 3 },
    { x: 1, y: 3 },
    { x: 1, y: 5 },
    { x: c, y: 5 },
    { x: c, y: 7 },
    { x: 1, y: 7 },
    { x: 1, y: 1 },
  ];
}

var waypoints = buildWaypoints();
var wpIdx = 0;

function initCobra() {
  cobra = [];
  for (var i = 0; i < COMPRIMENTO; i++) {
    cobra.push({ x: -i - 1, y: 1 });
  }
  direcao = { x: 1, y: 0 };
  wpIdx = 0;
}

function step() {
  var head = cobra[0];
  var wp = waypoints[wpIdx];

  if (head.x === wp.x && head.y === wp.y) {
    wpIdx = (wpIdx + 1) % waypoints.length;
    wp = waypoints[wpIdx];
  }

  var dx = 0, dy = 0;
  if (wp.x > head.x) dx = 1;
  else if (wp.x < head.x) dx = -1;
  else if (wp.y > head.y) dy = 1;
  else if (wp.y < head.y) dy = -1;

  if (dx === 0 && dy === 0) { dx = direcao.x; dy = direcao.y; }
  if (dx === -direcao.x && direcao.x !== 0) dx = direcao.x;
  if (dy === -direcao.y && direcao.y !== 0) dy = direcao.y;

  direcao = { x: dx, y: dy };
  cobra.unshift({ x: head.x + dx, y: head.y + dy });
  cobra.pop();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 0.4;
  for (var c = 0; c < COLS; c++)
    for (var r = 0; r < ROWS; r++)
      ctx.strokeRect(c * T, r * T, T, T);

  for (var i = cobra.length - 1; i >= 1; i--) {
    var seg = cobra[i];
    if (seg.x < 0 || seg.x >= COLS || seg.y < 0 || seg.y >= ROWS) continue;

    var ratio = 1 - i / cobra.length;
    var verde = Math.round(80 + ratio * 120);
    ctx.fillStyle = 'rgb(20,' + verde + ',30)';
    ctx.fillRect(seg.x * T + 1, seg.y * T + 1, T - 2, T - 2);

    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(seg.x * T + 4, seg.y * T + 4, T - 8, T - 8);
    }

    ctx.strokeStyle = 'rgba(61,220,74,' + (0.12 + ratio * 0.28) + ')';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(seg.x * T + 1, seg.y * T + 1, T - 2, T - 2);
  }

  var cab = cobra[0];
  if (cab.x >= 0 && cab.x < COLS && cab.y >= 0 && cab.y < ROWS) {
    ctx.fillStyle = '#4ccd55';
    ctx.fillRect(cab.x * T + 1, cab.y * T + 1, T - 2, T - 2);

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(cab.x * T + 2, cab.y * T + 2, T / 2 - 2, T / 2 - 2);

    ctx.strokeStyle = '#3ddc4a';
    ctx.lineWidth = 1;
    ctx.strokeRect(cab.x * T + 1, cab.y * T + 1, T - 2, T - 2);

    drawOlhos(cab);
    if (frameCount % 8 < 4) drawLingua(cab);
  }

  drawMaca(COLS - 2, 0);
}

function drawOlhos(cab) {
  var hx = cab.x * T, hy = cab.y * T;
  var o1, o2;
  if (direcao.x === 1) { o1 = { x: hx + T - 5, y: hy + 4 }; o2 = { x: hx + T - 5, y: hy + T - 5 }; }
  else if (direcao.x === -1) { o1 = { x: hx + 5, y: hy + 4 }; o2 = { x: hx + 5, y: hy + T - 5 }; }
  else if (direcao.y === -1) { o1 = { x: hx + 4, y: hy + 5 }; o2 = { x: hx + T - 5, y: hy + 5 }; }
  else { o1 = { x: hx + 4, y: hy + T - 5 }; o2 = { x: hx + T - 5, y: hy + T - 5 }; }

  [o1, o2].forEach(function (o) {
    ctx.beginPath(); ctx.arc(o.x, o.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff'; ctx.fill();

    ctx.beginPath(); ctx.arc(o.x + direcao.x * 0.8, o.y + direcao.y * 0.8, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#000000'; ctx.fill();
  });
}

function drawLingua(cab) {
  var hx = cab.x * T, hy = cab.y * T;
  var bx, by, ex, ey, f1x, f1y, f2x, f2y, comp = 6, garfo = 3;
  if (direcao.x === 1) { bx = hx + T - 1; by = hy + T / 2; ex = bx + comp; ey = by; f1x = ex + garfo; f1y = ey - garfo; f2x = ex + garfo; f2y = ey + garfo; }
  else if (direcao.x === -1) { bx = hx + 1; by = hy + T / 2; ex = bx - comp; ey = by; f1x = ex - garfo; f1y = ey - garfo; f2x = ex - garfo; f2y = ey + garfo; }
  else if (direcao.y === -1) { bx = hx + T / 2; by = hy + 1; ex = bx; ey = by - comp; f1x = ex - garfo; f1y = ey - garfo; f2x = ex + garfo; f2y = ey - garfo; }
  else { bx = hx + T / 2; by = hy + T - 1; ex = bx; ey = by + comp; f1x = ex - garfo; f1y = ey + garfo; f2x = ex + garfo; f2y = ey + garfo; }
  ctx.strokeStyle = '#ff2255'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(f1x, f1y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(f2x, f2y); ctx.stroke();
}

function drawMaca(cx, cy) {
  var x = cx * T, y = cy * T, P = 4;
  var pixels = [[0, 0, 5, 4, 0], [0, 1, 2, 2, 0], [1, 2, 3, 2, 1], [1, 2, 2, 2, 1], [0, 1, 2, 1, 0]];
  var cores = { 1: '#8b0000', 2: '#e03030', 3: '#ff6b6b', 4: '#3ddc4a', 5: '#4a2800' };
  pixels.forEach(function (linha, li) {
    linha.forEach(function (cor, ci) {
      if (cor === 0) return;
      ctx.fillStyle = cores[cor];
      ctx.fillRect(x + ci * P, y + li * P, P, P);
    });
  });
}

function loop() {
  frameCount++;
  if (frameCount % 3 === 0) step();
  draw();
  requestAnimationFrame(loop);
}

initCobra();
loop();
