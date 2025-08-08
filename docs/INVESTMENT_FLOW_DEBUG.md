# ✅ RESOLVIDO: Guia de Correção do Fluxo de Aportes e Retiradas

**STATUS: CORRIGIDO EM COMMIT f79f857**

Este documento descreve como estava estruturado o fluxo de dados para registrar aportes ou retiradas (tabela `contributions_or_withdrawals`) e os passos que foram implementados para corrigir o problema em que nada acontecia ao tentar cadastrar um novo registro.

## 1. Fluxo Atual de Dados
1. **Página**: `app/(dashboard)/investimentos/client.tsx` – ao clicar em **Novo Investimento** abre um `Dialog` interno (linhas 420+). 
2. **Ação de salvar**: a função `handleSaveInvestment` (linha 136) apenas registra no logger e fecha o modal, sem chamar nenhuma API.
3. **API existente**: `app/api/investments/route.ts` possui métodos `GET` e `POST` que manipulam a tabela `contributions_or_withdrawals` (linhas 20‑120). O endpoint `POST` espera um corpo com:
   ```ts
   { investorId: string, amount: number, date: Date, description?: string }
   ```
4. **Hook disponível**: `features/investments/api/use-create-investment.ts` já implementa a chamada POST para `/api/investments`, exibindo toast de sucesso ou erro.

Como `handleSaveInvestment` não utiliza o hook acima, nenhum registro é criado e nenhum feedback é exibido.

## 2. Passos para Correção
1. **Integrar o Hook de Criação**
   - Importar `useCreateInvestment` em `app/(dashboard)/investimentos/client.tsx`.
   - Instanciar o mutation: `const createInvestment = useCreateInvestment();`.
   - Substituir o corpo de `handleSaveInvestment` por uma chamada `createInvestment.mutate({ ... })` passando `investorId`, `amount`, `date` e `description` a partir dos estados do modal.
2. **Mapear Campo de Valor**
   - O formulário utiliza a variável `investmentAmount`; o backend espera `amount`. Certifique‑se de converter para número e enviar como `amount`.
3. **Exibir Feedback**
   - O hook já mostra toast de sucesso/erro. Após `onSuccess`, limpe os campos e feche o modal.
4. **Validar Dados**
   - O schema em `use-create-investment.ts` converte datas para ISO e define taxa padrão. Mantenha essa lógica ou adapte conforme necessário.
5. **Testar**
   - Criar um investidor (se ainda não existir).
   - Registrar um novo aporte e verificar no banco (tabela `contributions_or_withdrawals`) se o registro foi criado.
   - Garantir que toasts apareçam corretamente.

## 3. ✅ CORREÇÕES IMPLEMENTADAS

### Arquivos Modificados:
1. **`features/investments/api/use-create-investment.ts`**
   - Atualizado tipo `CreateInvestmentData` para usar formato da API
   - Removidos campos desnecessários (`value`, `investorName`, `startDate`, `returnRate`, `status`)
   - Corrigido para usar apenas `investorId`, `amount`, `date`, `description`
   - Melhorados logs e mensagens de erro

2. **`app/(dashboard)/investimentos/client.tsx`**
   - Importado hook `useCreateInvestment`
   - Substituída função `handleSaveInvestment` vazia por implementação completa
   - Adicionadas validações de formulário
   - Implementado loading state no botão
   - Adicionado feedback com toasts
   - Limpeza automática do formulário após sucesso

### Funcionalidades Adicionadas:
- ✅ Validação de dados antes do envio
- ✅ Conversão correta de string para number
- ✅ Loading state visual durante criação
- ✅ Toasts de sucesso/erro com mensagens da API
- ✅ Limpeza automática do formulário
- ✅ Logs detalhados para debugging
- ✅ Invalidação automática de cache para atualização da lista

### Fluxo Corrigido:
1. Usuário preenche formulário → Validação frontend
2. Dados convertidos para formato da API → POST /api/investments
3. API cria registro na tabela `contributions_or_withdrawals`
4. Toast de sucesso com mensagem personalizada
5. Formulário limpo e modal fechado
6. Lista atualizada automaticamente

## 4. Referências de Código Original
- **Função corrigida**: `handleSaveInvestment` em `app/(dashboard)/investimentos/client.tsx`
- **Hook atualizado**: `features/investments/api/use-create-investment.ts`
- **Endpoint responsável**: `app/api/investments/route.ts`

### Teste de Funcionamento:
Execute: `node scripts/test-investment-flow.js` para ver instruções de teste.

**PROBLEMA RESOLVIDO: O fluxo de criação de aportes/retiradas agora funciona corretamente e os investidores têm seus movimentos registrados no banco de dados.**
