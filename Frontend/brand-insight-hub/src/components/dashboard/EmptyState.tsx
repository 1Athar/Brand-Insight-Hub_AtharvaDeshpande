import { BarChart3, Search } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "No analysis data yet",
  description = "Enter your brand details above and click Analyze to get started.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <BarChart3 className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
        <Search className="h-4 w-4" />
        <span>Brand + Category + Competitors → Analyze</span>
      </div>
    </div>
  );
}
