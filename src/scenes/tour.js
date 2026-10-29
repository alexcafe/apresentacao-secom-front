import { gsap } from '../gsap.js';

// Tour sobre um print: cada passo (li) leva o foco e o zoom a um ponto da tela.
// li[data-img] troca o print, [data-x][data-y] em % posicionam o foco, [data-z] é o zoom.
export default function tour(secao) {
  const passos = [...secao.querySelectorAll('.passos li')];
  const imgs = [...secao.querySelectorAll('.zoom img')];
  const zoom = secao.querySelector('.zoom');
  const foco = secao.querySelector('.foco');
  const palco = secao.querySelector('.tour-palco');

  gsap.set(imgs.slice(1), { opacity: 0 });

  function aplicar(i) {
    const li = passos[i];
    if (!li) return;
    const { x, y, z = 1, img = 0 } = li.dataset;
    passos.forEach((p, k) => p.classList.toggle('ativo', k === i));
    imgs.forEach((im, k) => gsap.to(im, { opacity: k === Number(img) ? 1 : 0, duration: 0.6, ease: 'power2.out' }));
    const temFoco = x !== undefined;
    gsap.to(zoom, {
      scale: Number(z),
      transformOrigin: temFoco ? `${x}% ${y}%` : '50% 50%',
      duration: 1.2,
      ease: 'power3.inOut',
    });
    gsap.to(foco, {
      left: `${x ?? 50}%`,
      top: `${y ?? 50}%`,
      scale: 1 / Number(z),
      opacity: temFoco ? 1 : 0,
      duration: 1.2,
      ease: 'power3.inOut',
    });
  }

  return {
    onStep: aplicar,
    onProgress(p) {
      gsap.set(palco, { y: (0.5 - p) * 50, rotation: (0.5 - p) * 1.6 });
    },
  };
}
