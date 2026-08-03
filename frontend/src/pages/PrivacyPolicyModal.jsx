import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { privacyPolicySections as sections } from "./privacyPolicyData";

export default function PrivacyPolicyModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden" showCloseButton={false}>
        <DialogHeader className="p-4 border-b border-border bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] text-white dark:bg-none dark:bg-transparent dark:text-foreground">
          <DialogTitle>Privacy Policy</DialogTitle>
          <p className="text-sm font-normal opacity-90 mt-1 dark:text-muted-foreground">
            Data Privacy Act of 2012 (Republic Act No. 10173) Compliance
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <Accordion type="multiple" defaultValue={["introduction"]} className="space-y-3 border-0 w-full">
            {sections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                id={section.id}
                className="rounded-lg border px-2 border-border bg-card"
              >
                <AccordionTrigger className="items-center px-1 py-3 font-semibold hover:no-underline text-foreground">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg flex size-8 items-center justify-center shrink-0 bg-muted text-foreground">
                      {section.icon}
                    </div>
                    <span className="text-left">{section.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 pt-0 pb-4 leading-relaxed text-muted-foreground">
                  <div className="pl-11 prose prose-sm sm:prose-base dark:prose-invert max-w-none text-justify">
                     {section.content}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <DialogFooter className="flex-row justify-end px-8 pt-4 pb-8 border-t border-border bg-muted/30">
          <Button type="button" variant="outline" onClick={() => onClose(false)} className="rounded-[0.55rem]">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
