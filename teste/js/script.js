// JOGO DA COBRINHA - script.js
// aqui fica toda a lógica do jogo: mover a cobra, ver se comeu a maçã,
// ver se bateu na parede ou nela mesma, contar pontos, tempo, etc.

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const TAMANHO_CELULA = 20;
const COLUNAS = canvas.width / TAMANHO_CELULA;
const LINHAS = canvas.height / TAMANHO_CELULA;

// pega a velocidade que o usuário escolheu no menu (localStorage)
// se não tiver nada salvo, usa 150ms (nível médio) como padrão
let velocidade = Number(localStorage.getItem('velocidadeEscolhida')) || 150;
let nivelEscolhido = localStorage.getItem('nivelEscolhido') || 'Médio';

// meta de pontos pra vencer o jogo e tempo total da partida (em segundos)
const META_PONTOS = 100;
const TEMPO_TOTAL = 60;

let cobra, direcao, proximaDirecao, maca, pontos, intervalo, rodando;
let frameCount = 0;
let tempo = TEMPO_TOTAL;
let timerTempo;

// contador de tentativas (quantas vezes já jogou nessa aba do navegador)
let tentativas = Number(sessionStorage.getItem('tentativas')) || 0;

function iniciarJogo() {
  cobra = [
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 }
  ];
  direcao = { x: 1, y: 0 };
  proximaDirecao = { x: 1, y: 0 };
  pontos = 0;
  rodando = true;
  frameCount = 0;
  tempo = TEMPO_TOTAL;

  // cada vez que inicia o jogo (ou reinicia) conta como uma nova tentativa
  tentativas++;
  sessionStorage.setItem('tentativas', tentativas);

  document.getElementById('pontuacao').textContent = pontos;
  document.getElementById('tentativas').textContent = tentativas;
  document.getElementById('tempo').textContent = tempo;
  document.getElementById('nivel').textContent = nivelEscolhido;
  document.getElementById('tela-gameover').style.display = 'none';
  document.getElementById('painel-gameover').classList.remove('vitoria');

  gerarMaca();
  clearInterval(intervalo);
  clearInterval(timerTempo);

  intervalo = setInterval(loop, velocidade);

  // a cada 1 segundo, diminui o tempo. se zerar, acaba o jogo
  timerTempo = setInterval(function () {
    if (!rodando) return;
    tempo--;
    document.getElementById('tempo').textContent = tempo;
    if (tempo <= 0) {
      terminarJogo(false);
    }
  }, 1000);
}

function gerarMaca() {
  let posicaoValida = false;
  while (!posicaoValida) {
    maca = {
      x: Math.floor(Math.random() * COLUNAS),
      y: Math.floor(Math.random() * LINHAS)
    };
    posicaoValida = !cobra.some(s => s.x === maca.x && s.y === maca.y);
  }
}

function loop() {
  mover();
  if (!rodando) return;
  frameCount++;
  desenhar();
}

function mover() {
  direcao = proximaDirecao;
  const cabeca = {
    x: cobra[0].x + direcao.x,
    y: cobra[0].y + direcao.y
  };

  // bateu na parede -> perdeu
  if (cabeca.x < 0 || cabeca.x >= COLUNAS || cabeca.y < 0 || cabeca.y >= LINHAS) {
    terminarJogo(false);
    return;
  }

  // bateu no próprio corpo -> perdeu
  if (cobra.some(s => s.x === cabeca.x && s.y === cabeca.y)) {
    terminarJogo(false);
    return;
  }

  cobra.unshift(cabeca);

  if (cabeca.x === maca.x && cabeca.y === maca.y) {
    pontos += 5;
    document.getElementById('pontuacao').textContent = pontos;
    gerarMaca();

    // chegou na pontuação alvo -> ganhou o jogo
    if (pontos >= META_PONTOS) {
      terminarJogo(true);
      return;
    }
  } else {
    cobra.pop();
  }
}

// função que encerra a partida, seja por vitória ou derrota
function terminarJogo(ganhou) {
  rodando = false;
  clearInterval(intervalo);
  clearInterval(timerTempo);

  var melhor = localStorage.getItem('snakeBest') || 0;
  if (pontos > melhor) localStorage.setItem('snakeBest', pontos);

  salvarNoHistorico(pontos);

  document.getElementById('pontuacao-final').textContent = pontos;
  document.getElementById('tentativas-final').textContent = tentativas;
  document.getElementById('titulo-resultado').textContent = ganhou ? 'VOCÊ VENCEU!' : 'GAME OVER';

  // troca a cor do painel pra verde quando ganha
  const painel = document.getElementById('painel-gameover');
  painel.classList.toggle('vitoria', ganhou);

  document.getElementById('tela-gameover').style.display = 'flex';
}

// guarda a pontuação da partida numa lista (array) salva no localStorage
// mantém só as 5 últimas pra não ficar uma lista infinita
function salvarNoHistorico(pontuacao) {
  var historico = JSON.parse(localStorage.getItem('snakeHistorico')) || [];
  historico.unshift(pontuacao); // coloca a pontuação nova no início da lista

  if (historico.length > 5) {
    historico = historico.slice(0, 5);
  }

  localStorage.setItem('snakeHistorico', JSON.stringify(historico));
}

function reiniciarJogo() {
  iniciarJogo();
}

document.getElementById('btn-jogar-novamente').addEventListener('click', reiniciarJogo);

