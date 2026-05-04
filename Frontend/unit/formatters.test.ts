import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from '../../../web/src/lib/formatters';

describe('Testes Unitários de Formatadores', () => {
  describe('formatCurrency', () => {
    it('deve formatar valores em Reais (BRL)', () => {
      expect(formatCurrency(1000)).toContain('R$');
      expect(formatCurrency(1000)).toContain('1.000,00');
    });

    it('deve retornar R$ 0,00 para valores nulos ou indefinidos', () => {
      expect(formatCurrency(undefined as any)).toContain('0,00');
    });
  });

  describe('formatDate', () => {
    it('deve formatar data no padrão brasileiro (DD/MM/AAAA)', () => {
      const date = new Date(2026, 0, 1); // 1 de Janeiro de 2026
      expect(formatDate(date)).toBe('01/01/2026');
    });

    it('deve retornar string vazia para datas nulas', () => {
      expect(formatDate(null)).toBe('');
    });
  });
});
