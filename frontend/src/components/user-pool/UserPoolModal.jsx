import { useEffect, useState } from "react";
import MultiSelect from "../MultiSelect";
import { useAllRoles } from "../../hooks/useAllRoles";

export default function UserPoolModal({ open, mode, user, onClose }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("active");
  const [selectedUser, setSelectedUser] = useState(null);
  const roles = useAllRoles();
  const isView = mode === "view";

  useEffect(() => {
    if (!user) {
      setSelectedUser(null);
      setEmail("");
      setStatus("active");
      return;
    }

    setSelectedUser({
      ...user,
      roleIds:
        user.roleIds ??
        roles
          .filter((role) => user.roles?.includes(role.role_name))
          .map((role) => role.id),
    });
    setEmail(user.email || "");
    setStatus((user.status || "active").toLowerCase());
  }, [user, roles]);

  if (!open) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-xl max-h-[85vh] p-0 overflow-hidden flex flex-col">
        <div className="bg-linear-to-r from-[#991b1b] to-red-600 p-6 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">
                {mode === "edit" ? "Edit User" : "View User"}
              </h3>
              <p className="text-white/90 mt-1">
                {mode === "edit" ? "Update user account information" : "User account details"}
              </p>
            </div>
            <button className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20" onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <form id="user-pool-form" className="flex-1 overflow-y-auto p-6 bg-white space-y-4">
          {(isView || mode === "edit") && (
            <div className="space-y-0.5">
              <label className="block text-sm font-semibold text-gray-700">
                User ID
              </label>
              <input
                type="text"
                value={selectedUser?.id || ""}
                placeholder="User ID"
                readOnly
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700"
              />
            </div>
          )}
          <div className="space-y-0.5">
            <label className="block text-sm font-semibold text-gray-700">
              Email {!isView && <span className="text-red-500">*</span>}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isView}
              className={`input w-full rounded-lg ${
                isView
                  ? "border border-gray-300 bg-gray-100 text-gray-700"
                  : "border border-gray-200 bg-transparent text-gray-700"
              }`}
              placeholder="Email"
              required
            />
          </div>

          <div className="space-y-0.5">
            <label className="block text-sm font-semibold text-gray-700">
              First Name {!isView && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={selectedUser?.givenName || ""}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  givenName: e.target.value,
                })
              }
              disabled={isView}
              className={`input w-full rounded-lg ${
                isView
                  ? "border border-gray-300 bg-gray-100 text-gray-700"
                  : "border border-gray-200 bg-transparent text-gray-700"
              }`}
              placeholder="First Name"
              required
            />
          </div>

          <div className="space-y-0.5">
            <label className="block text-sm font-semibold text-gray-700">
              Middle Name
            </label>
            <label
              className={`input flex w-full items-center gap-2 rounded-lg ${
                isView
                  ? "border border-gray-300 bg-gray-100 text-gray-700"
                  : "border border-gray-200 bg-transparent text-gray-700"
              }`}
            >
              <input
                type="text"
                name="middleName"
                value={selectedUser?.middleName || ""}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    middleName: e.target.value,
                  })
                }
                placeholder="Middle Name"
                disabled={isView}
                className="grow bg-transparent disabled:bg-transparent"
              />
              <span className="badge badge-neutral badge-xs shrink-0">Optional</span>
            </label>
          </div>

          <div className="space-y-0.5">
            <label className="block text-sm font-semibold text-gray-700">
              Last Name {!isView && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={selectedUser?.surname || ""}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  surname: e.target.value,
                })
              }
              disabled={isView}
              className={`input w-full rounded-lg ${
                isView
                  ? "border border-gray-300 bg-gray-100 text-gray-700"
                  : "border border-gray-200 bg-transparent text-gray-700"
              }`}
              placeholder="Last Name"
              required
            />
          </div>

          <div className="space-y-0.5">
            <label className="block text-sm font-semibold text-gray-700">
              Role {!isView && <span className="text-red-500">*</span>}
            </label>
            {isView ? (
              <div className="w-full min-h-24 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-700">
                {selectedUser?.roles?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUser.roles.map((role, index) => (
                      <span
                        key={`${role}-${index}`}
                        className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-xs font-medium"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 italic">No content</span>
                )}
              </div>
            ) : (
              <MultiSelect
                options={roles}
                selectedValues={selectedUser?.roleIds || []}
                onChange={(ids) =>
                  setSelectedUser((current) =>
                    current
                      ? {
                          ...current,
                          roleIds: ids,
                          roles: roles
                            .filter((role) => ids.includes(role.id))
                            .map((role) => role.role_name),
                        }
                      : current,
                  )
                }
                placeholder="Select roles"
                required
              />
            )}
          </div>
          
          <div className="space-y-0.5">
            <label className="block text-sm font-semibold text-gray-700">
              Status {!isView && <span className="text-red-500">*</span>}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isView}
              className={`select w-full rounded-lg ${
                isView
                  ? "border border-gray-300 bg-gray-100 text-gray-700 cursor-not-allowed"
                  : "border border-gray-200 bg-white text-gray-700"
              }`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </form>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 shrink-0">
          <div className="flex justify-end gap-3">
            <button type="button" className="btn h-12 rounded-lg btn-outline text-[#991b1b] border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
