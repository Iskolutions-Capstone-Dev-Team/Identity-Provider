import { describe, it, expect, vi, beforeEach } from "vitest";
import { deviceService } from "../deviceService";
import axiosInstance from "../axiosInstance";

vi.mock("../axiosInstance", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("deviceService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getDevices returns normalized device list when array is returned", async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        {
          id: "dev-101",
          name: "Chrome on Windows",
          browser: "Chrome",
          os: "Windows",
          ip_address: "192.168.1.1",
          last_used_at: "2026-10-15T09:00:00Z",
          created_at: "2026-10-15T08:00:00Z",
          expires_at: "2026-10-22T08:00:00Z",
          user_agent: "Mozilla/5.0",
        },
      ],
    });

    const devices = await deviceService.getDevices();
    expect(axiosInstance.get).toHaveBeenCalledWith("/devices");
    expect(devices).toHaveLength(1);
    expect(devices[0]).toEqual({
      id: "dev-101",
      name: "Chrome on Windows",
      browser: "Chrome",
      os: "Windows",
      ipAddress: "192.168.1.1",
      lastUsedAt: "2026-10-15T09:00:00Z",
      createdAt: "2026-10-15T08:00:00Z",
      expiresAt: "2026-10-22T08:00:00Z",
      userAgent: "Mozilla/5.0",
    });
  });

  it("getDevices returns empty array when response is empty or non-array", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: [] });
    let devices = await deviceService.getDevices();
    expect(devices).toEqual([]);

    axiosInstance.get.mockResolvedValueOnce({ data: null });
    devices = await deviceService.getDevices();
    expect(devices).toEqual([]);
  });

  it("updateDevice sends PATCH with device name", async () => {
    axiosInstance.patch.mockResolvedValueOnce({
      data: { message: "Device renamed successfully" },
    });

    const result = await deviceService.updateDevice({
      id: "dev-101",
      name: "Office PC",
    });

    expect(axiosInstance.patch).toHaveBeenCalledWith("/devices/dev-101", {
      name: "Office PC",
    });
    expect(result).toEqual({ message: "Device renamed successfully" });
  });

  it("updateDevice throws if device ID is missing", async () => {
    await expect(deviceService.updateDevice({ name: "Office PC" })).rejects.toThrow(
      "Device ID is required."
    );
  });

  it("deleteDevice sends DELETE request", async () => {
    axiosInstance.delete.mockResolvedValueOnce({
      data: { message: "Device deleted successfully" },
    });

    const result = await deviceService.deleteDevice({ id: "dev-101" });

    expect(axiosInstance.delete).toHaveBeenCalledWith("/devices/dev-101");
    expect(result).toEqual({ message: "Device deleted successfully" });
  });

  it("deleteDevice throws if device ID is missing", async () => {
    await expect(deviceService.deleteDevice({})).rejects.toThrow(
      "Device ID is required."
    );
  });
});
