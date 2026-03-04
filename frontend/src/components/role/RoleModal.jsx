import React, { useState, useEffect } from "react";
import ErrorAlert from "../ErrorAlert";

export default function RoleModal({ open, mode, role, onClose, onSubmit }) {
    const [roleName, setRoleName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (!open) return;

        if (mode === "create") {
            setRoleName("");
            setDescription("");
        } else {
            setRoleName(role?.role_name || "");
            setDescription(role?.description || "");
        }

        setError("");
        setTouched(false);
    }, [mode, role, open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === "view") return onClose();

        setTouched(true);

        if (!roleName.trim() || !description.trim()) {
            setError("Role name and description are required.");
            return;
        }

        setError("");

        onSubmit({
            id: role?.id || Date.now(),
            role_name: roleName.trim(),
            description: description.trim(),
            created_at: role?.created_at || new Date().toISOString().slice(0, 10),
        });

        onClose();
    };

    if (!open) return null;

    const isRoleNameInvalid = touched && !roleName.trim();
    const isDescriptionInvalid = touched && !description.trim();
    
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
                        {(mode === "view" || mode === "edit") && (
                            <div className="space-y-0.5">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Role Id
                                </label>
                                <input type="text" value={role?.id} placeholder="Role ID" readOnly className="input w-full rounded-lg border bg-gray-100 text-gray-700 border-gray-300"/>
                            </div>
                        )}

                        <div className="space-y-0.5">
                            <label className="block text-sm font-semibold text-gray-700">
                                Role Name<span className="text-red-500"> *</span>
                            </label>
                            <input type="text" required={mode !== "view"} value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="(e.g., idp:superadmin)" className={`input validator w-full rounded-lg ${ mode === "view" ? "bg-gray-100 border-gray-300 text-gray-700" : "bg-transparent border-gray-200 text-gray-700" }`} disabled={mode === "view"}/>
                            {mode !== "view" && (
                                <div className="validator-hint">Role name is required</div>
                            )}
                        </div>

                        <div className="space-y-0.5">
                            <label className="block text-sm font-semibold text-gray-700">
                                Role Description<span className="text-red-500"> *</span>
                            </label>
                            <textarea required={mode !== "view"} value={description} onChange={(e) => setDescription(e.target.value)} rows="3" placeholder="Role description" className={`textarea validator w-full rounded-lg resize-none ${ mode === "view" ? "bg-gray-100 border-gray-300 text-gray-700" : "bg-transparent border-gray-200 text-gray-700" }`} disabled={mode === "view"}/>
                            {mode !== "view" && (
                                <div className="validator-hint">Role description is required</div>
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
                        {mode !== "view" && (
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