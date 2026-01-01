import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3 } from "lucide-react";

interface RankDistributionChartProps {
  rankDistribution: any; // Using 'any' to handle the backend keys safely
  isLoading: boolean;
}

export function RankDistributionChart({ rankDistribution, isLoading }: RankDistributionChartProps) {
  
  // FIX: Updated keys to match Python backend ("1st_rank", "2nd_rank", "3rd_rank_plus")
  const chartData = rankDistribution
    ? [
        { 
          rank: "1st Rank", 
          value: rankDistribution["1st_rank"] || 0, 
          color: "hsl(var(--primary))" 
        },
        { 
          rank: "2nd Rank", 
          value: rankDistribution["2nd_rank"] || 0, 
          color: "hsl(var(--primary) / 0.6)" 
        },
        { 
          rank: "3rd+ Rank", 
          value: rankDistribution["3rd_rank_plus"] || 0, 
          color: "hsl(var(--muted-foreground))" 
        },
      ]
    : [];

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Mention Rank</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No rank data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart 
              data={chartData} 
              layout="vertical" 
              margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                domain={[0, 100]} 
                unit="%"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
              />
              <YAxis
                type="category"
                dataKey="rank"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-medium text-muted-foreground">
                            {payload[0].payload.rank}:
                          </span>
                          <span className="font-bold">
                            {Number(payload[0].value).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}