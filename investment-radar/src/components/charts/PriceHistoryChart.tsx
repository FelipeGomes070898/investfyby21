"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export interface HistoryPoint {
  recorded_at: string;
  price: number | null;
  score: number | null;
}

export function PriceHistoryChart({ data }: { data: HistoryPoint[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.recorded_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit" }),
  }));

  if (formatted.length < 2) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-text-muted">
        Ainda não há histórico suficiente — volte depois de algumas atualizações horárias.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="#26374480" vertical={false} />
        <XAxis dataKey="label" stroke="#5B6B7A" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
        <YAxis stroke="#5B6B7A" fontSize={11} tickLine={false} axisLine={false} domain={["auto", "auto"]} width={70} />
        <Tooltip
          contentStyle={{ background: "#1D2B38", border: "1px solid #26374480", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#8A99A8" }}
        />
        <Line type="monotone" dataKey="price" stroke="#C9A24B" strokeWidth={2} dot={false} name="Preço" />
      </LineChart>
    </ResponsiveContainer>
  );
}
