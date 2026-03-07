import AuditLogsCard from "./AuditLogsCard";

export default function LogTypeTabsCard({ activeTab, onTabChange }) {
    const tabClass = (isActive) =>
        `btn flex-1 rounded-xl border text-sm sm:text-base px-4 sm:px-6 min-h-12 h-12 ${
            isActive
                ? "bg-[#991b1b] border-[#991b1b] text-white hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]"
                : "bg-white text-[#991b1b] border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]"
        }`;

    return (
        <AuditLogsCard>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                <button type="button" onClick={() => onTabChange("system")} className={tabClass(activeTab === "system")}>
                    System Logs
                </button>

                <button type="button" onClick={() => onTabChange("transaction")} className={tabClass(activeTab === "transaction")}>
                    Transaction Logs
                </button>
            </div>
        </AuditLogsCard>
    );
}