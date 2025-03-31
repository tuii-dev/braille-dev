import { useCallback, useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";

const FragmentB = () => {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.20956 0H15.4614C17.1494 0 18.5312 1.38866 18.5312 3.0849V15.1078C18.5312 16.804 17.1494 18.1927 15.4614 18.1927H0V9.2547C0 4.16294 4.14264 0 9.20956 0Z"
        fill="currentColor"
      />
    </svg>
  );
};

const FragmentA = () => {
  return (
    <svg
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.14258 1.11705L23.183 12.2294V16.7151C23.183 23.5823 18.9798 26.719 13.7431 23.8686L3.14561 18.0947C1.40007 17.1445 0 14.4433 0 12.1533V3.50458C0 1.2145 1.40916 0.157776 3.14561 1.1201L3.14258 1.11705Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const Logo = ({ className }: { className?: string }) => {
  const [keyframe, setKeyframe] = useState({ frame: 0, iteration: 0 });

  const cyclicIteration = useCallback(
    (deg: number) => {
      return `${keyframe.iteration * 360 + deg}deg`;
    },
    [keyframe.iteration],
  );

  const keyframes = useMemo(() => {
    return [
      {
        a: { y: "24%", rotate: cyclicIteration(0) },
        b: { x: "120%", y: "0", rotate: cyclicIteration(0), scale: 1 },
      },
      {
        a: { x: "84%", y: "10%", rotate: cyclicIteration(61) },
        b: { x: "16%", y: "70%", rotate: cyclicIteration(0), scale: 1 },
      },
      {
        a: { x: "72%", y: "8%", rotate: cyclicIteration(180) },
        b: { x: "0%", y: "65%", rotate: cyclicIteration(180), scale: 0.8 },
      },
      {
        a: { x: "72%", y: "94%", rotate: cyclicIteration(331) },
        b: { x: "0%", y: "50%", rotate: cyclicIteration(270), scale: 1 },
      },
    ];
  }, [cyclicIteration]);

  useEffect(() => {
    const interval = setInterval(() => {
      setKeyframe((prev) => {
        const frame = (prev.frame + 1) % keyframes.length;
        return {
          frame,
          iteration: frame === 0 ? prev.iteration + 1 : prev.iteration,
        };
      });
    }, 500);

    return () => clearInterval(interval);
  }, [keyframes]);

  const transition = {
    type: "spring",
    duration: 0.45,
    stiffness: 2200,
    damping: 80,
    mass: 0.5,
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 w-[42px] h-[32px] relative text-current">
        <motion.div
          className="w-[24px] h-[25px] absolute top-0 left-0 text-current"
          initial={false}
          animate={keyframes[keyframe.frame].a}
          transition={transition}
        >
          <FragmentA />
        </motion.div>
        <motion.div
          className="w-[19px] h-[19px] absolute top-0 left-0 text-current"
          initial={false}
          animate={keyframes[keyframe.frame].b}
          transition={transition}
        >
          <FragmentB />
        </motion.div>
      </div>
    </div>
  );
};
