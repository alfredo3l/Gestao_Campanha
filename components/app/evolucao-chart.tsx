"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { fmtNumero } from "@/lib/utils/formatters";

interface Props {
  data: { dia: string; cadastros: number; acumulado: number }[];
}

export function EvolucaoChart({ data }: Props) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="grad-cad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2683bf" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#2683bf" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#ecf0f5" vertical={false} />
          <XAxis
            dataKey="dia"
            tickLine={false}
            axisLine={false}
            stroke="#8f99aa"
            fontSize={11}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            stroke="#8f99aa"
            fontSize={11}
            tickFormatter={(v) => fmtNumero(v as number)}
            width={40}
          />
          <Tooltip
            cursor={{ stroke: "#dde2ea" }}
            contentStyle={{
              background: "white",
              border: "1px solid #dde2ea",
              borderRadius: 6,
              fontSize: 12,
            }}
            formatter={(value: number, name) => [
              fmtNumero(value),
              name === "cadastros" ? "Novos cadastros" : "Acumulado",
            ]}
          />
          <Area
            type="monotone"
            dataKey="cadastros"
            stroke="#2683bf"
            strokeWidth={2}
            fill="url(#grad-cad)"
            name="cadastros"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
