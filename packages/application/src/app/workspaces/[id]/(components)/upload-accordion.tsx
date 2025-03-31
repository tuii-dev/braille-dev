import { PlusIcon } from "lucide-react";
import { MotionAccordian } from "../components";

type UploadAccordionProps = {
  children: React.ReactNode;
};

export const UploadAccordion = ({ children }: UploadAccordionProps) => {
  return (
    <MotionAccordian
      animate="enter"
      icon={<PlusIcon className="w-4 h-4 mr-2" />}
      expanded
      title="Create a job"
      expandAxis="y"
    >
      {children}
    </MotionAccordian>
  );
};
