import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import ErrorAlert from "../ErrorAlert";
import TagMultiSelect from "./TagMultiSelect";
import {
  modalBodyClassName,
  modalBodyStackClassName,
  modalBoxClassName,
  modalCloseButtonClassName,
  modalFooterActionsClassName,
  modalFooterClassName,
  modalHeaderClassName,
  modalHeaderDescriptionClassName,
  modalHeaderTitleClassName,
  modalHelperTextClassName,
  modalLabelClassName,
  modalOverlayClassName,
  modalPrimaryButtonClassName,
  modalReadOnlyInputClassName,
  modalSecondaryButtonClassName,
  modalSectionClassName,
} from "../modalTheme";

const readOnlyTextAreaClassName =
  `${modalReadOnlyInputClassName} min-h-28 whitespace-pre-wrap`;
const readOnlySingleLineFieldClassName =
  `${modalReadOnlyInputClassName} flex h-14 items-center`;
const readOnlyTagFieldClassName =
  `${readOnlySingleLineFieldClassName} overflow-hidden`;
const editableFieldBaseClassName =
  "w-full rounded-[1rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,243,0.88))] px-4 text-sm text-[#4a1921] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] outline-none transition placeholder:text-[#9b7d84] focus:border-[#d4a017]";
const editableInputBaseClassName = `${editableFieldBaseClassName} h-14`;
const editableTextAreaBaseClassName =
  `${editableFieldBaseClassName} min-h-28 resize-none py-3`;

