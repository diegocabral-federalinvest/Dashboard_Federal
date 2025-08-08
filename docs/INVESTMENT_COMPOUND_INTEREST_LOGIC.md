# Lógica de Cálculo de Rendimentos com Juros Compostos

## 📋 Visão Geral

Este documento descreve a lógica correta para cálculo de rendimentos de investimentos com juros compostos no sistema Federal Invest. O sistema deve calcular rendimentos diários baseados em uma taxa mensal, considerando o reinvestimento automático dos rendimentos (juros compostos).

## 🎯 Conceitos Fundamentais

### 1. Taxa de Rendimento
- **Taxa Diária FIXA**: 0.0394520548% ao dia
- **Taxa Anual Equivalente**: ~15.4% ao ano com juros compostos
- **Importante**: A taxa diária é SEMPRE a mesma, independente do mês
  ```
  Taxa Diária = 0.000394520548 (constante)
  Montante = Capital × (1 + taxa_diária)^dias
  ```

### 2. Juros Compostos
- Os rendimentos são **reinvestidos automaticamente** a cada dia
- O saldo do dia seguinte = Saldo do dia anterior + Rendimento do dia
- Fórmula: `Montante = Capital × (1 + taxa_diária)^dias`

### 3. Exibição na Tabela
- **Apenas mostrar linhas com aportes reais** (não os reinvestimentos diários automáticos)
- Cada linha representa um novo aporte do investidor
- A coluna "Renda" mostra:
  - Para aportes intermediários: rendimento do aporte atual até o PRÓXIMO aporte
  - Para o último aporte: rendimento do aporte até a data ATUAL

## 📊 Estrutura de Dados

### Campos da Tabela de Investimentos

| Campo | Descrição | Cálculo |
|-------|-----------|---------|
| **Investidor** | Nome do investidor | - |
| **Data** | Data do aporte | - |
| **Caixa** | Saldo antes do novo aporte | Saldo acumulado até a data |
| **Aporte** | Valor do novo aporte | Valor inserido pelo investidor |
| **Total em Aportes** | Soma de todos os aportes | Soma acumulada de aportes |
| **Renda** | Rendimento do período | Até próximo aporte ou data atual (último) |
| **Saldo** | Saldo total atual | Caixa + Aporte + Renda |

## 🔢 Algoritmo de Cálculo

### Passo 1: Taxa Diária Fixa
```javascript
// Taxa diária é sempre a mesma, não varia por mês
const TAXA_DIARIA = 0.000394520548; // 0.0394520548% ao dia
```

### Passo 2: Calcular Rendimento com Juros Compostos
```javascript
function calcularRendimento(valorInicial, dataInicio, dataFim) {
  // Calcular número de dias entre as datas
  const dias = Math.floor((dataFim - dataInicio) / (1000 * 60 * 60 * 24));
  
  // Aplicar juros compostos com taxa diária fixa
  const montante = valorInicial * Math.pow(1 + TAXA_DIARIA, dias);
  const rendimento = montante - valorInicial;
  
  return { montante, rendimento, dias };
}
```

### Passo 3: Processar Lista de Aportes
```javascript
function processarAportes(aportes, taxaMensal) {
  const hoje = new Date();
  let saldoAcumulado = 0;
  let totalAportes = 0;
  
  return aportes.map((aporte, index) => {
    // Calcula o saldo em caixa (montante anterior com rendimentos)
    const caixa = saldoAcumulado;
    
    // Adiciona o novo aporte
    const novoCapital = caixa + aporte.valor;
    totalAportes += aporte.valor;
    
    // Calcula rendimento desde o aporte até hoje
    const { montante, rendimento } = calcularRendimento(
      novoCapital,
      aporte.data,
      hoje,
      taxaMensal
    );
    
    // Atualiza saldo para próximo aporte
    saldoAcumulado = montante;
    
    return {
      investidor: aporte.investidor,
      data: aporte.data,
      caixa: caixa,
      aporte: aporte.valor,
      totalEmAportes: totalAportes,
      renda: rendimento,
      saldo: montante
    };
  });
}
```

## 📈 Exemplo Prático

