"use client";

import { CircleX, Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

export default function AnimatedTags({
  initialTags = ["Security Analysis", "Authentication Statistics", "Failed Attempts"],
  selectedTags: controlledSelectedTags,
  onChange,
  className = "",
}) {
  const [internalSelected, setInternalSelected] = useState([]);
  const shouldReduceMotion = useReducedMotion();

  const selectedTag = controlledSelectedTags ?? internalSelected;
  const tags = initialTags.filter((tag) => !selectedTag.includes(tag));

  const handleTagClick = (tag) => {
    const newSelected = [...selectedTag, tag];
    if (onChange) {
      onChange(newSelected);
    } else {
      setInternalSelected(newSelected);
    }
  };
  const handleDeleteTag = (tag) => {
    const newSelectedTag = selectedTag.filter((selected) => selected !== tag);
    if (onChange) {
      onChange(newSelectedTag);
    } else {
      setInternalSelected(newSelectedTag);
    }
  };
  return (
    <div className={`flex w-full flex-col gap-2 p-1 ${className}`}>
      <div className="flex flex-col items-start justify-center gap-1">
        <p className="text-xs font-medium text-foreground">Selected Sections</p>
        <AnimatePresence>
          <div className="flex min-h-8 w-full flex-wrap items-center gap-1 rounded-lg border dark:border-white/10 bg-background dark:bg-transparent p-1.5">
            {selectedTag?.map((tag) => (
              <motion.div
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : {
                        y: 0,
                        opacity: 1,
                        filter: "blur(0px)",
                      }
                }
                className="group flex cursor-pointer flex-row items-center justify-center gap-1.5 rounded-md border border-[#7b0d15] dark:border-white/10 bg-[#7b0d15] dark:bg-transparent px-2 py-0.5 text-xs text-white dark:text-gray-300 hover:bg-[#5a0b12] dark:hover:bg-white/5"
                exit={
                  shouldReduceMotion
                    ? { opacity: 0, transition: { duration: 0 } }
                    : { y: 20, opacity: 0, filter: "blur(4px)" }
                }
                initial={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { y: 20, opacity: 0, filter: "blur(4px)" }
                }
                key={tag}
                layout
                onClick={() => handleDeleteTag(tag)}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.25, bounce: 0, type: "spring" }
                }
              >
                {tag}{" "}
                <CircleX
                  className="ease flex items-center justify-center rounded-full transition-all duration-200"
                  size={12}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
      <AnimatePresence>
        <div className="flex flex-wrap items-center gap-1">
          {tags.map((tag) => (
            <motion.div
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : {
                      y: 0,
                      opacity: 1,
                      filter: "blur(0px)",
                    }
              }
              className="group flex cursor-pointer flex-row items-center justify-center gap-1.5 rounded-md border border-[#7b0d15]/20 dark:border-white/10 bg-[#7b0d15]/10 dark:bg-transparent px-2 py-0.5 text-xs text-[#7b0d15] dark:text-gray-300 hover:bg-[#7b0d15]/20 dark:hover:bg-white/5 dark:hover:text-gray-200"
              exit={
                shouldReduceMotion
                  ? { opacity: 0, transition: { duration: 0 } }
                  : { y: -20, opacity: 0, filter: "blur(4px)" }
              }
              initial={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { y: -20, opacity: 0, filter: "blur(4px)" }
              }
              key={tag}
              layout
              onClick={() => handleTagClick(tag)}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.25, bounce: 0, type: "spring" }
              }
            >
              {tag}{" "}
              <Plus
                className="ease flex items-center justify-center rounded-full transition-all duration-200"
                size={12}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
