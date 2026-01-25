import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface CategoryPieChartProps {
  data: { name: string; value: number }[];
}

const COLORS = [
  "hsl(217, 91%, 60%)",   // finance blue
  "hsl(142, 71%, 45%)",   // health green
  "hsl(25, 95%, 53%)",    // training orange
  "hsl(262, 83%, 58%)",   // schedule purple
  "hsl(199, 89%, 48%)",   // academic cyan
  "hsl(0, 84%, 60%)",     // destructive red
  "hsl(45, 93%, 47%)",    // yellow
  "hsl(280, 65%, 60%)",   // violet
  "hsl(180, 50%, 50%)",   // teal
];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Nenhum gasto registrado ainda
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
