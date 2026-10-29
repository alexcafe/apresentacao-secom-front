// Captura as telas do painel, do Gutenberg e do Elementor no cafeteste.
// Uso: node scripts/capturar-prints.mjs [nome-do-print ...]   (sem nomes = todos)
import { readFileSync } from 'node:fs';
import { abrir, env, CSS_LIMPO } from './_wp.mjs';

const ids = JSON.parse(readFileSync(new URL('./_ids.json', import.meta.url), 'utf8'));
const ELEMENTOR_PAGINA = 2;
const so = process.argv.slice(2);
const { browser, page } = await abrir();
const admin = `${env.WP_URL}/wp-admin`;

async function ir(url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.addStyleTag({ content: CSS_LIMPO }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
}

// remove promoções, aviso de cookies e widgets flutuantes (no painel e no preview do Elementor)
async function limpar() {
  for (const frame of page.frames()) {
    await frame
      .evaluate(() => {
        const sumir = (el) => el && el.remove();
        const css = document.createElement('style');
        css.textContent = '[vw],[vw-access-button],.vw-plugin-top-wrapper,[id*="wpchat" i],[class*="wpchat" i],[class*="sb-chat" i]{display:none!important}';
        document.head?.appendChild(css);
        for (const el of document.querySelectorAll('body *')) {
          if (el.children.length > 6 || !el.isConnected) continue;
          const t = el.textContent || '';
          if (/Exclusive offer/i.test(t)) sumir(el.closest('.notice, [class*="notice"], #wpbody-content > div'));
          else if (/Atualize para o WP Mail SMTP Pro/i.test(t)) sumir(el.closest('[class*="upgrade"], [class*="overlay"], [class*="blur"]') || el.parentElement);
          else if (/Usamos cookies/i.test(t)) {
            let a = el;
            while (a && a !== document.body && getComputedStyle(a).position !== 'fixed') a = a.parentElement;
            sumir(a && a !== document.body ? a : el);
          }
        }
      })
      .catch(() => {});
  }
}

async function foto(nome) {
  await page.addStyleTag({ content: CSS_LIMPO }).catch(() => {});
  await limpar();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `public/prints/wp-${nome}.jpg`, type: 'jpeg', quality: 84 });
  console.log('ok', nome);
}

