import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { getRecentActivity } from "@/lib/getWorkspaceData";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/card";

export default async function Page() {
  const activities = await getRecentActivity();

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Workspace Activity
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Recent changes and updates to your workspaces
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No recent activity
            </p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
