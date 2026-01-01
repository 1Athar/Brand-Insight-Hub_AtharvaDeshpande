import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAnalyze } from "@/hooks/useAnalytics";
import { toast } from "sonner";

export function DashboardHeader() {
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [competitors, setCompetitors] = useState("");

  const { mutate: analyze, isPending } = useAnalyze();

  const handleAnalyze = () => {
    if (!brand.trim() || !category.trim()) {
      toast.error("Please enter a brand and category");
      return;
    }

    analyze(
      {
        my_brand: brand.trim(),
        category: category.trim(),
        competitors: competitors.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Analysis started successfully");
        },
        onError: () => {
          toast.error("Failed to start analysis. Is the backend running?");
        },
      }
    );
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              placeholder="Your Brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="h-9 w-40 pl-3 text-sm"
            />
          </div>
          <div className="relative">
            <Input
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 w-40 pl-3 text-sm"
            />
          </div>
          <div className="relative">
            <Input
              placeholder="Competitors (comma-separated)"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              className="h-9 w-56 pl-3 text-sm"
            />
          </div>
          <Button onClick={handleAnalyze} disabled={isPending} size="sm" className="h-9 gap-2">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Analyze
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
