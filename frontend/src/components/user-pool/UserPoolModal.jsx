import { useEffect, useState } from "react";
import MultiSelect from "../MultiSelect";
import { useAllRoles } from "../../hooks/useAllRoles";

export default function UserPoolModal({ open, mode, user, onClose }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("active");
  const [selectedUser, setSelectedUser] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const roles = useAllRoles();

  const processFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (mode !== "view") setIsDragging(true);;
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (mode !== "view") {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  useEffect(() => {
    if (!user) return;

    setSelectedUser({
      ...user,
      roleIds:
        user.roleIds ??
        roles
        .filter(r => user.roles?.includes(r.role_name))
        .map(r => r.id),
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;

    setUsername(user.username || "");
    setEmail(user.email || "");
    setStatus((user.status || "active").toLowerCase());
    if (user.image) {
      setImagePreview(user.image.startsWith("data:")
          ? user.image
          : `${import.meta.env.VITE_BACKEND_URL}${user.image}`
      );
    } else {
      setImagePreview(null);
    }
  }, [user]);

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
          {(mode === "view" || mode === "edit") && (
            <div className="space-y-0.5">
              <label className="block text-sm font-semibold text-gray-700">
                User ID
              </label>
              <input type="text" value={selectedUser?.id || ""} placeholder="User ID" readOnly className="w-full px-3 py-2 rounded-md border bg-gray-100 text-gray-700 border-gray-300"/>
            </div>
          )}
          <div className="space-y-1.5 mb-4">
            <label className="block text-base font-semibold text-gray-700">User Picture</label>
            <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-all duration-200 ${
                isDragging ? "border-[#991b1b] bg-red-50" : "border-gray-300 bg-gray-50"
                } ${mode === "view" ? "border-gray-200 cursor-default" : "hover:bg-gray-100 cursor-pointer"}`}
            >
              {!imagePreview ? (
                <label className={`flex flex-col items-center justify-center w-full h-full ${ mode === "view" ? "cursor-default" : "cursor-pointer"}`}>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                          <span className="font-semibold text-[#991b1b]">Click to upload</span>{" "}or drag and drop
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase mt-1">PNG or JPG</p>
                    </div>
                    <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange} disabled={mode === "view"}/>
                </label>
              ) : (
                <div className="relative w-full h-full p-2 flex items-center justify-center">
                  <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg cursor-zoom-in" onClick={() => setShowFullImage(true)}/>
                  {mode !== "view" && (
                    <button type="button" onClick={removeImage} className="absolute top-2 right-2 btn btn-circle btn-xs bg-white border-[#991b1b]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#991b1b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-0.5">
            <label className="block text-sm font-semibold text-gray-700">
              Username
            </label>
            <label className={`input flex items-center rounded-lg border gap-2 w-full ${
              mode === "view"  
              ? "bg-gray-100 text-gray-700 border-gray-700" 
              : "bg-transparent border-gray-700 text-gray-700 focus-within:ring-1 focus-within:ring-[#991b1b] focus-within:border-[#991b1b]"}`}>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                disabled={mode === "view"}
                className="grow bg-transparent"
              />
              <span className="badge badge-neutral badge-xs">Optional</span>
            </label>
          </div>

          <div className="space-y-0.5">
            <label className="block text-sm font-semibold text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              disabled={mode === "view"}
              className={`w-full px-3 py-2 rounded-lg border ${
                mode === "view" ? "bg-gray-100 text-gray-700" : "bg-transparent text-gray-700 focus:ring-2 focus:ring-[#991b1b]"
              }`}
              placeholder="Email"
              required
            />
          </div>

          <div className="space-y-0.5">
            <label className="block text-sm font-semibold text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <input type="text" value={selectedUser?.givenName || ""} onChange={(e) => setSelectedUser({...selectedUser, givenName: e.target.value})}
              disabled={mode === "view"}
              className={`w-full px-3 py-2 rounded-lg border ${
                mode === "view" ? "bg-gray-100 text-gray-700" : "bg-transparent text-gray-700 focus:ring-2 focus:ring-[#991b1b]"
              }`}
              placeholder="First Name"
              required
            />
          </div>

          <div className="space-y-0.5">
            <label className="block font-medium mb-1 text-black text-base">
              Middle Name
            </label>
            <label className={`input flex items-center rounded-lg border gap-2 w-full ${
              mode === "view"  
              ? "bg-gray-100 text-gray-700 border-gray-700" 
              : "bg-transparent border-gray-700 text-gray-700 focus-within:ring-1 focus-within:ring-[#991b1b] focus-within:border-[#991b1b]"}`}>
              <input type="text" name="middleName" value={selectedUser?.middleName || ""} onChange={(e) => setSelectedUser({...selectedUser, middleName: e.target.value})}
                placeholder="Enter middle name"
                disabled={mode === "view"}
                className="grow bg-transparent"
              />
              <span className="badge badge-neutral badge-xs">Optional</span>
            </label>
          </div>

          <div className="space-y-0.5">
            <label className="block text-sm font-semibold text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input type="text" value={selectedUser?.surname || ""} onChange={(e) => setSelectedUser({...selectedUser, surname: e.target.value})}
              disabled={mode === "view"}
              className={`w-full px-3 py-2 rounded-lg border ${
                mode === "view" ? "bg-gray-100 text-gray-700" : "bg-transparent text-gray-700 focus:ring-2 focus:ring-[#991b1b]"
              }`}
              placeholder="Last Name"
              required
            />
          </div>

          <div className="space-y-0.5">
            <label className="block text-sm font-semibold text-gray-700">
              Role <span className="text-red-500">*</span>
            </label>

            <div className={`rounded-lg border ${
                mode === "view" 
                  ? "bg-gray-100 text-gray-700 p-2 min-h-10.5" 
                  : "bg-transparent text-gray-700 focus:ring-2 focus:ring-[#991b1b]"
              }`}>
              
              {mode === "view" ? (
                <div className="flex flex-wrap gap-1">
                  {selectedUser?.roles.map((role, i) => (
                    <span
                      key={i}
                      className="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-xs font-medium"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              ) : (
                <MultiSelect
                  options={roles}
                  selectedValues={selectedUser?.roleIds || []}
                  onChange={(ids) =>
                    setSelectedUser({
                      ...selectedUser,
                      roleIds: ids,
                      roles: roles
                        .filter(r => ids.includes(r.id))
                        .map(r => r.role_name),
                    })
                  }
                  placeholder="Select roles"
                  required
                />
              )}
            </div>
          </div>
          
          <div className="space-y-0.5">
            <label className="block text-sm font-semibold text-gray-700">
              Status <span className="text-red-500">*</span>
            </label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              disabled={mode === "view"}
              className={`select border rounded-lg w-full border-gray-700 text-gray-700 ${
                mode === "view" ? "bg-gray-100 cursor-not-allowed" : "bg-white focus:ring-2 focus:ring-[#991b1b]"
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