import { gsap, Flip } from '../gsap.js';

// Elementor "mutável": a mesma seção se reorganiza por dispositivo e troca de kit visual.
const ESTADOS = [
  { modo: 'desktop', kit: 'unb', rotulo: 'Desktop · 1440 px' },
  { modo: 'tablet', kit: 'unb', rotulo: 'Tablet · 768 px' },
  { modo: 'mobile', kit: 'unb', rotulo: 'Celular · 390 px' },
  { modo: 'desktop', kit: 'verde', rotulo: 'Kit global: Verde UnB' },
  { modo: 'desktop', kit: 'noite', rotulo: 'Kit global: Noite + carrossel' },
];

export default function mutavel(secao) {
  const device = secao.querySelector('.device');
  const passos = [...secao.querySelectorAll('.mut-passos li')];
  const botoes = [...secao.querySelectorAll('.mut-barra [data-modo]')];
  const rotulo = secao.querySelector('.mut-rotulo');
  const alvos = device.querySelectorAll('.d-topo nav, .d-burger, .d-hero, .d-hero h4, .d-btn, .d-card, .d-img, .d-cards');

  function aplicar(i) {
    const e = ESTADOS[i];
    const estado = Flip.getState([device, ...alvos], { props: 'borderRadius' });
    device.dataset.modo = e.modo;
    device.dataset.kit = e.kit;
    Flip.from(estado, { duration: 0.95, ease: 'power3.inOut', nested: true, prune: true });
    passos.forEach((li, k) => li.classList.toggle('ativo', k === i));
    botoes.forEach((b) => b.classList.toggle('ativo', b.dataset.modo === e.modo));
    gsap.fromTo(rotulo, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    rotulo.textContent = e.rotulo;
  }

  return { onStep: (i) => aplicar(i) };
}
