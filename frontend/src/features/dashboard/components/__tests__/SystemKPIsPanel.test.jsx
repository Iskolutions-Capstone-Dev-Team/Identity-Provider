import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SystemKPIsPanel from "../SystemKPIsPanel";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { metricsService } from "@/services/metricsService";

vi.mock("@/services/metricsService", () => ({
  metricsService: {
    getSystemKPIs: vi.fn(),
    getKPIThreatDetails: vi.fn(),
  },
}));

function renderWithClient(ui) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe("SystemKPIsPanel", () => {
  it("renders KPIs from backend correctly", async () => {
    metricsService.getSystemKPIs.mockResolvedValueOnce({
      system_health: "Healthy",
      cache_status: "Active",
      apm: {
        avg_latency_ms: 15.4,
        tx_processing_time_ms: 12.1,
        throughput_rps: 3.5,
        active_sessions: 4,
        cpu_load_percent: 22.5,
        memory_usage_mb: 85.2,
      },
      security: {
        total_logins: 120,
        successful_logins: 110,
        failed_logins: 10,
        success_rate_percent: 91.67,
        threat_level: "LOW",
      },
      identity: {
        total_accounts: 50,
        active_accounts: 45,
        archived_accounts: 5,
      },
    });

    renderWithClient(<SystemKPIsPanel />);

    expect(await screen.findByText(/Operational KPIs/i)).toBeInTheDocument();
    expect((await screen.findAllByText(/15.4 ms/i)).length).toBeGreaterThan(0);
    expect((await screen.findAllByText(/3.50/i)).length).toBeGreaterThan(0);
  });

  it("renders inspect button and opens ThreatDetailsModal on click", async () => {
    metricsService.getSystemKPIs.mockResolvedValueOnce({
      system_health: "Healthy",
      cache_status: "Active",
      apm: {},
      security: {
        total_logins: 120,
        successful_logins: 110,
        failed_logins: 10,
        success_rate_percent: 91.67,
        threat_level: "LOW",
      },
      identity: {},
    });

    metricsService.getKPIThreatDetails.mockResolvedValueOnce({
      threat_level: "LOW",
      eval_timeframe: "Past 24 Hours",
      triggers: {
        failed_logins: 10,
        trigger_reason: "Activity within safe threshold",
      },
      targeted_clients: [],
      offending_sources: [],
    });

    renderWithClient(<SystemKPIsPanel />);

    const securityTab = await screen.findByRole("tab", { name: /Auth Security/i });
    fireEvent.click(securityTab);

    const inspectBtns = await screen.findAllByRole("button", { name: /Inspect/i });
    expect(inspectBtns.length).toBeGreaterThan(0);

    fireEvent.click(inspectBtns[0]);

    expect(await screen.findByText(/Threat Posture & Telemetry Drilldown/i)).toBeInTheDocument();
  });
});
