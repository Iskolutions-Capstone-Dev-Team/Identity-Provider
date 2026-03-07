import { useState } from "react";
import PageHeader from "../components/PageHeader";
import LogTypeTabsCard from "../components/audit-logs/LogTypeTabsCard";
import AuditLogsListCard from "../components/audit-logs/AuditLogsListCard";

const ITEMS_PER_PAGE = 10;

export default function AuditLogs() {
    const [activeTab, setActiveTab] = useState("transaction");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const logs = [];
    const totalResults = logs.length;
    const totalPages = 1;
    const loading = false;
    const error = "";

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearch("");
        setPage(1);
    };

    return (
        <div className="flex flex-col items-center gap-6 px-3 sm:px-6">
            <PageHeader
                title="Audit Logs"
                description="Track user actions and system events"
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-28 h-28 text-[#991b1b]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                    </svg>
                }
            />

            <LogTypeTabsCard
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

            <AuditLogsListCard
                activeTab={activeTab}
                logs={logs}
                totalResults={totalResults}
                itemsPerPage={ITEMS_PER_PAGE}
                search={search}
                setSearch={setSearch}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                loading={loading}
                error={error}
            />
        </div>
    );
}