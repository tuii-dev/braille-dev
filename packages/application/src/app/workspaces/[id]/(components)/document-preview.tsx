import { PdfViewer } from "@/components/pdf-viewer";
import { Scrollbars } from "@/components/scrollbars";

export const DocumentPreview = ({ pdf }: { pdf: string }) => {
    return (
      <div className="mt-4">
        <div className="flex items-center h-36">
          <Scrollbars className="flex justify-center items-center h-65">
            <div className="h-full flex items-center">
              {pdf && <PdfViewer height={140} width={undefined} file={pdf} />}
            </div>
          </Scrollbars>
        </div>
      </div>
    );
  };
  