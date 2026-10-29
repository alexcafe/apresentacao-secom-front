import { gsap, Flip } from '../gsap.js';

// O tema: o painel "Personalizar" acende as opções do passo e a prévia muda junto.
// As classes da prévia se acumulam (passo 2 mantém o que o passo 1 aplicou).
const CLASSES = ['', 'com-identidade', 'com-topo', 'com-blog', 'com-filho'];

export default function tema(secao) {
  const passos = [...secao.querySelectorAll('.passos li')];
  const opcoes = [...secao.querySelectorAll('.tema-painel li')];
  const previa = secao.querySelector('.tema-preview');
  const alvos = previa.querySelectorAll('.tp-topo, .tp-logo, .tp-topo nav, .tp-busca, .tp-posts, .tp-posts article, .tp-lateral, .tp-rodape');

  function aplicar(i) {
    const estado = Flip.getState(alvos);
    CLASSES.forEach((c, k) => c && previa.classList.toggle(c, k <= i));
    Flip.from(estado, { duration: 0.9, ease: 'power3.inOut', nested: true });

    passos.forEach((li, k) => li.classList.toggle('ativo', k === i));
    const acesos = (passos[i]?.dataset.alvo || '').split(',').filter(Boolean).map(Number);
    opcoes.forEach((li, k) => li.classList.toggle('aceso', acesos.includes(k)));
  }

  return {
    onStep: aplicar,
    onProgress(p) {
      gsap.set(previa, { y: (0.5 - p) * 40, rotation: (0.5 - p) * 1.4 });
    },
  };
}
