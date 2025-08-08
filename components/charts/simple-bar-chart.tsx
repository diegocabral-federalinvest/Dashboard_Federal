"use client";

import React from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface DataPoint {
  name: string;
  value: number;
}

interface SimpleBarChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  tooltipLabel?: string;
  showTooltip?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  barSize?: number;
  className?: string;
  formatValue?: (value: number) => string;
}

export function SimpleBarChart({
  data,
  height = 300,
  color = "#0366FF",
  tooltipLabel = "Valor",
  showTooltip = true,
  showXAxis = true,
  showYAxis = true,
  barSize = 20,
  className = "",
  formatValue = formatCurrency,
}: SimpleBarChartProps) {

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 60,
            bottom: 40,
          }}
        >
          {showXAxis && (
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
          )}
          {showYAxis && (
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatValue(value)}
            />
          )}
          {showTooltip && (
            <Tooltip
              cursor={{ fill: "rgba(200, 200, 200, 0.2)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {tooltipLabel}
                          </span>
                          <span className="font-bold text-foreground">
                            {formatValue(payload[0].value as number)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Período
                          </span>
                          <span className="font-bold text-foreground">
                            {payload[0].payload.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          )}
          <Bar
            dataKey="value"
            fill={color}
            radius={[4, 4, 0, 0]}
            barSize={barSize}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 