async function editorBlocos(url) {
  await ir(url);
  await page.waitForSelector('.editor-styles-wrapper, iframe[name="editor-canvas"]', { timeout: 30000 });
  await page.evaluate(() => {
    const p = window.wp?.data?.dispatch('core/preferences');
    p?.set('core/edit-post', 'welcomeGuide', false);
    p?.set('core', 'fullscreenMode', false);
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
}

const canvas = () => page.frameLocator('iframe[name="editor-canvas"]');

async function elementor({ navegador = false } = {}) {
  await ir(`${admin}/post.php?post=${ELEMENTOR_PAGINA}&action=elementor`);
  await page.waitForFunction(() => window.elementor?.loaded || document.querySelector('#elementor-preview-iframe'), null, { timeout: 60000 });
  await page.waitForTimeout(6000);
  for (let i = 0; i < 3; i++) await page.keyboard.press('Escape');
  await page.evaluate((navegador) => {
    try {
      if (!navegador) window.$e.run('navigator/close');
    } catch {}
  }, navegador);
  await page.addStyleTag({
    content: `${navegador ? '' : '#elementor-navigator, .elementor-navigator,'} .dialog-widget, .e-route-notice, #elementor-element--promotion__dialog, .elementor-tour, [class*="announcement"], .e-announcements-root { display:none !important; }`,
  });
}

const passos = {
  painel: async () => {
    await ir(`${admin}/index.php`);
    await foto('painel');
  },
  posts: async () => {
    await ir(`${admin}/edit.php`);
    await foto('posts');
  },
  paginas: async () => {
    await ir(`${admin}/edit.php?post_type=page`);
    await foto('paginas');
  },
  'post-editor': async () => {
    await editorBlocos(`${admin}/post.php?post=${ids.post}&action=edit`);
    await foto('post-editor');
  },
  'post-bloco': async () => {
    await editorBlocos(`${admin}/post.php?post=${ids.post}&action=edit`);
    await canvas().locator('.wp-block-image').first().click();
    await page.waitForTimeout(800);
    await foto('post-bloco');
  },
  'post-inseridor': async () => {
    await editorBlocos(`${admin}/post.php?post=${ids.post}&action=edit`);
    await page.locator('.editor-document-tools__inserter-toggle, button[aria-label*="inserir" i], button[aria-label*="Alternar inseridor" i]').first().click();
    await page.waitForTimeout(1500);
    await foto('post-inseridor');
  },
  'post-padroes': async () => {
    await editorBlocos(`${admin}/post.php?post=${ids.post}&action=edit`);
    await page.locator('.editor-document-tools__inserter-toggle').first().click();
    await page.waitForTimeout(800);
    await page.getByRole('tab', { name: /padrões|patterns/i }).click().catch(() => {});
    await page.waitForTimeout(2500);
    await foto('post-padroes');
  },
  'pagina-editor': async () => {
    await editorBlocos(`${admin}/post.php?post=${ids.pagina}&action=edit`);
    await foto('pagina-editor');
  },
  midia: async () => {
    await ir(`${admin}/upload.php?mode=grid`);
    await page.waitForTimeout(2500);
    await foto('midia');
  },
  menus: async () => {
    await ir(`${admin}/nav-menus.php?action=edit&menu=${ids.menu}`);
    await foto('menus');
  },
  'theme-builder': async () => {
    await ir(`${admin}/edit.php?post_type=elementor_library&tabs_group=theme`);
    await foto('theme-builder');
  },
  'elementor-editor': async () => {
    await elementor();
    await foto('elementor-editor');
  },
  'elementor-estilo': async () => {
    await elementor();
    const preview = page.frameLocator('#elementor-preview-iframe');
    await preview.locator('.elementor-widget-heading, .elementor-widget-icon-box, .elementor-widget').nth(3).scrollIntoViewIfNeeded();
    await preview.locator('.elementor-widget-heading, .elementor-widget-icon-box, .elementor-widget').nth(3).click({ force: true });
    await page.waitForTimeout(2000);
    await page.locator('#elementor-panel').getByText(/^Estilo$/).first().click().catch(() => {});
    await page.waitForTimeout(1500);
    await foto('elementor-estilo');
  },
  'elementor-tablet': async () => {
    await elementor();
    await page.evaluate(() => window.elementor.changeDeviceMode('tablet'));
    await page.waitForTimeout(3500);
    await foto('elementor-tablet');
  },
  'elementor-celular': async () => {
    await elementor();
    await page.evaluate(() => window.elementor.changeDeviceMode('mobile'));
    await page.waitForTimeout(3500);
    await foto('elementor-celular');
  },
  'elementor-global': async () => {
    await elementor();
    await page.evaluate(() => window.$e.run('panel/global/open'));
    await page.waitForTimeout(3500);
    await page.evaluate(() => window.$e.route('panel/global/global-colors')).catch(() => {});
    await page.waitForTimeout(2500);
    await foto('elementor-global');
  },
  'elementor-navegador': async () => {
    await elementor({ navegador: true });
    await page.evaluate(() => window.$e.run('navigator/open'));
    await page.waitForTimeout(1500);
    await foto('elementor-navegador');
  },
  'site-post': async () => {
    await ir(`${env.WP_URL}/?p=${ids.post}`);
    await foto('site-post');
  },
};

for (const [nome, fn] of Object.entries(passos)) {
  if (so.length && !so.includes(nome)) continue;
  try {
    await fn();
  } catch (e) {
    console.log('FALHOU', nome, e.message.split('\n')[0]);
  }
}
await browser.close();