### Cenário
- Investidor faz aporte de R$ 100.000,00 em 30/01/2025
- Taxa diária FIXA: 0.0394520548% ao dia
- Taxa anual equivalente: ~15.4% ao ano

### Cálculo dia a dia (não exibido na tabela):
- **30/01**: Aporte de R$ 100.000,00
- **31/01**: R$ 100.000 × 1.000394520548 = R$ 100.039,45 (rendeu R$ 39,45)
- **01/02**: R$ 100.039,45 × 1.000394520548 = R$ 100.078,91 (rendeu mais R$ 39,46)
- E assim sucessivamente com a MESMA taxa diária...

### Se houver novo aporte em 15/02/2025:
1. O rendimento do aporte de 30/01 será calculado de 30/01 até 15/02 (NÃO até hoje)
2. O rendimento do aporte de 15/02 será calculado de 15/02 até hoje
3. Quando um terceiro aporte for feito, o rendimento de 15/02 mudará para ser até a data do terceiro aporte

### Exibição na Tabela:
Apenas duas linhas seriam mostradas:
1. Aporte de 30/01 com renda calculada até 15/02 (próximo aporte)
2. Aporte de 15/02 com renda calculada até hoje (último aporte)

### Exemplo com valores:
- **06/07/2025**: Aporte de R$ 50.000,00
  - Renda: R$ 143,01 (calculado de 06/07 até 08/07)
- **08/07/2025**: Aporte de R$ 10.000,00  
  - Renda: R$ 870,69 (calculado de 08/07 até hoje)
  
Se um novo aporte for feito em 29/07/2025:
- A linha de 08/07 terá sua renda recalculada de 08/07 até 29/07 (não mais até hoje)
- A linha de 29/07 terá renda calculada de 29/07 até hoje

## 🔄 Fluxo de Atualização

### Quando a tabela é carregada:
1. Busca todos os aportes do banco de dados
2. Para cada aporte, calcula o rendimento até a data atual
3. Exibe apenas as linhas dos aportes (não os dias intermediários)

### Quando um novo aporte é feito:
1. Calcula o saldo atual (último montante com rendimentos)
2. Adiciona o novo aporte
3. Salva no banco de dados
4. Recalcula toda a tabela

## ⚠️ Considerações Importantes

1. **Performance**: Para muitos aportes, considerar cache dos cálculos
2. **Precisão**: Usar bibliotecas de precisão decimal para valores monetários
3. **Fuso Horário**: Considerar fuso horário para cálculo correto de dias
4. **Meses com dias diferentes**: Sempre recalcular taxa diária baseada no mês atual
5. **Ano bissexto**: Fevereiro pode ter 28 ou 29 dias

## 🧪 Casos de Teste

### Teste 1: Aporte Único
```javascript
// Aporte de R$ 10.000 em 01/01/2025
// Taxa: 1.2% ao mês
// Após 30 dias: R$ 10.120,00 (aproximadamente)
```

### Teste 2: Múltiplos Aportes
```javascript
// Aporte 1: R$ 10.000 em 01/01/2025
// Aporte 2: R$ 5.000 em 15/01/2025
// Calcular rendimentos compostos para cada período
```

### Teste 3: Validação de Fórmula
```javascript
// Comparar com fórmula de juros compostos tradicional
// M = C × (1 + i)^t
// Onde: M = Montante, C = Capital, i = taxa, t = tempo
```

## 📝 Notas de Implementação

1. **Banco de Dados**: Armazenar apenas os aportes, não os cálculos diários
2. **Cache**: Implementar cache para cálculos frequentes
3. **API**: Endpoint deve calcular rendimentos em tempo real
4. **Frontend**: Atualizar valores ao carregar a página
5. **Validação**: Verificar datas futuras e valores negativos

## 🔗 Referências

- [Matemática Financeira - Juros Compostos](https://pt.wikipedia.org/wiki/Juro#Juros_compostos)
- [Cálculo de Taxa Equivalente](https://www.suno.com.br/artigos/taxa-equivalente/)
- [Date-fns - Biblioteca para manipulação de datas](https://date-fns.org/)

---

**Última atualização**: Janeiro 2025
**Autor**: Sistema Federal Invest
**Versão**: 1.0.0