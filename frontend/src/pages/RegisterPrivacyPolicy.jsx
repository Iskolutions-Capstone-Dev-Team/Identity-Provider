import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../routes/routePaths";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, ArrowLeft } from "lucide-react";
import { privacyPolicySections as sections } from "./privacyPolicyData";
import { authPageBackground } from "../auth/utils/authBackground";
import DotField from "@/components/ui/DotField";

export default function RegisterPrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("introduction");
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`${ROUTE_PATHS.REGISTER}${location.search}`);
    }
  };

  // Handle scroll spy to highlight active section in the sidebar
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((s) => document.getElementById(s.id));
      let currentSectionId = sections[0].id;

      for (const el of sectionElements) {
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            currentSectionId = el.id;
          }
        }
      }
      setActiveSection(currentSectionId);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setActiveSection(id);
  };

  const pageBgClass = "relative overflow-x-hidden font-[Poppins] text-white";
  const cardClass = "shadow-2xl border-white/10 bg-black/20 backdrop-blur-xl text-white";
  const textClass = "text-white";
  const mutedTextClass = "text-white/80";

  return (
    <div
      className={`min-h-screen pt-6 pb-16 ${pageBgClass}`}
      style={{ background: authPageBackground }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <DotField
          dotRadius={1.5}
          dotSpacing={14}
          bulgeStrength={67}
          glowRadius={160}
          sparkle={false}
          waveAmplitude={0}
          cursorRadius={500}
          cursorForce={0.1}
          bulgeOnly
          gradientFrom="rgba(255, 255, 255, 0.22)"
          gradientTo="rgba(255, 255, 255, 0.08)"
          glowColor="rgba(0, 0, 0, 0.2)"
        />
      </div>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 relative z-10">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${textClass}`}>
              Privacy Policy
            </h1>
            <p className={`${mutedTextClass}`}>
              Data Privacy Act of 2012 (Republic Act No. 10173) Compliance
            </p>
          </div>
          <Button
            type="button"
            onClick={handleGoBack}
            className="bg-[#f8d24e] text-[#7b0d15] hover:bg-[#f8d24e]/90 rounded-md font-bold px-4 py-2 h-10 gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Main Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Sections */}
          <div className="lg:col-span-8">
            <Accordion
              type="multiple"
              defaultValue={["introduction"]}
              className="space-y-3 border-0 w-full"
            >
              {sections.map((section) => (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  id={section.id}
                  className="rounded-lg border px-2 scroll-mt-24 border-white/10 bg-black/20 backdrop-blur-xl text-white shadow-2xl"
                >
                  <AccordionTrigger
                    className={`items-center px-1 py-3 font-semibold hover:no-underline ${textClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg flex size-8 items-center justify-center shrink-0 bg-black/30">
                        {section.icon}
                      </div>
                      <span className="text-left">{section.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent
                    className={`px-2 pt-0 pb-4 leading-relaxed ${mutedTextClass}`}
                  >
                    <div className="pl-11 prose prose-sm sm:prose-base dark:prose-invert max-w-none text-justify">
                      {section.content}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Right Column: Sticky Table of Contents */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 hidden md:block">
            <Card className={`overflow-hidden border ${cardClass}`}>
              <div className="px-5 py-4 flex items-center font-semibold text-lg text-white border-b border-white/10">
                <BookOpen className="h-5 w-5 mr-2" />
                Table of Contents
              </div>
              <div className="p-2">
                <ul className="space-y-1">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        onClick={(e) => scrollToSection(e, section.id)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors duration-200 ${
                          activeSection === section.id
                            ? "bg-[#f8d24e]/15 text-[#f8d24e] font-medium"
                            : "text-white/60 hover:bg-[#f8d24e]/10 hover:text-[#f8d24e]"
                        }`}
                      >
                        {section.icon}
                        <span>{section.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
