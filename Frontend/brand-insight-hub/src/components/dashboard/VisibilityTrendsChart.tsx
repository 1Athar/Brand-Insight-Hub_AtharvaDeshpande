import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useHistory } from "@/hooks/useAnalytics";
import { format } from "date-fns";
import { TrendingUp } from "lucide-react";

const BRAND_COLORS = [
  "hsl(var(--primary))", 
  "#ef4444", 
  "#22c55e", 
  "#eab308", 
  "#a855f7", 
  "#ec4899", 
  "#06b6d4", 
  "#f97316", 
  "#6366f1", 
];

export function VisibilityTrendsChart() {
  const { data: history, isLoading, isError } = useHistory();

  // FIX 1: Cast entry to 'any' here to bypass the missing type definition
  const allBrands = Array.from(
    new Set(
      history?.flatMap((entry: any) => 
        entry.metrics?.leaderboard?.map((item: any) => item.brand) || []
      ) || []
    )
  );

  // FIX 2: Cast entry to 'any' here as well
  const chartData = history?.map((entry: any) => {
    const dataPoint: any = {
      date: format(new Date(entry.timestamp), "MMM d"),
    };

    if (entry.metrics?.leaderboard) {
      entry.metrics.leaderboard.forEach((item: any) => {
        dataPoint[item.brand] = item.visibility;
      });
    }

    return dataPoint;
  }) || [];

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Visibility Trends (All Brands)</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : isError || chartData.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No trend data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px hsl(0 0% 0% / 0.1)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
              {allBrands.map((brand: any, index) => (
                <Line
                  key={brand}
                  type="monotone"
                  dataKey={brand}
                  stroke={BRAND_COLORS[index % BRAND_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}