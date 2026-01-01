import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLatest,
  getHistory,
  getMentionedPrompts,
  getNotMentionedPrompts,
  analyzeRequest,
  AnalyzeRequest,
} from "@/lib/api";

export function useLatestData() {
  return useQuery({
    queryKey: ["latest"],
    queryFn: getLatest,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useHistory() {
  return useQuery({
    queryKey: ["history"],
    queryFn: getHistory,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useMentionedPrompts() {
  return useQuery({
    queryKey: ["prompts", "mentioned"],
    queryFn: getMentionedPrompts,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useNotMentionedPrompts() {
  return useQuery({
    queryKey: ["prompts", "not-mentioned"],
    queryFn: getNotMentionedPrompts,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useAnalyze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AnalyzeRequest) => analyzeRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["latest"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
    },
  });
}
