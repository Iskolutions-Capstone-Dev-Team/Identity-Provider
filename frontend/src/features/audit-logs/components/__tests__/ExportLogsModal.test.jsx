import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ExportLogsModal from "../ExportLogsModal";

describe("ExportLogsModal", () => {
  it("renders with updated title, short description, and timeframe label", () => {
    render(
      <ExportLogsModal
        open={true}
        onClose={vi.fn()}
        onExport={vi.fn()}
        canViewSecurityLogs={true}
      />
    );

    // Title has no (CSV) and matches Image 2 style
    expect(screen.getByText("Export Log Records")).toBeInTheDocument();
    // Short description
    expect(
      screen.getByText("Export audit and security logs up to 1 year.")
    ).toBeInTheDocument();
    // Timeframe label
    expect(screen.getByText("Timeframe")).toBeInTheDocument();
    expect(screen.queryByText(/Horizon/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Download CSV/i })).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    const { container } = render(
      <ExportLogsModal
        open={false}
        onClose={vi.fn()}
        onExport={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("does NOT show From and To fields when preset is selected, but shows them when Custom is selected", () => {
    render(
      <ExportLogsModal
        open={true}
        onClose={vi.fn()}
        onExport={vi.fn()}
        canViewSecurityLogs={true}
      />
    );

    // Initially preset is Last 30 Days -> From and To should NOT be rendered
    expect(screen.queryByText(/^From$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^To$/i)).not.toBeInTheDocument();

    // Click "Custom" preset
    fireEvent.click(screen.getByRole("button", { name: "Custom" }));

    // Now From and To date fields appear
    expect(screen.getByText(/^From$/i)).toBeInTheDocument();
    expect(screen.getByText(/^To$/i)).toBeInTheDocument();
    expect(screen.queryByText(/From Date/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/To Date/i)).not.toBeInTheDocument();
  });

  it("handles preset selection and calls onExport with valid payload", () => {
    const onExport = vi.fn();
    render(
      <ExportLogsModal
        open={true}
        onClose={vi.fn()}
        onExport={onExport}
        canViewSecurityLogs={true}
      />
    );

    // Click "Last 7 Days"
    fireEvent.click(screen.getByRole("button", { name: "Last 7 Days" }));

    // Click Download CSV
    fireEvent.click(screen.getByRole("button", { name: /Download CSV/i }));

    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onExport).toHaveBeenCalledWith(
      expect.objectContaining({
        from: expect.any(String),
        to: expect.any(String),
        type: "all",
      })
    );
  });
});
