import { gsap } from '../gsap.js';

// Páginas × Posts: duas colunas que se aproximam e revelam o que têm em comum.
export default function split(secao) {
  const [a, b] = secao.querySelectorAll('.split-col');
  const meio = secao.querySelector('.split-meio');
  const tl = gsap.timeline();
  tl.from(a, { xPercent: -40, opacity: 0, rotation: -4, duration: 0.4, ease: 'power3.out' }, 0)
    .from(b, { xPercent: 40, opacity: 0, rotation: 4, duration: 0.4, ease: 'power3.out' }, 0.05)
    .from(meio, { scale: 0.4, opacity: 0, duration: 0.3, ease: 'back.out(1.6)' }, 0.5)
    .to({}, { duration: 0.2 });
  return { timeline: tl };
}
