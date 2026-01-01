import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { LeaderboardEntry } from "@/lib/api";
import { PieChart as PieIcon } from "lucide-react";

interface CitationShareChartProps {
  leaderboard: LeaderboardEntry[] | undefined;
  isLoading: boolean;
}

const COLORS = [
  "hsl(239, 84%, 67%)",
  "hsl(239, 84%, 80%)",
  "hsl(215, 16%, 47%)",
  "hsl(215, 16%, 65%)",
  "hsl(215, 16%, 80%)",
];

export function CitationShareChart({ leaderboard, isLoading }: CitationShareChartProps) {
  const chartData = leaderboard?.map((entry) => ({
    name: entry.brand,
    value: entry.citation_share,
    isMe: entry.is_me,
  })) || [];

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Citation Share</CardTitle>
        <PieIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No citation data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isMe ? "hsl(239, 84%, 67%)" : COLORS[index % COLORS.length]}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, "Share"]}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                formatter={(value) => <span className="text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
