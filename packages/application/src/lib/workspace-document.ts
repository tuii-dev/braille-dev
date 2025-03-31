import { DataExtractionJobStatus } from "@jptr/braille-prisma";

export const aggregateJobsStatus = (
  jobs: { status: DataExtractionJobStatus }[],
): DataExtractionJobStatus | null => {
  return jobs.reduce<DataExtractionJobStatus | null>((acc, cur) => {
    if (!acc) {
      return cur.status;
    }

    switch (acc) {
      case DataExtractionJobStatus.FAILED:
        return DataExtractionJobStatus.FAILED;

      case DataExtractionJobStatus.RUNNING:
      case DataExtractionJobStatus.FINISHED:
        if (cur.status === DataExtractionJobStatus.FAILED) {
          return cur.status;
        }

      case DataExtractionJobStatus.PENDING:
        switch (cur.status) {
          case DataExtractionJobStatus.FAILED:
          case DataExtractionJobStatus.RUNNING:
            return cur.status;
        }
    }

    return acc;
  }, null);
};
