export default function MfaShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#250508] font-[Poppins] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/assets/images/pup_bg.png)" }}/>
        <div className="absolute inset-0 bg-gradient-to-br from-[#2b0307]/92 via-[#7b0d15]/86 to-[#180204]/94" />
      </div>

      <main className="relative flex min-h-screen items-center justify-center px-3.5 py-6 sm:px-6">
        <div className="w-full max-w-[28rem] sm:max-w-[29rem] md:max-w-[30rem] lg:max-w-[32rem] xl:max-w-[34rem] rounded-[1.75rem] sm:rounded-[2rem] border-[2px] sm:border-[3px] border-[#a13a3a]/60 bg-[#5b0b10]/35 p-1 shadow-[0_34px_90px_-42px_rgba(0,0,0,0.95)] backdrop-blur-sm">
          <div className="rounded-[calc(1.75rem-5px)] sm:rounded-[calc(2rem-7px)] bg-[linear-gradient(180deg,rgba(122,13,21,0.72),rgba(55,6,11,0.78))] px-4 py-4 sm:px-8 sm:py-8">
            <div className="mb-4 sm:mb-6 flex justify-center">
              <img src="/assets/images/IDP_Logo.png" alt="Identity Provider" className="h-14 sm:h-18 lg:h-20 object-contain drop-shadow-[0_0_22px_rgba(248,210,78,0.5)]"/>
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}