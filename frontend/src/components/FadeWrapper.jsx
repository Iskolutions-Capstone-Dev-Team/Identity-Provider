import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function FadeWrapper({ children, isVisible, keyId }) {
  const shouldReduceMotion = useReducedMotion();

  const fadeVariants = shouldReduceMotion
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: { opacity: 0, y: 18 },
        center: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
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
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}