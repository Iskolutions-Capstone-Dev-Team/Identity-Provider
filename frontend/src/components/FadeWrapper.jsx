import { AnimatePresence, motion } from "framer-motion";

export default function FadeWrapper({ children, isVisible, keyId }) {
  const fadeVariants = {
    enter: {
      opacity: 0,
      y: 12,
    },
    center: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: 8,
    },
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={keyId || "fade-content"}
          variants={fadeVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}