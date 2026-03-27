const lightModalTheme = {
  modalOverlayClassName:
    "modal modal-open fixed inset-0 z-[120] px-3 py-6 backdrop:bg-[rgba(43,3,7,0.58)] backdrop:backdrop-blur-sm",
  modalBoxClassName:
    "modal-box relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,250,244,0.98),rgba(255,255,255,0.96))] p-0 font-[Poppins] text-slate-800 shadow-[0_36px_90px_-40px_rgba(43,3,7,0.72)] transition-[background-color,border-color,color,box-shadow] duration-500 ease-out",
  modalHeaderClassName:
    "relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(248,210,78,0.22),transparent_32%),linear-gradient(135deg,#7b0d15_0%,#3d0910_58%,#1f0205_100%)] px-6 py-6 text-white transition-[background-color,border-color] duration-500 ease-out sm:px-8",
  modalHeaderTitleClassName:
    "text-2xl font-semibold tracking-tight sm:text-[2rem]",
  modalHeaderDescriptionClassName:
    "mt-2 text-sm text-white/82 sm:text-[0.95rem]",
  modalCloseButtonClassName:
    "btn btn-circle btn-sm border border-white/10 bg-white/10 text-white shadow-none backdrop-blur-sm transition hover:bg-white/20",
  modalBodyClassName:
    "flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(255,250,244,0.98),rgba(255,255,255,0.96))] px-6 py-6 transition-[background-color,color] duration-500 ease-out sm:px-8",
  modalBodyStackClassName: "space-y-5",
  modalSectionClassName:
    "rounded-[1.5rem] border border-[#7b0d15]/10 bg-white/80 p-5 shadow-[0_22px_45px_-36px_rgba(43,3,7,0.55)] transition-[background-color,border-color,box-shadow] duration-500 ease-out",
  modalStepsWrapClassName:
    "rounded-[1.5rem] border border-[#7b0d15]/10 bg-white/78 px-2 pb-2 shadow-[0_22px_45px_-36px_rgba(43,3,7,0.55)] transition-[background-color,border-color,box-shadow] duration-500 ease-out",
  modalFooterClassName:
    "border-t border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,248,243,0.96))] px-6 py-5 transition-[background-color,border-color] duration-500 ease-out sm:px-8",
  modalFooterActionsClassName:
    "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
  modalPrimaryButtonClassName:
    "btn h-12 rounded-[1rem] border border-[#7b0d15] bg-[#7b0d15] px-6 text-white transition hover:border-[#5a0b12] hover:bg-[#5a0b12]",
  modalSecondaryButtonClassName:
    "btn h-12 rounded-[1rem] border border-[#7b0d15]/15 bg-white/85 px-6 text-[#7b0d15] shadow-none transition hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]",
  modalLabelClassName:
    "mb-2 block text-sm font-semibold uppercase tracking-[0.08em] text-[#5a0b12] transition-colors duration-500 ease-out",
  modalHelperTextClassName:
    "mb-3 text-xs text-[#8f6f76] transition-colors duration-500 ease-out",
  modalInputClassName:
    "input w-full rounded-[1rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.88))] text-[#4a1921] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition-[background-color,border-color,color,box-shadow] duration-500 ease-out focus:border-[#d4a017] focus:outline-none",
  modalSelectTriggerClassName:
    "group relative rounded-[1.35rem] border border-[#eed7ab] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,248,238,0.94))] shadow-[0_18px_45px_-36px_rgba(43,3,7,0.45)] transition duration-300 hover:border-[#e6c46a] focus-within:border-[#f8d24e] focus-within:ring-4 focus-within:ring-[#f8d24e]/20",
  modalSelectButtonClassName:
    "flex h-14 w-full items-center justify-between gap-3 rounded-[inherit] bg-transparent pl-4 pr-3 text-left",
  modalSelectMenuClassName:
    "absolute left-0 right-0 top-[calc(100%+0.65rem)] z-30 overflow-hidden rounded-[1.35rem] border border-[#eed7ab] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(255,247,239,0.99))] shadow-[0_26px_50px_-30px_rgba(43,3,7,0.55)] backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-500 ease-out",
  modalSelectOptionClassName:
    "w-full px-4 py-3 text-left text-sm font-medium text-[#4a1921] transition duration-200 hover:bg-[#fff1c7] hover:text-[#7b0d15]",
  modalSelectOptionSelectedClassName:
    "bg-[#fff2d2] text-[#7b0d15]",
  modalReadOnlyInputClassName:
    "w-full rounded-[1rem] border border-[#7b0d15]/10 bg-[#fff7ef]/90 px-4 py-3 text-sm text-[#5d3a41] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition-[background-color,border-color,color,box-shadow] duration-500 ease-out",
  modalOptionalBadgeClassName:
    "badge border border-[#f8d24e]/50 bg-[#fff4dc] text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[#7b0d15] transition-[background-color,border-color,color] duration-500 ease-out",
};

