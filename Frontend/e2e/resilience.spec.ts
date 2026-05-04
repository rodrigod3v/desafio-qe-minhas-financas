import { test, expect } from '@playwright/test';

test.describe('Resiliência e Qualidade Visual', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Deve garantir a consistência visual do Dashboard', async ({ page }) => {
    // Valida que o layout base não quebrou visualmente
    await expect(page).toHaveScreenshot('dashboard-initial.png', {
      maxDiffPixels: 100,
      threshold: 0.2
    });
  });

  test('Deve exibir mensagem amigável quando a API falha (Chaos Testing)', async ({ page }) => {
    // Intercepta todas as chamadas para a API de transações e simula um erro 500
    await page.route('**/api/transacoes*', route => route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Internal Server Error' }),
    }));

    // Tenta navegar para a página de transações ou carregar os dados
    await page.goto('/transacoes');

    // Verifica se a UI lida com o erro graciosamente em vez de "quebrar"
    const errorMessage = page.locator('text=erro ao carregar|problema de conexão|tente novamente');
    await expect(errorMessage).toBeVisible();
  });

  test('Deve validar o comportamento da UI durante lentidão na rede (Network Throttling)', async ({ page }) => {
    // Simula uma rede lenta (3G)
    await page.route('**/api/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto('/dashboard');
    
    // Verifica se um loader é exibido
    const loader = page.locator('.spinner, .loading-indicator, text=carregando');
    await expect(loader).toBeVisible();
  });

  test('Deve validar a exibição de Empty State quando não há transações', async ({ page }) => {
    // Simula uma resposta vazia da API
    await page.route('**/api/transacoes*', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    }));

    await page.goto('/transacoes');

    // Verifica se uma mensagem amigável de "nada encontrado" aparece
    const emptyMessage = page.locator('text=nenhuma transação encontrada|lista vazia|comece a poupar');
    await expect(emptyMessage).toBeVisible();
  });

  test('Deve garantir a formatação correta de moeda (BRL)', async ({ page }) => {
    // Mock de uma transação específica
    await page.route('**/api/transacoes*', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ id: '1', descricao: 'Teste', valor: 1234.56, tipo: 0, data: '2026-01-01' }]),
    }));

    await page.goto('/transacoes');

    // Verifica se o valor está formatado como moeda brasileira
    const valorFormatado = page.locator('text=R$ 1.234,56');
    await expect(valorFormatado).toBeVisible();
  });
});
