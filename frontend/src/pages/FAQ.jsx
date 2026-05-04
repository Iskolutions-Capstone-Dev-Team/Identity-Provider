import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import FAQAccordionItem from "../components/faq/FAQAccordionItem";
import FAQHeaderIcon from "../components/faq/FAQHeaderIcon";
import FAQPanel from "../components/faq/FAQPanel";
import FAQSkeleton from "../components/faq/FAQSkeleton";
import FAQTopicButton from "../components/faq/FAQTopicButton";
import FAQ_TOPICS from "../components/faq/faqTopics";
import FAQ_THEME from "../components/faq/faqTheme";
import { useDelayedLoading } from "../hooks/useDelayedLoading";

const SKELETON_DELAY_MS = 450;

export default function FAQ() {
  const { colorMode = "light" } = useOutletContext() || {};
  const [activeTopicId, setActiveTopicId] = useState(FAQ_TOPICS[0].id);
  const [openQuestionId, setOpenQuestionId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const isDarkMode = colorMode === "dark";
  const theme = FAQ_THEME[isDarkMode ? "dark" : "light"];
  const showSkeleton = useDelayedLoading(isLoading, SKELETON_DELAY_MS);
  const activeTopic =
    FAQ_TOPICS.find((topic) => topic.id === activeTopicId) || FAQ_TOPICS[0];

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsLoading(false);
    }, SKELETON_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const handleTopicSelect = (topicId) => {
    setActiveTopicId(topicId);
    setOpenQuestionId("");
  };

  const handleQuestionToggle = (questionId) => {
    setOpenQuestionId((currentId) =>
      currentId === questionId ? "" : questionId,
    );
  };

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[96rem] flex-col gap-6 px-1 min-[1800px]:max-w-[112rem] min-[2200px]:max-w-[128rem] sm:px-0">
      <PageHeader
        title="FAQ"
        description="Frequently asked questions"
        icon={<FAQHeaderIcon />}
        colorMode={colorMode}
      />

      {showSkeleton ? (
        <FAQSkeleton theme={theme} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
          <FAQPanel theme={theme}>
            <div className="space-y-4 p-4 sm:p-5 lg:p-6">
              <h2 className={`text-base font-bold ${theme.panelTitle}`}>
                Browse by Topic
              </h2>

              <div className={`space-y-2 border-t pt-4 ${theme.divider}`}>
                {FAQ_TOPICS.map((topic) => (
                  <FAQTopicButton
                    key={topic.id}
                    topic={topic}
                    isActive={activeTopic.id === topic.id}
                    onClick={() => handleTopicSelect(topic.id)}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
          </FAQPanel>

          <FAQPanel theme={theme}>
            <div className="space-y-5 p-4 sm:p-5 lg:p-6">
              <div className={`flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between ${theme.divider}`}>
                <div className="min-w-0">
                  <p className={`text-xs font-bold uppercase tracking-[0.18em] ${theme.muted}`}>
                    {activeTopic.title}
                  </p>
                  <h2 className={`mt-1 text-2xl font-black ${theme.panelTitle}`}>
                    System Guide
                  </h2>
                </div>
                <span className={`self-start rounded-full border px-3 py-1.5 text-xs font-bold sm:self-center ${theme.badge}`}>
                  {activeTopic.questions.length} questions
                </span>
              </div>

              <div className="space-y-3">
                {activeTopic.questions.map((item) => (
                  <FAQAccordionItem
                    key={item.id}
                    item={item}
                    isOpen={openQuestionId === item.id}
                    onToggle={() => handleQuestionToggle(item.id)}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
          </FAQPanel>
        </div>
      )}
    </div>
  );
}