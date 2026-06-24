import FAQPanel from "./FAQPanel";

function SkeletonBlock({ className = "", theme }) {
  return (
    <div className={`animate-pulse rounded-full ${theme.skeleton} ${className}`} />
  );
}

export default function FAQSkeleton({ theme }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
      <FAQPanel theme={theme}>
        <div className="space-y-4 p-4 sm:p-5 lg:p-6">
          <SkeletonBlock theme={theme} className="h-5 w-36" />
          <div className={`space-y-2 border-t pt-4 ${theme.divider}`}>
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="flex items-center gap-4 rounded-[1.4rem] border border-transparent px-3 py-3">
                <SkeletonBlock theme={theme} className="h-12 w-12 shrink-0 rounded-[1.15rem]" />
                <SkeletonBlock theme={theme} className="h-4 flex-1" />
                <SkeletonBlock theme={theme} className="h-7 w-9" />
              </div>
            ))}
          </div>
        </div>
      </FAQPanel>

      <FAQPanel theme={theme}>
        <div className="space-y-5 p-4 sm:p-5 lg:p-6">
          <div className={`flex items-center justify-between border-b pb-5 ${theme.divider}`}>
            <div className="space-y-3">
              <SkeletonBlock theme={theme} className="h-3 w-24" />
              <SkeletonBlock theme={theme} className="h-7 w-44" />
            </div>
            <SkeletonBlock theme={theme} className="h-8 w-24" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <SkeletonBlock key={index} theme={theme} className="h-16 w-full rounded-[1.35rem]" />
            ))}
          </div>
        </div>
      </FAQPanel>
    </div>
  );
}