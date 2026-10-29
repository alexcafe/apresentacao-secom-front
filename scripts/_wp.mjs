// Sessão no cafeteste como o usuário temporário (senha + código TOTP).
import { chromium } from 'playwright';
import { lerEnv, totp } from './_env.mjs';

export const env = lerEnv();

// some com avisos promocionais que poluem os prints do painel
export const CSS_LIMPO = `
  .notice, .update-nag, .updated, .error:not(.form-invalid), [class*="-notice"]:not(.components-notice),
  #wpfooter, .sbi_notice, .cff_notice, .ctf_notice, #wp-admin-bar-wp-statistics, .forminator-notice,
  .e-notice, .elementor-message, #elementor-tracker-notice { display: none !important; }
`;

export async function abrir({ escala = 1.5 } = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: escala, locale: 'pt-BR' });
  const page = await ctx.newPage();
  await page.goto(`${env.WP_URL}/wp-login.php`, { waitUntil: 'domcontentloaded' });
  await page.fill('#user_login', env.WP_USER);
  await page.fill('#user_pass', env.WP_PASS);
  await Promise.all([page.waitForLoadState('domcontentloaded'), page.click('#wp-submit')]);
  const codigo = page.locator('input[name="authcode"], #authcode, input[name*="authcode" i]').first();
  if (await codigo.isVisible({ timeout: 4000 }).catch(() => false)) {
    await codigo.fill(totp(env.WP_TOTP));
    await Promise.all([page.waitForLoadState('domcontentloaded'), page.keyboard.press('Enter')]);
  }
  await page.waitForURL(/wp-admin/, { timeout: 20000 });
  return { browser, ctx, page };
}

// chamada REST autenticada pelo cookie + nonce do próprio painel
export async function rest(page, metodo, rota, corpo) {
  return page.evaluate(
    async ([metodo, rota, corpo]) => {
      const r = await fetch(`/wp-json${rota}`, {
        method: metodo,
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': window.wpApiSettings?.nonce },
        body: corpo ? JSON.stringify(corpo) : undefined,
      });
      return { status: r.status, json: await r.json().catch(() => null) };
    },
    [metodo, rota, corpo],
  );
}
