import { test, expect } from '@playwright/test';

test.describe('Regras de Negócio - Transações', () => {

  test('Deve evidenciar o bug: Permitir alteração de pessoa para menor de idade quando possui receita', async ({ page }) => {
    // 1. Cadastrar pessoa maior de idade
    // await page.goto('/pessoas');
    // await page.click('text=Nova Pessoa');
    // await page.fill('input[name="nome"]', 'João');
    // await page.fill('input[name="dataNascimento"]', '1990-01-01');
    // await page.click('button[type="submit"]');

    // 2. Cadastrar Receita
    // await page.goto('/transacoes');
    // await page.click('text=Nova Transação');
    // await page.fill('input[name="descricao"]', 'Salário');
    // await page.fill('input[name="valor"]', '5000');
    // await page.selectOption('select[name="tipo"]', 'Receita');
    // await page.selectOption('select[name="pessoaId"]', { label: 'João' });
    // await page.click('button[type="submit"]');

    // 3. Editar pessoa para menor de idade
    // await page.goto('/pessoas');
    // await page.click('text=Editar João');
    // await page.fill('input[name="dataNascimento"]', '2015-01-01');
    // await page.click('button[type="submit"]');

    // BUG: A edição passa sem dar erro
    // O E2E deveria esperar a mensagem abaixo, mas ela não vem.
    // await expect(page.locator('.error-message')).toContainText('Menor de idade não pode ter receitas');
  });
});
