import { useEffect, useState } from "react";

export const TOKEN_TTL_LIMITS = {
  accessToken: { min: 1, max: 1440, defaultValue: "60" },
  refreshToken: { min: 1, max: 8760, defaultValue: "168" },
};
export const GRANT_OPTIONS = ["authorization_code", "refresh_token", "client_credentials"];

const initialFieldErrors = {
  imageFile: "", name: "", baseURL: "", redirectURL: "",
  logoutURL: "", onePortalRedirectLink: "", accessTokenTTL: "", refreshTokenTTL: "",
};

export const isValidHttpUrl = (value) => {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};

export const parseTokenTTL = (value) => Number.parseInt(value, 10);
export const isValidTokenTTL = (value, { min, max }) => Number.isInteger(value) && value >= min && value <= max;

export function useAppClientCreateForm({ onSubmit }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [redirectURL, setRedirectURL] = useState("");
  const [logoutURL, setLogoutURL] = useState("");
  const [onePortalRedirectLink, setOnePortalRedirectLink] = useState("");
  const [grants, setGrants] = useState(["authorization_code"]);
  const [accessTokenTTL, setAccessTokenTTL] = useState(TOKEN_TTL_LIMITS.accessToken.defaultValue);
  const [refreshTokenTTL, setRefreshTokenTTL] = useState(TOKEN_TTL_LIMITS.refreshToken.defaultValue);
  const [imageFile, setImageFile] = useState(null);
  const [activeVoiceField, setActiveVoiceField] = useState("name");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);

  useEffect(() => {
    if (step === 1) {
      if (!["name", "description"].includes(activeVoiceField)) setActiveVoiceField("name");
      return;
    }
    if (step === 2 && !["baseURL", "redirectURL", "logoutURL", "onePortalRedirectLink"].includes(activeVoiceField)) {
      setActiveVoiceField("baseURL");
    }
  }, [activeVoiceField, step]);

  const clearFieldError = (fieldName) => {
    setFieldErrors((current) => current[fieldName] ? { ...current, [fieldName]: "" } : current);
  };

  const updateFieldValue = (fieldName, value, setter) => {
    setter(value);
    clearFieldError(fieldName);
    if (error) setError("");
  };

  const voiceFieldLabels = {
    description: "Description", baseURL: "Base URL", redirectURL: "Redirect URL",
    logoutURL: "Logout URL", onePortalRedirectLink: "One Portal Redirect Link",
  };
  const activeVoiceFieldLabel = voiceFieldLabels[activeVoiceField] || "Name";

  const handleVoiceInput = (transcript) => {
    if (activeVoiceField === "description") {
      setError("");
      setDescription((curr) => curr.trim() ? `${curr.trimEnd()} ${transcript}` : transcript);
      return;
    }
    if (activeVoiceField === "baseURL") return updateFieldValue("baseURL", transcript, setBaseURL);
    if (activeVoiceField === "redirectURL") return updateFieldValue("redirectURL", transcript, setRedirectURL);
    if (activeVoiceField === "logoutURL") return updateFieldValue("logoutURL", transcript, setLogoutURL);
    if (activeVoiceField === "onePortalRedirectLink") return updateFieldValue("onePortalRedirectLink", transcript, setOnePortalRedirectLink);
    updateFieldValue("name", transcript, setName);
  };

  const validateBasicInfo = () => {
    const trimmedName = name.trim();
    const nextFieldErrors = { ...initialFieldErrors, baseURL: fieldErrors.baseURL, redirectURL: fieldErrors.redirectURL, logoutURL: fieldErrors.logoutURL, onePortalRedirectLink: fieldErrors.onePortalRedirectLink };

    if (!imageFile) nextFieldErrors.imageFile = "System logo is required.";
    if (!trimmedName) nextFieldErrors.name = "Client name is required.";
    else if (trimmedName.length < 5 || trimmedName.length > 100) nextFieldErrors.name = "Client name must be between 5 and 100 characters.";

    setFieldErrors(nextFieldErrors);
    const firstError = nextFieldErrors.imageFile || nextFieldErrors.name;
    if (firstError) {
      return false;
    }
    return true;
  };

  const validateUrls = () => {
    const trimmedBaseURL = baseURL.trim();
    const trimmedRedirectURL = redirectURL.trim();
    const trimmedLogoutURL = logoutURL.trim();
    const trimmedOnePortalRedirectLink = onePortalRedirectLink.trim();
    const nextFieldErrors = { ...initialFieldErrors, imageFile: fieldErrors.imageFile, name: fieldErrors.name };

    if (!trimmedBaseURL) nextFieldErrors.baseURL = "Base URL is required.";
    else if (!isValidHttpUrl(trimmedBaseURL)) nextFieldErrors.baseURL = "Base URL must be a valid URL.";
    if (!trimmedRedirectURL) nextFieldErrors.redirectURL = "Redirect URL is required.";
    else if (!isValidHttpUrl(trimmedRedirectURL)) nextFieldErrors.redirectURL = "Redirect URL must be a valid URL.";
    if (!trimmedLogoutURL) nextFieldErrors.logoutURL = "Logout URL is required.";
    else if (!isValidHttpUrl(trimmedLogoutURL)) nextFieldErrors.logoutURL = "Logout URL must be a valid URL.";
    if (trimmedOnePortalRedirectLink && !isValidHttpUrl(trimmedOnePortalRedirectLink)) nextFieldErrors.onePortalRedirectLink = "One Portal Redirect Link must be a valid URL.";

    setFieldErrors(nextFieldErrors);
    const firstError = nextFieldErrors.baseURL || nextFieldErrors.redirectURL || nextFieldErrors.logoutURL || nextFieldErrors.onePortalRedirectLink;
    if (firstError) {
      return false;
    }
    return true;
  };

  const validateTokenSettings = () => {
    const parsedAccessTokenTTL = parseTokenTTL(accessTokenTTL);
    const parsedRefreshTokenTTL = parseTokenTTL(refreshTokenTTL);
    const nextFieldErrors = { ...initialFieldErrors, imageFile: fieldErrors.imageFile, name: fieldErrors.name, baseURL: fieldErrors.baseURL, redirectURL: fieldErrors.redirectURL, logoutURL: fieldErrors.logoutURL, onePortalRedirectLink: fieldErrors.onePortalRedirectLink };

    if (!accessTokenTTL) nextFieldErrors.accessTokenTTL = "Access Token expiration is required.";
    else if (!isValidTokenTTL(parsedAccessTokenTTL, TOKEN_TTL_LIMITS.accessToken)) nextFieldErrors.accessTokenTTL = "Expiration must be between 1 and 1,440 minutes.";

    if (!refreshTokenTTL) nextFieldErrors.refreshTokenTTL = "Refresh Token expiration is required.";
    else if (!isValidTokenTTL(parsedRefreshTokenTTL, TOKEN_TTL_LIMITS.refreshToken)) nextFieldErrors.refreshTokenTTL = "Expiration must be between 1 and 8,760 hours.";

    setFieldErrors(nextFieldErrors);
    const firstError = nextFieldErrors.accessTokenTTL || nextFieldErrors.refreshTokenTTL;
    if (firstError) {
      return false;
    }
    return true;
  };

  const toggleGrant = (grant) => {
    if (grants.includes(grant)) setGrants(grants.filter((value) => value !== grant));
    else setGrants([...grants, grant]);
    if (error) setError("");
  };

  const handleLogoChange = (file) => {
    setImageFile(file);
    if (file) {
      clearFieldError("imageFile");
      setError("");
    }
  };

  const nextStep = () => {
    if (step === 1 && !validateBasicInfo()) return;
    if (step === 2 && !validateUrls()) return;
    if (step === 3 && grants.length === 0) {
      setError("At least one grant must be selected.");
      return;
    }
    if (step === 3 && !validateTokenSettings()) return;
    setError("");
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validateBasicInfo()) return setStep(1);
    if (!validateUrls()) return setStep(2);
    if (grants.length === 0) {
      setError("At least one grant must be selected.");
      return setStep(3);
    }
    if (!validateTokenSettings()) return setStep(3);

    setError("");
    try {
      await onSubmit({
        name, description, base_url: baseURL, redirect_uri: redirectURL, logout_uri: logoutURL,
        one_portal_redirect_link: onePortalRedirectLink, grants,
        access_token_ttl: parseTokenTTL(accessTokenTTL), refresh_token_ttl: parseTokenTTL(refreshTokenTTL), imageFile,
      });
    } catch (submitError) {
      console.error("Create app client error:", submitError);
      setError(submitError?.message || "Unable to create app client. Please review the details and try again.");
    }
  };

  return {
    step,
    setStep,
    name,
    setName,
    description,
    setDescription,
    baseURL,
    setBaseURL,
    redirectURL,
    setRedirectURL,
    logoutURL,
    setLogoutURL,
    onePortalRedirectLink,
    setOnePortalRedirectLink,
    grants,
    accessTokenTTL,
    setAccessTokenTTL,
    refreshTokenTTL,
    setRefreshTokenTTL,
    activeVoiceField,
    setActiveVoiceField,
    error,
    setError,
    fieldErrors,
    updateFieldValue,
    activeVoiceFieldLabel,
    handleVoiceInput,
    toggleGrant,
    handleLogoChange,
    nextStep,
    handleSubmit,
  };
}
