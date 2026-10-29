import { gsap } from '../gsap.js';

// Linha do tempo da migração: um marco por passo, com o detalhe no cartão.
export default function roteiro(secao) {
  const marcos = [...secao.querySelectorAll('.marco')];
  const fill = secao.querySelector('.trilha i');
  const cartao = secao.querySelector('.roteiro-cartao');
  const num = cartao.querySelector('b');
  const titulo = cartao.querySelector('h3');
  const texto = cartao.querySelector('p');

  return {
    onStep(i) {
      marcos.forEach((m, k) => {
        m.classList.toggle('feito', k < i);
        m.classList.toggle('ativo', k === i);
      });
      gsap.to(fill, { scaleX: marcos.length > 1 ? i / (marcos.length - 1) : 1, duration: 0.9, ease: 'power3.inOut' });
      gsap.fromTo(cartao, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
      num.textContent = String(i + 1).padStart(2, '0');
      titulo.textContent = marcos[i].dataset.titulo;
      texto.textContent = marcos[i].dataset.texto;
    },
  };
}
