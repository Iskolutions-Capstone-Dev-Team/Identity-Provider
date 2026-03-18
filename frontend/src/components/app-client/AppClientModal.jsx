import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ErrorAlert from "../ErrorAlert";
import { useAllRoles } from "../../hooks/useAllRoles";
import MultiSelect from "../MultiSelect";
import {
  userPoolModalBodyClassName,
  userPoolModalBodyStackClassName,
  userPoolModalBoxClassName,
  userPoolModalCloseButtonClassName,
  userPoolModalFooterActionsClassName,
  userPoolModalFooterClassName,
  userPoolModalHeaderClassName,
  userPoolModalHeaderDescriptionClassName,
  userPoolModalHeaderTitleClassName,
  userPoolModalHelperTextClassName,
  userPoolModalInputClassName,
  userPoolModalLabelClassName,
  userPoolModalOverlayClassName,
  userPoolModalPrimaryButtonClassName,
  userPoolModalReadOnlyInputClassName,
  userPoolModalSecondaryButtonClassName,
  userPoolModalSectionClassName,
} from "../user-pool/modalTheme";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];
const GRANT_OPTIONS = [
  "authorization_code",
  "refresh_token",
  "client_credentials",
];
const dropzoneBaseClassName =
  "relative flex min-h-56 w-full flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border border-dashed bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.88))] px-6 py-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition duration-300";
const imagePreviewCloseButtonClassName =
  "btn btn-circle btn-sm absolute -right-3 -top-3 border border-[#7b0d15]/10 bg-white text-[#7b0d15] shadow-[0_18px_40px_-24px_rgba(43,3,7,0.55)] transition hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]";

const toPositiveInt = (value) => {
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const normalizeRoleIds = (values = []) =>
  Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => toPositiveInt(value))
        .filter((value) => value !== null),
    ),
  );

const normalizeRoleName = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const getRoleName = (role) => {
  const rawName = role?.role_name ?? role?.roleName ?? role?.name ?? "";
  return typeof rawName === "string" ? rawName.trim() : "";
};

const toRoleOption = (role) => {
  const roleId = toPositiveInt(
    role?.id ?? role?.role_id ?? role?.roleId ?? role?.value,
  );
  const roleName = getRoleName(role);

  if (roleId === null || !roleName) {
    return null;
  }

  return { id: roleId, role_name: roleName };
};

const createRoleLookup = (roleOptions = []) => {
  const roleLookup = new Map();

  roleOptions.forEach((role) => {
    const normalizedName = normalizeRoleName(role?.role_name);
    if (!normalizedName || roleLookup.has(normalizedName)) {
      return;
    }

    roleLookup.set(normalizedName, role);
  });

  return roleLookup;
};

const mapRoleNamesToIds = (roleNames = [], roleOptions = []) => {
  if (
    !Array.isArray(roleNames) ||
    roleNames.length === 0 ||
    !Array.isArray(roleOptions)
  ) {
    return [];
  }

  const roleLookup = createRoleLookup(roleOptions);

  const ids = roleNames
    .map((name) => roleLookup.get(normalizeRoleName(name))?.id)
    .filter((id) => id !== undefined);

  return normalizeRoleIds(ids);
};

const mapRoleNamesToLabels = (roleNames = [], roleOptions = []) => {
  if (
    !Array.isArray(roleNames) ||
    roleNames.length === 0 ||
    !Array.isArray(roleOptions)
  ) {
    return [];
  }

  const roleLookup = createRoleLookup(roleOptions);

  return Array.from(
    new Set(
      roleNames
        .map((name) => roleLookup.get(normalizeRoleName(name))?.role_name)
        .filter(Boolean),
    ),
  );
};

const getDropzoneClassName = ({ isDragging, isView }) =>
  `${dropzoneBaseClassName} ${
    isDragging && !isView
      ? "border-[#f8d24e] bg-[linear-gradient(180deg,rgba(255,247,220,0.92),rgba(255,244,220,0.84))]"
      : isView
        ? "border-[#7b0d15]/10"
        : "border-[#7b0d15]/12 hover:border-[#f8d24e]/65 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,249,238,0.94))]"
  }`;

const getGrantClassName = (isSelected, isView) =>
  `flex items-center gap-3 rounded-[1rem] border px-4 py-3 text-sm font-medium transition duration-300 ${
    isSelected
      ? "border-[#f8d24e]/70 bg-[#fff4dc] text-[#7b0d15]"
      : "border-[#7b0d15]/10 bg-white/78 text-[#5d3a41]"
  } ${isView ? "cursor-default" : "hover:border-[#f8d24e]/45 hover:bg-[#fffaf2]"}`;

