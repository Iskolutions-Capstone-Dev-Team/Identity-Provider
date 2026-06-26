import { AnimatePresence, motion } from "framer-motion";
import { ChevronIcon } from "./faqIcons";

export default function FAQAccordionItem({ item, isOpen, onToggle, theme }) {
  const contentId = `faq-answer-${item.id}`;

  return (
    <article className={`overflow-hidden rounded-[1.35rem] border transition duration-300 ${theme.question} ${isOpen ? theme.questionOpen : ""}`}>
      <button type="button" onClick={onToggle} aria-controls={contentId} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="text-base font-bold leading-6 sm:text-lg">
          {item.question}
        </span>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition duration-300 ${theme.chevronButton}`}>
          <ChevronIcon isOpen={isOpen} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            key={contentId}
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className={`border-t px-5 pb-5 pt-3 ${theme.divider}`}>
              <ul className={`space-y-2 text-sm leading-6 sm:text-base ${theme.answer}`}>
                {item.answer.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f8d24e]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}
