"use client";

import { Scrollbars } from "@/components/scrollbars";
import { DocumentCheckboxProvider } from "./document-checkbox";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUpdateQueryString } from "@/app/_helpers/updateParams";
import { useDebounce } from "@uidotdev/usehooks";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/chadcn/pagination";
import { fetchWorkspace } from "@/app/_helpers/workspace-docs";
import { Combobox } from "@/components/combobox";
import { Button } from "@/components/button";
import { DatePickerWithRange } from "@/components/datepicker";
import { DateRange } from "react-day-picker";
import { endOfDay, startOfDay } from "date-fns";
import { useProgress } from "@/components/client";

import { DocumentListRow, DocumentsActions } from "./components";
import { THead } from "@/components/table";
import { cn } from "@/lib/utils";
import { TextInput } from "@/components/textinput";

export const WorkspaceDocuments = ({
  workspaceId,
  initialWorkspace,
  initialPageSize,
  initialPage,
  initialPageMax,
}: {
  initialPageMax: number;
  workspaceId: string;
  initialWorkspace: Awaited<ReturnType<typeof fetchWorkspace>>;
  initialPageSize: number;
  initialPage: number;
}) => {
  const params = useSearchParams();
  const page = parseInt(params.get("page") || "1") ?? initialPage;
  const pageSize = parseInt(params.get("pageSize") || "20") ?? initialPageSize;
  const search = params.get("search") || "";
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const uploader = params.get("uploader") || "";

  const [searchTerm, setSearchTerm] = useState(search);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const updateQueryString = useUpdateQueryString();

  const { monitorProgress } = useProgress();

  const workspaceQuery = useQuery<typeof initialWorkspace>({
    queryKey: [
      "documents",
      workspaceId,
      page,
      pageSize,
      search,
      from,
      to,
      uploader,
    ],
    queryFn: monitorProgress(() =>
      fetchWorkspace(
        { id: workspaceId },
        page,
        pageSize,
        search,
        from,
        to,
        uploader,
      ),
    ),
  });

  const { workspace, docCount } = workspaceQuery.data ?? initialWorkspace;
  const workspaceUsers = initialWorkspace.workspaceUsers;
  const pageMax = Math.ceil(docCount / pageSize) || initialPageMax;

  const handlePreviousClick = () => {
    if (page > 1) {
      const _params = [{ page: page - 1 }];
      updateQueryString(_params);
    }
  };

  const handleNextClick = () => {
    if (page < pageMax) {
      const _params = [{ page: page + 1 }];
      updateQueryString(_params);
    }
  };

  const handleUploaderChange = (value: string) => {
    const uploader = value ? value : "paramDelete";
    const _params = [{ uploader: uploader }, { page: "paramDelete" }];
    updateQueryString(_params);
  };

  const handleDateChange = (date: DateRange | undefined) => {
    const from = date?.from
      ? startOfDay(date.from).toISOString()
      : "paramDelete";
    const to = date?.to ? endOfDay(date.to).toISOString() : "paramDelete";
    const _params = [{ from: from }, { to: to }, { page: "paramDelete" }];
    updateQueryString(_params);
  };

  const handleSearchChange = (e: any) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const updateSearchParams = async () => {
      const _params = debouncedSearchTerm
        ? [{ search: debouncedSearchTerm }, { page: "paramDelete" }]
        : [{ search: "paramDelete" }, { page: "paramDelete" }];
      updateQueryString(_params);
    };

    if (debouncedSearchTerm !== null || "") {
      updateSearchParams();
    }
  }, [debouncedSearchTerm, updateQueryString]);

  const handleFilterReset = () => {
    const paramKeys = [...params.keys()];
    const resetParamsArray = paramKeys.map((key) => ({ [key]: "paramDelete" }));
    updateQueryString(resetParamsArray);
  };

  const hasNoResults = !workspace?.documents?.length;

  return (
    <DocumentCheckboxProvider>
      <div className="w-full flex flex-col">
        <div className="relative grow @container/document-list">
          <Scrollbars className="shrink overflow-auto overflow-x-hidden relative">
            <table
              className={cn("w-full", {
                "h-full": hasNoResults,
              })}
            >
              <THead>
                <tr className="dark:text-gray-200">
                  <th
                    className="py-2 text-left align-middle border-x-0"
                    colSpan={2}
                  >
                    <div className="flex px-4 py-2 border-x-0 flex-col gap-2">
                      <span className="text text-sm font-semibold">Name</span>
                      <TextInput
                        name="name"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search by name"
                      />
                    </div>
                  </th>
                  <th className="py-2 text-left border-x-0">
                    <div className="p-2 border-x-0 flex flex-col gap-2">
                      <span className="text text-sm font-semibold">
                        Uploaded by
                      </span>
                      <Combobox
                        className="font-normal"
                        width={300}
                        value={uploader}
                        onChange={handleUploaderChange}
                        options={workspaceUsers.map((user) => ({
                          value: user.id,
                          label: user.name ? user.name : user.email,
                        }))}
                      />
                    </div>
                  </th>
                  <th className="py-2 text-left border-x-0">
                    <div className="p-2 border-x-0 flex flex-col gap-2">
                      <span className="text text-sm font-semibold">Date</span>
                      <DatePickerWithRange
                        numberOfMonths={1}
                        onChange={handleDateChange}
                        from={from || undefined}
                        to={to || undefined}
                      />
                    </div>
                  </th>
                  <th className="py-2 text-left border-x-0 w-0 align-bottom">
                    <div className="p-2 border-x-0 flex flex-col justify-end h-full gap-2">
                      <span className="text text-sm font-semibold sr-only">
                        Actions
                      </span>
                      <Button variant="ghost" onClick={handleFilterReset}>
                        Reset
                      </Button>
                    </div>
                  </th>
                </tr>
              </THead>
              <tbody className="overflow-auto">
                {workspace?.documents?.map((document) => (
                  <DocumentListRow
                    workspaceId={workspaceId}
                    thumbnail={document.thumbnail}
                    key={document.id}
                    document={document}
                    job={document.dataExtractionJobs[0]}
                    jobs={document.dataExtractionJobs}
                  />
                ))}
              </tbody>
              {hasNoResults && (
                <tfoot className="h-full">
                  <tr>
                    <td colSpan={5}>
                      <div className="text-center flex flex-col items-center pb-12">
                        <p className="text-grey-200 font-semibold max-w-[16em]">
                          No results found
                        </p>
                        <p className="text-gray-500 text-sm max-w-[25em]">
                          Please update search criteria or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </Scrollbars>
        </div>
        {!hasNoResults && (
          <footer className="@container/document-list-footer p-3 px-6 flex justify-between gap-2 h-13 border-t dark:border-midnight-400">
            <div className="w-1/3 shrink-0">
              <DocumentsActions />
            </div>
            <div className="w-1/3 flex justify-end flex-grow">
              <Pagination>
                <PaginationContent className="flex gap-x-2">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePreviousClick();
                      }}
                      disabled={page <= 1}
                    >
                      <span className="sr-only @lg/document-list-footer:not-sr-only">
                        Prev
                      </span>
                    </PaginationPrevious>
                  </PaginationItem>
                  <PaginationItem>
                    <span className="flex gap-x-2 text-xs">
                      <span>{page}</span>/<span>{pageMax}</span>
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      disabled={page >= pageMax}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNextClick();
                      }}
                    >
                      <span className="sr-only @lg/document-list-footer:not-sr-only">
                        Next
                      </span>
                    </PaginationNext>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </footer>
        )}
      </div>
    </DocumentCheckboxProvider>
  );
};
