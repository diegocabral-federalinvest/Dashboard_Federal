# Análise do Layout da Tabela DRE

## Observações da Imagem Original

### Estrutura Visual
- **Card Principal**: "DRE Resumido" com fundo branco
- **Layout de Duas Colunas**: 
  - Coluna esquerda: "Descrição" 
  - Coluna direita: "Valor"
- **Botões de Ação**: "Expandir" e "Exportar" no topo direito

### Itens da Tabela
1. **Operação** ℹ️ - R$ 98.268,07
2. **Dedução** ℹ️ ➖ - R$ 0,00
3. **Receita Bruta** ℹ️ - R$ 12.764,65
4. **Receita Líquida** ℹ️ - R$ 11.783,30
5. **Despesas** ℹ️ ➖ - R$ 6.000,00
6. **Resultado Bruto** ℹ️ - R$ 5.783,30
7. **Entradas** ➕ - R$ 5.000,00
8. **Resultado** - R$ 10.783,30

### Elementos Visuais Identificados
- **Ícones de Informação**: Círculos com "i" para tooltips explicativos
- **Sinais Matemáticos**: ➕ (verde) para entradas, ➖ (vermelho) para deduções/despesas
- **Formatação de Valores**: Todos os valores em formato monetário brasileiro (R$)
- **Hierarquia Visual**: Resultado final em destaque

### Layout Responsivo
- Tabela ocupa toda a largura disponível
- Alinhamento: Descrição à esquerda, Valores à direita
- Espaçamento consistente entre linhas
- Bordas sutis para separação visual

### Funcionalidades UX
- **Tooltips**: Ícones ℹ️ devem mostrar explicações detalhadas
- **Indicadores Visuais**: Cores e símbolos para facilitar interpretação
- **Ações Rápidas**: Botões de expandir e exportar facilmente acessíveis

## Especificações Técnicas para Implementação

### Componentes Necessários
1. Card container com título "DRE Resumido"
2. Tabela com duas colunas bem definidas
3. Financial tooltips para ícones informativos
4. Indicadores visuais (➕/➖) com cores apropriadas
5. Botões de ação no header do card

### Estilo Visual
- **Fonte**: Roboto ou sistema padrão
- **Cores**: 
  - Verde para valores positivos/entradas
  - Vermelho para valores negativos/saídas
  - Azul para informações/tooltips
- **Espaçamento**: Padding consistente de 12-16px
- **Bordas**: Sutis, cinza claro

### Responsividade
- Manter duas colunas mesmo em mobile
- Ajustar tamanhos de fonte se necessário
- Garantir que tooltips funcionem em touch devices 