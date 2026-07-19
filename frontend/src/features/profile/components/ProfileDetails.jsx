import { Card, CardContent } from "../../../components/ui/card";
import { UserRound } from "lucide-react";

function DetailField({ id, label, value }) {
  const normalizedValue = typeof value === "string" ? value.trim() : value;
  const isMissingValue = !normalizedValue;
  const displayValue = normalizedValue || "—";

  return (
    <Card className="shadow-none bg-muted/10 border-border">
      <CardContent className="flex items-center gap-4 px-4 py-2.5">
        <div className="bg-muted flex size-10 items-center justify-center rounded-md text-muted-foreground">
          <UserRound className="size-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          <p id={id} className={`text-sm font-semibold truncate ${isMissingValue ? "text-muted-foreground" : "text-foreground"}`}>
            {displayValue}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProfileDetails({ profile, colorMode = "light" }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <DetailField
        id="firstName"
        label="First Name"
        value={profile.firstName}
        colorMode={colorMode}
      />
      <DetailField
        id="lastName"
        label="Last Name"
        value={profile.lastName}
        colorMode={colorMode}
      />
      <DetailField
        id="middleName"
        label="Middle Name"
        value={profile.middleName}
        colorMode={colorMode}
      />
      <DetailField
        id="suffix"
        label="Suffix"
        value={profile.suffix}
        colorMode={colorMode}
      />
    </div>
  );
}