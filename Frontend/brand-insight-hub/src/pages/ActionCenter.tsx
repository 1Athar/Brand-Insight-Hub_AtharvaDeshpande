import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useLatestData } from "@/hooks/useAnalytics";
import { Lightbulb, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ActionCenter() {
  const { data, isLoading } = useLatestData();
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());

  const recommendations = data?.recommendations || [];

  const toggleComplete = (index: number) => {
    setCompletedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Action Center</h1>
        <p className="text-muted-foreground">
          AI-powered recommendations to improve your brand's visibility.
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Improvement Recommendations
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {completedItems.size} / {recommendations.length} completed
          </span>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-[200px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground">
                No recommendations available. Run an analysis to get personalized suggestions.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-4 rounded-lg border border-border p-4 transition-all",
                    completedItems.has(index)
                      ? "bg-success/5 border-success/20"
                      : "bg-card hover:bg-muted/30"
                  )}
                >
                  <Checkbox
                    id={`rec-${index}`}
                    checked={completedItems.has(index)}
                    onCheckedChange={() => toggleComplete(index)}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor={`rec-${index}`}
                    className={cn(
                      "flex-1 cursor-pointer text-sm leading-relaxed",
                      completedItems.has(index)
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    )}
                  >
                    {recommendation}
                  </label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Pro Tip</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Prioritize recommendations that align with your content strategy. Focus on
                high-impact actions first, then work through the rest systematically.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
