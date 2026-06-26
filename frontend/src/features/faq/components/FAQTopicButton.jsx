import { TopicIcon } from "./faqIcons";

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