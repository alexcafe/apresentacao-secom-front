// Captura a dobra inicial dos sites Joomla da Secom (públicos, sem login).
import { chromium } from 'playwright';

const SITES = [
  ['unb', 'https://unb.br/'],
  ['noticias', 'https://noticias.unb.br/'],
  ['unbciencia', 'https://unbciencia.unb.br/'],
  ['darcy', 'https://revistadarcy.unb.br/'],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1.5,
  locale: 'pt-BR',
});

for (const [nome, url] of SITES) {
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  // some avisos de cookies e widgets flutuantes que poluem o print
  await page.addStyleTag({
    content: `[class*="cookie" i],[id*="cookie" i],[vw],[class*="vlibras" i],.enabled[vw]{display:none!important}`,
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `public/prints/joomla-${nome}.jpg`, type: 'jpeg', quality: 82 });
  console.log('ok', nome);
  await page.close();
}

await browser.close();
