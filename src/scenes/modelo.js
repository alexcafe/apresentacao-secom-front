import { gsap } from '../gsap.js';

// Modelo de post único: estrutura vazia → tags dinâmicas → dados do post → condição de exibição.
// Cada passo acrescenta uma classe ao palco; o CSS faz as trocas de estado.
const CLASSES = ['', 'com-tags', 'com-dados', 'com-condicao'];

export default function modelo(secao) {
  const passos = [...secao.querySelectorAll('.passos li')];
  const palco = secao.querySelector('.mp-palco');
  const pecas = secao.querySelectorAll('.mp-peca');

  function aplicar(i, dir) {
    CLASSES.forEach((c, k) => c && palco.classList.toggle(c, k <= i));
    passos.forEach((li, k) => li.classList.toggle('ativo', k === i));
    if (dir > 0 && i > 0) gsap.fromTo(pecas, { scale: 0.97 }, { scale: 1, duration: 0.6, ease: 'back.out(2)', stagger: 0.04 });
  }

  return {
    onStep: aplicar,
    onProgress(p) {
      gsap.set(palco, { y: (0.5 - p) * 40, rotation: (0.5 - p) * -1.2 });
    },
  };
}