// ─── DESENHO ───────────────────────────────
function desenhar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Grade
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 0.5;
  for (let c = 0; c < COLUNAS; c++)
    for (let l = 0; l < LINHAS; l++)
      ctx.strokeRect(c * TAMANHO_CELULA, l * TAMANHO_CELULA, TAMANHO_CELULA, TAMANHO_CELULA);

  desenharMaca();
  desenharCobra();
}

// ─── MAÇÃ PIXEL ART ────────────────────────
function desenharMaca() {
  const x = maca.x * TAMANHO_CELULA;
  const y = maca.y * TAMANHO_CELULA;
  const P = 4; // tamanho do pixel art

  // 0=vazio, 1=vermelho escuro, 2=vermelho, 3=vermelho claro, 4=verde(folha), 5=marrom(cabo)
  const pixels = [
    [0, 0, 5, 4, 0],
    [0, 1, 2, 2, 0],
    [1, 2, 3, 2, 1],
    [1, 2, 2, 2, 1],
    [0, 1, 2, 1, 0],
  ];

  const cores = {
    1: '#8b0000',
    2: '#e03030',
    3: '#ff6b6b',
    4: '#3ddc4a',
    5: '#4a2800'
  };

  pixels.forEach(function (linha, li) {
    linha.forEach(function (cor, ci) {
      if (cor === 0) return;
      ctx.fillStyle = cores[cor];
      ctx.fillRect(x + ci * P, y + li * P, P, P);
    });
  });
}

// ─── COBRA ─────────────────────────────────
function desenharCobra() {
  const T = TAMANHO_CELULA;

  // Corpo
  for (let i = cobra.length - 1; i >= 1; i--) {
    const seg = cobra[i];
    const px = seg.x * T;
    const py = seg.y * T;
    const t = i / cobra.length;
    const verde = Math.floor(180 - t * 60);
    ctx.fillStyle = 'rgb(30,' + verde + ',40)';
    ctx.fillRect(px + 1, py + 1, T - 2, T - 2);
    ctx.strokeStyle = 'rgba(61,220,74,0.3)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(px + 1, py + 1, T - 2, T - 2);
  }

  // Cabeça
  const cab = cobra[0];
  const hx = cab.x * T;
  const hy = cab.y * T;
  ctx.fillStyle = '#4ccd55';
  ctx.fillRect(hx + 1, hy + 1, T - 2, T - 2);
  ctx.strokeStyle = '#3ddc4a';
  ctx.lineWidth = 1;
  ctx.strokeRect(hx + 1, hy + 1, T - 2, T - 2);

  // Olhos (a posição muda dependendo de pra onde a cobra está indo)
  var o1, o2;
  if (direcao.x === 1) {
    o1 = { x: hx + T - 5, y: hy + 4 };
    o2 = { x: hx + T - 5, y: hy + T - 5 };
  } else if (direcao.x === -1) {
    o1 = { x: hx + 5, y: hy + 4 };
    o2 = { x: hx + 5, y: hy + T - 5 };
  } else if (direcao.y === -1) {
    o1 = { x: hx + 4, y: hy + 5 };
    o2 = { x: hx + T - 5, y: hy + 5 };
  } else {
    o1 = { x: hx + 4, y: hy + T - 5 };
    o2 = { x: hx + T - 5, y: hy + T - 5 };
  }

  [o1, o2].forEach(function (o) {
    ctx.beginPath();
    ctx.arc(o.x, o.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(o.x + direcao.x * 0.8, o.y + direcao.y * 0.8, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();
  });

  // Língua (fica piscando, aparece e desaparece)
  if (frameCount % 8 < 4) {
    ctx.strokeStyle = '#ff2255';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    var bx, by, ex, ey, f1x, f1y, f2x, f2y;
    var comp = 6, garfo = 3;

    if (direcao.x === 1) {
      bx = hx + T - 1; by = hy + T / 2; ex = bx + comp; ey = by;
      f1x = ex + garfo; f1y = ey - garfo; f2x = ex + garfo; f2y = ey + garfo;
    } else if (direcao.x === -1) {
      bx = hx + 1; by = hy + T / 2; ex = bx - comp; ey = by;
      f1x = ex - garfo; f1y = ey - garfo; f2x = ex - garfo; f2y = ey + garfo;
    } else if (direcao.y === -1) {
      bx = hx + T / 2; by = hy + 1; ex = bx; ey = by - comp;
      f1x = ex - garfo; f1y = ey - garfo; f2x = ex + garfo; f2y = ey - garfo;
    } else {
      bx = hx + T / 2; by = hy + T - 1; ex = bx; ey = by + comp;
      f1x = ex - garfo; f1y = ey + garfo; f2x = ex + garfo; f2y = ey + garfo;
    }

    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(f1x, f1y);
    ctx.moveTo(ex, ey); ctx.lineTo(f2x, f2y); ctx.stroke();
  }
}

// ─── CONTROLES ─────────────────────────────
document.addEventListener('keydown', function (e) {
  // Enter reinicia quando game over
  if (e.key === 'Enter' && !rodando) {
    reiniciarJogo();
    return;
  }
  switch (e.key) {
    // o "if" serve pra não deixar a cobra virar pro lado contrário
    // (senão ela bateria nela mesma direto)
    case 'ArrowUp': if (direcao.y !== 1) proximaDirecao = { x: 0, y: -1 }; break;
    case 'ArrowDown': if (direcao.y !== -1) proximaDirecao = { x: 0, y: 1 }; break;
    case 'ArrowLeft': if (direcao.x !== 1) proximaDirecao = { x: -1, y: 0 }; break;
    case 'ArrowRight': if (direcao.x !== -1) proximaDirecao = { x: 1, y: 0 }; break;
  }
});

iniciarJogo();
