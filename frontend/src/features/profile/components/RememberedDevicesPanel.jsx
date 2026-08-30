import ErrorAlert from "../../../components/ErrorAlert";
import { formatTimestamp } from "../../../utils/formatTimestamp";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../../../components/ui/carousel";
import { Monitor, Smartphone, Tablet, Trash, CalendarDays, Edit2, ShieldCheck, MapPin, Clock, Globe } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useRememberedDevices } from "../hooks/useRememberedDevices";
import DeviceRenameModal from "./DeviceRenameModal";
import DeviceDeleteConfirmModal from "./DeviceDeleteConfirmModal";
import React from 'react';

function IpLocationDisplay({ ipAddress }) {
    const [location, setLocation] = React.useState(ipAddress);
    
    React.useEffect(() => {
        if (!ipAddress || ipAddress.startsWith("127.") || ipAddress.startsWith("192.168.") || ipAddress.startsWith("10.") || ipAddress.startsWith("172.")) {
            return;
        }
        
        fetch(`http://ip-api.com/json/${ipAddress}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === "success" && data.city && data.country) {
                    setLocation(`${data.city}, ${data.country}`);
                }
            })
            .catch(() => {});
    }, [ipAddress]);

    return (
        <span className="text-muted-foreground text-[10px] xl:text-xs text-right leading-tight break-all">
            {location}
        </span>
    );
}

function DevicesIllustration() {
    return (
        <svg width="200" height="120" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Desktop Monitor */}
            <rect x="50" y="30" width="80" height="50" rx="4" className="stroke-[#7b0d15]/40 dark:stroke-[#f8d24e]/40" strokeWidth="2" />
            <path d="M75 80 L70 95 L110 95 L105 80" className="fill-[#7b0d15]/20 dark:fill-[#f8d24e]/20" />
            <rect x="60" y="95" width="60" height="4" rx="2" className="fill-[#7b0d15]/40 dark:fill-[#f8d24e]/40" />

            {/* Mobile Phone (overlapping) */}
            <rect x="110" y="45" width="30" height="50" rx="6" className="fill-card stroke-[#7b0d15] dark:stroke-[#f8d24e]" strokeWidth="2" />
            <circle cx="125" cy="88" r="2" className="fill-[#7b0d15] dark:fill-[#f8d24e]" />
            
            {/* Connection signals */}
            <path d="M145 60 Q155 55 160 60" className="stroke-[#7b0d15]/30 dark:stroke-[#f8d24e]/30" strokeWidth="2" strokeLinecap="round" />
            <path d="M148 50 Q162 42 168 50" className="stroke-[#7b0d15]/30 dark:stroke-[#f8d24e]/30" strokeWidth="2" strokeLinecap="round" />
            <path d="M151 40 Q169 29 176 40" className="stroke-[#7b0d15]/30 dark:stroke-[#f8d24e]/30" strokeWidth="2" strokeLinecap="round" />

            {/* Decorative dots */}
            <circle cx="30" cy="50" r="2" className="fill-[#7b0d15]/20 dark:fill-[#f8d24e]/20" />
            <circle cx="40" cy="80" r="3" className="fill-[#7b0d15]/15 dark:fill-[#f8d24e]/15" />
            <circle cx="180" cy="80" r="2" className="fill-[#7b0d15]/20 dark:fill-[#f8d24e]/20" />
        </svg>
    );
}

function FormattedDateDisplay({ value }) {
  if (!value) {
    return <span className="text-muted-foreground text-[10px] xl:text-xs text-right leading-tight min-w-0">Never</span>;
  }

  const timestamp = formatTimestamp(value);

  if (timestamp === "NaN-NaN-NaN NaN:NaN:NaN") {
    return <span className="text-muted-foreground text-[10px] xl:text-xs text-right leading-tight min-w-0">Unavailable</span>;
  }

  const parts = timestamp.split(" ");
  if (parts.length === 2) {
    return (
      <div className="flex flex-col items-end text-muted-foreground text-[10px] xl:text-xs leading-tight min-w-0">
        <span>{parts[0]}</span>
        <span>{parts[1]}</span>
      </div>
    );
  }

  return <span className="text-muted-foreground text-[10px] xl:text-xs text-right leading-tight min-w-0">{timestamp}</span>;
}

export default function RememberedDevicesPanel({ colorMode = "light" }) {
    const {
        devices,
        isLoading,
        errorMessage,
        cooldown,

        isRenameModalOpen,
        pendingRenameDevice,
        isRenaming,
        handleRenameClick,
        handleRenameSave,
        handleRenameCancel,

        deletingId,
        pendingDeleteDevice,
        handleDeleteClick,
        handleConfirmDelete,
        handleCancelDelete,
    } = useRememberedDevices();

    const getDeviceIcon = (userAgent) => {
        const ua = (userAgent || "").toLowerCase();
        if (ua.includes("ipad") || (ua.includes("android") && !ua.includes("mobile"))) {
            return <Tablet aria-hidden="true" className="relative size-14 text-[#7b0d15] dark:text-[#f8d24e]" strokeWidth="1.5" />;
        }
        if (ua.includes("iphone") || ua.includes("android") || ua.includes("mobile")) {
            return <Smartphone aria-hidden="true" className="relative size-14 text-[#7b0d15] dark:text-[#f8d24e]" strokeWidth="1.5" />;
        }
        return <Monitor aria-hidden="true" className="relative size-14 text-[#7b0d15] dark:text-[#f8d24e]" strokeWidth="1.5" />;
    };

    const renderDeviceCard = (device) => (
        <Card key={device.id} className="mx-auto w-full max-w-xs overflow-hidden p-0 relative h-full">
            <CardContent className="flex flex-col items-center p-0 h-full">
                <div className="flex w-full flex-col items-center justify-center bg-gradient-to-b from-[#7b0d15]/10 to-transparent dark:from-[#f8d24e]/10 py-12 relative">
                    <div className="absolute top-4 left-4 flex gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                            <ShieldCheck className="w-3 h-3" /> Remembered
                        </span>
                    </div>

                    <div className="absolute top-2 right-2 flex gap-0.5">
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-[#7b0d15] hover:bg-[#7b0d15]/10 hover:text-[#7b0d15] dark:text-[#f8d24e] dark:hover:bg-[#f8d24e]/10 dark:hover:text-[#f8d24e] transition-colors" onClick={() => handleRenameClick(device)} disabled={isRenaming || cooldown > 0} aria-label="Rename device">
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-[#7b0d15] hover:bg-[#7b0d15]/10 hover:text-[#7b0d15] dark:text-[#f8d24e] dark:hover:bg-[#f8d24e]/10 dark:hover:text-[#f8d24e] transition-colors" onClick={() => handleDeleteClick(device)} disabled={deletingId === device.id || cooldown > 0} aria-label="Remove device">
                            <Trash className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="relative mb-6 mt-4">
                        <div className="absolute inset-0 scale-150 rounded-full bg-[#7b0d15]/20 dark:bg-[#f8d24e]/20 blur-2xl" />
                        {getDeviceIcon(device.userAgent)}
                    </div>
                    
                    <h3 className="text-foreground text-lg font-semibold px-4 text-center truncate max-w-[90%]">
                        {device.name || "Unknown Device"}
                    </h3>
                    <p className="text-muted-foreground text-xs text-center px-4 mt-1 line-clamp-2 max-w-[90%]" title={device.userAgent}>
                        {device.userAgent || "Unknown Browser"}
                    </p>
                </div>

                <div className="w-full space-y-1 px-3 pb-6 mt-auto">
                    {device.ipAddress && (
                        <div className="rounded-lg flex items-center justify-between px-2 sm:px-3 py-2.5 bg-muted/40 gap-2 min-h-[52px]">
                            <span className="text-foreground text-xs sm:text-sm font-medium flex items-center gap-1.5 shrink-0">
                                <Globe className="h-4 w-4 shrink-0" /> Registered
                            </span>
                            <IpLocationDisplay ipAddress={device.ipAddress} />
                        </div>
                    )}
                    <div className="rounded-lg flex items-center justify-between px-2 sm:px-3 py-2.5 gap-2 min-h-[52px]">
                        <span className="text-foreground text-xs sm:text-sm font-medium flex items-center gap-1.5 shrink-0">
                            <CalendarDays className="h-4 w-4 shrink-0" /> Added
                        </span>
                        <FormattedDateDisplay value={device.createdAt} />
                    </div>
                    <div className="rounded-lg flex items-center justify-between px-2 sm:px-3 py-2.5 bg-muted/40 gap-2 min-h-[52px]">
                        <span className="text-foreground text-xs sm:text-sm font-medium flex items-center gap-1.5 shrink-0">
                            <Clock className="h-4 w-4 shrink-0" /> Expires
                        </span>
                        <FormattedDateDisplay value={device.expiresAt} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <>
            <Card className="flex flex-col border-border bg-card shadow-sm">
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b">
                    <div className="min-w-0">
                        <CardTitle className="text-xl font-bold uppercase tracking-wide">Remembered Devices</CardTitle>
                        <CardDescription className="mt-1">Devices that skip multi-factor authentication when you sign in.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 lg:p-8">

                    {errorMessage && (
                        <div className="mb-6">
                            <ErrorAlert 
                                message={cooldown > 0 && errorMessage === "Too many attempts. Please wait." ? `Too many attempts. Please wait ${cooldown}s.` : errorMessage}
                                onClose={() => {}} 
                            />
                        </div>
                    )}

                    {isLoading ? (
                        <div className="w-full px-0 sm:px-12">
                            <div className="flex overflow-hidden">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="min-w-0 shrink-0 grow-0 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                        <div className="p-1 h-[440px]">
                                            <Card className="mx-auto w-full overflow-hidden p-0 relative h-full">
                                                <CardContent className="flex flex-col items-center p-0 h-full">
                                                    <div className="flex w-full flex-col items-center justify-center py-10">
                                                        <Skeleton className="h-16 w-16 rounded-full mb-6" />
                                                        <Skeleton className="h-6 w-3/4 rounded-md mb-2" />
                                                        <Skeleton className="h-4 w-1/2 rounded-md" />
                                                    </div>
                                                    <div className="w-full space-y-2 px-3 pb-6 mt-auto">
                                                        <Skeleton className="h-[44px] w-full rounded-lg" />
                                                        <Skeleton className="h-[44px] w-full rounded-lg" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                        {devices.length > 0 ? (
                            <div className="w-full px-0 sm:px-12">
                                <Carousel
                                    opts={{ align: "start" }}
                                    className="w-full"
                                >
                                    <CarouselContent>
                                        {devices.map((device) => (
                                            <CarouselItem key={device.id} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                                <div className="p-1 h-[440px]">
                                                    {renderDeviceCard(device)}
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="hidden sm:inline-flex bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-[#f8d24e] border-0 transition-colors duration-200" />
                                    <CarouselNext className="hidden sm:inline-flex bg-[#7b0d15] text-white hover:bg-[#f8d24e] hover:text-[#7b0d15] dark:bg-[#f8d24e] dark:text-[#7b0d15] dark:hover:bg-[#7b0d15] dark:hover:text-[#f8d24e] border-0 transition-colors duration-200" />
                                </Carousel>
                            </div>
                            ) : (
                                !errorMessage && (
                                    <div className="flex items-center justify-center p-4">
                                        <Empty className="py-12">
                                            <EmptyHeader>
                                                <EmptyMedia>
                                                    <DevicesIllustration />
                                                </EmptyMedia>
                                                <EmptyTitle>No remembered devices</EmptyTitle>
                                                <EmptyDescription>
                                                    When you sign in, check the "Remember this device" box to skip MFA.
                                                </EmptyDescription>
                                            </EmptyHeader>
                                        </Empty>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <DeviceRenameModal
                device={pendingRenameDevice}
                isOpen={isRenameModalOpen}
                isRenaming={isRenaming}
                onClose={handleRenameCancel}
                onSave={handleRenameSave}
            />

            <DeviceDeleteConfirmModal
                device={pendingDeleteDevice}
                isDeleting={Boolean(deletingId)}
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}
