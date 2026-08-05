import React, { useState } from 'react';
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/reui/alert"
import { Frame, FramePanel } from "@/components/reui/frame"
import { Button } from "@/components/ui/button"
import { Bell, XIcon, ArrowLeft, ArrowRight } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function AdvancedAnalyticsAlert() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const pages = [
    { 
      title: "New UI Redesign", 
      content: "Experience our newly redesigned interface for a smoother and more intuitive experience." 
    },
    { 
      title: "Filters & Views", 
      content: "Use advanced filtering and view options to quickly find what you need. Account types can now be viewed and edited directly." 
    },
    { 
      title: "Client Documentation", 
      content: "Access documentation for clients connecting to the system." 
    }
  ];

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(pages.length, p + 1));

  if (!isVisible) return null;

  return (
    <div className="w-full">
      <Frame variant="ghost">
        <FramePanel className="overflow-hidden p-0!">
          <Alert variant="info" className="border-0 shadow-none [&>svg]:text-[#7b0d15] dark:[&>svg]:text-[#f8d24e] bg-[#7b0d15]/5 dark:bg-[#f8d24e]/10">
            <Bell className="text-[#7b0d15] dark:text-[#f8d24e] mt-1" />
            <AlertTitle className="text-[#7b0d15] dark:text-[#f8d24e]">New Update!</AlertTitle>
            <AlertDescription className="text-[#7b0d15]/90 dark:text-[#f8d24e]/90 flex flex-col items-start gap-1">
              <span>Explore the latest features and enhancements in our newest release.</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="link" size="sm" className="text-[#7b0d15] dark:text-[#f8d24e] h-auto p-0 underline font-medium cursor-pointer">
                    What's new?
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  side="bottom" 
                  align="start" 
                  className="w-72 gap-2 px-3 pt-3 pb-2 flex flex-col"
                >
                  <div className="space-y-2">
                    <p className="leading-tight font-medium text-foreground">
                      {pages[currentPage - 1].title}
                    </p>
                    <p className="text-muted-foreground text-sm min-h-[60px]">
                      {pages[currentPage - 1].content}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-muted-foreground text-xs font-medium">
                      {currentPage} of {pages.length}
                    </span>
                    <div className="flex gap-0.5">
                      <Button aria-label="Previous step" className="h-6 w-6" disabled={currentPage === 1} onClick={handlePrev} size="icon" variant="ghost">
                        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                      <Button aria-label="Next step" className="h-6 w-6" disabled={currentPage === pages.length} onClick={handleNext} size="icon" variant="ghost">
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </AlertDescription>
          </Alert>
        </FramePanel>
      </Frame>
    </div>
  )
}
