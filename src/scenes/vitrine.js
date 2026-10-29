import { gsap } from '../gsap.js';

// Print em perspectiva que "deita" e se endireita com o scroll.
export default function vitrine(secao) {
  const moldura = secao.querySelector('.vitrine-moldura');
  const selos = secao.querySelectorAll('.vitrine-selo');
  const tl = gsap.timeline();
  tl.fromTo(
    moldura,
    { rotationX: 32, rotationZ: -4, yPercent: 30, scale: 0.82, transformPerspective: 1600, transformOrigin: '50% 100%' },
    { rotationX: 0, rotationZ: 0, yPercent: 0, scale: 1, duration: 0.55, ease: 'power2.out' },
  )
    .from(selos, { scale: 0, opacity: 0, duration: 0.15, ease: 'back.out(2)', stagger: 0.06 }, 0.45)
    .to({}, { duration: 0.2 });
  return { timeline: tl };
}
