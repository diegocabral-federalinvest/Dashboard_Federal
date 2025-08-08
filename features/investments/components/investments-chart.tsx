
"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InvestmentData {
  date: string;
  saldoAtual: number;
  totalInvestido: number;
}

interface InvestmentsChartProps {
  data: InvestmentData[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function InvestmentsChart({ data }: InvestmentsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(date) => format(new Date(date), 'MMM/yy', { locale: ptBR })}
        />
        <YAxis tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip 
          formatter={(value: number, name: string) => [
            formatCurrency(value),
            name === 'saldoAtual' ? 'Saldo Atual' : 'Total Investido'
          ]}
          labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy', { locale: ptBR })}
        />
        <Area type="monotone" dataKey="saldoAtual" stackId="1" stroke="#8884d8" fill="#8884d8" />
        <Area type="monotone" dataKey="totalInvestido" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
