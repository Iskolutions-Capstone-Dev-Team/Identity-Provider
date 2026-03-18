import { motion } from "framer-motion";

export default function PageHeader({ title, description, icon, variant = "default" }) {
  if (variant === "hero") {
    return (
      <div className="mx-auto w-full max-w-[96rem] min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_32px_90px_-48px_rgba(43,3,7,0.95)]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/assets/images/pup_bg.png)" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(43,3,7,0.94),rgba(123,13,21,0.84),rgba(24,2,4,0.96))]" />
          <div className="absolute left-[-4rem] top-[-4rem] h-40 w-40 rounded-full bg-[#f8d24e]/20 blur-3xl" />
          <div className="absolute bottom-[-5rem] right-[-1rem] h-52 w-52 rounded-full bg-white/10 blur-3xl" />

          <div className="relative px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex items-center gap-4 sm:gap-5">
              <motion.div
                whileHover={{ scale: 1.08, rotate: 10 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="shrink-0 text-white"
              >
                {icon}
              </motion.div>

              <div className="min-w-0 space-y-2">
                <h1 className="text-3xl font-semibold tracking-[0.01em] text-white sm:text-[2.6rem]">
                  {title}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[80vw] md:max-w-xl lg:max-w-7xl">
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ rotate: 2, scale: 1.06, x: 2 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-gray-200 shadow-[0_8px_18px_rgba(0,0,0,0.12)] transition-all hover:shadow-[0_14px_28px_rgba(0,0,0,0.20)]"
        >
          {icon}
        </motion.div>

        <div>
          <h1 className="text-2xl font-bold text-[#991b1b] sm:text-4xl">
            {title}
          </h1>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}