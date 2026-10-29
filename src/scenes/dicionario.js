import { gsap } from '../gsap.js';

// Cada termo do Joomla "atravessa" a seta e vira o equivalente no WordPress.
export default function dicionario(secao) {
  const linhas = secao.querySelectorAll('.linha');
  const tl = gsap.timeline();
  linhas.forEach((l, i) => {
    const t = i * 0.16;
    tl.from(l.querySelector('.de'), { x: -40, opacity: 0, duration: 0.12, ease: 'power2.out' }, t)
      .from(l.querySelector('.seta path'), { drawSVG: 0, duration: 0.12, ease: 'none' }, t + 0.06)
      .from(l.querySelector('.para'), { x: -60, opacity: 0, scale: 0.92, duration: 0.14, ease: 'power3.out' }, t + 0.14);
  });
  tl.to({}, { duration: 0.2 });
  return { timeline: tl };
}
