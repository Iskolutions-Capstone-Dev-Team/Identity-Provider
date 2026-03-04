import { motion } from "framer-motion";

export default function PageHeader({ title, description, icon }) {
  return (
    <div className="w-full max-w-[80vw] md:max-w-xl lg:max-w-7xl mx-auto">
      <div className="flex items-center gap-4">

        {/* ICON TILE */}
        <motion.div
          whileHover={{ rotate: 2, scale: 1.06, x: 2 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className="
            flex items-center justify-center
            w-14 h-14
            rounded-2xl
            bg-gray-200
            shadow-[0_8px_18px_rgba(0,0,0,0.12)]
            hover:shadow-[0_14px_28px_rgba(0,0,0,0.20)]
            cursor-pointer
            transition-all
          "
        >
          {icon}
        </motion.div>

        {/* TEXT */}
        <div>
          <h1 className="text-[#991b1b] text-2xl sm:text-4xl font-bold">
            {title}
          </h1>
          <p className="text-sm text-gray-600">
            {description}
          </p>
        </div>

      </div>
    </div>
  );
}