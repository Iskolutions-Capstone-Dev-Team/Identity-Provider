import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

export default function SuccessStep({ showCurrentPassword = true }) {
  const description = showCurrentPassword
    ? "Your password has been changed successfully."
    : "Your password has been changed successfully. You can now sign in with your new password.";

  return (
    <div className="space-y-4">
      <Card className="shadow-none border-border">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <Check className="size-8" />
          </div>
          <CardTitle className="text-xl">Password Updated</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground pb-6">
          <p>{description}</p>
        </CardContent>
      </Card>
    </div>
  );
}