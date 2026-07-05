"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { SENTIMENT_COLORS } from "@/lib/constants";

const AXIS = { fontSize: 11, stroke: "var(--muted-foreground)" } as const;

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2 capitalize">
          <span className="size-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

const fmtDay = (d: string) => {
  try {
    return format(parseISO(d), "MMM d");
  } catch {
    return d;
  }
};

export function SentimentTrendChart({ data }: { data: { date: string; positive: number; neutral: number; negative: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <defs>
          {(["positive", "neutral", "negative"] as const).map((k) => (
            <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={SENTIMENT_COLORS[k.toUpperCase() as "POSITIVE"]} stopOpacity={0.4} />
              <stop offset="95%" stopColor={SENTIMENT_COLORS[k.toUpperCase() as "POSITIVE"]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
        <XAxis dataKey="date" tickFormatter={fmtDay} tick={AXIS} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
        <Tooltip content={<ChartTooltip />} labelFormatter={fmtDay} />
        <Area type="monotone" dataKey="positive" stroke={SENTIMENT_COLORS.POSITIVE} fill="url(#g-positive)" strokeWidth={2} stackId="1" />
        <Area type="monotone" dataKey="neutral" stroke={SENTIMENT_COLORS.NEUTRAL} fill="url(#g-neutral)" strokeWidth={2} stackId="1" />
        <Area type="monotone" dataKey="negative" stroke={SENTIMENT_COLORS.NEGATIVE} fill="url(#g-negative)" strokeWidth={2} stackId="1" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CoverageTimelineChart({ data }: { data: { date: string; mentions: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
        <XAxis dataKey="date" tickFormatter={fmtDay} tick={AXIS} tickLine={false} axisLine={false} minTickGap={30} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
        <Tooltip content={<ChartTooltip />} labelFormatter={fmtDay} />
        <Line type="monotone" dataKey="mentions" stroke="var(--primary)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SentimentDonut({ positive, neutral, negative }: { positive: number; neutral: number; negative: number }) {
  const data = [
    { name: "Positive", value: positive, color: SENTIMENT_COLORS.POSITIVE },
    { name: "Neutral", value: neutral, color: SENTIMENT_COLORS.NEUTRAL },
    { name: "Negative", value: negative, color: SENTIMENT_COLORS.NEGATIVE },
  ];
  const total = positive + neutral + negative || 1;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={2} strokeWidth={0}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <text x="50%" y="47%" textAnchor="middle" className="fill-foreground text-2xl font-semibold">
          {Math.round((positive / total) * 100)}%
        </text>
        <text x="50%" y="60%" textAnchor="middle" className="fill-muted-foreground text-[11px]">
          positive
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBar({ data, color = "var(--primary)" }: { data: { name: string; value: number }[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 42)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" tick={AXIS} tickLine={false} axisLine={false} width={120} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
        <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ShareOfVoiceChart({ data }: { data: { name: string; shareOfVoice: number }[] }) {
  const palette = ["var(--primary)", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="shareOfVoice" nameKey="name" innerRadius={0} outerRadius={82} paddingAngle={2} strokeWidth={0}>
          {data.map((_, i) => (
            <Cell key={i} fill={palette[i % palette.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
