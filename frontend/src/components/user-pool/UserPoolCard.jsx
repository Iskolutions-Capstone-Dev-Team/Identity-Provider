export default function UserPoolCard({ children }) {
  return (
    <div className="relative mx-auto w-full min-w-0 max-w-[96rem] overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,248,243,0.86))] shadow-[0_32px_90px_-54px_rgba(43,3,7,0.85)] backdrop-blur-2xl min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,210,78,0.18),transparent_24%),linear-gradient(180deg,rgba(123,13,21,0.04),transparent_38%)]" />
      <div className="relative space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {children}
      </div>
    </div>
  );
}