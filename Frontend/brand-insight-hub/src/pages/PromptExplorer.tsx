import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PromptCard } from "@/components/prompts/PromptCard";
import { useMentionedPrompts, useNotMentionedPrompts } from "@/hooks/useAnalytics";
import { CheckCircle, XCircle } from "lucide-react";

export default function PromptExplorer() {
  const [activeTab, setActiveTab] = useState("mentioned");
  const { data: mentionedPrompts, isLoading: loadingMentioned } = useMentionedPrompts();
  const { data: notMentionedPrompts, isLoading: loadingNotMentioned } = useNotMentionedPrompts();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Prompt Explorer</h1>
        <p className="text-muted-foreground">
          Explore AI prompts where your brand was mentioned or missing.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="mentioned" className="gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            Mentioned ({mentionedPrompts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="not-mentioned" className="gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            Not Mentioned ({notMentionedPrompts?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mentioned" className="mt-0">
          {loadingMentioned ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : mentionedPrompts && mentionedPrompts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {mentionedPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} variant="mentioned" />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
              <CheckCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No mentioned prompts found.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="not-mentioned" className="mt-0">
          {loadingNotMentioned ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : notMentionedPrompts && notMentionedPrompts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {notMentionedPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} variant="not-mentioned" />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
              <XCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No missing prompts found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
