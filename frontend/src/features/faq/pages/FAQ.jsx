import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { createPortal } from "react-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CircleHelp, Users, ShieldUser, MonitorCog, FileCheckCorner, FileSearchCorner, Info } from "lucide-react";
import FAQSkeleton from "../components/FAQSkeleton";
import FAQ_TOPICS from "../components/faqTopics";
import FAQ_THEME from "../components/faqTheme";
import { useDelayedLoading } from "../../../hooks/useDelayedLoading";

const SKELETON_DELAY_MS = 2000;

const topicIcons = {
  "user-pool": Users,
  "roles": ShieldUser,
  "app-client": MonitorCog,
  "registration": FileCheckCorner,
  "audit-logs": FileSearchCorner,
  "other": Info,
};

export default function FAQ() {
  const { colorMode = "light" } = useOutletContext() || {};
  const [isLoading, setIsLoading] = useState(true);
  const [breadcrumbsContainer, setBreadcrumbsContainer] = useState(null);
  const isDarkMode = colorMode === "dark";
  const theme = FAQ_THEME[isDarkMode ? "dark" : "light"];
  const showSkeleton = useDelayedLoading(isLoading, SKELETON_DELAY_MS);

  useEffect(() => {
    setBreadcrumbsContainer(document.getElementById("navbar-breadcrumbs"));
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsLoading(false);
    }, SKELETON_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full">
      {breadcrumbsContainer && createPortal(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>FAQ</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        breadcrumbsContainer
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#7b0d15] text-[#f8d24e] dark:bg-primary/10 dark:text-primary rounded-xl">
            <CircleHelp className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">FAQ</h1>
            <p className="text-muted-foreground">Frequently asked questions</p>
          </div>
        </div>
      </div>

      {showSkeleton ? (
        <FAQSkeleton />
      ) : (
        <Tabs defaultValue={FAQ_TOPICS[0].id} orientation="vertical" className="w-full">
          <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)] w-full items-start">
            {/* 1st Card: Left side Topics Sidebar */}
            <TabsList className="w-full shrink-0 flex flex-col gap-1.5 h-auto p-2 bg-muted rounded-xl">
              {FAQ_TOPICS.map((topic) => {
                const Icon = topicIcons[topic.id] || Info;
                return (
                  <TabsTrigger
                    key={topic.id}
                    value={topic.id}
                    className="group justify-start gap-3 px-3.5 py-3 rounded-lg w-full text-left font-medium cursor-pointer transition-colors data-active:!bg-[#7b0d15] data-active:!text-[#f8d24e] data-[active]:!bg-[#7b0d15] data-[active]:!text-[#f8d24e] dark:data-active:!bg-[#f8d24e] dark:data-active:!text-[#7b0d15] dark:data-[active]:!bg-[#f8d24e] dark:data-[active]:!text-[#7b0d15]"
                  >
                    <Icon className="size-5 shrink-0 text-muted-foreground group-data-active:!text-[#f8d24e] group-data-[active]:!text-[#f8d24e] dark:group-data-active:!text-[#7b0d15] dark:group-data-[active]:!text-[#7b0d15]" />
                    <span className="truncate">{topic.title}</span>
                    <Badge className="ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 bg-[#7b0d15]/10 border border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20 group-data-active:!bg-[#f8d24e]/20 group-data-active:!border-[#f8d24e]/30 group-data-active:!text-[#f8d24e] group-data-[active]:!bg-[#f8d24e]/20 group-data-[active]:!border-[#f8d24e]/30 group-data-[active]:!text-[#f8d24e] dark:group-data-active:!bg-[#7b0d15]/20 dark:group-data-active:!border-[#7b0d15]/30 dark:group-data-active:!text-[#7b0d15] dark:group-data-[active]:!bg-[#7b0d15]/20 dark:group-data-[active]:!border-[#7b0d15]/30 dark:group-data-[active]:!text-[#7b0d15]">
                      {topic.questions.length}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* 2nd Card: Right side Questions & Answers */}
            <Card className="w-full bg-card border-border shadow-sm">
              <CardContent className="p-6">
                {FAQ_TOPICS.map((topic) => (
                  <TabsContent key={topic.id} value={topic.id} className="mt-0 space-y-6 outline-none">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-5">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          {topic.title}
                        </p>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                          System Guide
                        </h2>
                      </div>
                      <Badge className="rounded-full px-3 py-1 text-xs font-bold w-fit bg-[#7b0d15]/10 border border-[#7b0d15]/20 text-[#7b0d15] hover:bg-[#7b0d15]/20 dark:bg-[#f8d24e]/10 dark:border-[#f8d24e]/20 dark:text-[#ffe28a] dark:hover:bg-[#f8d24e]/20">
                        {topic.questions.length} questions
                      </Badge>
                    </div>

                    <Accordion type="single" collapsible defaultValue={topic.questions[0]?.id} className="space-y-3 border-0">
                      {topic.questions.map((item) => (
                        <AccordionItem
                          key={item.id}
                          value={item.id}
                          className="border-border rounded-lg border px-4 not-last:border-b"
                        >
                          <AccordionTrigger className="items-center py-4 font-medium hover:no-underline text-base text-left">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground pt-0 pb-4 text-sm leading-relaxed space-y-2">
                            {Array.isArray(item.answer) ? (
                              item.answer.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                              ))
                            ) : (
                              <p>{item.answer}</p>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>
                ))}
              </CardContent>
            </Card>
          </div>
        </Tabs>
      )}
    </div>
  );
}