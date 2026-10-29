import { reduced } from '../gsap.js';

// Esfera de pontos em anéis de latitude, girando devagar.
// progresso 0 → esfera inteira | 1 → a câmera "atravessa" e os pontos se dispersam.
export class Esfera {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.progresso = 0;
    this.rot = 0.6;
    this.rodando = false;
    this.pontos = [];
    const aneis = 54;
    for (let i = 1; i < aneis; i++) {
      const lat = (i / aneis) * Math.PI - Math.PI / 2;
      const raio = Math.cos(lat);
      const n = Math.max(6, Math.round(raio * 96));
      for (let j = 0; j < n; j++) {
        const lon = (j / n) * Math.PI * 2 + (i % 2 ? 0.5 / n : 0);
        this.pontos.push({
          x: raio * Math.cos(lon),
          y: Math.sin(lat),
          z: raio * Math.sin(lon),
          s: 0.4 + Math.random() * 2.2,
          t: Math.random(),
        });
      }
    }
    // paleta: azul claro → sálvia → verde → quase branco
    this.cores = ['#7cc4f2', '#6fd0bd', '#4fb3a0', '#2f9a6a', '#d9f2ea'];
    this.redimensionar = this.redimensionar.bind(this);
    this.quadro = this.quadro.bind(this);
    window.addEventListener('resize', this.redimensionar);
    this.redimensionar();
  }

  redimensionar() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const { clientWidth: w, clientHeight: h } = this.canvas;
    this.w = w;
    this.h = h;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!this.rodando) this.desenhar();
  }

  iniciar() {
    if (this.rodando) return;
    this.rodando = true;
    requestAnimationFrame(this.quadro);
  }

  parar() {
    this.rodando = false;
  }

  quadro() {
    if (!this.rodando) return;
    if (!reduced) this.rot += 0.0018;
    this.desenhar();
    requestAnimationFrame(this.quadro);
  }

  desenhar() {
    const { ctx, w, h } = this;
    const p = this.progresso;
    ctx.clearRect(0, 0, w, h);

    const base = Math.min(w, h);
    const R = base * 0.56 * (1 + p * 1.5);
    // começa no alto à direita e caminha para o centro enquanto cresce
    const cx = w * (0.7 - p * 0.2);
    const cy = h * (0.36 + p * 0.14);

    // halo
    const halo = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.25);
    halo.addColorStop(0, `rgba(79,179,160,${0.28 * (1 - p)})`);
    halo.addColorStop(0.55, `rgba(10,74,133,${0.22 * (1 - p)})`);
    halo.addColorStop(1, 'rgba(11,31,51,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);

    const cr = Math.cos(this.rot);
    const sr = Math.sin(this.rot);
    const inc = -0.42;
    const ci = Math.cos(inc);
    const si = Math.sin(inc);
    const sumir = Math.pow(1 - p, 1.3);
    const baldes = this.cores.map(() => []);

    for (const pt of this.pontos) {
      // gira em Y e inclina em X
      let x = pt.x * cr - pt.z * sr;
      let z = pt.x * sr + pt.z * cr;
      let y = pt.y * ci - z * si;
      z = pt.y * si + z * ci;
      const esp = 1 + p * p * pt.s * 2.2;
      x *= esp;
      y *= esp;
      const persp = 1 / (1.9 - z * 0.55);
      const px = cx + x * R * persp * 1.35;
      const py = cy + y * R * persp * 1.35;
      if (px < -10 || px > w + 10 || py < -10 || py > h + 10) continue;
      const a = (0.25 + 0.75 * ((z + 1) / 2)) * sumir;
      if (a < 0.02) continue;
      const idx = Math.min(this.cores.length - 1, Math.floor(((x / esp + 1) / 2 + pt.t * 0.35) * (this.cores.length - 1)));
      baldes[idx].push(px, py, a, (z > 0.4 ? 2 : 1.3) * (1 + p));
    }

    baldes.forEach((b, i) => {
      ctx.fillStyle = this.cores[i];
      for (let k = 0; k < b.length; k += 4) {
        ctx.globalAlpha = b[k + 2];
        const r = b[k + 3];
        ctx.fillRect(b[k] - r / 2, b[k + 1] - r / 2, r, r);
      }
    });
    ctx.globalAlpha = 1;
  }
}
