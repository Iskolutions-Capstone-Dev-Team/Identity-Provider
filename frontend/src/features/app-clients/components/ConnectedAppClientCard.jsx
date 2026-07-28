import { useState, useEffect } from "react";
import Pagination from "../../../components/Pagination";
import ConnectedAppClientTable from "./ConnectedAppClientTable";
import ConnectedAppClientCards from "./ConnectedAppClientCards";
import ResultsCount from "../../../components/ResultsCount";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { SearchIcon } from "./appClientIcons";
import { Table, WalletCards, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SpeechInputToolbar } from "../../../components/SpeechInputButton";
import { SearchIcon } from "./appClientIcons";

export default function ConnectedAppClientCard({ loading = false, clients, totalResults, itemsPerPage, search, setSearch, page, totalPages, onPageChange, onView, onEdit, onDelete, onRotateSecret, showEditAction = true, showDeleteAction = true, showRotateSecretAction = true, colorMode = "light" }) {
    const [viewType, setViewType] = useState(() => {
        return localStorage.getItem("appClientsViewType") || "table";
    });

    useEffect(() => {
        localStorage.setItem("appClientsViewType", viewType);
    }, [viewType]);

    const isDarkMode = colorMode === "dark";
    const containerClassName = `flex flex-col gap-5 ${
        isDarkMode ? "border-white/10" : "border-[#7b0d15]/10"
    }`;
    const labelClassName = isDarkMode
        ? "mb-2 block text-sm font-semibold tracking-[0.01em] text-[#f2dfe2] transition-colors duration-500 ease-out"
        : "mb-2 block text-sm font-semibold tracking-[0.01em] text-[#4b2027] transition-colors duration-500 ease-out";
    const searchFieldClassName = isDarkMode
        ? "group flex h-14 w-full lg:max-w-xl items-center gap-3 rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(30,20,28,0.88))] px-4 shadow-[0_18px_45px_-36px_rgba(2,6,23,0.72)] transition-[background-color,border-color,box-shadow] duration-500 ease-out focus-within:border-[#f8d24e]/55 focus-within:ring-4 focus-within:ring-[#f8d24e]/12"
        : "group flex h-14 w-full lg:max-w-xl items-center gap-3 rounded-[1.35rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,243,0.9))] px-4 shadow-[0_18px_45px_-36px_rgba(43,3,7,0.45)] transition-[background-color,border-color,box-shadow] duration-500 ease-out focus-within:border-[#f8d24e]/70 focus-within:ring-4 focus-within:ring-[#f8d24e]/15";
    const searchIconClassName = isDarkMode
        ? "h-5 w-5 shrink-0 text-white/45 transition-colors duration-500 ease-out group-focus-within:text-[#f8d24e]"
        : "h-5 w-5 shrink-0 text-[#7b0d15]/55 transition-colors duration-500 ease-out group-focus-within:text-[#7b0d15]";
    const searchInputClassName = isDarkMode
        ? "h-full w-full bg-transparent text-sm text-[#f6eaec] outline-none transition-colors duration-500 ease-out placeholder:text-[#a58d95]"
        : "h-full w-full bg-transparent text-sm text-[#4a1921] outline-none transition-colors duration-500 ease-out placeholder:text-[#9a7b81]";
    const footerClassName = `flex flex-col items-center gap-4 pt-5 lg:grid lg:grid-cols-3 ${
        isDarkMode ? "border-white/10" : "border-[#7b0d15]/10"
    }`;
    const updateSearchValue = (value) => {
        setSearch(value);
    };
    const handleSearchChange = (event) => {
        updateSearchValue(event.target.value);
    };
    const handleSearchVoiceInput = (transcript) => {
        updateSearchValue(transcript);
    };

    return (
        <div className="relative space-y-5 sm:space-y-6 lg:space-y-8">
            <div className={containerClassName}>
                <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6 w-full">
                    <div className="min-w-0 flex-1 w-full flex flex-col gap-2 relative">
                        <SpeechInputToolbar
                            activeFieldLabel="Client Search"
                            onTranscript={handleSearchVoiceInput}
                            colorMode={colorMode}
                        />
                        <label className={labelClassName}>
                            What are you looking for?
                        </label>
                        <label className={searchFieldClassName}>
                            <SearchIcon className={searchIconClassName} />
                            <input type="search"  value={search}  placeholder="Search by name..."  className={searchInputClassName} onChange={handleSearchChange}/>
                        </label>
                    </div>

                    <div className="w-full lg:w-[150px] shrink-0 flex flex-col gap-2">
                        <label className={labelClassName}>View</label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-14 px-4 flex items-center gap-2 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,243,0.9))] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(30,20,28,0.88))] border border-[#7b0d15]/10 dark:border-white/10 shadow-[0_18px_45px_-36px_rgba(43,3,7,0.45)] dark:shadow-[0_18px_45px_-36px_rgba(2,6,23,0.72)] rounded-[1.35rem] w-full justify-between">
                                    <div className="flex items-center gap-2 text-foreground font-normal">
                                        {viewType === "card" ? <WalletCards className="w-5 h-5 opacity-70" /> : <Table className="w-5 h-5 opacity-70" />}
                                        <span className="text-base">{viewType === "card" ? "Card" : "Table"}</span>
                                    </div>
                                    <ChevronDown className="w-4 h-4 opacity-50 ml-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[150px] rounded-xl">
                                <DropdownMenuRadioGroup value={viewType} onValueChange={setViewType}>
                                    <DropdownMenuRadioItem value="table" className="cursor-pointer gap-2 py-2">
                                        <Table className="w-4 h-4 opacity-70" />
                                        Table
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="card" className="cursor-pointer gap-2 py-2">
                                        <WalletCards className="w-4 h-4 opacity-70" />
                                        Card
                                    </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            
            {viewType === "table" ? (
                <ConnectedAppClientTable loading={loading} clients={clients} onView={onView} onEdit={onEdit} onDelete={onDelete} onRotateSecret={onRotateSecret} showEditAction={showEditAction} showDeleteAction={showDeleteAction} showRotateSecretAction={showRotateSecretAction} colorMode={colorMode} />
            ) : (
                <ConnectedAppClientCards loading={loading} clients={clients} onView={onView} onEdit={onEdit} onDelete={onDelete} onRotateSecret={onRotateSecret} showEditAction={showEditAction} showDeleteAction={showDeleteAction} showRotateSecretAction={showRotateSecretAction} colorMode={colorMode} />
            )}
            {!loading && (
                <div className={footerClassName}>
                    <div className="flex w-full justify-center lg:justify-start">
                        <ResultsCount
                            page={page}
                            itemsPerPage={itemsPerPage}
                            totalResults={totalResults}
                            currentResultsCount={clients.length}
                            variant="glass"
                            colorMode={colorMode}
                        />
                    </div>
                    <div className="flex w-full justify-center">
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} variant="glass" colorMode={colorMode} />
                    </div>
                    <div className="hidden lg:block"></div>
                </div>
            )}
        </div>
    );
}