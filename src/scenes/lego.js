import { gsap } from '../gsap.js';

// Gutenberg: blocos caem e se encaixam formando a página.
export default function lego(secao) {
  const blocos = secao.querySelectorAll('.bloco');
  const rotulos = secao.querySelectorAll('.bloco span');
  const lista = secao.querySelectorAll('.lego-lista li');
  gsap.set(lista, { opacity: 0.25, x: -8 });

  const tl = gsap.timeline();
  blocos.forEach((b, i) => {
    const t = i * 0.12;
    tl.from(b, { y: -420, rotation: i % 2 ? 14 : -12, opacity: 0, duration: 0.16, ease: 'bounce.out' }, t);
    if (lista[i]) tl.to(lista[i], { opacity: 1, x: 0, duration: 0.08 }, t + 0.06);
  });
  tl.from(rotulos, { opacity: 0, y: 6, duration: 0.1, stagger: 0.01 }, '>-0.05').to({}, { duration: 0.15 });
  return { timeline: tl };
}
