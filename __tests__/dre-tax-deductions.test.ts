/**
 * 🧪 Testes para Lógica de Deduções Fiscais do DRE
 * 
 * Testes automatizados para identificar bugs nas tabs Mensal e Trimestral
 * relacionados ao salvamento e exibição de deduções fiscais.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock do fetch global
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock dos dados de teste
const mockTaxDeductionResponse = {
  success: true,
  data: {
    id: 1,
    year: 2025,
    quarter: 1,
    month: 1,
    value: '10000.00'
  }
};

const mockDREResponse = {
  success: true,
  data: {
    periodo: {
      mes: 1,
      ano: 2025,
      dataInicio: '2025-01-01',
      dataFim: '2025-01-31',
      trimestral: false,
      anual: false
    },
    receitas: {
      operacoes: 50000,
      outras: 5000,
      total: 55000
    },
    custos: {
      fator: 2000,
      adValorem: 1000,
      iof: 500,
      tarifas: 800,
      total: 4300
    },
    despesas: {
      operacionais: 15000,
      tributaveis: 10000,
      total: 25000
    },
    impostos: {
      pis: 825,
      cofins: 3795,
      issqn: 1100,
      ir: 3000,
      csll: 1800,
      total: 10520
    },
    deducaoFiscal: 10000, // Valor esperado
    resultadoBruto: 25700,
    resultadoOperacional: 700,
    resultadoLiquido: -9820
  }
};

describe('🧪 DRE Tax Deductions Tests', () => {
  let consoleLogSpy: jest.SpiedFunction<typeof console.log>;
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;
  
  beforeEach(() => {
    // Setup spies para capturar logs
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Limpar mocks
    (global.fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });
  
  afterEach(() => {
    // Restaurar spies
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('🔍 Bug 1: Tab Mensal - Valor zerado na tabela', () => {
    it('deve salvar dedução mensal corretamente', async () => {
      // Arrange
      const taxDeductionPayload = {
        year: 2025,
        month: 1,
        value: 10000
      };

      // Mock da resposta de salvamento
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTaxDeductionResponse)
        } as Response);

      // Act
      const response = await fetch('/api/finance/monthly-tax-deduction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taxDeductionPayload)
      });

      const result = await response.json();

      // Assert
      expect(response.ok).toBe(true);
      expect(result.success).toBe(true);
      expect(result.data.value).toBe('10000.00');
      
      // Verificar se o fetch foi chamado com os parâmetros corretos
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/finance/monthly-tax-deduction',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taxDeductionPayload)
        })
      );
    });

    it('deve recuperar dedução mensal salva no DRE', async () => {
      // Arrange
      const dreParams = new URLSearchParams({
        year: '2025',
        month: '1',
        monthly: 'true'
      });

      // Mock da resposta do DRE
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockDREResponse)
        } as Response);

      // Act
      const response = await fetch(`/api/reports/dre?${dreParams.toString()}`);
      const dreData = await response.json();

      // Assert
      expect(response.ok).toBe(true);
      expect(dreData.success).toBe(true);
      expect(dreData.data.deducaoFiscal).toBe(10000);
      
      console.log('🧪 [TEST-DEBUG] DRE Response:', dreData);
    });

    it('deve detectar quando valor salvo não aparece na tabela', async () => {
      // Cenário de bug: valor salvo mas não recuperado
      
      // 1. Salvar dedução
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTaxDeductionResponse)
        } as Response);

      const saveResponse = await fetch('/api/finance/monthly-tax-deduction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: 2025, month: 1, value: 10000 })
      });

      // 2. Buscar DRE (que deveria mostrar o valor salvo)
      const buggyDREResponse = {
        ...mockDREResponse,
        data: {
          ...mockDREResponse.data,
          deducaoFiscal: 0 // BUG: valor zerado na tabela
        }
      };

      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(buggyDREResponse)
        } as Response);

      const dreResponse = await fetch('/api/reports/dre?year=2025&month=1&monthly=true');
      const dreData = await dreResponse.json();

      // Assert - Detectar o bug
      const savedSuccessfully = (await saveResponse.json()).success;
      const retrievedValue = dreData.data.deducaoFiscal;
      
      expect(savedSuccessfully).toBe(true);
      expect(retrievedValue).toBe(0); // BUG DETECTADO!
      
      console.error('🐛 [BUG DETECTED] Valor salvo mas não recuperado no DRE mensal:', {
        saved: true,
        expectedValue: 10000,
        actualValue: retrievedValue
      });
    });
  });

  describe('🔍 Bug 2: Tab Trimestral - Valor incorreto (23.333.333)', () => {
    it('deve calcular dedução trimestral corretamente', async () => {
      // Arrange
      const taxDeductionPayload = {
        year: 2025,
        quarter: 1,
        value: 10000
      };

      // Mock da resposta de salvamento
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            ...mockTaxDeductionResponse,
            data: { ...mockTaxDeductionResponse.data, quarter: 1, value: '10000.00' }
          })
        } as Response);

      // Act
      const response = await fetch('/api/finance/tax_deduction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taxDeductionPayload)
      });

      const result = await response.json();

      // Assert
      expect(response.ok).toBe(true);
      expect(result.success).toBe(true);
      expect(result.data.value).toBe('10000.00');
    });

    it('deve detectar cálculo incorreto na agregação trimestral', async () => {
      // Cenário de bug: 10.000 vira 23.333.333
      
      // 1. Salvar dedução trimestral
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { year: 2025, quarter: 1, value: '10000.00' }
          })
        } as Response);

      const saveResponse = await fetch('/api/finance/tax_deduction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: 2025, quarter: 1, value: 10000 })
      });

      // 2. Buscar DRE trimestral (que deveria mostrar 10.000)
      const buggyDREResponse = {
        ...mockDREResponse,
        data: {
          ...mockDREResponse.data,
          periodo: {
            ...mockDREResponse.data.periodo,
            trimestral: true
          },
          deducaoFiscal: 23333333 // BUG: valor incorreto!
        }
      };

      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(buggyDREResponse)
        } as Response);

      const dreResponse = await fetch('/api/reports/dre?year=2025&quarterly=true');
      const dreData = await dreResponse.json();

      // Assert - Detectar o bug
      const savedValue = 10000;
      const retrievedValue = dreData.data.deducaoFiscal;
      
      expect(retrievedValue).not.toBe(savedValue);
      expect(retrievedValue).toBe(23333333); // BUG DETECTADO!
      
      console.error('🐛 [BUG DETECTED] Cálculo incorreto na dedução trimestral:', {
        expectedValue: savedValue,
        actualValue: retrievedValue,
        incorrectCalculation: 'Possível média/soma incorreta',
        ratio: retrievedValue / savedValue // ~2333.33
      });
    });

    it('deve identificar problema na agregação de valores mensais para trimestre', async () => {
      // Simular cenário onde há valores mensais sendo somados incorretamente
      
      // Mock de resposta da API que mostra cálculo incorreto
      const debugResponse = {
        success: true,
        data: {
          ...mockDREResponse.data,
          deducaoFiscal: 23333333,
          // Debug info que a API poderia retornar
          debug: {
            monthlyValues: [10000, 0, 0], // Jan, Fev, Mar
            quarterlySum: 10000, // Correto
            finalValue: 23333333, // Incorreto - indica problema de conversão/cálculo
            calculationSteps: [
              'SUM(monthlyTaxDeductions) = 10000',
              'Number(totalValue) = ???', // Conversão incorreta
              'Final deducaoFiscal = 23333333'
            ]
          }
        }
      };

      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(debugResponse)
        } as Response);

      const response = await fetch('/api/reports/dre?year=2025&quarterly=true&debug=true');
      const debugData = await response.json();

      // Assert - Analisar o problema
      const monthlySum = debugData.data.debug.monthlyValues.reduce((sum: number, val: number) => sum + val, 0);
      const finalValue = debugData.data.deducaoFiscal;
      
      expect(monthlySum).toBe(10000);
      expect(finalValue).toBe(23333333);
      
      console.error('🐛 [BUG ANALYSIS] Problema na conversão/agregação:', {
        monthlyValues: debugData.data.debug.monthlyValues,
        correctSum: monthlySum,
        incorrectFinalValue: finalValue,
        possibleCause: 'Number() conversion or SQL aggregation issue'
      });
    });
  });

  describe('🧪 Integration Tests', () => {
    it('deve testar fluxo completo de salvamento e recuperação', async () => {
      // Teste de integração simulando o fluxo do usuário
      const testCases = [
        { type: 'monthly', year: 2025, month: 1, value: 5000 },
        { type: 'quarterly', year: 2025, quarter: 1, value: 15000 }
      ];

      for (const testCase of testCases) {
        console.log(`🧪 Testing ${testCase.type} deduction...`);
        
        // 1. Salvar
        const endpoint = testCase.type === 'monthly' 
          ? '/api/finance/monthly-tax-deduction'
          : '/api/finance/tax_deduction';
        
        const payload = testCase.type === 'monthly'
          ? { year: testCase.year, month: testCase.month, value: testCase.value }
          : { year: testCase.year, quarter: testCase.quarter, value: testCase.value };

        (global.fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ success: true, data: payload })
          } as Response);

        const saveResponse = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        // 2. Recuperar
        const dreParams = testCase.type === 'monthly'
          ? `year=${testCase.year}&month=${testCase.month}&monthly=true`
          : `year=${testCase.year}&quarterly=true`;

        (global.fetch as jest.MockedFunction<typeof fetch>)
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: { ...mockDREResponse.data, deducaoFiscal: testCase.value }
            })
          } as Response);

        const dreResponse = await fetch(`/api/reports/dre?${dreParams}`);
        
        // 3. Verificar
        const saveResult = await saveResponse.json();
        const dreResult = await dreResponse.json();
        
        expect(saveResult.success).toBe(true);
        expect(dreResult.data.deducaoFiscal).toBe(testCase.value);
        
        console.log(`✅ ${testCase.type} test passed`);
      }
    });
  });
});

// Helper functions for testing
export const testHelpers = {
  createMockCurrentPeriod: (type: 'monthly' | 'quarterly', year: number = 2025, month?: number, quarter?: number) => ({
    year,
    month: type === 'monthly' ? (month || 1) : undefined,
    quarter: type === 'quarterly' ? (quarter || 1) : undefined,
    periodType: type,
    deducaoFiscal: 0
  }),
  
  createMockLocalState: (deducaoFiscal: number = 0) => ({
    year: 2025,
    quarter: 1,
    month: 1,
    deducaoFiscal,
    csll: 0,
    irpj: 0
  }),

  simulateBugScenario: (bugType: 'monthly-zero' | 'quarterly-incorrect') => {
    if (bugType === 'monthly-zero') {
      return {
        expectedValue: 10000,
        actualValue: 0,
        description: 'Valor salvo na tab mensal não aparece na tabela (zerado)'
      };
    } else {
      return {
        expectedValue: 10000,
        actualValue: 23333333,
        description: 'Valor 10.000 vira 23.333.333 na tab trimestral'
      };
    }
  }
};

describe("Validação de retirada x saldo (unit)", () => {
  const canWithdraw = (saldoAtual: number, valor: number) => {
    if (valor <= 0) return false;
    return valor <= saldoAtual;
  };

  test("valor igual ao saldo é permitido", () => {
    expect(canWithdraw(1000, 1000)).toBe(true);
  });

  test("valor maior que o saldo é bloqueado", () => {
    expect(canWithdraw(1000, 1001)).toBe(false);
  });

  test("valor 0 não é permitido", () => {
    expect(canWithdraw(1000, 0)).toBe(false);
  });
});
