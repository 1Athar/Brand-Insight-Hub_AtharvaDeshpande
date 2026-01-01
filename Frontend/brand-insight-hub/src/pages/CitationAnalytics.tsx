import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLatestData } from "@/hooks/useAnalytics"; // Correct hook name
import { Globe, FileText, ExternalLink } from "lucide-react";

export default function CitationAnalytics() {
  const { data, isLoading } = useLatestData(); // Use the correct hook name

  // FIX: Directly map over the arrays, no need for Object.entries here.
  const topDomains = Array.isArray(data?.metrics?.top_cited_domains) ? data.metrics.top_cited_domains : [];
  const topPages = Array.isArray(data?.metrics?.top_cited_pages) ? data.metrics.top_cited_pages : [];

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Citation Analytics</h1>
        <p className="text-muted-foreground">
          Analyze which domains and pages are most frequently cited by AI.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Cited Domains */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Globe className="h-4 w-4 text-primary" />
              Top Cited Domains
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : topDomains.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No domain data available
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead className="w-24 text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topDomains.map((item, index) => ( // Changed from [domain, count] to item
                    <TableRow key={item.domain}> {/* Use item.domain as key */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="font-medium">{item.domain}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-sm font-medium text-primary">
                          {item.count} {/* Use item.count */}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Top Cited Pages */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FileText className="h-4 w-4 text-primary" />
              Top Cited Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : topPages.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No page data available
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page URL</TableHead>
                    <TableHead className="w-24 text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPages.map((item, index) => ( // Changed from [url, count] to item
                    <TableRow key={item.url}> {/* Use item.url as key */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-medium">
                            {index + 1}
                          </span>
                          <a
                            href={item.url} // Use item.url
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                            title={item.url} // Use item.url
                          >
                            {truncateUrl(item.url)} {/* Use item.url */}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-sm font-medium text-primary">
                          {item.count} {/* Use item.count */}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
