import ErrorAlert from "../../../components/ErrorAlert";
import { Mail } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";

export default function ForgotPasswordEmailStep({ email, setEmail, errorMessage, onClearError }) {
  const hasError = Boolean(errorMessage);

  return (
    <div className="space-y-5">
      <ErrorAlert message={errorMessage} onClose={onClearError} />

      <Card>
        <CardContent className="p-6">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Email Address <span className="text-destructive">*</span>
          </label>
          <p className="mb-4 text-sm text-muted-foreground">
            We'll send a 6-digit verification code to this email address.
          </p>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-[#7b0d15]/60 z-10">
              <Mail className="size-5" />
            </span>
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email address" autoFocus required
              className={`h-12 w-full rounded-xl bg-background pl-10 pr-4 text-base shadow-sm ${
                hasError
                  ? "border-destructive focus-visible:ring-destructive"
                  : "border-input focus-visible:ring-[#ffd700]"
              }`}
            />
          </div>

          {hasError ? (
            <p className="pl-1 pt-2 text-xs text-red-600">
              {errorMessage}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}