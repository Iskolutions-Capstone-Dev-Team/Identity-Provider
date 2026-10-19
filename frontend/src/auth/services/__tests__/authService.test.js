import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "../authService";
import axiosInstance from "../../../services/axiosInstance";
import * as authCookies from "../../utils/authCookies";

vi.mock("../../../services/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("../../utils/authCookies", () => ({
  storePendingMfaTokenResponse: vi.fn(),
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("login returns mfaRequired=false when no mfa_pending_token is returned", async () => {
    axiosInstance.post.mockResolvedValueOnce({
      data: {
        redirect_url: "http://localhost:5173/callback?code=abc",
        mfa_pending_token: null,
      },
    });

    const result = await authService.login("user@test.com", "pass123", "client-123");

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/auth/login",
      { email: "user@test.com", password: "pass123", client_id: "client-123" },
      { skipAuthRefresh: true }
    );
    expect(authCookies.storePendingMfaTokenResponse).not.toHaveBeenCalled();
    expect(result).toEqual({
      redirectUrl: "http://localhost:5173/callback?code=abc",
      mfaRequired: false,
      hasMfa: false,
    });
  });

  it("login stores token and returns mfaRequired=true when mfa_pending_token is returned", async () => {
    axiosInstance.post.mockResolvedValueOnce({
      data: {
        redirect_url: "http://localhost:5173/api/v1/auth/authorize?client_id=client-123",
        mfa_pending_token: "pending-mfa-token-jwt",
      },
    });

    const result = await authService.login("user@test.com", "pass123", "client-123");

    expect(authCookies.storePendingMfaTokenResponse).toHaveBeenCalledWith({
      access_token: "pending-mfa-token-jwt",
    });
    expect(result.mfaRequired).toBe(true);
    expect(result.hasMfa).toBe(true);
    expect(result.redirectUrl).toBe("http://localhost:5173/api/v1/auth/authorize?client_id=client-123");
  });

  it("checkSession calls /auth/session", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { authenticated: true } });
    const res = await authService.checkSession();
    expect(axiosInstance.get).toHaveBeenCalledWith("/auth/session", { skipAuthRefresh: true });
    expect(res).toEqual({ authenticated: true });
  });
});
