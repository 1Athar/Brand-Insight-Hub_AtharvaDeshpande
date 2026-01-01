import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
// import { LeaderboardEntry } from "@/lib/api"; // You might need to update this type definition too
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardTableProps {
  leaderboard: any[]; // Using any[] to bypass the type mismatch immediately
  isLoading: boolean;
}

export function LeaderboardTable({ leaderboard, isLoading }: LeaderboardTableProps) {
  
  // FIX 1: Updated sort to use 'visibility' instead of 'visibility_score'
  const sortedLeaderboard = leaderboard
    ? [...leaderboard].sort((a, b) => (b.visibility ?? 0) - (a.visibility ?? 0))
    : [];

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold">Brand Leaderboard</CardTitle>
        <Trophy className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : sortedLeaderboard.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No leaderboard data available
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead className="text-right">Visibility %</TableHead>
                <TableHead className="text-right">Citation Share %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLeaderboard.map((entry, index) => (
                <TableRow
                  key={entry.brand}
                  className={cn(
                    entry.is_me && "bg-primary/5 hover:bg-primary/10"
                  )}
                >
                  <TableCell className="font-medium">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm">
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entry.brand}</span>
                      {entry.is_me && (
                        <Badge variant="default" className="text-xs">
                          Me
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  {/* FIX 2: Updated property access to 'entry.visibility' */}
                  <TableCell className="text-right font-medium">
                    {(entry.visibility ?? 0).toFixed(1)}%
                  </TableCell>
                  
                  <TableCell className="text-right text-muted-foreground">
                    {(entry.citation_share ?? 0).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}