const splitRoleName = (value = "") => {
  const trimmed = typeof value === "string" ? value.trim() : "";

  if (!trimmed) {
    return { tag: "", name: "" };
  }

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

const normalizeRoleNameValue = (value) =>
  typeof value === "string" ? value.toLowerCase() : "";

const getEditableInputClassName = (hasError) =>
  `${editableInputBaseClassName} ${hasError ? "border-red-400 focus:border-red-500" : "border-[#7b0d15]/10"}`;

const getEditableTextAreaClassName = (hasError) =>
  `${editableTextAreaBaseClassName} ${
    hasError ? "border-red-400 focus:border-red-500" : "border-[#7b0d15]/10"
  }`;

export default function RoleModal({ open, mode, role, tagOptions = [], isTagOptionsLoading = false, onClose, onSubmit }) {
  const isCreateMode = mode === "create";
  const isViewMode = mode === "view";
  const modalTitle =
    mode === "create" ? "Create Role" : mode === "edit" ? "Edit Role" : "View Role";
  const modalDescription =
    mode === "create"
      ? "Define a new role."
      : mode === "edit"
        ? "Modify the role's name and description."
        : "View the role's information.";
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
    if (!open) {
      return;
    }

    if (mode === "create") {
      setSelectedTags([]);
      setRoleName("");
      setDescription("");
    } else {
      const parsedRoleName = splitRoleName(role?.role_name || "");
      setSelectedTags(parsedRoleName.tag ? [parsedRoleName.tag] : []);
      setRoleName(normalizeRoleNameValue(parsedRoleName.name));
      setDescription(role?.description || "");
    }

    setError("");
    setTouched({
      tags: false,
      name: false,
      description: false,
    });
  }, [mode, open, role]);

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

  const clearAlertError = () => {
    if (error) {
      setError("");
    }
  };

  const setFieldTouched = (field) => {
    setTouched((current) => ({ ...current, [field]: true }));
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
    const normalizedTags = (Array.isArray(values) ? values : [])
      .map((value) => normalizeTagValue(value))
      .filter(Boolean);

    const latestTag = normalizedTags[normalizedTags.length - 1] || "";
    setSelectedTags(latestTag ? [latestTag] : []);
    setFieldTouched("tags");
    clearAlertError();
  };

  const handleRoleNameChange = (value) => {
    setRoleName(normalizeRoleNameValue(value));
    clearAlertError();
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
    clearAlertError();
  };

  const hasSelectedTag = selectedTags.length > 0;
  const hasRoleName = Boolean(roleName.trim());

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isViewMode) {
      onClose();
      return;
    }

    setTouched({
      tags: true,
      name: true,
      description: true,
    });

    if (!validateForm()) {
      return;
    }

    const selectedTag = selectedTags[0];
    const normalizedName = normalizeRoleNameValue(roleName).trim();

    onSubmit({
      id: role?.id || Date.now(),
      role_name: `${selectedTag}:${normalizedName}`,
      description: description.trim(),
      created_at:
        role?.created_at || new Date().toISOString().slice(0, 10),
    });

    onClose();
  };

  if (!open) {
    return null;
  }

  return createPortal(
    <dialog open className={modalOverlayClassName}>
      <div className={modalBoxClassName}>
        <div className={`${modalHeaderClassName} !pb-6 sm:!pb-7`}>
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h3 className={modalHeaderTitleClassName}>{modalTitle}</h3>
              <p className={modalHeaderDescriptionClassName}>{modalDescription}</p>
            </div>

            <button type="button" className={modalCloseButtonClassName} onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form id="role-form" noValidate className={modalBodyClassName} onSubmit={handleSubmit}>
          <div className={modalBodyStackClassName}>
            <ErrorAlert message={error} onClose={() => setError("")} />

            <section className={modalSectionClassName}>
              <div className="space-y-5">
                <div>
                  <label className={modalLabelClassName}>
                    Role Name {!isViewMode && <span className="text-red-500">*</span>}
                  </label>

                  {isCreateMode && (
                    <p className={modalHelperTextClassName}>
                      Select a tag and enter the role name.
                    </p>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      {!isCreateMode ? (
                        <div className={readOnlyTagFieldClassName}>
                          {hasSelectedTag ? (
                            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#f8d24e]/45 bg-[#fff4dc] px-3 py-1 text-xs font-semibold text-[#7b0d15]">
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#fff1d0] text-[0.625rem] font-semibold text-[#7b0d15]">
                                {selectedTags[0].charAt(0).toUpperCase()}
                              </span>
                              <span className="truncate">{selectedTags[0]}</span>
                            </span>
                          ) : (
                            <span className="italic text-[#8f6f76]">No content</span>
                          )}
                        </div>
                      ) : (
                        <TagMultiSelect
                          options={mergedTagOptions}
                          selectedValues={selectedTags}
                          onChange={handleTagChange}
                          placeholder={
                            isTagOptionsLoading ? "Loading tags..." : "Select tag"
                          }
                        />
                      )}
                      {isCreateMode && touched.tags && fieldErrors.tags && (
                        <p className="mt-2 text-xs text-red-500">{fieldErrors.tags}</p>
                      )}
                    </div>

                    <div>
                      {isViewMode ? (
                        <div className={readOnlySingleLineFieldClassName}>
                          {hasRoleName ? (
                            <span className="truncate">{roleName}</span>
                          ) : (
                            <span className="italic text-[#8f6f76]">No content</span>
                          )}
                        </div>
                      ) : (
                        <input type="text" required value={roleName}
                          onChange={(event) =>
                            handleRoleNameChange(event.target.value)
                          }
                          onBlur={() => setFieldTouched("name")}
                          placeholder="(e.g., superadmin)"
                          autoCapitalize="none"
                          className={getEditableInputClassName(
                            touched.name && Boolean(fieldErrors.name),
                          )}
                        />
                      )}
                      {!isViewMode && touched.name && fieldErrors.name && (
                        <p className="mt-2 text-xs text-red-500">{fieldErrors.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className={modalSectionClassName}>
              <div>
                <label className={modalLabelClassName}>
                  Role Description {!isViewMode && <span className="text-red-500">*</span>}
                </label>

                {isViewMode ? (
                  <div className={readOnlyTextAreaClassName}>
                    {description.trim() ? (
                      description
                    ) : (
                      <span className="italic text-[#8f6f76]">No content</span>
                    )}
                  </div>
                ) : (
                  <>
                    <textarea required value={description}
                      onChange={(event) =>
                        handleDescriptionChange(event.target.value)
                      }
                      onBlur={() => setFieldTouched("description")}
                      rows="4"
                      placeholder="Role description"
                      className={getEditableTextAreaClassName(
                        touched.description && Boolean(fieldErrors.description),
                      )}
                    />
                    {touched.description && fieldErrors.description && (
                      <p className="mt-2 text-xs text-red-500">
                        {fieldErrors.description}
                      </p>
                    )}
                  </>
                )}
              </div>
            </section>
          </div>
        </form>

        <div className={modalFooterClassName}>
          <div className={modalFooterActionsClassName}>
            <button type="button" className={modalSecondaryButtonClassName} onClick={onClose}>
              {isViewMode ? "Close" : "Cancel"}
            </button>

            {!isViewMode && (
              <button form="role-form" type="submit" className={modalPrimaryButtonClassName}>
                {mode === "create" ? "Create" : "Save"}
              </button>
            )}
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}