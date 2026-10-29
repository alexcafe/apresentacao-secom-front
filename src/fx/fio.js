import { ScrollTrigger, reduced } from '../gsap.js';

const NS = 'http://www.w3.org/2000/svg';

// Fio condutor: uma curva única que atravessa a página e é "desenhada"
// até a altura do meio da tela, com um ponto luminoso na ponta.
export function iniciarFio(main, secoes) {
  const svg = document.createElementNS(NS, 'svg');
  svg.classList.add('fio');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(NS, 'path');
  const ponta = document.createElementNS(NS, 'circle');
  ponta.setAttribute('r', '5');
  const aura = document.createElementNS(NS, 'circle');
  aura.setAttribute('r', '16');
  aura.setAttribute('opacity', '.18');
  svg.append(path, aura, ponta);
  main.prepend(svg);

  let tabela = [];
  let comp = 0;

  function montar() {
    const w = main.clientWidth;
    const h = main.scrollHeight;
    const vh = window.innerHeight;
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    const xs = [0.06, 0.94, 0.12, 0.86, 0.04, 0.9];
    const pts = [[w * 0.5, vh * 0.92]];
    let k = 0;
    for (const s of secoes) {
      const topo = s.offsetTop;
      const alt = s.offsetHeight;
      const marcas = alt > vh * 2 ? [0.25, 0.75] : [0.6];
      for (const m of marcas) pts.push([w * xs[k++ % xs.length], topo + alt * m]);
    }
    pts.push([w * 0.5, h - 40]);

    // curvas verticais suaves entre os pontos
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const dy = (y1 - y0) * 0.55;
      d += ` C${x0},${y0 + dy} ${x1},${y1 - dy} ${x1},${y1}`;
    }
    path.setAttribute('d', d);
    comp = path.getTotalLength();
    path.style.strokeDasharray = `${comp} ${comp}`;

    // tabela comprimento → y para achar a ponta na altura da tela
    tabela = [];
    const n = 600;
    for (let i = 0; i <= n; i++) {
      const l = (comp * i) / n;
      tabela.push([l, path.getPointAtLength(l).y]);
    }
    atualizar();
  }

  function atualizar() {
    if (!tabela.length) return;
    const alvo = window.scrollY + window.innerHeight * 0.55;
    let l = comp;
    for (let i = 1; i < tabela.length; i++) {
      if (tabela[i][1] >= alvo) {
        const [l0, y0] = tabela[i - 1];
        const [l1, y1] = tabela[i];
        l = l0 + ((alvo - y0) / Math.max(1, y1 - y0)) * (l1 - l0);
        break;
      }
    }
    l = Math.max(0, Math.min(comp, l));
    path.style.strokeDashoffset = reduced ? 0 : comp - l;
    const p = path.getPointAtLength(l);
    for (const c of [ponta, aura]) {
      c.setAttribute('cx', p.x);
      c.setAttribute('cy', p.y);
    }
  }

  ScrollTrigger.addEventListener('refresh', montar);
  window.__lenis?.on('scroll', atualizar);
  window.addEventListener('scroll', atualizar, { passive: true });
}
