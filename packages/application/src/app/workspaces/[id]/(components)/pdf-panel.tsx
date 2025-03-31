import { AdvancedViewer } from "@/components/pdf-viewer";

export const PDFPanel = ({ pdf }: { pdf: string | null }) => {
    return (
      <div className="@[1200px]:block hidden w-4/12 border-r bg-slate-50 dark:bg-charcoal-980 dark:border-midnight-400">
        <div className="flex w-full h-full items-stretch">
          <AdvancedViewer file={pdf} />
        </div>
      </div>
    );
  };
  