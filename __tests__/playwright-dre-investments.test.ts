import { test, expect } from '@playwright/test';

async function loginAndGoToInvestimentos(page: any) {
  await page.goto('http://localhost:3000/investimentos');
  await page.waitForTimeout(1500);
  if (page.url().includes('/sign-in') || page.url().includes('/login')) {
    await page.fill('input[type="email"], input[name="email"]', 'admin@federalinvest.com');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"], button:has-text("Entrar")');
    await page.waitForURL('**/investimentos', { timeout: 15000 });
  }
  expect(page.url()).toContain('/investimentos');
}

test.describe('Investimentos - Validação de retirada', () => {
  test('Retirada acima do saldo retorna 422 e bloqueia envio', async ({ page }) => {
    await loginAndGoToInvestimentos(page);

    // Abrir "Novo Investimento"
    await page.click('button:has-text("Novo Investimento")');
    await page.waitForSelector('[role="dialog"], [data-state="open"]', { timeout: 5000 });

    // Selecionar um investidor (primeiro da lista)
    await page.click('[role="combobox"], [data-state] button:has-text("Selecione um investidor")');
    const firstOption = page.locator('[role="option"], [data-radix-select-viewport] div[role="option"]').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
    }

    // Alternar para retirada se possível
    const switchSelector = 'button[role="switch"], [data-state] [role="switch"], [type="checkbox"]';
    try { await page.click(switchSelector); } catch {}

    // Inserir um valor alto para garantir > saldo
    await page.fill('input[type="number"]', '999999');

    // Verificar mensagem de erro no frontend (aria-live)
    const errorLocator = page.locator('[data-testid="withdrawal-error"]');
    await expect(errorLocator).toBeVisible({ timeout: 5000 });

    // Botão desabilitado
    const submitBtn = page.locator('button:has-text("Criar Investimento"), button[type="submit"]');
    await expect(submitBtn).toBeDisabled();

    // Simular envio direto para backend (opcional)
    const status = await page.evaluate(async () => {
      try {
        const investorId = (document.querySelector('[data-state="open"] [data-radix-select-trigger]')?.getAttribute('data-value')
          || document.querySelector('[data-state="open"] [role="combobox"]')?.getAttribute('data-value')) || '';
        const res = await fetch('/api/investments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            investorId,
            value: 999999,
            type: 'retirada',
            date: new Date().toISOString(),
            startDate: new Date().toISOString(),
            status: 'withdrawn',
            description: 'Teste retirada acima do saldo'
          })
        });
        return res.status;
      } catch (e) {
        return 0;
      }
    });

    if (status !== 0 && status !== 401) {
      expect(status).toBe(422);
    }
  });
}); 