const darkModalTheme = {
  modalOverlayClassName:
    "modal modal-open fixed inset-0 z-[120] px-3 py-6 backdrop:bg-[rgba(9,13,20,0.78)] backdrop:backdrop-blur-sm",
  modalBoxClassName:
    "modal-box relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(35,22,31,0.96))] p-0 font-[Poppins] text-[#f4eaea] shadow-[0_36px_90px_-40px_rgba(2,6,23,0.9)] transition-[background-color,border-color,color,box-shadow] duration-500 ease-out",
  modalHeaderClassName:
    "relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(248,210,78,0.18),transparent_32%),linear-gradient(135deg,#7b0d15_0%,#263345_55%,#1a121c_100%)] px-6 py-6 text-white transition-[background-color,border-color] duration-500 ease-out sm:px-8",
  modalHeaderTitleClassName:
    "text-2xl font-semibold tracking-tight sm:text-[2rem]",
  modalHeaderDescriptionClassName:
    "mt-2 text-sm text-white/78 sm:text-[0.95rem]",
  modalCloseButtonClassName:
    "btn btn-circle btn-sm border border-white/12 bg-white/[0.08] text-white shadow-none backdrop-blur-sm transition hover:border-[#f8d24e]/40 hover:bg-white/[0.14] hover:text-[#f8d24e]",
  modalBodyClassName:
    "flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(31,19,27,0.96))] px-6 py-6 transition-[background-color,color] duration-500 ease-out sm:px-8",
  modalBodyStackClassName: "space-y-5",
  modalSectionClassName:
    "rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-5 shadow-[0_22px_45px_-36px_rgba(2,6,23,0.72)] transition-[background-color,border-color,box-shadow] duration-500 ease-out",
  modalStepsWrapClassName:
    "rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-2 pb-2 shadow-[0_22px_45px_-36px_rgba(2,6,23,0.72)] transition-[background-color,border-color,box-shadow] duration-500 ease-out",
  modalFooterClassName:
    "border-t border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(10,14,22,0.28))] px-6 py-5 transition-[background-color,border-color] duration-500 ease-out sm:px-8",
  modalFooterActionsClassName:
    "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
  modalPrimaryButtonClassName:
    "btn h-12 rounded-[1rem] border border-[#f8d24e]/35 bg-[linear-gradient(135deg,#7b0d15_0%,#4f1018_100%)] px-6 text-white transition hover:border-[#f8d24e] hover:bg-[#8f121b]",
  modalSecondaryButtonClassName:
    "btn h-12 rounded-[1rem] border border-white/12 bg-white/[0.04] px-6 text-[#f4eaea] shadow-none transition hover:border-[#f8d24e]/45 hover:bg-[#f8d24e]/12 hover:text-[#ffe6a4]",
  modalLabelClassName:
    "mb-2 block text-sm font-semibold uppercase tracking-[0.08em] text-[#f7dadd] transition-colors duration-500 ease-out",
  modalHelperTextClassName:
    "mb-3 text-xs text-[#c7adb4] transition-colors duration-500 ease-out",
  modalInputClassName:
    "input w-full rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,25,0.72),rgba(22,28,40,0.88))] text-[#f4eaea] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] placeholder:text-[#9f8790] transition-[background-color,border-color,color,box-shadow] duration-500 ease-out focus:border-[#f8d24e]/55 focus:outline-none",
  modalSelectTriggerClassName:
    "group relative rounded-[1.35rem] border border-white/10 bg-[linear-gradient(135deg,rgba(16,22,35,0.94),rgba(32,22,30,0.9))] shadow-[0_18px_45px_-36px_rgba(2,6,23,0.7)] transition duration-300 hover:border-[#f8d24e]/28 focus-within:border-[#f8d24e]/55 focus-within:ring-4 focus-within:ring-[#f8d24e]/15",
  modalSelectButtonClassName:
    "flex h-14 w-full items-center justify-between gap-3 rounded-[inherit] bg-transparent pl-4 pr-3 text-left",
  modalSelectMenuClassName:
    "absolute left-0 right-0 top-[calc(100%+0.65rem)] z-30 overflow-hidden rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,23,38,0.98),rgba(27,18,28,0.98))] shadow-[0_26px_50px_-30px_rgba(2,6,23,0.8)] backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-500 ease-out",
  modalSelectOptionClassName:
    "w-full px-4 py-3 text-left text-sm font-medium text-[#f4eaea] transition duration-200 hover:bg-[#f8d24e]/12 hover:text-[#ffe28a]",
  modalSelectOptionSelectedClassName:
    "bg-[#7b0d15]/30 text-[#ffe28a]",
  modalReadOnlyInputClassName:
    "w-full rounded-[1rem] border border-white/10 bg-[rgba(10,15,24,0.76)] px-4 py-3 text-sm text-[#d6c3c7] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[background-color,border-color,color,box-shadow] duration-500 ease-out",
  modalOptionalBadgeClassName:
    "badge border border-[#f8d24e]/35 bg-[#f8d24e]/12 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[#ffe28a] transition-[background-color,border-color,color] duration-500 ease-out",
};

export function getModalTheme(colorMode = "light") {
  return colorMode === "dark" ? darkModalTheme : lightModalTheme;
}

export const {
  modalOverlayClassName,
  modalBoxClassName,
  modalHeaderClassName,
  modalHeaderTitleClassName,
  modalHeaderDescriptionClassName,
  modalCloseButtonClassName,
  modalBodyClassName,
  modalBodyStackClassName,
  modalSectionClassName,
  modalStepsWrapClassName,
  modalFooterClassName,
  modalFooterActionsClassName,
  modalPrimaryButtonClassName,
  modalSecondaryButtonClassName,
  modalLabelClassName,
  modalHelperTextClassName,
  modalInputClassName,
  modalSelectTriggerClassName,
  modalSelectButtonClassName,
  modalSelectMenuClassName,
  modalSelectOptionClassName,
  modalSelectOptionSelectedClassName,
  modalReadOnlyInputClassName,
  modalOptionalBadgeClassName,
} = lightModalTheme;