import { useEffect, useState } from "react";
import ErrorAlert from "./ErrorAlert";
import SuccessAlert from "./SuccessAlert";

const INITIAL_CONTACT_FORM = {
  email: "",
  message: "",
};

const INITIAL_FIELD_ERRORS = {
  email: "",
  message: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getEmailError(email) {
  if (!email.trim()) {
    return "Email is required.";
  }

  if (!EMAIL_REGEX.test(email)) {
    return "Enter a valid email address.";
  }

  return "";
}

function getMessageError(message) {
  if (!message.trim()) {
    return "Message is required.";
  }

  return "";
}

function validateContactForm(contactForm) {
  return {
    email: getEmailError(contactForm.email),
    message: getMessageError(contactForm.message),
  };
}

function getValidationAlertMessage(fieldErrors) {
  return Object.values(fieldErrors).filter(Boolean).join(" ");
}

export default function ContactUsPanel({
  isOpen,
  colorMode = "light",
  onClose,
}) {
  const [contactForm, setContactForm] = useState(INITIAL_CONTACT_FORM);
  const [fieldErrors, setFieldErrors] = useState(INITIAL_FIELD_ERRORS);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage("");
      setFieldErrors(INITIAL_FIELD_ERRORS);
    }
  }, [isOpen]);

  const isDarkMode = colorMode === "dark";
  const panelClassName = isDarkMode
    ? "overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(31,19,27,0.96))] text-[#f4eaea] shadow-[0_36px_80px_-40px_rgba(2,6,23,0.9)] backdrop-blur-xl"
    : "overflow-hidden rounded-[1.75rem] border border-[#7b0d15]/12 bg-[linear-gradient(180deg,rgba(255,250,244,0.98),rgba(255,255,255,0.96))] text-slate-800 shadow-[0_36px_80px_-40px_rgba(43,3,7,0.72)] backdrop-blur-xl";
  const headerClassName =
    "relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(248,210,78,0.22),transparent_34%),linear-gradient(135deg,#7b0d15_0%,#3d0910_58%,#1f0205_100%)] px-5 py-4 text-white";
  const bodyClassName = "space-y-4 px-5 py-5";
  const labelClassName = isDarkMode
    ? "mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#f7dadd]"
    : "mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#5a0b12]";
  const helperTextClassName = isDarkMode
    ? "mt-2 text-xs text-[#c7adb4]"
    : "mt-2 text-xs text-[#8f6f76]";
  const fieldErrorClassName = isDarkMode
    ? "mt-2 text-xs text-red-300"
    : "mt-2 text-xs text-red-500";
  const secondaryButtonClassName = isDarkMode
    ? "btn h-11 rounded-2xl border border-white/12 bg-white/[0.04] px-4 text-[#f4eaea] shadow-none transition hover:border-[#f8d24e]/45 hover:bg-[#f8d24e]/12 hover:text-[#ffe6a4]"
    : "btn h-11 rounded-2xl border border-[#7b0d15]/12 bg-white/85 px-4 text-[#7b0d15] shadow-none transition hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]";
  const primaryButtonClassName = isDarkMode
    ? "btn h-11 rounded-2xl border border-[#f8d24e]/35 bg-[linear-gradient(135deg,#7b0d15_0%,#4f1018_100%)] px-5 text-white transition hover:border-[#f8d24e] hover:bg-[#8f121b]"
    : "btn h-11 rounded-2xl border border-[#7b0d15] bg-[#7b0d15] px-5 text-white transition hover:border-[#5a0b12] hover:bg-[#5a0b12]";

  const getInputClassName = (hasError) => {
    const baseClassName = isDarkMode
      ? "h-12 w-full rounded-2xl border bg-[linear-gradient(180deg,rgba(9,14,25,0.72),rgba(22,28,40,0.88))] px-4 text-sm text-[#f4eaea] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition placeholder:text-[#9f8790] focus:ring-4"
      : "h-12 w-full rounded-2xl border bg-white/92 px-4 text-sm text-slate-800 shadow-[0_18px_40px_-28px_rgba(43,3,7,0.32)] outline-none transition placeholder:text-slate-400 focus:ring-4";

    return `${baseClassName} ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-200/50"
        : isDarkMode
          ? "border-white/10 focus:border-[#f8d24e]/55 focus:ring-[#f8d24e]/15"
          : "border-[#7b0d15]/10 focus:border-[#f8d24e] focus:ring-[#f8d24e]/20"
    }`;
  };

  const getTextareaClassName = (hasError) => {
    const baseClassName = isDarkMode
      ? "min-h-32 w-full rounded-2xl border bg-[linear-gradient(180deg,rgba(9,14,25,0.72),rgba(22,28,40,0.88))] px-4 py-3 text-sm text-[#f4eaea] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition placeholder:text-[#9f8790] focus:ring-4"
      : "min-h-32 w-full rounded-2xl border bg-white/92 px-4 py-3 text-sm text-slate-800 shadow-[0_18px_40px_-28px_rgba(43,3,7,0.32)] outline-none transition placeholder:text-slate-400 focus:ring-4";

    return `${baseClassName} resize-none ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-200/50"
        : isDarkMode
          ? "border-white/10 focus:border-[#f8d24e]/55 focus:ring-[#f8d24e]/15"
          : "border-[#7b0d15]/10 focus:border-[#f8d24e] focus:ring-[#f8d24e]/20"
    }`;
  };

  const updateField = (name, value) => {
    setContactForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setFieldErrors((currentErrors) =>
      currentErrors[name]
        ? {
            ...currentErrors,
            [name]: "",
          }
        : currentErrors,
    );

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleEmailBlur = () => {
    const emailError = getEmailError(contactForm.email);

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      email: emailError,
    }));

    if (emailError) {
      setErrorMessage(emailError);
    }
  };

  const handleMessageBlur = () => {
    const messageError = getMessageError(contactForm.message);

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      message: messageError,
    }));

    if (messageError) {
      setErrorMessage(messageError);
    }
  };

  const resetContactForm = () => {
    setContactForm(INITIAL_CONTACT_FORM);
    setFieldErrors(INITIAL_FIELD_ERRORS);
    setErrorMessage("");
  };

  const handleClose = () => {
    resetContactForm();
    onClose?.();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextFieldErrors = validateContactForm(contactForm);
    const validationMessage = getValidationAlertMessage(nextFieldErrors);

    setFieldErrors(nextFieldErrors);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setSuccessMessage(
      "Message was submitted successfully.",
    );
    resetContactForm();
    onClose?.();
  };

  return (
    <>
      <SuccessAlert
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />

      {isOpen ? (
        <div className="pointer-events-auto fixed bottom-[calc(env(safe-area-inset-bottom,0px)+7rem)] right-[5.5rem] z-[141] w-[calc(100vw-7rem)] max-w-[22rem] sm:w-[22rem] lg:bottom-6 lg:right-[7rem]">
          <div className={panelClassName}>
            <div className={headerClassName}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-[#f8d24e] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                      <ContactUsIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">
                        Contact Us
                      </h3>
                      <p className="text-sm text-white/78">
                        Share your email and message with us.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Close contact form"
                  className="btn btn-circle btn-sm border border-white/12 bg-white/10 text-white shadow-none transition hover:bg-white/18"
                  onClick={handleClose}
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            <form noValidate className={bodyClassName} onSubmit={handleSubmit}>
              <ErrorAlert
                message={errorMessage}
                onClose={() => setErrorMessage("")}
              />

              <div>
                <label htmlFor="contact-us-email" className={labelClassName}>
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  id="contact-us-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={contactForm.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  onBlur={handleEmailBlur}
                  className={getInputClassName(Boolean(fieldErrors.email))}
                  aria-invalid={Boolean(fieldErrors.email)}
                />
                {fieldErrors.email ? (
                  <p className={fieldErrorClassName}>{fieldErrors.email}</p>
                ) : (
                  <p className={helperTextClassName}>
                    We will use this email to reply to you.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="contact-us-message" className={labelClassName}>
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="contact-us-message"
                  rows={5}
                  maxLength={1000}
                  placeholder="Write your message"
                  value={contactForm.message}
                  onChange={(event) =>
                    updateField("message", event.target.value)
                  }
                  onBlur={handleMessageBlur}
                  className={getTextareaClassName(Boolean(fieldErrors.message))}
                  aria-invalid={Boolean(fieldErrors.message)}
                />
                {fieldErrors.message ? (
                  <p className={fieldErrorClassName}>{fieldErrors.message}</p>
                ) : (
                  <p className={helperTextClassName}>
                    Tell us how we can help.
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className={secondaryButtonClassName}
                  onClick={handleClose}
                >
                  Cancel
                </button>

                <button type="submit" className={primaryButtonClassName}>
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function ContactUsIcon({ className = "h-7 w-7" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
      <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
    >
      <path
        d="M6 18 18 6M6 6l12 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}