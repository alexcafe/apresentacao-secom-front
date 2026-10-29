import { gsap, ScrollTrigger } from '../gsap.js';

// Contadores animados + camadas do CMS empilhando.
export default function numeros(secao) {
  const contadores = secao.querySelectorAll('[data-contar]');
  const camadas = secao.querySelectorAll('.camada');
  const fmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

  const tl = gsap.timeline({ paused: true });
  contadores.forEach((el) => {
    const alvo = Number(el.dataset.contar);
    const casas = el.dataset.contar.includes('.') ? 1 : 0;
    const obj = { v: 0 };
    tl.to(
      obj,
      {
        v: alvo,
        duration: 2,
        ease: 'power2.out',
        onUpdate: () => {
          const v = casas ? Math.round(obj.v * 10) / 10 : Math.round(obj.v);
          el.textContent = el.hasAttribute('data-sem-milhar') ? String(v) : fmt.format(v);
        },
      },
      0,
    );
  });
  tl.from(camadas, { y: 60, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.15 }, 0.2);

  ScrollTrigger.create({ trigger: secao, start: 'top 55%', onEnter: () => tl.play(), onLeaveBack: () => tl.reverse() });
  contadores.forEach((el) => (el.textContent = '0'));
  return {};
}
