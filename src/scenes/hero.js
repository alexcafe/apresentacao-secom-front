import { gsap, reduced } from '../gsap.js';
import { Esfera } from '../fx/particulas.js';

export default function hero(secao) {
  const esfera = new Esfera(secao.querySelector('canvas'));
  new IntersectionObserver(([e]) => (e.isIntersecting ? esfera.iniciar() : esfera.parar())).observe(secao);

  const tl = gsap.timeline();
  tl.to(secao.querySelector('.hero-texto'), {
    opacity: 0,
    y: -90,
    filter: reduced ? 'none' : 'blur(10px)',
    ease: 'power2.in',
    duration: 0.6,
  });
  tl.to({}, { duration: 0.4 });

  return {
    timeline: tl,
    onProgress(p) {
      esfera.progresso = p;
    },
  };
}
