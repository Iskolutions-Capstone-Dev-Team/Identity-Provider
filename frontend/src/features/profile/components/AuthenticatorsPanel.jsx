import { useCallback, useEffect, useState } from "react";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import ErrorAlert from "../../../components/ErrorAlert";
import { toast } from "sonner";
import NewAuthenticatorModal from "./NewAuthenticatorModal";
import { mfaService } from "../../../services/mfaService";
import { formatTimestamp } from "../../../utils/formatTimestamp";
import { PhoneIcon, PasskeyIcon, AddedIcon, LastUsedIcon, DeleteIcon } from "./profileIcons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../../../components/ui/carousel";
import { Smartphone, KeySquare, Trash } from 'lucide-react';

const AUTHENTICATORS_PER_SLIDE = 3;

function getRequestErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

function formatDate(value) {
  if (!value) {
    return "Never";
  }

  const timestamp = formatTimestamp(value);

  return timestamp === "NaN-NaN-NaN NaN:NaN:NaN" ? "Unavailable" : timestamp;
}

function getAuthenticatorTypeLabel(type) {
  const normalizedType = String(type || "").toLowerCase();

  if (normalizedType === "totp") {
    return "authenticator app";
  }

  return normalizedType || "authenticator app";
}

function AuthenticatorIcon({ colorMode, type }) {
  const isDarkMode = colorMode === "dark";
  const isPasskey = String(type || "").toLowerCase() === "passkey";

  return (
    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1rem] sm:h-16 sm:w-16 ${
        isDarkMode
          ? "border border-[#f8d24e]/35 bg-[#f8d24e]/10 text-[#ffe28a] shadow-[0_18px_44px_-34px_rgba(248,210,78,0.8)]"
          : "border border-[#f8d24e]/45 bg-[#fff4dc] text-[#7b0d15] shadow-[0_18px_44px_-34px_rgba(123,13,21,0.45)]"
      }`}
    >
      {isPasskey ? <PasskeyIcon /> : <PhoneIcon />}
    </div>
  );
}

export default function AuthenticatorsPanel({ email = "", colorMode = "light" }) {
  const isDarkMode = colorMode === "dark";
  const [authenticators, setAuthenticators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [authenticatorToDelete, setAuthenticatorToDelete] = useState(null);
  const [isNewConnectionOpen, setIsNewConnectionOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const loadAuthenticators = useCallback(async () => {
    if (!email) {
      setAuthenticators([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const list = await mfaService.getAuthenticators(email);
      setAuthenticators(list);
    } catch (loadError) {
      setError(
        getRequestErrorMessage(
          loadError,
          "Unable to load authenticator apps.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  useEffect(() => {
    loadAuthenticators();
  }, [loadAuthenticators]);

  const handleDeleteAuthenticator = async () => {
    if (!authenticatorToDelete) return;
    
    setError("");
    try {
      await mfaService.deleteAuthenticator({
        email,
        id: authenticatorToDelete.id,
      });
      setAuthenticatorToDelete(null);
      toast.success("Authenticator removed successfully.", { style: { backgroundColor: "#22c55e", color: "white", borderColor: "#22c55e" } });
      await loadAuthenticators();
    } catch (deleteError) {
      setError(
        getRequestErrorMessage(
          deleteError,
          "Unable to remove this authenticator.",
        ),
      );
    }
  };

  const renderAuthenticatorCard = (authenticator) => {
    const isPasskey = String(authenticator.type || "").toLowerCase() === "passkey";
    
    return (
      <Card key={authenticator.id} className="mx-auto w-full max-w-xs overflow-hidden p-0 relative h-full">
        <CardContent className="flex flex-col items-center p-0 h-full">
          <div className="flex w-full flex-col items-center justify-center bg-gradient-to-b from-[#7b0d15]/10 to-transparent dark:from-white/10 py-12">
            <div className="relative mb-6">
              <div className="absolute inset-0 scale-150 rounded-full bg-[#7b0d15]/20 dark:bg-white/20 blur-2xl" />
              {isPasskey ? (
                <KeySquare aria-hidden="true" className="relative size-16 text-[#7b0d15] dark:text-white" strokeWidth="1.5" />
              ) : (
                <Smartphone aria-hidden="true" className="relative size-16 text-[#7b0d15] dark:text-white" strokeWidth="1.5" />
              )}
            </div>
            <h3 className="text-foreground text-lg font-semibold px-4 text-center">
              {authenticator.name || "Authenticator app"}
            </h3>
            <p className="text-muted-foreground text-sm">{getAuthenticatorTypeLabel(authenticator.type)}</p>
          </div>

          <div className="w-full space-y-1 px-3 pb-6 mt-auto">
            <div className="rounded-lg flex items-center justify-between px-2 sm:px-3 py-2.5 bg-muted/40 gap-2">
              <span className="text-foreground text-xs sm:text-sm font-medium flex items-center gap-1.5 shrink-0">
                <AddedIcon /> Added
              </span>
              <span className="text-muted-foreground text-[10px] xl:text-xs text-right leading-tight min-w-0">
                {formatDate(authenticator.created_at)}
              </span>
            </div>
            <div className="rounded-lg flex items-center justify-between px-2 sm:px-3 py-2.5 gap-2">
              <span className="text-foreground text-xs sm:text-sm font-medium flex items-center gap-1.5 shrink-0">
                <LastUsedIcon /> Last used
              </span>
              <span className="text-muted-foreground text-[10px] xl:text-xs text-right leading-tight min-w-0">
                {formatDate(authenticator.last_used_at)}
              </span>
            </div>
          </div>
        </CardContent>
        <Button variant="ghost" size="icon" onClick={() => setAuthenticatorToDelete(authenticator)} aria-label={`Delete ${authenticator.name || "authenticator app"}`} className="absolute right-2 top-2 text-[#7b0d15] hover:bg-[#7b0d15]/10 hover:text-[#7b0d15] dark:text-white dark:hover:bg-white/10 dark:hover:text-white">
          <Trash className="w-5 h-5" />
        </Button>
      </Card>
    );
  };

  return (
    <>
      <Card className="flex flex-col border-border bg-card shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b">
          <div className="min-w-0">
            <CardTitle className="text-xl font-bold uppercase tracking-wide">Authenticator Apps</CardTitle>
            <CardDescription className="mt-1">Manage the authenticator apps connected to your account.</CardDescription>
          </div>
          <Button onClick={() => setIsNewConnectionOpen(true)} className="h-11 px-6 rounded-lg font-bold text-[15px] bg-[#7b0d15] text-white hover:bg-[#7b0d15]/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
            + New Connection
          </Button>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <ErrorAlert message={error} onClose={() => setError("")} />

          {isLoading ? (
            <div className="grid gap-3">
              {[0, 1].map((item) => (
                <div key={item} className="h-24 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : authenticators.length === 0 ? (
            <div className="rounded-2xl border border-border bg-muted/20 px-4 py-5 text-center text-sm text-muted-foreground">
              No authenticator apps are connected yet.
            </div>
          ) : (
            <div className="w-full px-0 sm:px-12">
              <Carousel
                opts={{
                  align: "start",
                }}
                className="w-full"
              >
                <CarouselContent>
                  {authenticators.map((authenticator, index) => (
                    <CarouselItem
                      key={authenticator.id}
                      className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                    >
                      <div className="p-1 h-full">
                        {renderAuthenticatorCard(authenticator)}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:inline-flex bg-[#7b0d15] text-white hover:bg-[#7b0d15]/90 border-0 hover:text-white dark:bg-white dark:text-black dark:hover:bg-white/90 dark:hover:text-black" />
                <CarouselNext className="hidden sm:inline-flex bg-[#7b0d15] text-white hover:bg-[#7b0d15]/90 border-0 hover:text-white dark:bg-white dark:text-black dark:hover:bg-white/90 dark:hover:text-black" />
              </Carousel>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmModal
        open={Boolean(authenticatorToDelete)}
        message={`Delete ${authenticatorToDelete?.name || "this authenticator"}?`}
        onCancel={() => setAuthenticatorToDelete(null)}
        onConfirm={handleDeleteAuthenticator}
        theme="glass"
        colorMode={colorMode}
      />
      <NewAuthenticatorModal
        open={isNewConnectionOpen}
        email={email}
        colorMode={colorMode}
        onClose={() => setIsNewConnectionOpen(false)}
        onCreated={async () => {
          await loadAuthenticators();
        }}
      />
    </>
  );
}
