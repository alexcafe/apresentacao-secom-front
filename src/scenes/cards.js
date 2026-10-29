import { gsap } from '../gsap.js';

// Cartões que sobem em sequência e assentam numa onda.
export default function cards(secao) {
  const itens = secao.querySelectorAll('.card');
  const tl = gsap.timeline();
  tl.from(itens, {
    y: 220,
    opacity: 0,
    rotation: (i) => (i % 2 ? 6 : -6),
    scale: 0.9,
    duration: 0.5,
    ease: 'power3.out',
    stagger: 0.07,
  });
  tl.to({}, { duration: 0.25 });
  return { timeline: tl };
}
