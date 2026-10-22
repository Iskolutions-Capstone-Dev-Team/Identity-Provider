import { describe, it, expect } from "vitest";
import {
  getRequestErrorMessage,
  getInitialStep,
  getStepMeta,
} from "../useChangePasswordModal";

describe("useChangePasswordModal utils", () => {
  describe("getRequestErrorMessage", () => {
    it("handles password reuse error code 1031 correctly", () => {
      const error = {
        response: {
          data: {
            code: 1031,
            message: "You cannot reuse any of your last 5 passwords.",
            error: "password cannot be reused from recent history",
          },
        },
      };

      const msg = getRequestErrorMessage(error, "Fallback");
      expect(msg).toBe("You cannot reuse any of your last 5 passwords.");
    });

    it("falls back to default password reuse message when data.message is empty for 1031", () => {
      const error = {
        response: {
          data: {
            code: 1031,
          },
        },
      };

      const msg = getRequestErrorMessage(error, "Fallback");
      expect(msg).toBe("You cannot reuse any of your last 5 passwords.");
    });

    it("prioritizes data.message over technical data.error", () => {
      const error = {
        response: {
          data: {
            message: "Friendly server error",
            error: "internal_err",
          },
        },
      };

      const msg = getRequestErrorMessage(error, "Fallback");
      expect(msg).toBe("Friendly server error");
    });
  });

  describe("getInitialStep", () => {
    it("returns password if showCurrentPassword is true", () => {
      expect(getInitialStep(true)).toBe("password");
    });

    it("returns email if showCurrentPassword is false", () => {
      expect(getInitialStep(false)).toBe("email");
    });
  });

  describe("getStepMeta", () => {
    it("returns correct metadata for profile password change step", () => {
      const meta = getStepMeta("password", true);
      expect(meta.title).toBe("Change Password");
    });

    it("returns correct metadata for forgot password reset step", () => {
      const meta = getStepMeta("password", false);
      expect(meta.title).toBe("Set New Password");
    });
  });
});
