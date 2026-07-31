import type { Variants } from "framer-motion";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const dropdownVariants: Variants = {
  hidden: { opacity: 0, scaleY: 0.95, y: -4 },
  visible: {
    opacity: 1,
    scaleY: 1,
    y: 0,
    transition: { duration: 0.18, ease: "easeOut" },
  },
  exit: { opacity: 0, scaleY: 0.95, y: -4, transition: { duration: 0.12 } },
};
