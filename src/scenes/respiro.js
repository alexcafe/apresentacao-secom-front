import { gsap } from '../gsap.js';

// Respiro no meio da apresentação: o que já vimos ganha um check, a ponte se desenha
// até "você está aqui" e o que vem a seguir aparece do outro lado.
export default function respiro(secao) {
  const feitos = secao.querySelectorAll('.rm-feito li');
  const proximos = secao.querySelectorAll('.rm-proximo li');
  const ponte = secao.querySelector('.rm-ponte path');
  const marca = secao.querySelector('.rm-ponte span');

  const tl = gsap.timeline();
  tl.from(secao.querySelectorAll('.rm-col'), { y: 60, opacity: 0, duration: 0.3, ease: 'power3.out', stagger: 0.08 }, 0)
    .from(feitos, { x: -30, opacity: 0, duration: 0.2, ease: 'power2.out', stagger: 0.06 }, 0.15)
    .to(feitos, { '--check': 1, duration: 0.15, stagger: 0.05 }, 0.35)
    .fromTo(ponte, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 0.4, ease: 'power1.inOut' }, 0.45)
    .from(marca, { scale: 0.5, opacity: 0, duration: 0.2, ease: 'back.out(2)' }, 0.62)
    .from(proximos, { x: 30, opacity: 0, duration: 0.2, ease: 'power2.out', stagger: 0.06 }, 0.7)
    .to({}, { duration: 0.15 });
  return { timeline: tl };
}
