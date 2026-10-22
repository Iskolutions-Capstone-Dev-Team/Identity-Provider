import { describe, it, expect } from "vitest";
import {
  getRequestErrorMessage,
  getPasswordValidationState,
  formatTimer,
  normalizeTextValue,
} from "../forgotPasswordUtils";

describe("forgotPasswordUtils", () => {
  describe("getRequestErrorMessage", () => {
    it("returns friendly message for password reuse error code 1031", () => {
      const error = {
        response: {
          data: {
            code: 1031,
            message: "You cannot reuse any of your last 5 passwords.",
            error: "password cannot be reused from recent history",
          },
        },
      };

      const result = getRequestErrorMessage(error, "Fallback");
      expect(result).toBe("You cannot reuse any of your last 5 passwords.");
    });

    it("falls back to default password reuse message if code 1031 has no custom message", () => {
      const error = {
        response: {
          data: {
            code: 1031,
          },
        },
      };

      const result = getRequestErrorMessage(error, "Fallback");
      expect(result).toBe("You cannot reuse any of your last 5 passwords.");
    });

    it("prioritizes response data message over raw error string", () => {
      const error = {
        response: {
          data: {
            message: "Custom user message",
            error: "internal_error",
          },
        },
      };

      const result = getRequestErrorMessage(error, "Fallback");
      expect(result).toBe("Custom user message");
    });

    it("falls back to data.error if data.message is absent", () => {
      const error = {
        response: {
          data: {
            error: "Specific error message",
          },
        },
      };

      const result = getRequestErrorMessage(error, "Fallback");
      expect(result).toBe("Specific error message");
    });

    it("uses fallback message when no response data exists", () => {
      const error = {};
      const result = getRequestErrorMessage(error, "Fallback error");
      expect(result).toBe("Fallback error");
    });
  });

  describe("getPasswordValidationState", () => {
    it("marks valid when all rules and match pass", () => {
      const state = getPasswordValidationState({
        newPassword: "StrongPassword123!",
        confirmPassword: "StrongPassword123!",
      });
      expect(state.isValid).toBe(true);
      expect(state.checks.length).toBe(true);
      expect(state.checks.uppercase).toBe(true);
      expect(state.checks.number).toBe(true);
      expect(state.checks.special).toBe(true);
    });

    it("marks invalid when passwords do not match", () => {
      const state = getPasswordValidationState({
        newPassword: "StrongPassword123!",
        confirmPassword: "DifferentPassword123!",
      });
      expect(state.isValid).toBe(false);
    });
  });

  describe("formatTimer", () => {
    it("formats minutes and seconds accurately", () => {
      expect(formatTimer(180)).toBe("03:00");
      expect(formatTimer(65)).toBe("01:05");
      expect(formatTimer(0)).toBe("00:00");
    });
  });

  describe("normalizeTextValue", () => {
    it("trims strings and normalizes non-strings", () => {
      expect(normalizeTextValue("  test  ")).toBe("test");
      expect(normalizeTextValue(null)).toBe("");
      expect(normalizeTextValue(undefined)).toBe("");
    });
  });
});
