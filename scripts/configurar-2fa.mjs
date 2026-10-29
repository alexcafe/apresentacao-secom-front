// Configura o 2FA por aplicativo (TOTP) do usuário temporário, como um usuário faria.
// O segredo vai para .env.local (WP_TOTP) e nunca é impresso.
import { chromium } from 'playwright';
import { lerEnv, gravarEnv, totp } from './_env.mjs';

const env = lerEnv();
const mascarar = (t) => t.replace(/\b[A-Z2-7]{16,}\b/g, '[SEGREDO]');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' });

await page.goto(`${env.WP_URL}/wp-login.php`, { waitUntil: 'domcontentloaded' });
await page.fill('#user_login', env.WP_USER);
await page.fill('#user_pass', env.WP_PASS);
await Promise.all([page.waitForLoadState('networkidle').catch(() => {}), page.click('#wp-submit')]);
await page.waitForTimeout(2000);

await page.getByText('Código único via aplicativo 2FA').click();
await page.getByRole('button', { name: 'Continuar' }).click();
await page.waitForTimeout(2500);

const segredo = (await page.inputValue('#wp2fa-totp-key-input')).replace(/\s/g, '');
console.log('segredo encontrado:', /^[A-Z2-7]{16,}$/.test(segredo));
gravarEnv('WP_TOTP', segredo);

await page.click('#wp2fa-totp-btn-ready');
await page.waitForTimeout(1500);
const lista = async () =>
  page.$$eval('.wp2fa-setup-content input:visible, [id^="wp2fa"] input:visible, [class*="wp2fa"] button:visible, [class*="wp2fa"] input:visible', (els) =>
    els.map((e) => `${e.tagName}#${e.id}.${e.name || ''}[${e.type || ''}] ${(e.textContent || '').trim().slice(0, 40)}`),
  );
console.log('PASSO CÓDIGO:', await lista());
const campo = page.locator('input[name*="authcode" i]:visible, input[id*="code" i]:visible').first();
await campo.fill(totp(segredo));
await page.locator('button:visible, a.button:visible').filter({ hasText: /valid|verific|salvar|ativar/i }).first().click();
await page.waitForTimeout(3000);
const depois = await page.innerText('body');
const i = depois.search(/parabéns|configurad|backup|códigos de backup|sucesso|congrat/i);
console.log('RESULTADO:', mascarar(i >= 0 ? depois.slice(i - 100, i + 500) : depois.slice(-800)));
console.log('FINAL:', await lista());
await page.screenshot({ path: 'scripts/_tela.png' });
await browser.close();
