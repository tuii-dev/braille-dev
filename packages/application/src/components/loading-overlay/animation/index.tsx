import { Logo } from "@/components/logo";
import { AnimatePresence, motion } from "framer-motion";

export default function LoadingScreenAnimation() {
  return (
    <div className="flex flex-col justify-center items-center gap-6">
      <Logo />
      <span className="flex text-sm font-semibold text-gray-800 dark:text-white">
        <AnimatePresence>
          {"Getting everything ready for you.".split(" ").map((word, index) => (
            <motion.span
              initial={{ opacity: 0, translateY: "1em" }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0, transform: "translateY(-10px)" }}
              transition={{
                duration: 1,
                delay: index * 0.1,
              }}
              key={index}
            >
              {word}&nbsp;
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
    </div>
  );
}
