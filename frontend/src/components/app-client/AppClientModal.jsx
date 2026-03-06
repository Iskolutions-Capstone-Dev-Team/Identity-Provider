import React, { useState, useEffect } from "react";
import ErrorAlert from "../ErrorAlert";
import { useAllRoles } from "../../hooks/useAllRoles";
import MultiSelect from "../MultiSelect";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];

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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageLocation, setImageLocation] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [showFullImage, setShowFullImage] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const roleOptions = [
    ...rolesData.map((r) => ({ id: r.id, role_name: r.role_name })),
    ...roles
      .filter(
        (value) =>
          typeof value === "string" &&
          !rolesData.some((role) => role.id === value),
      )
      .map((value) => ({ id: value, role_name: value })),
  ];

  const resolveImageSrc = (img) => {
    if (!img) return null;
    if (img.startsWith("data:")) return img;
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    return `${img}`;
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
    setRoles(client.roles || []);
    setImageFile(null);
    setIsDragging(false);
    setError("");
    const img = client.image || client.image_location || null;
    setImageLocation(img || "");
    setImagePreview(resolveImageSrc(img));
  }, [client, open]);

  useEffect(() => {
    if (!open || !client || typeof getClientDetails !== "function") return;

    const clientId = client.id || client.clientId;
    if (!clientId) return;

    let cancelled = false;
    setIsDetailsLoading(true);
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
        setRoles(details.roles || []);

        const img = details.image || details.image_location || null;
        setImageLocation(img || "");
        setImagePreview(resolveImageSrc(img));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Fetch client details error:", err);
        setError("Unable to load latest app client details.");
      })
      .finally(() => {
        if (!cancelled) setIsDetailsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, getClientDetails, open]);

  const toggleGrant = (grant) => {
    if (selectedGrants.includes(grant)) {
      setSelectedGrants(selectedGrants.filter((g) => g !== grant));
    } else {
      setSelectedGrants([...selectedGrants, grant]);
    }
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

  const handleImageChange = (e) => validateAndProcessFile(e.target.files?.[0]);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isView) setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isView) validateAndProcessFile(e.dataTransfer.files?.[0]);
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    setImageFile(null);
    setImageLocation("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView) return onClose();

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

    await onSubmit({
      id: client?.id || client?.clientId,
      name,
      description,
      base_url: baseURL,
      redirect_uri: redirectURL,
      logout_uri: logoutURL,
      grants: selectedGrants,
      roles,
      imageFile,
      image_location: imageLocation ?? "",
    });

    onClose();
  };

  if (!open) return null;

  return (
    <>
      <dialog className={`modal ${open ? "modal-open" : ""} z-998`}>
        <div className="modal-box max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col">
          <div className="bg-linear-to-r from-[#991b1b] to-red-600 p-6 text-white shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">
                  {isView ? "View App Client" : "Edit App Client"}
                </h3>
                <p className="text-white/90 mt-1">
                  {isView ? "Application client's configuration details." : "Update the application client's configuration and settings."}
                </p>
              </div>
              <button className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20" onClick={onClose}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <form id="app-client-form" noValidate className="flex-1 overflow-y-auto p-6 space-y-4 bg-white" onSubmit={handleSubmit}>
            <ErrorAlert message={error} onClose={() => setError("")}/>
            {isDetailsLoading && (
              <p className="text-sm text-gray-500">Loading latest app client details...</p>
            )}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">System Logo{!isView && <span className="text-red-500"> *</span>}</label>
              <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-all duration-200 ${
                  isDragging ? "border-[#991b1b] bg-red-50" : "border-gray-300 bg-gray-50"
                } ${mode === "view" ? "border-gray-200 cursor-default" : "hover:bg-gray-100 cursor-pointer"}`}
              >
                {!imagePreview ? (
                  <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-full ${isView ? "cursor-default" : "cursor-pointer"}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                      <svg className={`w-8 h-8 mb-2 transition-colors ${isDragging ? "text-[#991b1b]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold text-[#991b1b]">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase mt-1">PNG or JPG • Max 5MB</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange} disabled={mode === "view"} />
                  </label>
                ) : (
                  <div className="relative w-full h-full p-2 flex items-center justify-center">
                    <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg cursor-zoom-in hover:opacity-90 transition-opacity" onClick={() => setShowFullImage(true)} />
                    {!isView && (
                      <button type="button" onClick={removeImage} className="absolute top-2 right-2 btn btn-circle btn-xs bg-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] shadow-lg z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#991b1b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4 flex-1">
                <div className="space-y-0.5 mb-5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Client Id
                  </label>
                  <input type="text" value={client?.id || client?.clientId || ""} readOnly className="w-full px-3 py-2 rounded-md border bg-gray-100 text-gray-700 border-gray-300"/>
                </div>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      Name{!isView && <span className="text-red-500"> *</span>}
                    </label>
                    <input type="text" required minLength={5} maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder="(e.g., Identity Provider System)" className={`input validator w-full rounded-lg border border-gray-200 ${isView ? "bg-gray-100 text-gray-700" : "bg-transparent text-gray-700"}`} disabled={isView}/>
                    {!isView && <div className="validator-hint">Must be 5-100 characters</div>}
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      Tag
                    </label>
                    <input type="text" readOnly value={tag} className="w-full px-3 py-2 rounded-md border bg-gray-100 text-gray-700 border-gray-300"/>
                  </div>
                </div>
                <div className="space-y-0.5 mb-5">
                    <label className="block text-sm font-semibold text-gray-700">
                        Description
                    </label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" placeholder="Application description"
                        className={`textarea w-full rounded-lg border border-gray-200 resize-none ${isView ? "bg-gray-100 text-gray-700" : "bg-transparent text-gray-700"}`}
                        disabled={isView}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      Base URLs{!isView && <span className="text-red-500"> *</span>}
                    </label>
                    <input type="url" required value={baseURL} onChange={(e) => setBaseURL(e.target.value)} placeholder="https://app.example.com" className={`input validator w-full rounded-lg border border-gray-200 ${isView ? "bg-gray-100 text-gray-700" : "bg-transparent text-gray-700"}`} pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9-].*[a-zA-Z0-9])?.)+[a-zA-Z].*$" title="Must be valid URL" disabled={isView}/>
                    {!isView && <p className="validator-hint">Must be valid URL</p>}
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      Redirect URLs{!isView && <span className="text-red-500"> *</span>}
                    </label>
                    <input type="url" required value={redirectURL} onChange={(e) => setRedirectURL(e.target.value)} placeholder="https://app.example.com/callback" className={`input validator w-full rounded-lg border border-gray-200 ${isView ? "bg-gray-100 text-gray-700" : "bg-transparent text-gray-700"}`} pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9-].*[a-zA-Z0-9])?.)+[a-zA-Z].*$" title="Must be valid URL" disabled={isView}/>
                    {!isView && <p className="validator-hint">Must be valid URL</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 flex justify-center">
                    <div className="w-full md:w-1/2 space-y-0.5">
                      <label className="block text-sm font-semibold text-gray-700">
                        Logout URLs{!isView && <span className="text-red-500"> *</span>}
                      </label>
                      <input type="url" required value={logoutURL} onChange={(e) => setLogoutURL(e.target.value)} placeholder="https://app.example.com/logout" className={`input validator w-full rounded-lg border border-gray-200 ${isView ? "bg-gray-100 text-gray-700" : "bg-transparent text-gray-700"}`} pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9-].*[a-zA-Z0-9])?.)+[a-zA-Z].*$" title="Must be valid URL" disabled={isView}/>
                      {!isView && <p className="validator-hint">Must be valid URL</p>}
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <span className="block text-sm font-medium text-gray-700">Grants{!isView && <span className="text-red-500"> *</span>}</span>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-5">
                    {["authorization_code", "refresh_token", "client_credentials"].map((grant) => (
                      <label key={grant} className="flex items-center gap-2 text-gray-700">
                        <input type="checkbox" name="grants" value={grant} className="checkbox border-gray-300 bg-transparent checked:bg-[#991b1b] checked:border-red-900 checked:text-white mr-1" checked={selectedGrants.includes(grant)} onChange={() => toggleGrant(grant)} disabled={isView} required={!isView && selectedGrants.length === 0} title="Required" />
                        <span className="text-[#991b1b] text-[.7rem] sm:text-sm">{grant}</span>
                      </label>
                    ))}
                  </div>
                  {!isView && selectedGrants.length === 0 && (
                    <p className="text-xs text-[#ff637d] mt-2">At least one grant is required.</p>
                  )}
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Roles
                  </label>
                  {!isView && <p className="text-xs text-gray-500 italic mb-2">
                    select roles that are permitted to use this client
                  </p>}
                  <MultiSelect
                    options={roleOptions}
                    selectedValues={roles}
                    onChange={(ids) => setRoles(ids)}
                    placeholder="Select roles"
                    disabled={isView}
                  />
                </div>
            </div>
          </form>

          {/* Action buttons */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 shrink-0">
          <div className="flex justify-end gap-3">
            <button type="button" className="btn h-12 rounded-lg btn-outline text-[#991b1b] border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]" onClick={onClose}>
              Cancel
            </button>
            {mode !== "view" && (
              <button form="app-client-form" type="submit" className="btn h-12 rounded-lg bg-[#991b1b] text-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]">
                {mode === "create" ? "Create" : "Save"}
              </button>
            )}
          </div>
        </div>
        </div>
      </dialog>
      {showFullImage && (
        <div className="fixed inset-0 flex items-center justify-center z-9999" onClick={() => setShowFullImage(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
          <div className="relative max-w-4xl p-4 flex flex-col items-center justify-center pointer-events-none">
            <button className="btn btn-circle btn-sm absolute -top-4 -right-4 bg-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] text- pointer-events-auto" onClick={() => setShowFullImage(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#991b1b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img src={imagePreview} className="max-w-full max-h-[90vh] rounded-xl shadow-2xl pointer-events-auto" alt="Full Preview" />
          </div>
        </div>
      )}
    </>
  );
}
