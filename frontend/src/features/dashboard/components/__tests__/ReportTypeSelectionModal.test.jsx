import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ReportTypeSelectionModal from "../ReportTypeSelectionModal";

describe("ReportTypeSelectionModal", () => {
  it("renders report options including 'Audit & Security Logs'", () => {
    const onSelectType = vi.fn();
    render(
      <ReportTypeSelectionModal
        open={true}
        onClose={vi.fn()}
        onSelectType={onSelectType}
      />
    );

    expect(screen.getByText("Generate Report")).toBeInTheDocument();
    expect(screen.getByText("Authentication Report")).toBeInTheDocument();
    expect(screen.getByText("System Report")).toBeInTheDocument();
    expect(screen.getByText("System Analytics")).toBeInTheDocument();
    expect(screen.getByText("Audit & Security Logs")).toBeInTheDocument();
    expect(screen.queryByText("Audit & Security Logs Export")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Audit & Security Logs"));
    expect(onSelectType).toHaveBeenCalledWith("csv_export");
  });

  it("does not render when closed", () => {
    const { container } = render(
      <ReportTypeSelectionModal
        open={false}
        onClose={vi.fn()}
        onSelectType={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
