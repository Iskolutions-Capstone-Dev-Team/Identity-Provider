import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TOKEN_TTL_LIMITS, isValidHttpUrl, parseTokenTTL, isValidTokenTTL } from "./useAppClientCreateForm";

const initialFieldErrors = {
  imageFile: "", name: "", baseURL: "", redirectURL: "",
  logoutURL: "", onePortalRedirectLink: "", accessTokenTTL: "", refreshTokenTTL: "",
};

export const getOnePortalRedirectLink = (client = {}) =>
  client.one_portal_link ?? client.one_portal_redirect_link ?? "";

export const getTokenTTLValue = (value, fallbackValue) => {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? String(parsedValue) : fallbackValue;
};

export const resolveImageSrc = (image) => {
  if (!image) return null;
  if (image.startsWith("data:")) return image;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${image}`;
};

export function useAppClientModal({ open, mode, client, getClientDetails, onClose, onSubmit }) {
  const isView = mode === "view";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [redirectURL, setRedirectURL] = useState("");
  const [logoutURL, setLogoutURL] = useState("");
  const [onePortalRedirectLink, setOnePortalRedirectLink] = useState("");
  const [selectedGrants, setSelectedGrants] = useState(["authorization_code"]);
  const [accessTokenTTL, setAccessTokenTTL] = useState(TOKEN_TTL_LIMITS.accessToken.defaultValue);
  const [refreshTokenTTL, setRefreshTokenTTL] = useState(TOKEN_TTL_LIMITS.refreshToken.defaultValue);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageLocation, setImageLocation] = useState(null);
  const [activeVoiceField, setActiveVoiceField] = useState("name");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const detailsRequestRef = useRef({ clientId: "", inFlight: false });

  const handleCopyId = () => {
    const idToCopy = client?.id || client?.clientId;
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setIsCopied(true);
      toast.success("Client ID copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (!open) {
      detailsRequestRef.current = { clientId: "", inFlight: false };
      setActiveVoiceField("name");
      setFieldErrors(initialFieldErrors);
      return;
    }

    if (!client) return;

    setName(client.name || "");
    setDescription(client.description || "");
    setBaseURL(client.base_url || "");
    setRedirectURL(client.redirect_uri || "");
    setLogoutURL(client.logout_uri || "");
    setOnePortalRedirectLink(getOnePortalRedirectLink(client));
    setSelectedGrants(client.grants || ["authorization_code"]);
    setAccessTokenTTL(getTokenTTLValue(client.access_token_ttl, TOKEN_TTL_LIMITS.accessToken.defaultValue));
    setRefreshTokenTTL(getTokenTTLValue(client.refresh_token_ttl, TOKEN_TTL_LIMITS.refreshToken.defaultValue));
    setImageFile(null);
    setActiveVoiceField("name");
    setError("");
    setFieldErrors(initialFieldErrors);

    const image = client.image || client.image_location || null;
    setImageLocation(image || "");
    setImagePreview(resolveImageSrc(image));
  }, [client, open]);

  useEffect(() => {
    if (!open || !client || typeof getClientDetails !== "function") return;

    const clientId = client.id || client.clientId;
    if (!clientId) return;
    if (detailsRequestRef.current.inFlight && detailsRequestRef.current.clientId === clientId) {
      return;
    }

    let cancelled = false;
    detailsRequestRef.current = { clientId, inFlight: true };
    setIsDetailsLoading(true);
    setError("");

    getClientDetails(clientId)
      .then((details) => {
        if (cancelled || !details) return;

        setName(details.name || "");
        setDescription(details.description || "");
        setBaseURL(details.base_url || "");
        setRedirectURL(details.redirect_uri || "");
        setLogoutURL(details.logout_uri || "");
        setOnePortalRedirectLink(getOnePortalRedirectLink(details));
        setSelectedGrants(details.grants || ["authorization_code"]);
        setAccessTokenTTL(getTokenTTLValue(details.access_token_ttl, TOKEN_TTL_LIMITS.accessToken.defaultValue));
        setRefreshTokenTTL(getTokenTTLValue(details.refresh_token_ttl, TOKEN_TTL_LIMITS.refreshToken.defaultValue));
        setFieldErrors(initialFieldErrors);

        const image = details.image || details.image_location || null;
        setImageLocation(image || "");
        setImagePreview(resolveImageSrc(image));
      })
      .catch((fetchError) => {
        if (cancelled) return;
        console.error("Fetch client details error:", fetchError);
        setError("Unable to load latest app client details.");
      })
      .finally(() => {
        detailsRequestRef.current = { clientId, inFlight: false };
        if (!cancelled) {
          setIsDetailsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [client, getClientDetails, open]);

  const clearFieldError = (fieldName) => {
    setFieldErrors((current) => current[fieldName] ? { ...current, [fieldName]: "" } : current);
  };

  const updateFieldValue = (fieldName, value, setter) => {
    setter(value);
    clearFieldError(fieldName);
    if (error) setError("");
  };

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

  const validateEditableFields = () => {
    const trimmedName = name.trim();
    const trimmedBaseURL = baseURL.trim();
    const trimmedRedirectURL = redirectURL.trim();
    const trimmedLogoutURL = logoutURL.trim();
    const trimmedOnePortalRedirectLink = onePortalRedirectLink.trim();
    const nextFieldErrors = { ...initialFieldErrors };
    const hasLogo = Boolean(imageFile) || Boolean(imageLocation);

    if (!hasLogo) nextFieldErrors.imageFile = "System logo is required.";
    if (!trimmedName) nextFieldErrors.name = "Client name is required.";
    else if (trimmedName.length < 5 || trimmedName.length > 100) nextFieldErrors.name = "Client name must be between 5 and 100 characters.";

    if (!trimmedBaseURL) nextFieldErrors.baseURL = "Base URL is required.";
    else if (!isValidHttpUrl(trimmedBaseURL)) nextFieldErrors.baseURL = "Base URL must be a valid URL.";

    if (!trimmedRedirectURL) nextFieldErrors.redirectURL = "Redirect URL is required.";
    else if (!isValidHttpUrl(trimmedRedirectURL)) nextFieldErrors.redirectURL = "Redirect URL must be a valid URL.";

    if (!trimmedLogoutURL) nextFieldErrors.logoutURL = "Logout URL is required.";
    else if (!isValidHttpUrl(trimmedLogoutURL)) nextFieldErrors.logoutURL = "Logout URL must be a valid URL.";

    if (trimmedOnePortalRedirectLink && !isValidHttpUrl(trimmedOnePortalRedirectLink)) {
      nextFieldErrors.onePortalRedirectLink = "One Portal Redirect Link must be a valid URL.";
    }

    if (!accessTokenTTL) {
      nextFieldErrors.accessTokenTTL = "Access Token expiration is required.";
    } else if (!isValidTokenTTL(parseTokenTTL(accessTokenTTL), TOKEN_TTL_LIMITS.accessToken)) {
      nextFieldErrors.accessTokenTTL = "Expiration must be between 1 and 1,440 minutes.";
    }

    if (!refreshTokenTTL) {
      nextFieldErrors.refreshTokenTTL = "Refresh Token expiration is required.";
    } else if (!isValidTokenTTL(parseTokenTTL(refreshTokenTTL), TOKEN_TTL_LIMITS.refreshToken)) {
      nextFieldErrors.refreshTokenTTL = "Expiration must be between 1 and 8,760 hours.";
    }

    setFieldErrors(nextFieldErrors);

    const firstError = Object.values(nextFieldErrors).find(err => err);
    if (firstError) {
      return false;
    }
    return true;
  };

  const toggleGrant = (grant) => {
    if (selectedGrants.includes(grant)) {
      setSelectedGrants(selectedGrants.filter((value) => value !== grant));
    } else {
      setSelectedGrants([...selectedGrants, grant]);
    }
    if (error) setError("");
  };

  const handleLogoChange = (file) => {
    setImageFile(file);
    if (file) {
      clearFieldError("imageFile");
      setError("");
    } else {
      setImageLocation("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isView) return onClose();

    if (!validateEditableFields()) return;

    if (!selectedGrants || selectedGrants.length === 0) {
      setError("At least one grant must be selected.");
      return;
    }

    setError("");

    try {
      await onSubmit({
        id: client?.id || client?.clientId,
        name,
        description,
        base_url: baseURL,
        redirect_uri: redirectURL,
        logout_uri: logoutURL,
        one_portal_redirect_link: onePortalRedirectLink,
        grants: selectedGrants,
        access_token_ttl: parseTokenTTL(accessTokenTTL),
        refresh_token_ttl: parseTokenTTL(refreshTokenTTL),
        imageFile,
      });

      onClose();
    } catch (submitError) {
      console.error("Submit app client error:", submitError);
      setError(submitError?.message || "Unable to save app client. Please review the details and try again.");
    }
  };

  const voiceFieldLabels = {
    description: "Description", baseURL: "Base URL", redirectURL: "Redirect URL",
    logoutURL: "Logout URL", onePortalRedirectLink: "One Portal Redirect Link",
  };
  const activeVoiceFieldLabel = voiceFieldLabels[activeVoiceField] || "Name";

  return {
    isView,
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
    selectedGrants,
    accessTokenTTL,
    setAccessTokenTTL,
    refreshTokenTTL,
    setRefreshTokenTTL,
    imagePreview,
    activeVoiceField,
    setActiveVoiceField,
    error,
    setError,
    fieldErrors,
    isDetailsLoading,
    isCopied,
    activeVoiceFieldLabel,
    handleCopyId,
    updateFieldValue,
    handleVoiceInput,
    toggleGrant,
    handleLogoChange,
    handleSubmit,
  };
}
