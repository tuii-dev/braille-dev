import { Card } from "@/components/card";

export default function Loading() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-800 rounded mt-2 animate-pulse" />
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-3 rounded-lg">
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded mt-2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
