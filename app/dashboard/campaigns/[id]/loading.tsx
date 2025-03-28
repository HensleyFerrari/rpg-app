import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignLoading() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main content loading */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-1/3" />
            </div>
            <div className="p-6 pt-0 space-y-6">
              <Skeleton className="h-[300px] w-full rounded-md" />
              <div className="space-y-4">
                <Skeleton className="h-7 w-1/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <Skeleton className="h-7 w-1/3" />
            </div>
            <div className="p-6 pt-0">
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </div>

        {/* Sidebar loading */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <Skeleton className="h-7 w-1/2" />
            </div>
            <div className="p-6 pt-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <Skeleton className="h-7 w-2/3" />
            </div>
            <div className="p-6 pt-0">
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="p-6 pt-0 flex items-center justify-end border-t">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <Skeleton className="h-7 w-1/2" />
            </div>
            <div className="p-6 pt-0 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
