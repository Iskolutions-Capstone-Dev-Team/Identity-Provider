import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SystemKPIsPanel from "../SystemKPIsPanel";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { metricsService } from "@/services/metricsService";

vi.mock("@/services/metricsService", () => ({
  metricsService: {
    getSystemKPIs: vi.fn(),
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
    expect(await screen.findByText(/15.4 ms/i)).toBeInTheDocument();
    expect(await screen.findByText(/3.50/i)).toBeInTheDocument();
  });
});
