import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Eye } from "lucide-react";
import { PromptItem } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PromptCardProps {
  prompt: PromptItem;
  variant: "mentioned" | "not-mentioned";
}

export function PromptCard({ prompt, variant }: PromptCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isMentioned = variant === "mentioned";

  return (
    <>
      <Card
        className={cn(
          "cursor-pointer border-l-4 shadow-card transition-all hover:shadow-card-hover",
          isMentioned ? "border-l-success" : "border-l-destructive"
        )}
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium text-foreground line-clamp-2">{prompt.question}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={isMentioned ? "default" : "secondary"} className="text-xs">
                  {isMentioned ? "Mentioned" : "Not Mentioned"}
                </Badge>
                {prompt.citations?.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {prompt.citations.length} citation{prompt.citations.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">{prompt.question}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-medium text-muted-foreground">Answer</h4>
              <div className="rounded-lg bg-muted/50 p-4 text-sm leading-relaxed">
                {prompt.answer || "No answer available."}
              </div>
            </div>

            {prompt.citations && prompt.citations.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">Citations</h4>
                <div className="space-y-2">
                  {prompt.citations.map((citation, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{citation.text}</p>
                        {citation.url && (
                          <a
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {citation.url}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
