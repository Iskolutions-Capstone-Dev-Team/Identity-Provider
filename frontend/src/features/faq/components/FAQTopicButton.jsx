function TopicIcon({ iconPath, theme }) {
  return (
    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.15rem] border ${theme.topicIcon}`}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
      </svg>
    </span>
  );
}

export default function FAQTopicButton({ topic, isActive, onClick, theme }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-[1.4rem] border px-3 py-3 text-left transition duration-300 ${
        isActive ? theme.activeTopic : theme.inactiveTopic
      }`}
    >
      <TopicIcon iconPath={topic.iconPath} theme={theme} />

      <span className={`min-w-0 flex-1 text-sm font-bold ${theme.text}`}>
        {topic.title}
      </span>

      <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${theme.badge}`}>
        {topic.questions.length}
      </span>
    </button>
  );
}