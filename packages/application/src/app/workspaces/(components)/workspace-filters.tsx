"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { TextInput } from "@/components/textinput";
import { Select } from "@/components/select";

import type { WorkspaceFilters } from "./types";
import { WorkspaceStatus } from "./types";

interface WorkspaceFiltersProps {
  totalCount: number;
  onFilterChange: (filters: WorkspaceFilters) => void;
}

export function WorkspaceFilters({
  totalCount,
  onFilterChange,
}: WorkspaceFiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<WorkspaceStatus>(WorkspaceStatus.ALL);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({ search: value, status });
  };

  const handleStatusChange = (value: string) => {
    const newStatus = value as WorkspaceStatus;
    setStatus(newStatus);
    onFilterChange({ search, status: newStatus });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4">
      <div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {totalCount} workspace{totalCount !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto ml-auto justify-end">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <TextInput
            name="search"
            placeholder="Search workspaces..."
            value={search}
            onChange={(e) => handleSearchChange(e.currentTarget.value)}
            className="pl-8 w-full sm:w-[200px]"
          />
        </div>
        <Select
          name="status"
          value={status}
          onChange={handleStatusChange}
          options={[
            { value: WorkspaceStatus.ALL, label: "All Workspaces" },
            { value: WorkspaceStatus.PINNED, label: "Pinned" },
            { value: WorkspaceStatus.UNPINNED, label: "Unpinned" },
          ]}
        />
      </div>
    </div>
  );
}
