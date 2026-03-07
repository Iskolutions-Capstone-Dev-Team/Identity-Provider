import React, { useEffect, useMemo, useState } from "react";
import ErrorAlert from "../ErrorAlert";
import TagMultiSelect from "./TagMultiSelect";

const splitRoleName = (value = "") => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return { tag: "", name: "" };

  const separatorIndex = trimmed.indexOf(":");
  if (separatorIndex === -1) {
    return { tag: "", name: trimmed };
  }

  return {
    tag: trimmed.slice(0, separatorIndex).trim(),
    name: trimmed.slice(separatorIndex + 1).trim(),
  };
};

const normalizeTagValue = (value) =>
  typeof value === "string" ? value.replace(/:+$/, "").trim() : "";

export default function RoleModal({
  open,
  mode,
  role,
  tagOptions = [],
  isTagOptionsLoading = false,
  onClose,
  onSubmit,
}) {
    const isViewMode = mode === "view";

    const [selectedTags, setSelectedTags] = useState([]);
    const [roleName, setRoleName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [touched, setTouched] = useState({
      tags: false,
      name: false,
      description: false,
    });

    useEffect(() => {
        if (!open) return;

        if (mode === "create") {
            setSelectedTags([]);
            setRoleName("");
            setDescription("");
        } else {
            const parsedRoleName = splitRoleName(role?.role_name || "");
            setSelectedTags(parsedRoleName.tag ? [parsedRoleName.tag] : []);
            setRoleName(parsedRoleName.name);
            setDescription(role?.description || "");
        }

        setError("");
        setTouched({
          tags: false,
          name: false,
          description: false,
        });
    }, [mode, role, open]);

    const mergedTagOptions = useMemo(() => {
      const optionMap = new Map(
        (Array.isArray(tagOptions) ? tagOptions : [])
          .filter((option) => option?.id)
          .map((option) => [option.id, option]),
      );

      selectedTags.forEach((tag) => {
        if (!optionMap.has(tag)) {
          optionMap.set(tag, { id: tag, tag, image: "" });
        }
      });

      return Array.from(optionMap.values());
    }, [selectedTags, tagOptions]);

    const fieldErrors = useMemo(
      () => ({
        tags: selectedTags.length === 0 ? "Tag is required." : "",
        name: !roleName.trim() ? "Name is required." : "",
        description: !description.trim() ? "Description is required." : "",
      }),
      [description, roleName, selectedTags],
    );

    const setFieldTouched = (field) => {
      setTouched((previous) => ({ ...previous, [field]: true }));
    };

    const clearAlertError = () => {
      if (error) {
        setError("");
      }
    };

    const validateForm = () => {
      const firstError =
        fieldErrors.tags || fieldErrors.name || fieldErrors.description;

      if (!firstError) {
        setError("");
        return true;
      }

      setError(firstError);
      return false;
    };

    const handleTagChange = (values) => {
      const normalized = (Array.isArray(values) ? values : [])
        .map((value) => normalizeTagValue(value))
        .filter(Boolean);

      // The role payload supports a single role name, so keep one selected tag.
      const latestTag = normalized[normalized.length - 1] || "";
      setSelectedTags(latestTag ? [latestTag] : []);
      setFieldTouched("tags");
      clearAlertError();
    };

    const handleRoleNameChange = (value) => {
      setRoleName(value);
      clearAlertError();
    };

    const handleDescriptionChange = (value) => {
      setDescription(value);
      clearAlertError();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isViewMode) return onClose();

        setTouched({
          tags: true,
          name: true,
          description: true,
        });

        if (!validateForm()) return;

        const selectedTag = selectedTags[0];
        const normalizedName = roleName.trim();

        onSubmit({
            id: role?.id || Date.now(),
            role_name: `${selectedTag}:${normalizedName}`,
            description: description.trim(),
            created_at: role?.created_at || new Date().toISOString().slice(0, 10),
        });

        onClose();
    };

    if (!open) return null;
    
    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col">
                <div className="bg-linear-to-r from-[#991b1b] to-red-600 p-6 text-white shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold">
                                {mode === "create" ? "Create Role" : mode === "edit" ? "Edit Role" : "View Role"}
                            </h3>
                            <p className="text-white/90 mt-1">
                                {mode === "create" ? "Define a new role.": mode === "edit" ? "Modify the role's name and description." : "View the role's information."}
                            </p>
                        </div>
                        <button className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20" onClick={onClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                <form id="role-form" noValidate className="flex-1 overflow-y-auto p-6 space-y-4 bg-white" onSubmit={handleSubmit}>
                    <ErrorAlert message={error} onClose={() => setError("")} />
                    <div className="space-y-4 flex-1">
                        <div className="space-y-0.5">
                            <label className="block text-base font-semibold text-gray-700">
                                Role Name<span className="text-red-500"> *</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-0.5">
                                <TagMultiSelect
                                  options={mergedTagOptions}
                                  selectedValues={selectedTags}
                                  onChange={handleTagChange}
                                  placeholder={
                                    isTagOptionsLoading
                                      ? "Loading tags..."
                                      : "Select tag"
                                  }
                                  disabled={isViewMode}
                                />
                                {!isViewMode && touched.tags && fieldErrors.tags && (
                                  <p className="text-xs text-[#ff637d]">
                                    {fieldErrors.tags}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-0.5">
                                <input
                                  type="text"
                                  required={!isViewMode}
                                  value={roleName}
                                  onChange={(e) =>
                                    handleRoleNameChange(e.target.value)
                                  }
                                  onBlur={() => setFieldTouched("name")}
                                  placeholder="(e.g., superadmin)"
                                  className={`input validator w-full rounded-lg ${
                                    isViewMode
                                      ? "bg-gray-100 border-gray-300 text-gray-700"
                                      : "bg-transparent border-gray-200 text-gray-700"
                                  }`}
                                  disabled={isViewMode}
                                />
                                {!isViewMode &&
                                  touched.name &&
                                  fieldErrors.name && (
                                    <p className="text-xs text-[#ff637d]">
                                      {fieldErrors.name}
                                    </p>
                                  )}
                              </div>
                            </div>
                        </div>

                        <div className="space-y-0.5">
                            <label className="block text-base font-semibold text-gray-700">
                                Role Description<span className="text-red-500"> *</span>
                            </label>
                            <textarea
                              required={!isViewMode}
                              value={description}
                              onChange={(e) =>
                                handleDescriptionChange(e.target.value)
                              }
                              onBlur={() => setFieldTouched("description")}
                              rows="3"
                              placeholder="Role description"
                              className={`textarea validator w-full rounded-lg resize-none ${
                                isViewMode
                                  ? "bg-gray-100 border-gray-300 text-gray-700"
                                  : "bg-transparent border-gray-200 text-gray-700"
                              }`}
                              disabled={isViewMode}
                            />
                            {!isViewMode &&
                              touched.description &&
                              fieldErrors.description && (
                                <p className="text-xs text-[#ff637d]">
                                  {fieldErrors.description}
                                </p>
                              )}
                        </div>
                    </div>
                </form>

                {/* Action buttons */}
                <div className="p-6 bg-gray-50 border-t border-gray-200 shrink-0">
                    <div className="flex justify-end gap-3">
                        <button type="button" className="btn h-12 rounded-lg btn-outline text-[#991b1b] border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]" onClick={onClose}>
                            Cancel
                        </button>
                        {!isViewMode && (
                            <button form="role-form" type="submit" className="btn h-12 rounded-lg bg-[#991b1b] text-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]">
                                {mode === "create" ? "Create" : "Save"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </dialog>
    );
}