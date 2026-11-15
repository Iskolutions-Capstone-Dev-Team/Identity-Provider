import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LogRetentionCard } from "../LogRetentionCard";

describe("LogRetentionCard", () => {
  it("renders retention policy details correctly", () => {
    render(
      <LogRetentionCard
        isSuperadmin={true}
        loadingRetention={false}
        onOpenConfirm={vi.fn()}
      />
    );

    expect(screen.getByText("Log Retention & Purge")).toBeInTheDocument();
    expect(screen.getAllByText("13 Months").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Daily @ 08:00 UTC")).toBeInTheDocument();
    expect(screen.getByText("Audit & Security Logs")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run Retention Now" })).toBeEnabled();
  });

  it("disables button when user is not superadmin", () => {
    render(
      <LogRetentionCard
        isSuperadmin={false}
        loadingRetention={false}
        onOpenConfirm={vi.fn()}
      />
    );

    const button = screen.getByRole("button", { name: "Run Retention Now" });
    expect(button).toBeDisabled();
    expect(
      screen.getByText(/Manual retention execution requires Superadmin privileges/i)
    ).toBeInTheDocument();
  });

  it("calls onOpenConfirm when clicked by a superadmin", () => {
    const onOpenConfirm = vi.fn();
    render(
      <LogRetentionCard
        isSuperadmin={true}
        loadingRetention={false}
        onOpenConfirm={onOpenConfirm}
      />
    );

    const button = screen.getByRole("button", { name: "Run Retention Now" });
    fireEvent.click(button);
    expect(onOpenConfirm).toHaveBeenCalledTimes(1);
  });

  it("shows loading state while retention is executing", () => {
    render(
      <LogRetentionCard
        isSuperadmin={true}
        loadingRetention={true}
        onOpenConfirm={vi.fn()}
      />
    );

    expect(screen.getByText("Running...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
