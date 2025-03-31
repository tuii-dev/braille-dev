"use client";

import { Fragment, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Activity as ActivityIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { Activity } from "@/lib/getWorkspaceData";

interface ActivityFeedProps {
  initialActivities: Activity[];
}

const ActivityList = ({ activities }: { activities: Activity[] }) => {
  return (
    <ul>
      {activities.map((activity) => (
        <li key={activity.id} className="flex items-start gap-4 p-3 rounded-lg">
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
        </li>
      ))}
    </ul>
  );
};

const ViewAllLink = () => {
  return (
    <Link
      href="/workspaces/activity"
      className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-1"
    >
      View all
      <ArrowRightIcon className="w-4 h-4" />
    </Link>
  );
};

export function ActivityFeed({ initialActivities }: ActivityFeedProps) {
  const [activities, setActivities] = useState(initialActivities);

  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch("/api/activities");
      const newActivities = await response.json();
      setActivities(newActivities);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Fragment>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <ActivityIcon className="w-4 h-4" />
          <h2 className="font-semibold">Recent Activity</h2>
        </div>
        <ViewAllLink />
      </div>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
        ) : (
          <ActivityList activities={activities} />
        )}
      </div>
    </Fragment>
  );
}
