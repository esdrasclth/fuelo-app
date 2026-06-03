"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const axis = { stroke: "#5b6675", fontSize: 11 };
const grid = "#e6e9ec";
const primary = "#10242f";
const accent = "#e39a4d";

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full">{children}</div>
      </CardContent>
    </Card>
  );
}

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e6e9ec",
  borderRadius: 12,
  fontSize: 12,
  color: "#06040e",
  boxShadow: "0 8px 24px rgba(6,4,14,0.08)",
};

export function EfficiencyChart({
  data,
  unitLabel = "km/L",
}: {
  data: { label: string; kmPerL: number }[];
  unitLabel?: string;
}) {
  return (
    <ChartCard title={`Rendimiento (${unitLabel})`}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity={0.4} />
              <stop offset="100%" stopColor={accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis dataKey="label" {...axis} tickLine={false} />
          <YAxis {...axis} tickLine={false} width={40} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="kmPerL"
            name={unitLabel}
            stroke={accent}
            fill="url(#effGrad)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MonthlySpendChart({
  data,
}: {
  data: { label: string; spent: number }[];
}) {
  return (
    <ChartCard title="Gasto mensual">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis dataKey="label" {...axis} tickLine={false} />
          <YAxis {...axis} tickLine={false} width={50} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => [`$${Number(v).toFixed(2)}`, "Gasto"]}
          />
          <Bar dataKey="spent" name="Gasto" fill={primary} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function PriceTrendChart({
  data,
  volumeLabel = "L",
}: {
  data: { label: string; price: number }[];
  volumeLabel?: string;
}) {
  return (
    <ChartCard title={`Precio del combustible ($/${volumeLabel})`}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis dataKey="label" {...axis} tickLine={false} />
          <YAxis {...axis} tickLine={false} width={40} domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => [`$${Number(v).toFixed(2)}`, `$/${volumeLabel}`]}
          />
          <Line
            type="monotone"
            dataKey="price"
            name={`$/${volumeLabel}`}
            stroke={primary}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function StationPriceChart({
  data,
  volumeLabel = "L",
}: {
  data: { name: string; price: number }[];
  volumeLabel?: string;
}) {
  return (
    <ChartCard title={`Precio promedio por gasolinera ($/${volumeLabel})`}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 12, left: 8, bottom: 0 }}
        >
          <CartesianGrid stroke={grid} horizontal={false} />
          <XAxis type="number" {...axis} tickLine={false} domain={["auto", "auto"]} />
          <YAxis
            type="category"
            dataKey="name"
            {...axis}
            tickLine={false}
            width={110}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => [`$${Number(v).toFixed(2)}`, `$/${volumeLabel}`]}
          />
          <Bar dataKey="price" name={`$/${volumeLabel}`} fill={primary} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function StationSpendChart({
  data,
}: {
  data: { name: string; spent: number }[];
}) {
  return (
    <ChartCard title="Gasto por gasolinera">
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 12, left: 8, bottom: 0 }}
        >
          <CartesianGrid stroke={grid} horizontal={false} />
          <XAxis type="number" {...axis} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            {...axis}
            tickLine={false}
            width={110}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => [`$${Number(v).toFixed(2)}`, "Gasto"]}
          />
          <Bar dataKey="spent" name="Gasto" fill={accent} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
