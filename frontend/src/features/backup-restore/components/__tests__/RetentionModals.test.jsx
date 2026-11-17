import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RetentionConfirmModal from "../RetentionConfirmModal";
import RetentionResultModal from "../RetentionResultModal";

describe("RetentionModals", () => {
  it("renders RetentionConfirmModal and confirms", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <RetentionConfirmModal
        open={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
        isRunning={false}
      />
    );

    expect(screen.getByText("Run Log Retention Now?")).toBeInTheDocument();
    expect(
      screen.getByText(/Logs older than/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Archived records won't appear in active views, but remain safe in backups/i)
    ).toBeInTheDocument();
    const confirmBtn = screen.getByRole("button", { name: "Confirm & Run" });
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("renders RetentionResultModal with details when logs are archived", () => {
    const onClose = vi.fn();
    const mockResult = {
      status: "completed",
      cutoff_date: "2025-10-15",
      audit_logs_purged: 125,
      security_logs_purged: 40,
      duration: "135ms",
      archive_files: ["log-archives/audit/2025/10/audit.csv.gz"],
    };

    render(
      <RetentionResultModal
        open={true}
        onClose={onClose}
        result={mockResult}
      />
    );

    expect(screen.getByText("Log Retention Completed")).toBeInTheDocument();
    expect(
      screen.getByText("Logs older than the cutoff date were successfully archived.")
    ).toBeInTheDocument();
    expect(screen.getByText("2025-10-15")).toBeInTheDocument();
    expect(screen.getByText("125")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("165 records")).toBeInTheDocument();
    expect(screen.getByText("135ms")).toBeInTheDocument();
    expect(screen.getByText("log-archives/audit/2025/10/audit.csv.gz")).toBeInTheDocument();

    const closeButtons = screen.getAllByRole("button", { name: /Close/i });
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders user-friendly message when 0 logs are older than the cutoff date", () => {
    const mockResult = {
      status: "completed",
      cutoff_date: "2025-10-15",
      audit_logs_purged: 0,
      security_logs_purged: 0,
      duration: "4.36ms",
      archive_files: [],
    };

    render(
      <RetentionResultModal
        open={true}
        onClose={vi.fn()}
        result={mockResult}
      />
    );

    expect(screen.getByText("Log Retention Completed")).toBeInTheDocument();
    expect(
      screen.getByText("No logs were older than the cutoff date. All active records remain preserved.")
    ).toBeInTheDocument();
    expect(screen.getByText("0 records")).toBeInTheDocument();
  });
});
