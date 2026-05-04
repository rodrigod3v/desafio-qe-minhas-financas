import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Acessibilidade (WCAG 2.1)', () => {
  test('O Dashboard não deve possuir violações de acessibilidade automáticas', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Se houver violações, o teste falha exibindo os detalhes
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('A listagem de transações deve ser acessível', async ({ page }) => {
    await page.goto('/transacoes');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
