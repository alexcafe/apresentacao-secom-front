import { gsap } from '../gsap.js';

// Blocos e widgets próprios: primeiro os de fábrica (parada em 0.3),
// depois os componentes UnB encaixam na lista e o aviso de desenvolvimento aparece.
export default function componentes(secao) {
  const paineis = secao.querySelectorAll('.comp-painel');
  const padrao = secao.querySelectorAll('.comp-itens span:not(.proprio)');
  const proprios = secao.querySelectorAll('.comp-itens .proprio');
  const aviso = secao.querySelector('.comp-aviso');

  const tl = gsap.timeline();
  tl.from(paineis, { y: 120, opacity: 0, rotation: (i) => (i ? 3 : -3), duration: 0.14, ease: 'power3.out', stagger: 0.04 }, 0)
    .from(padrao, { scale: 0.6, opacity: 0, duration: 0.08, ease: 'back.out(2)', stagger: 0.008 }, 0.08)
    .to({}, { duration: 0.1 }, 0.25)
    .from(proprios, { y: 160, x: (i) => (i % 2 ? 40 : -40), rotation: (i) => (i % 2 ? 12 : -12), opacity: 0, duration: 0.2, ease: 'back.out(1.4)', stagger: 0.05 }, 0.35)
    .from(aviso, { y: 60, opacity: 0, duration: 0.15, ease: 'power3.out' }, 0.7)
    .to({}, { duration: 0.15 }, 0.85);
  return { timeline: tl };
}
