"use client";

import React from "react";
import {
  Line,
  LineChart,
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

interface DataPointttt {
  name: string;
  value: number;
}


interface SimpleLineChartProps {
  data: DataPoint[];
  height?: number;
  width?: number;
  color?: string;
  tooltipLabel?: string;
  showTooltip?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGrid?: boolean;
  lineWidth?: number;
  className?: string;
  areaFill?: string;
  formatValue?: (value: number) => string;
}

export function SimpleLineChart({
  data,
  height = 300,
  color = "#0366FF",
  tooltipLabel = "Valor",
  showTooltip = true,
  showXAxis = true,
  showYAxis = true,
  lineWidth = 2,
  className = "",
  formatValue = formatCurrency,
}: SimpleLineChartProps) {
  
  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
                            Data
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
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={lineWidth}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 