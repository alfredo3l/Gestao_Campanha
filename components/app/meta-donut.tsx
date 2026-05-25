"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { fmtNumero } from "@/lib/utils/formatters";

interface Props {
  meta: number;
  projetado: number;
}

export function MetaDonut({ meta, projetado }: Props) {
  const pct = meta > 0 ? Math.min(100, (projetado / meta) * 100) : 0;
  const dados = [
    { nome: "Atingido", value: Math.min(projetado, meta) },
    { nome: "Restante", value: Math.max(0, meta - projetado) },
  ];

  return (
    <div className="relative h-44 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={dados}
            innerRadius={48}
            outerRadius={70}
            paddingAngle={1}
            dataKey="value"
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            <Cell fill="#2ba867" />
            <Cell fill="#ecf0f5" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-2xl font-semibold tabular text-ink-900">
          {Math.round(pct)}%
        </span>
        <span className="text-2xs text-ink-500">
          {fmtNumero(projetado)} / {fmtNumero(meta)}
        </span>
      </div>
    </div>
  );
}
