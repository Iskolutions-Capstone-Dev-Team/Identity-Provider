export default function MfaSetupQrStep({ qrCodeUrl, isLoading, onNext }) {
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Scan the QR code</h1>
      </div>

      <div className="mx-auto flex min-h-[18rem] max-w-[18rem] items-center justify-center rounded-[1.5rem] border border-white/18 bg-white p-4 shadow-[0_24px_60px_-35px_rgba(0,0,0,0.9)]">
        {isLoading ? (
          <div className="h-40 w-40 animate-pulse rounded-xl bg-slate-200" />
        ) : qrCodeUrl ? (
          <img src={qrCodeUrl} alt="Authenticator setup QR code" className="h-full w-full"/>
        ) : (
          <p className="text-sm text-slate-500">QR code unavailable</p>
        )}
      </div>

      <div className="rounded-2xl border border-blue-300/35 bg-blue-950/28 px-4 py-4 text-left text-blue-50 shadow-[0_18px_45px_-36px_rgba(37,99,235,0.72)]">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-300/14 text-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <p className="text-sm font-medium leading-6">
            Note: Make sure to scan this using any authenticator app before clicking "Next".
          </p>
        </div>
      </div>

      <button type="button" disabled={isLoading || !qrCodeUrl} onClick={onNext} className="btn h-12 w-full rounded-lg border-[#ffd700] bg-[#ffd700] text-[#991b1b] shadow-[0_18px_40px_-22px_rgba(248,210,78,0.9)] transition hover:border-[#991b1b] hover:bg-[#991b1b] hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
        Next
      </button>
    </div>
  );
}