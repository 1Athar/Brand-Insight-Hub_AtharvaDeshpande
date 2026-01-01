import { Eye, Quote, FileText } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { VisibilityTrendsChart } from "@/components/dashboard/VisibilityTrendsChart";
import { CitationShareChart } from "@/components/dashboard/CitationShareChart";
import { RankDistributionChart } from "@/components/dashboard/RankDistributionChart";
import { LeaderboardTable } from "@/components/dashboard/LeaderboardTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useLatestData } from "@/hooks/useAnalytics";

export default function Overview() {
  const { data, isLoading, isError } = useLatestData();

  if (isError || (!isLoading && !data)) {
    return <EmptyState />;
  }

  const metrics = data?.metrics;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground">Track your brand's AI visibility and citation performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="AI Visibility Score"
          value={isLoading ? "—" : `${metrics?.visibility_score?.toFixed(1) || 0}%`}
          subtitle="Based on AI mentions"
          icon={<Eye className="h-6 w-6" />}
        />
        <StatCard
          title="Total Citations"
          value={isLoading ? "—" : metrics?.total_citations || 0}
          subtitle="Across all responses"
          icon={<Quote className="h-6 w-6" />}
        />
        <StatCard
          title="Answers Tracked"
          value={isLoading ? "—" : metrics?.total_answers || 0}
          subtitle="AI responses analyzed"
          icon={<FileText className="h-6 w-6" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <VisibilityTrendsChart />
        <CitationShareChart leaderboard={metrics?.leaderboard} isLoading={isLoading} />
        <RankDistributionChart rankDistribution={metrics?.rank_distribution} isLoading={isLoading} />
      </div>

      {/* Leaderboard */}
      <LeaderboardTable leaderboard={metrics?.leaderboard} isLoading={isLoading} />
    </div>
  );
}
