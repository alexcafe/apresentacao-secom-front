import { gsap, ScrollTrigger, reduced } from '../gsap.js';

// Gera um contorno orgânico fechado (curvas suaves) a partir de raios variados.
export function blob(cx, cy, r, semente, pontos = 7, amplitude = 0.22) {
  let s = semente * 9301 + 49297;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const pts = Array.from({ length: pontos }, (_, i) => {
    const a = (i / pontos) * Math.PI * 2;
    const rr = r * (1 - amplitude / 2 + rand() * amplitude);
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
  // Catmull-Rom fechado → cúbicas
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pontos; i++) {
    const p0 = pts[(i - 1 + pontos) % pontos];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pontos];
    const p3 = pts[(i + 2) % pontos];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + 'Z';
}

const NS = 'http://www.w3.org/2000/svg';

export function iniciarAmbiente(secoes) {
  const amb = document.querySelector('.ambiente');
  const svg = amb.querySelector('svg.formas');
  svg.setAttribute('viewBox', '0 0 1600 1000');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.innerHTML = `
    <defs>
      <linearGradient id="gA" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#4fb3a0" stop-opacity=".22"/>
        <stop offset="1" stop-color="#0a4a85" stop-opacity=".10"/>
      </linearGradient>
      <linearGradient id="gB" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1f8a55" stop-opacity=".16"/>
        <stop offset="1" stop-color="#4fb3a0" stop-opacity=".04"/>
      </linearGradient>
      <linearGradient id="gC" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stop-color="#0a4a85" stop-opacity=".12"/>
        <stop offset="1" stop-color="#a8dccf" stop-opacity=".18"/>
      </linearGradient>
    </defs>`;

  // três formas; cada capítulo ganha um "desenho" próprio delas
  const capitulos = [...new Set(secoes.map((s) => s.dataset.chapter))];
  const formas = [
    { fill: 'url(#gA)', cx: 260, cy: 220, r: 300 },
    { fill: 'url(#gB)', cx: 1380, cy: 760, r: 360 },
    { fill: 'url(#gC)', cx: 1200, cy: 180, r: 170 },
  ].map((f, i) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('fill', f.fill);
    p._formas = capitulos.map((_, c) => blob(f.cx + (c % 2 ? 60 : -40), f.cy + (c % 3) * 30, f.r, i * 17 + c * 5 + 3));
    p.setAttribute('d', p._formas[0]);
    svg.appendChild(p);
    return p;
  });

  // contorno fino que acompanha a forma maior: dá o ar "desenhado"
  const contorno = document.createElementNS(NS, 'path');
  contorno.setAttribute('fill', 'none');
  contorno.setAttribute('stroke', '#4fb3a0');
  contorno.setAttribute('stroke-opacity', '.35');
  contorno.setAttribute('stroke-width', '1.2');
  contorno._formas = capitulos.map((_, c) => blob(300 + (c % 2 ? 50 : -30), 240, 345, 91 + c * 7, 8, 0.18));
  contorno.setAttribute('d', contorno._formas[0]);
  svg.appendChild(contorno);
  formas.push(contorno);

  if (reduced) return;

  // troca de desenho a cada capítulo
  let capAtual = 0;
  secoes.forEach((s) => {
    const c = capitulos.indexOf(s.dataset.chapter);
    ScrollTrigger.create({
      trigger: s,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (st) => {
        if (!st.isActive || c === capAtual) return;
        capAtual = c;
        formas.forEach((p, i) =>
          gsap.to(p, { morphSVG: p._formas[c], duration: 2.4, ease: 'sine.inOut', delay: i * 0.12, overwrite: true }),
        );
      },
    });
  });

  // respiração lenta + parallax no scroll
  formas.forEach((p, i) => {
    gsap.to(p, {
      rotation: i % 2 ? 6 : -6,
      transformOrigin: '50% 50%',
      duration: 14 + i * 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  });
  gsap.to('.halo.h1', { yPercent: 40, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1 } });
  gsap.to('.halo.h2', { yPercent: -35, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1 } });
  gsap.to('.halo.h3', { xPercent: -60, yPercent: 30, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1 } });
  gsap.to(svg, { yPercent: -12, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1.5 } });
}
