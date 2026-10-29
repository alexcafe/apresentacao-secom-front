import { Esfera } from '../fx/particulas.js';

// Encerramento: a mesma esfera da abertura, parada no estado inicial.
export default function final(secao) {
  const esfera = new Esfera(secao.querySelector('canvas'));
  new IntersectionObserver(([e]) => (e.isIntersecting ? esfera.iniciar() : esfera.parar())).observe(secao);
  return {};
}
