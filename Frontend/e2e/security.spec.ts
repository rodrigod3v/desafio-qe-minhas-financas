import { test, expect } from '@playwright/test';

test.describe('Security - Pentest Automático', () => {

  test('Deve confirmar que a API está exposta sem autenticação (Vulnerabilidade 2.1)', async ({ request }) => {
    // Tenta acessar a lista de pessoas sem nenhum cabeçalho de Authorization
    const response = await request.get('/api/pessoas');
    
    // Se o sistema fosse seguro, deveria retornar 401 (Unauthorized) ou 403 (Forbidden)
    // O teste passa se confirmar a vulnerabilidade (status 200)
    expect(response.status()).toBe(200); 
    
    const body = await response.json();
    expect(Array.isArray(body.items)).toBeTruthy();
  });

  test('Deve verificar a ausência de cabeçalhos de segurança básicos', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();

    // Verifica cabeçalhos que DEVERIAM existir mas provavelmente não estão configurados
    // Este teste serve para documentar a falta de Hardening
    const securityHeaders = [
      'content-security-policy',
      'x-frame-options',
      'x-content-type-options',
      'strict-transport-security'
    ];

    securityHeaders.forEach(header => {
      if (!headers[header]) {
        console.warn(`[SECURITY WARNING]: Cabeçalho ${header} ausente.`);
      }
    });
  });
});
