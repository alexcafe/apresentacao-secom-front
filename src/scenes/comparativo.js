import { gsap } from '../gsap.js';

// Gutenberg × Elementor: barras que crescem critério a critério.
export default function comparativo(secao) {
  const barras = secao.querySelectorAll('.cmp-barra i');
  const tl = gsap.timeline();
  tl.from(barras, { scaleX: 0, transformOrigin: '0 50%', duration: 0.3, ease: 'power3.out', stagger: 0.04 }).to({}, { duration: 0.2 });
  return { timeline: tl };
}
