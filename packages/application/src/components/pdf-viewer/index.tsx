"use client";

import { Scrollbars } from "@/components/scrollbars";
import { cn } from "@/lib/utils";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { memo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useMeasure } from "react-use";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type PdfViewerProps = React.ComponentProps<typeof Document> &
  (
    | {
        width: number;
        height: undefined;
      }
    | { height: number; width: undefined }
  );

const Viewer = memo(
  ({ width, height, className, ...props }: PdfViewerProps) => {
    const [pageCount, setPageCount] = useState(1);
    const onLoadSuccess: PdfViewerProps["onLoadSuccess"] = (document) => {
      setPageCount(document.numPages);
    };

    return (
      <Document
        {...props}
        onLoadSuccess={onLoadSuccess}
        loading={
          <div
            style={{ width: width ?? "auto", height: height ?? "auto" }}
            className="bg-slate-200/20 animate-pulse"
          />
        }
        className={cn("flex gap-x-2", className)}
      >
        {new Array(pageCount).fill(null).map((_, i) => (
          <Page
            className="rounded-lg overflow-hidden dark:shadow-xl border-2 border-[#CFD8E4]"
            key={i}
            pageIndex={i}
            width={width}
            height={height}
          />
        ))}
      </Document>
    );
  },
);

Viewer.displayName = "PdfViewer";

type AdvancedPdfViewerProps = React.ComponentProps<typeof Document>;

export const AdvancedViewer = memo(
  ({ className, ...props }: AdvancedPdfViewerProps) => {
    const [pageCount, setPageCount] = useState(1);
    const onLoadSuccess: PdfViewerProps["onLoadSuccess"] = (document) => {
      setPageCount(document.numPages);
    };
    const [ref, { width }] = useMeasure<HTMLDivElement>();

    return (
      <div className={cn("w-full h-full flex items-stretch", className)}>
        <Document
          {...props}
          className={cn(
            "flex w-full items-stretch flex-col justify-center",
            className,
          )}
          error={
            <div className="h-full w-full flex flex-col items-center justify-center">
              <div className="mx-auto flex  h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gray-50/10">
                <ExclamationTriangleIcon
                  className="h-8 w-8 text-white-600"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-4 text-sm">Failed to load document preview.</p>
            </div>
          }
          onLoadSuccess={onLoadSuccess}
          loading={<div className="w-full h-full bg-slate-200 animate-pulse" />}
        >
          {/* <div className="h-full items-stretch w-24 pl-4">
            <Scrollbars className="h-full">
              <div className="h-full flex flex-col items-center gap-y-2 py-6">
                {new Array(pageCount).fill(null).map((_, i) => (
                  <Thumbnail
                    key={i}
                    pageIndex={i}
                    width={54}
                    className="rounded-sm overflow-hidden dark:shadow-xl border-[1px] border-[#CFD8E4]"
                  />
                ))}
              </div>
            </Scrollbars>
          </div> */}
          <Scrollbars className="flex-grow basis-1/1">
            <div
              ref={ref}
              className="w-full flex flex-col items-center pt-6 pb-24 gap-y-4"
            >
              {new Array(pageCount).fill(null).map((_, i) => (
                <Page
                  className="rounded overflow-hidden dark:shadow-xl border border-[#CFD8E4]"
                  key={i}
                  pageIndex={i}
                  width={width - 48 || 300}
                />
              ))}
            </div>
          </Scrollbars>
        </Document>
      </div>
    );
  },
);

AdvancedViewer.displayName = "AdvancedViewed";

export const PdfViewer = Viewer;
