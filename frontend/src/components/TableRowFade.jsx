import { motion, AnimatePresence } from "framer-motion";

export default function TableRowFade({ children, keyId, isVisible = true, className = "hover:bg-gray-200" }) {
  const variants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.tr
          key={keyId}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={className}
        >
          {children}
        </motion.tr>
      )}
    </AnimatePresence>
  );
}