const FAQ_THEME = {
  light: {
    panel:
      "border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,248,243,0.86))] shadow-[0_32px_90px_-54px_rgba(43,3,7,0.85)]",
    panelAccent:
      "bg-[radial-gradient(circle_at_top_right,rgba(248,210,78,0.18),transparent_25%),linear-gradient(180deg,rgba(123,13,21,0.04),transparent_42%)]",
    panelTitle: "text-[#4b2027]",
    text: "text-[#4b2027]",
    muted: "text-[#70545a]",
    divider: "border-[#7b0d15]/10",
    activeTopic:
      "border-[#f8d24e]/55 bg-[#fff6dc]/85 shadow-[0_18px_45px_-34px_rgba(43,3,7,0.45)]",
    inactiveTopic:
      "border-transparent hover:border-[#7b0d15]/10 hover:bg-white/70",
    topicIcon:
      "border-[#7b0d15]/15 bg-[#7b0d15]/10 text-[#7b0d15]",
    badge: "border-[#7b0d15]/10 bg-white/75 text-[#7b0d15]",
    question:
      "border-[#7b0d15]/10 bg-white/72 text-[#4b2027] shadow-[0_18px_45px_-38px_rgba(43,3,7,0.38)]",
    questionOpen: "border-[#f8d24e]/48 bg-[#fffaf0]",
    chevronButton:
      "border-[#7b0d15]/15 bg-[#7b0d15]/10 text-[#7b0d15]",
    answer: "text-[#65474e]",
    skeleton: "bg-[#7b0d15]/10",
  },
  dark: {
    panel:
      "border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(33,21,30,0.9))] shadow-[0_32px_90px_-54px_rgba(2,6,23,0.94)]",
    panelAccent:
      "bg-[radial-gradient(circle_at_top_right,rgba(248,210,78,0.12),transparent_25%),linear-gradient(180deg,rgba(123,13,21,0.12),transparent_42%)]",
    panelTitle: "text-[#f6eaec]",
    text: "text-[#f6eaec]",
    muted: "text-[#cbb8bd]",
    divider: "border-white/10",
    activeTopic:
      "border-[#f8d24e]/35 bg-[#f8d24e]/10 shadow-[0_18px_45px_-34px_rgba(2,6,23,0.76)]",
    inactiveTopic:
      "border-transparent hover:border-white/10 hover:bg-white/[0.04]",
    topicIcon:
      "border-[#f8d24e]/20 bg-[#f8d24e]/12 text-[#f8d24e]",
    badge: "border-white/10 bg-white/[0.04] text-[#f3e7e9]",
    question:
      "border-white/10 bg-white/[0.04] text-[#f6eaec] shadow-[0_18px_45px_-38px_rgba(2,6,23,0.7)]",
    questionOpen: "border-[#f8d24e]/28 bg-[#f8d24e]/8",
    chevronButton:
      "border-[#f8d24e]/20 bg-[#f8d24e]/12 text-[#f8d24e]",
    answer: "text-[#d8c7cb]",
    skeleton: "bg-white/10",
  },
};

export default FAQ_THEME;