import { gsap } from '../gsap.js';

// Prints dos sites Joomla chegam espalhados, formam uma pilha e se organizam em grade.
export default function polaroids(secao) {
  const fotos = gsap.utils.toArray(secao.querySelectorAll('.polaroid'));
  const legendas = secao.querySelectorAll('.polaroid figcaption');
  const area = secao.querySelector('.polaroids-area');

  const origem = [
    [-70, -80, -24],
    [80, -70, 18],
    [-60, 90, 14],
    [75, 85, -20],
  ];
  const pilha = [-7, 5, -2, 8];
  const grade = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  const meiaL = () => fotos[0].offsetWidth * 0.53;
  const meiaA = () => fotos[0].offsetHeight * 0.56;

  gsap.set(fotos, {
    xPercent: -50,
    yPercent: -50,
    x: (i) => (origem[i][0] * window.innerWidth) / 100,
    y: (i) => (origem[i][1] * window.innerHeight) / 100,
    rotation: (i) => origem[i][2],
    scale: 1.15,
    opacity: 0,
  });
  gsap.set(legendas, { opacity: 0, y: 10 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to(
    fotos,
    {
      x: (i) => (i - 1.5) * 18,
      y: (i) => (i - 1.5) * 10,
      rotation: (i) => pilha[i],
      scale: 0.92,
      opacity: 1,
      duration: 0.36,
      stagger: 0.03,
    },
    0.02,
  )
    .to(
      fotos,
      {
        x: (i) => grade[i][0] * meiaL(),
        y: (i) => grade[i][1] * meiaA(),
        rotation: 0,
        scale: 1,
        duration: 0.36,
        ease: 'power3.inOut',
        stagger: 0.02,
      },
      0.52,
    )
    .to(legendas, { opacity: 1, y: 0, duration: 0.12, stagger: 0.02 }, 0.82)
    .to(area, { '--brilho': 1, duration: 0.1 }, 0.9);

  return { timeline: tl };
}