export default function AppClientModal({ open, mode, client, getClientDetails, onClose, onSubmit }) {
  const isView = mode === "view";
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [redirectURL, setRedirectURL] = useState("");
  const [logoutURL, setLogoutURL] = useState("");
  const [selectedGrants, setSelectedGrants] = useState(["authorization_code"]);
  const rolesData = useAllRoles();
  const [roles, setRoles] = useState([]);
  const [detailRoleNames, setDetailRoleNames] = useState([]);
  const [hasRoleSelectionChanged, setHasRoleSelectionChanged] = useState(false);
  const [hasLoadedLatestRoles, setHasLoadedLatestRoles] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageLocation, setImageLocation] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [showFullImage, setShowFullImage] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const detailsRequestRef = useRef({ clientId: "", inFlight: false });

  const roleOptions = useMemo(
    () => rolesData.map(toRoleOption).filter(Boolean),
    [rolesData],
  );

  const roleOptionsById = useMemo(
    () => new Map(roleOptions.map((role) => [role.id, role])),
    [roleOptions],
  );

  const selectedRoleLabels = useMemo(
    () =>
      roles
        .map((roleId) => roleOptionsById.get(roleId)?.role_name)
        .filter(Boolean),
    [roleOptionsById, roles],
  );

  const resolvedDetailRoleIds = useMemo(
    () => mapRoleNamesToIds(detailRoleNames, roleOptions),
    [detailRoleNames, roleOptions],
  );

  const resolvedDetailRoleLabels = useMemo(
    () => mapRoleNamesToLabels(detailRoleNames, roleOptions),
    [detailRoleNames, roleOptions],
  );

  const displayedRoleLabels =
    selectedRoleLabels.length > 0 ? selectedRoleLabels : resolvedDetailRoleLabels;

  const hasInitialRoleData = detailRoleNames.length > 0 || roles.length > 0;
  const isWaitingForRoleOptions =
    hasLoadedLatestRoles && hasInitialRoleData && roleOptions.length === 0;

  const resolveImageSrc = (image) => {
    if (!image) return null;
    if (image.startsWith("data:")) return image;
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    return `${image}`;
  };

  useEffect(() => {
    if (!open || !client) return;

    setName(client.name || "");
    setTag(client.tag || "");
    setDescription(client.description || "");
    setBaseURL(client.base_url || "");
    setRedirectURL(client.redirect_uri || "");
    setLogoutURL(client.logout_uri || "");
    setSelectedGrants(client.grants || ["authorization_code"]);
    setRoles([]);
    setDetailRoleNames([]);
    setHasRoleSelectionChanged(false);
    setHasLoadedLatestRoles(false);
    setImageFile(null);
    setIsDragging(false);
    setError("");

    const image = client.image || client.image_location || null;
    setImageLocation(image || "");
    setImagePreview(resolveImageSrc(image));
  }, [client, open]);

  useEffect(() => {
    if (!open) {
      detailsRequestRef.current = { clientId: "", inFlight: false };
      setHasLoadedLatestRoles(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !client || typeof getClientDetails !== "function") return;

    const clientId = client.id || client.clientId;
    if (!clientId) return;
    if (
      detailsRequestRef.current.inFlight &&
      detailsRequestRef.current.clientId === clientId
    ) {
      return;
    }

    let cancelled = false;
    detailsRequestRef.current = { clientId, inFlight: true };
    setIsDetailsLoading(true);
    setHasLoadedLatestRoles(false);
    setError("");

    getClientDetails(clientId)
      .then((details) => {
        if (cancelled || !details) return;

        setName(details.name || "");
        setTag(details.tag || "");
        setDescription(details.description || "");
        setBaseURL(details.base_url || "");
        setRedirectURL(details.redirect_uri || "");
        setLogoutURL(details.logout_uri || "");
        setSelectedGrants(details.grants || ["authorization_code"]);
        setRoles(normalizeRoleIds(details.roles || []));
        setDetailRoleNames(Array.isArray(details.roleNames) ? details.roleNames : []);
        setHasRoleSelectionChanged(false);
        setHasLoadedLatestRoles(true);

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

  useEffect(() => {
    if (
      hasRoleSelectionChanged ||
      roles.length > 0 ||
      detailRoleNames.length === 0 ||
      resolvedDetailRoleIds.length === 0
    ) {
      return;
    }

    setRoles(resolvedDetailRoleIds);
  }, [
    detailRoleNames,
    hasRoleSelectionChanged,
    resolvedDetailRoleIds,
    roles,
  ]);

  const toggleGrant = (grant) => {
    if (selectedGrants.includes(grant)) {
      setSelectedGrants(selectedGrants.filter((value) => value !== grant));
      return;
    }

    setSelectedGrants([...selectedGrants, grant]);
  };

  const validateAndProcessFile = (file) => {
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("System logo must be a PNG or JPG file.");
      return;
    }

    if (file.size > MAX_LOGO_BYTES) {
      setError("System logo must be 5MB max.");
      return;
    }

    setError("");
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleImageChange = (event) => {
    validateAndProcessFile(event.target.files?.[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (!isView) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (!isView) {
      validateAndProcessFile(event.dataTransfer.files?.[0]);
    }
  };

  const removeImage = (event) => {
    event.stopPropagation();
    setImagePreview(null);
    setImageFile(null);
    setImageLocation("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isView) {
      onClose();
      return;
    }

    if (!hasLoadedLatestRoles || isWaitingForRoleOptions) {
      setError("Load the latest app client roles before saving changes.");
      return;
    }

    const hasLogo = Boolean(imageFile) || Boolean(imageLocation);
    if (!hasLogo) {
      setError("System logo is required.");
      return;
    }
    if (!name.trim() || name.length < 5 || name.length > 100) {
      setError("Client name must be between 5 and 100 characters.");
      return;
    }
    if (!baseURL.trim() || !redirectURL.trim() || !logoutURL.trim()) {
      setError("All URL fields are required.");
      return;
    }
    if (!selectedGrants || selectedGrants.length === 0) {
      setError("At least one grant must be selected.");
      return;
    }

    setError("");
    let roleIds = normalizeRoleIds(roles);
    if (!hasRoleSelectionChanged && roleIds.length === 0) {
      roleIds = resolvedDetailRoleIds;
    }

    const selectedRoleOptions = roleIds
      .map((roleId) => roleOptionsById.get(roleId))
      .filter(Boolean)
      .map((role) => ({
        id: role.id,
        role_name: role.role_name,
      }))
      .filter(Boolean);

    const selectedRoleNames = Array.from(
      new Set(
        selectedRoleOptions.map((role) => role.role_name).filter(Boolean),
      ),
    );

    try {
      await onSubmit({
        id: client?.id || client?.clientId,
        name,
        description,
        base_url: baseURL,
        redirect_uri: redirectURL,
        logout_uri: logoutURL,
        grants: selectedGrants,
        roles: roleIds,
        roleNames: selectedRoleNames,
        roleOptions: selectedRoleOptions,
        imageFile,
        image_location: imageLocation ?? "",
      });

      onClose();
    } catch (submitError) {
      console.error("Submit app client error:", submitError);
      setError("Unable to save app client. Please check selected roles and try again.");
    }
  };

  if (!open) return null;

  return createPortal(
    <>
      <dialog open className={userPoolModalOverlayClassName}>
        <div className={userPoolModalBoxClassName}>
          <div className={userPoolModalHeaderClassName}>
            <div className="flex items-start justify-between gap-4">
              <div className={`max-w-2xl ${isView ? "pb-5 sm:pb-10" : ""}`}>
                <h3 className={userPoolModalHeaderTitleClassName}>
                  {isView ? "View App Client" : "Edit App Client"}
                </h3>
                <p className={userPoolModalHeaderDescriptionClassName}>
                  {isView
                    ? "Application client's configuration details."
                    : "Update the application client's configuration and settings."}
                </p>
              </div>

              <button type="button" className={userPoolModalCloseButtonClassName} onClick={onClose}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <form id="app-client-form" noValidate className={userPoolModalBodyClassName} onSubmit={handleSubmit}>
            <div className={userPoolModalBodyStackClassName}>
              <ErrorAlert message={error} onClose={() => setError("")} />

              {isDetailsLoading && (
                <div className="rounded-[1rem] border border-[#f8d24e]/45 bg-[#fff4dc] px-4 py-3 text-sm text-[#7b0d15]">
                  Loading latest app client details...
                </div>
              )}

              <section className={userPoolModalSectionClassName}>
                <label className={userPoolModalLabelClassName}>
                  System Logo {!isView && <span className="text-red-500">*</span>}
                </label>
                <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={getDropzoneClassName({ isDragging, isView })}>
                  {!imagePreview ? (
                    <label htmlFor="dropzone-file" className={`flex h-full w-full flex-col items-center justify-center ${
                        isView ? "cursor-default" : "cursor-pointer"
                      }`}>
                      <div className="space-y-3">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff4dc] text-[#7b0d15]">
                          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#7b0d15]">
                            Click to upload
                          </p>
                          <p className="mt-1 text-sm text-[#8f6f76]">
                            or drag and drop
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#9b7d84]">
                            PNG or JPG | Max 5MB
                          </p>
                        </div>
                      </div>
                      <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange} disabled={isView}/>
                    </label>
                  ) : (
                    <div className="relative flex h-full w-full items-center justify-center">
                      <img src={imagePreview} alt="Preview" className="max-h-52 max-w-full rounded-[1.25rem] object-contain shadow-[0_24px_45px_-30px_rgba(43,3,7,0.45)] transition hover:opacity-90" onClick={() => setShowFullImage(true)}/>
                      {!isView && (
                        <button type="button" onClick={removeImage} className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#7b0d15]/10 bg-white/95 text-[#7b0d15] shadow-[0_18px_40px_-24px_rgba(43,3,7,0.55)] transition hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </section>

              <section className={userPoolModalSectionClassName}>
                <div className="space-y-5">
                  <div>
                    <label className={userPoolModalLabelClassName}>Client Id</label>
                    <input type="text" value={client?.id || client?.clientId || ""} readOnly className={userPoolModalReadOnlyInputClassName}/>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className={userPoolModalLabelClassName}>
                        Name {!isView && <span className="text-red-500">*</span>}
                      </label>
                      <input type="text" required minLength={5} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="(e.g., Identity Provider System)"
                        className={
                          isView
                            ? userPoolModalReadOnlyInputClassName
                            : userPoolModalInputClassName
                        }
                        disabled={isView}
                      />
                      {!isView && (
                        <p className={`${userPoolModalHelperTextClassName} mt-2`}>
                          Must be 5-100 characters
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={userPoolModalLabelClassName}>Tag</label>
                      <input type="text" readOnly value={tag} className={userPoolModalReadOnlyInputClassName}/>
                    </div>
                  </div>

                  <div>
                    <label className={userPoolModalLabelClassName}>Description</label>
                    {isView ? (
                      <div className="min-h-24 w-full rounded-[1rem] border border-[#7b0d15]/10 bg-[#fff7ef]/90 px-4 py-3 text-sm text-[#5d3a41] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
                        {description?.trim() ? (
                          description
                        ) : (
                          <span className="italic text-[#8f6f76]">No content</span>
                        )}
                      </div>
                    ) : (
                      <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows="3" placeholder="Application description" className="w-full rounded-[1rem] border border-[#7b0d15]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.88))] px-4 py-3 text-sm text-[#4a1921] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] outline-none transition focus:border-[#d4a017] resize-none"/>
                    )}
                  </div>
                </div>
              </section>

              <section className={userPoolModalSectionClassName}>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className={userPoolModalLabelClassName}>
                      Base URLs {!isView && <span className="text-red-500">*</span>}
                    </label>
                    <input type="url" required value={baseURL} onChange={(event) => setBaseURL(event.target.value)} placeholder="https://app.example.com"
                      className={
                        isView
                          ? userPoolModalReadOnlyInputClassName
                          : userPoolModalInputClassName
                      }
                      pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9-].*[a-zA-Z0-9])?.)+[a-zA-Z].*$" title="Must be valid URL" disabled={isView}
                    />
                    {!isView && (
                      <p className={`${userPoolModalHelperTextClassName} mt-2`}>
                        Must be valid URL
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={userPoolModalLabelClassName}>
                      Redirect URLs {!isView && <span className="text-red-500">*</span>}
                    </label>
                    <input type="url" required value={redirectURL} onChange={(event) => setRedirectURL(event.target.value)} placeholder="https://app.example.com/callback"
                      className={
                        isView
                          ? userPoolModalReadOnlyInputClassName
                          : userPoolModalInputClassName
                      }
                      pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9-].*[a-zA-Z0-9])?.)+[a-zA-Z].*$" title="Must be valid URL" disabled={isView}
                    />
                    {!isView && (
                      <p className={`${userPoolModalHelperTextClassName} mt-2`}>
                        Must be valid URL
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2 md:mx-auto md:w-1/2">
                    <label className={userPoolModalLabelClassName}>
                      Logout URLs {!isView && <span className="text-red-500">*</span>}
                    </label>
                    <input type="url" required value={logoutURL} onChange={(event) => setLogoutURL(event.target.value)} placeholder="https://app.example.com/logout"
                      className={
                        isView
                          ? userPoolModalReadOnlyInputClassName
                          : userPoolModalInputClassName
                      }
                      pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9-].*[a-zA-Z0-9])?.)+[a-zA-Z].*$" title="Must be valid URL" disabled={isView}
                    />
                    {!isView && (
                      <p className={`${userPoolModalHelperTextClassName} mt-2`}>
                        Must be valid URL
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className={userPoolModalSectionClassName}>
                <div className="space-y-5">
                  <div>
                    <label className={userPoolModalLabelClassName}>
                      Grants {!isView && <span className="text-red-500">*</span>}
                    </label>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {GRANT_OPTIONS.map((grant) => {
                        const isSelected = selectedGrants.includes(grant);

                        return (
                          <label key={grant} className={getGrantClassName(isSelected, isView)}>
                            <input type="checkbox" name="grants" value={grant} className="checkbox h-5 w-5 rounded border-[#7b0d15]/20 bg-transparent checked:border-[#7b0d15] checked:bg-[#7b0d15] checked:text-white" checked={isSelected} onChange={() => toggleGrant(grant)} disabled={isView} required={!isView && selectedGrants.length === 0} title="Required"/>
                            <span className="break-all">{grant}</span>
                          </label>
                        );
                      })}
                    </div>
                    {!isView && selectedGrants.length === 0 && (
                      <p className="mt-3 text-xs text-red-500">
                        At least one grant is required.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={userPoolModalLabelClassName}>Roles</label>
                    {!isView && (
                      <p className={userPoolModalHelperTextClassName}>
                        select roles that are permitted to use this client
                      </p>
                    )}
                    {isView ? (
                      <div className="min-h-24 w-full rounded-[1rem] border border-[#7b0d15]/10 bg-[#fff7ef]/90 px-4 py-3 text-sm text-[#5d3a41] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
                        {isDetailsLoading || isWaitingForRoleOptions ? (
                          <span className="italic text-[#8f6f76]">
                            Loading latest roles...
                          </span>
                        ) : displayedRoleLabels.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {displayedRoleLabels.map((roleName, index) => (
                              <span key={`${roleName}-${index}`} className="inline-flex items-center gap-1 rounded-full border border-[#f8d24e]/45 bg-[#fff4dc] px-3 py-1 text-xs font-semibold text-[#7b0d15]">
                                {roleName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="italic text-[#8f6f76]">No content</span>
                        )}
                      </div>
                    ) : (
                      <MultiSelect
                        options={roleOptions}
                        selectedValues={roles}
                        onChange={(ids) => {
                          setHasRoleSelectionChanged(true);
                          setRoles(normalizeRoleIds(ids));
                        }}
                        placeholder="Select roles"
                        disabled={
                          isView ||
                          isDetailsLoading ||
                          !hasLoadedLatestRoles ||
                          isWaitingForRoleOptions
                        }
                        variant="userpoolModal"
                      />
                    )}
                  </div>
                </div>
              </section>
            </div>
          </form>

          <div className={userPoolModalFooterClassName}>
            <div className={userPoolModalFooterActionsClassName}>
              <button type="button" className={userPoolModalSecondaryButtonClassName} onClick={onClose}>
                Cancel
              </button>

              {!isView && (
                <button form="app-client-form" type="submit"
                  disabled={
                    isDetailsLoading ||
                    !hasLoadedLatestRoles ||
                    isWaitingForRoleOptions
                  }
                  className={userPoolModalPrimaryButtonClassName}
                >
                  {mode === "create" ? "Create" : "Save"}
                </button>
              )}
            </div>
          </div>
        </div>
      </dialog>

      {showFullImage && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center px-4 py-6" onClick={() => setShowFullImage(false)}>
          <div className="absolute inset-0 bg-[rgba(43,3,7,0.72)] backdrop-blur-sm" />
          <div className="relative pointer-events-none flex max-w-4xl items-center justify-center">
            <button type="button" className={`${imagePreviewCloseButtonClassName} pointer-events-auto`} onClick={() => setShowFullImage(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            <img src={imagePreview} className="pointer-events-auto max-h-[88vh] max-w-full rounded-[1.5rem] border border-white/10 bg-white/90 object-contain shadow-[0_36px_90px_-40px_rgba(43,3,7,0.72)]" alt="Full Preview"/>
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}