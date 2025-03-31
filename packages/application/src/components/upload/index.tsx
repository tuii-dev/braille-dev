"use client";

import React, { useRef, useState, FormEvent } from "react";
import { useDropzone, DropEvent, FileRejection } from "react-dropzone";
import { ArrowUpTrayIcon } from "@heroicons/react/20/solid";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "../button";

interface DropZoneProps {
  disabled: boolean;
  onDrop: (
    acceptedFiles: File[],
    fileRejections: FileRejection[],
    event: DropEvent,
  ) => void;
  children: (props: ReturnType<typeof useDropzone>) => React.ReactNode;
}

const DropZone: React.FC<DropZoneProps> = ({ disabled, onDrop, children }) => {
  const dropzoneProps = useDropzone({
    multiple: true,
    disabled,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB max file size
    onDrop,
  });

  return <>{children(dropzoneProps)}</>;
};

interface DropzoneDivProps {
  hasFiles: boolean;
  children: React.ReactNode;
}

const DropzoneDiv: React.FC<DropzoneDivProps> = ({ hasFiles, children }) => {
  return (
    <div
      className={cn(
        hasFiles ? "blur-sm" : null,
        !hasFiles ? "cursor-pointer dark:hover:border-gray-500" : null,
        "absolute inset-0 flex justify-center items-center appearance-none flex-col w-full rounded-lg p-12 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
      )}
    >
      {children}
    </div>
  );
};

interface UploadProps {
  className?: string;
  children?: React.ReactNode;
  action: (data: FormData) => Promise<void>;
}

export const Upload: React.FC<UploadProps> = ({
  className,
  children,
  action,
}) => {
  const [session, setSession] = useState<number>(1);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [pending, setPending] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) return;

    setPending(true);

    const formData = new FormData();
    for (const file of files) {
      formData.append("asset", file);
    }

    try {
      await action(formData);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setSession((prev) => prev + 1);
      setFiles([]);
      toast.success("Files uploaded successfully", {
        duration: 4000,
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Failed to upload files",
        {
          duration: 5000,
        },
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      aria-label="Upload documents"
      className={className}
      key={session}
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <DropZone
        key={session}
        disabled={pending}
        onDrop={async (
          acceptedFiles: File[],
          fileRejections: FileRejection[],
          event: DropEvent,
        ) => {
          // Handle rejected files
          if (fileRejections.length > 0) {
            const rejectionsByError = fileRejections.reduce(
              (acc, rejection) => {
                const errorCode = rejection.errors[0]?.code || "unknown";
                if (!acc[errorCode]) {
                  acc[errorCode] = [];
                }
                acc[errorCode].push(rejection.file.name);
                return acc;
              },
              {} as Record<string, string[]>,
            );

            // Show specific error messages for each type of rejection
            Object.entries(rejectionsByError).forEach(([errorCode, files]) => {
              const fileList = files.join(", ");
              switch (errorCode) {
                case "file-invalid-type":
                  toast.error(
                    `Only PDF files are allowed. Invalid files: ${fileList}`,
                    {
                      duration: 5000,
                    },
                  );
                  break;
                case "file-too-large":
                  toast.error(
                    `Files must be under 50MB. Too large: ${fileList}`,
                    {
                      duration: 5000,
                    },
                  );
                  break;
                default:
                  toast.error(`Files rejected: ${fileList}`, {
                    duration: 5000,
                  });
              }
            });
            return;
          }

          const convertedFiles = await Promise.all(acceptedFiles);
          const filesToUpload = convertedFiles.filter(
            (file): file is File => file !== null,
          );

          setFiles(filesToUpload);
        }}
      >
        {({ getRootProps, getInputProps, isDragActive }) => {
          const hasFiles = files.length > 0;

          return (
            <>
              {pending && (
                <div role="status">
                  <span className="sr-only">Uploading...</span>
                </div>
              )}
              <div className="relative h-full w-full">
                <div {...getRootProps()}>
                  <input
                    disabled={pending || hasFiles}
                    className="opacity-0 absolute overflow-hidden z-10"
                    {...getInputProps()}
                  />
                  <DropzoneDiv hasFiles={hasFiles}>
                    {!hasFiles && (
                      <>{isDragActive ? "Drop to upload!" : children}</>
                    )}
                  </DropzoneDiv>
                </div>
                {hasFiles && (
                  <div className="absolute inset-0 mb-4 mr-4 flex justify-center items-center gap-x-4">
                    <Button type="submit" disabled={pending}>
                      <div className="flex gap-x-2 items-center">
                        <ArrowUpTrayIcon className="w-4 h-4" />
                        {pending
                          ? "Uploading..."
                          : `Upload ${files.length} file${
                              files.length > 1 ? "s" : ""
                            }!`}
                      </div>
                    </Button>
                    {!pending && (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => {
                          setFiles([]);
                        }}
                        disabled={pending}
                      >
                        <div className="flex gap-x-2 items-center">
                          <TrashIcon className="w-4 h-4" />
                          Cancel
                        </div>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          );
        }}
      </DropZone>
    </form>
  );
};
