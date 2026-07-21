import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildLogoutPath } from "../auth/utils/logoutRoute";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function TermsAgreementModal({ open, onClose, onContinue, colorMode = "light", currentUser = null }) {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const isDarkMode = colorMode === "dark";

  const linkClassName = isDarkMode
    ? "font-semibold text-[#ffe28a] underline decoration-[#f8d24e]/50 underline-offset-4 transition hover:text-[#fff1ba]"
    : "font-semibold text-[#7b0d15] underline decoration-[#d4a017]/65 underline-offset-4 transition hover:text-[#5a0b12]";

  useEffect(() => {
    if (open) {
      setAgreed(false);
    }
  }, [open]);

  const handleCancel = () => {
    onClose?.();
    navigate(
      buildLogoutPath({
        userId: currentUser?.id,
      }),
      { replace: true },
    );
  };

  const handleContinue = () => {
    if (!agreed) {
      return;
    }

    onContinue?.();
    onClose?.();
  };

  return (
    <Dialog open={open} dismissible={false}>
      <DialogContent 
        className="sm:max-w-xl" 
        showCloseButton={false}
      >
        <DialogHeader className="-mx-4 -mt-4 mb-2 rounded-t-xl border-b p-4 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] text-white dark:bg-none dark:bg-transparent dark:text-foreground">
          <DialogTitle>
            Terms and Conditions
          </DialogTitle>
          <p className="text-sm font-normal opacity-90 mt-1 dark:text-muted-foreground">
            Please read the following carefully before continuing.
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-4 pb-4">
          <section className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 no-scrollbar">
            <p className="leading-7 text-sm text-foreground text-justify">
              By clicking <span className="font-semibold">"I Agree"</span>, you acknowledge that you have read, understood, and accepted these Terms and Conditions. You consent to the collection, storage, use, processing, and protection of your personal information for legitimate purposes related to providing and managing this service.
            </p>
            <p className="leading-7 text-sm text-foreground text-justify">
              You confirm that the information you provide is accurate, complete, and up to date. You are responsible for maintaining the confidentiality of your account credentials and for all activities performed under your account.
            </p>
            <p className="leading-7 text-sm text-foreground text-justify">
              Your personal data will be processed in accordance with our <a href="https://www.pup.edu.ph/privacy/" className={linkClassName} target="_blank" rel="noreferrer">Privacy Policy</a> and the Data Privacy Act of 2012 (Republic Act No. 10173). Reasonable administrative, technical, and physical safeguards are implemented to protect your information from unauthorized access, disclosure, alteration, or destruction.
            </p>

            <p className="leading-7 text-sm text-foreground text-justify">
              Failure to comply with these terms may result in the suspension or termination of your access, subject to applicable policies and regulations.
            </p>

            <div className="flex items-start gap-3 sm:gap-4 mt-6 pt-2">
              <Checkbox 
                id="terms-agreement-checkbox" 
                checked={agreed} 
                onCheckedChange={setAgreed}
                className="mt-1 data-[state=checked]:!bg-[#7b0d15] data-[state=checked]:!border-[#7b0d15] data-[state=checked]:!text-white dark:data-[state=checked]:!bg-white dark:data-[state=checked]:!border-white dark:data-[state=checked]:!text-black data-checked:!bg-[#7b0d15] data-checked:!border-[#7b0d15] data-checked:!text-white dark:data-checked:!bg-white dark:data-checked:!border-white dark:data-checked:!text-black"
              />

              <label htmlFor="terms-agreement-checkbox" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground cursor-pointer select-none">
                I have read, understood, and agree to the {" "}
                <a href="https://www.pup.edu.ph/terms/" className={linkClassName} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                  Terms and Conditions
                </a>
                , and I acknowledge the Privacy Policy.
              </label>
            </div>
          </section>
        </div>

        <DialogFooter className="flex-row justify-end gap-2 mt-4 border-t border-border pt-4 -mx-4 px-4 bg-muted/30 rounded-b-xl">
          <Button type="button" variant="outline" onClick={handleCancel} className="rounded-[0.55rem]">
            Decline
          </Button>
          <Button type="button" onClick={handleContinue} disabled={!agreed} className="rounded-[0.55rem] bg-[#7b0d15] text-white hover:bg-[#7b0d15]/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}