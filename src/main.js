import '@fontsource-variable/plus-jakarta-sans';
import './styles/tokens.css';
import './styles/base.css';
import './styles/scenes.css';
import './styles/cenas-extras.css';

import { gsap, ScrollTrigger, SplitText, reduced } from './gsap.js';
import Lenis from 'lenis';
import { iniciarAmbiente } from './fx/ambiente.js';
import { iniciarFio } from './fx/fio.js';
import { cenas } from './scenes/index.js';

/* ---------- scroll suave ---------- */
const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: !reduced });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
window.__lenis = lenis;

const secoes = [...document.querySelectorAll('.scene')];
const total = secoes.length;
const html = document.documentElement;

/* ---------- altura das cenas ----------
   data-steps="N"   → N paradas (teclado) e data-passo telas de rolagem por passo (0.8)
   data-hold="x"    → rolagem extra em telas para cenas de passo único
   data-stops="..." → paradas explícitas, frações de 0 a 1 do trecho da cena */
for (const s of secoes) {
  const passos = Number(s.dataset.steps || 1);
  const porPasso = Number(s.dataset.passo || 0.8);
  const extra = s.dataset.hold ? Number(s.dataset.hold) : passos > 1 ? passos * porPasso : 0.35;
  s.style.height = `${(1 + extra) * 100}vh`;
  s._paradas = s.dataset.stops
    ? s.dataset.stops.split(',').map(Number)
    : Array.from({ length: passos }, (_, k) => k / passos);
}

/* ---------- bordas em onda nas cenas escuras e menta ---------- */
const ONDA_TOPO = 'M0,0 L0,60 C240,140 520,150 780,90 C1040,30 1250,20 1440,90 L1440,0 Z';
const ONDA_BASE = 'M0,160 L0,110 C260,30 560,20 820,80 C1080,140 1260,130 1440,70 L1440,160 Z';
const onda = (classe, d) =>
  `<svg class="onda ${classe}" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" /></svg>`;
secoes.forEach((s, i) => {
  if (s.dataset.tone !== 'dark' && s.dataset.tone !== 'menta') return;
  if (i > 0) s.insertAdjacentHTML('afterbegin', onda('topo', ONDA_TOPO));
  if (i < total - 1) s.insertAdjacentHTML('afterbegin', onda('base', ONDA_BASE));
});

/* ---------- interface fixa ---------- */
const elAtual = document.querySelector('[data-ui="atual"]');
document.querySelector('[data-ui="total"]').textContent = String(total).padStart(2, '0');
const trilho = document.querySelector('.ui-trilho');
const capitulos = [...new Set(secoes.map((s) => s.dataset.chapter))];
trilho.innerHTML = capitulos.map((c) => `<li data-cap="${c}"><span>${c}</span><i></i></li>`).join('');
const itensTrilho = [...trilho.children];

function ativar(i) {
  const s = secoes[i];
  elAtual.textContent = String(i + 1).padStart(2, '0');
  html.dataset.tone = s.dataset.tone === 'dark' ? 'dark' : 'light';
  itensTrilho.forEach((li) => li.classList.toggle('ativo', li.dataset.cap === s.dataset.chapter));
  document.querySelector('.ui-dica')?.classList.toggle('some', i > 0);
}

gsap.to('.ui-progresso', {
  scaleX: 1,
  ease: 'none',
  scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
});

/* ---------- títulos: revelação palavra a palavra com desfoque ---------- */
function revelar(el, gatilho) {
  if (reduced) return; // com movimento reduzido o título já aparece pronto
  const split = SplitText.create(el, { type: 'words', wordsClass: 'palavra' });
  const tl = gsap.from(split.words, {
    opacity: 0,
    yPercent: 60,
    filter: reduced ? 'none' : 'blur(14px)',
    duration: 1.1,
    ease: 'expo.out',
    stagger: 0.06,
    paused: true,
  });
  ScrollTrigger.create({
    trigger: gatilho,
    start: 'top 60%',
    onEnter: () => tl.play(),
    onLeaveBack: () => tl.reverse(),
  });
  return tl;
}

/* ---------- motor de cenas ---------- */
secoes.forEach((s, i) => {
  s.querySelectorAll('[data-reveal]').forEach((el) => revelar(el, s));

  const fabrica = cenas[s.dataset.scene];
  const api = fabrica ? fabrica(s, { lenis }) || {} : {};
  // já monta no passo 0: chegar exatamente no topo da cena (teclado) pode não disparar onUpdate
  let passoAtual = 0;
  api.onStep?.(0, 1);

  ScrollTrigger.create({
    trigger: s,
    start: 'top top',
    end: 'bottom bottom',
    animation: api.timeline,
    scrub: api.timeline ? 1 : false,
    onUpdate(st) {
      api.onProgress?.(st.progress);
      const paradas = s._paradas;
      let passo = 0;
      for (let k = 0; k < paradas.length; k++) if (st.progress >= paradas[k] - 0.01) passo = k;
      if (passo !== passoAtual) {
        const dir = passo > passoAtual ? 1 : -1;
        passoAtual = passo;
        api.onStep?.(passo, dir);
      }
    },
  });

  // cena ativa = a que ocupa o meio da tela
  ScrollTrigger.create({
    trigger: s,
    start: 'top 50%',
    end: 'bottom 50%',
    onToggle: (st) => st.isActive && ativar(i),
  });
});

/* ---------- teclado / passador ---------- */
let paradas = [];
function calcularParadas() {
  const vh = window.innerHeight;
  paradas = secoes.flatMap((s) => {
    const topo = s.offsetTop;
    const trecho = s.offsetHeight - vh;
    return s._paradas.map((f) => Math.round(topo + trecho * f + (f > 0 ? 2 : 0)));
  });
}
ScrollTrigger.addEventListener('refresh', calcularParadas);

function irPara(y) {
  lenis.scrollTo(y, { duration: reduced ? 0 : 1.5, easing: (t) => 1 - Math.pow(1 - t, 4), lock: true });
}

window.addEventListener('keydown', (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  const y = lenis.targetScroll ?? window.scrollY;
  const prox = ['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'];
  const ant = ['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'];
  if (prox.includes(e.key)) {
    e.preventDefault();
    const alvo = paradas.find((p) => p > y + 4);
    if (alvo !== undefined) irPara(alvo);
  } else if (ant.includes(e.key)) {
    e.preventDefault();
    const alvo = [...paradas].reverse().find((p) => p < y - 4);
    if (alvo !== undefined) irPara(alvo);
  } else if (e.key === 'Home') {
    e.preventDefault();
    irPara(0);
  } else if (e.key === 'End') {
    e.preventDefault();
    irPara(paradas.at(-1));
  }
});

/* ---------- ambiente ---------- */
iniciarAmbiente(secoes);
iniciarFio(document.querySelector('main'), secoes);

ativar(0);
document.fonts.ready.then(() => ScrollTrigger.refresh());
