import React, { useState, useEffect } from "react";
import { formatTimestamp } from "../../utils/formatTimestamp";

export default function EditProfileModal({ open, close, profileData, updateProfile, addAuditLog, allowEmailEdit = false }) {
  const [profile, setProfile] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    username: "",
    email: "",
  });
  const [previewImage, setPreviewImage] = useState(""); // separate preview
  const [errors, setErrors] = useState([]); 
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setErrors([]);
      setSuccess(false);
      if (profileData) {
        setProfile(profileData);
      }
    }
  }, [open, profileData]);

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };


  const handleSave = () => {
    const validationErrors = [];
    
    if (!profile.firstName) validationErrors.push("First name is required.");
    if (!profile.lastName) validationErrors.push("Last name is required.");
    if (!profile.username) validationErrors.push("Username is required.");
    if (allowEmailEdit && !profile.email) validationErrors.push("Email is required.");

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setSuccess(false);
      return;
    }
    setErrors([]);
    
    // Update parent state
    if (updateProfile) updateProfile(profile);

    // Add audit log
    if (addAuditLog) {
      addAuditLog({
        timestamp: formatTimestamp(new Date().toISOString()),
        action: "PROFILE_UPDATE",
        details: "Updated profile information",
        color: "blue",
      });
    } 

    setSuccess(true);

    close();
  };

  if (!open) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <div className="bg-linear-to-r from-[#991b1b] to-red-600 p-6 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Edit Profile</h3>
              <p className="text-white/90 mt-1">Update your personal information</p>
            </div>
            <button className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20" onClick={close}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <form className="space-y-6">

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input type="text" name="firstName" placeholder="Enter first name" value={profile.firstName} onChange={handleChange} className="input input-bordered w-full h-12 rounded-lg bg-transparent border-gray-300 text-base" required maxLength={50}/>
                <p className="text-xs text-gray-500">Max 50 characters</p>
              </div>
              {/* Middle Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Middle Name
                </label>
                <input type="text" name="middleName" placeholder="Enter middle Name" value={profile.middleName} onChange={handleChange} className="input input-bordered w-full h-12 rounded-lg bg-transparent border-gray-300 text-base" maxLength={50}/>
                <p className="text-xs text-gray-500">Optional</p>
              </div>
              {/* Last Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input type="text" name="lastName" placeholder="Enter last Name" value={profile.lastName} onChange={handleChange} className="input input-bordered w-full h-12 rounded-lg bg-transparent border-gray-300 text-base" required maxLength={50}/>
                <p className="text-xs text-gray-500">Max 50 characters</p>
              </div>
            </div>
            {/* Username*/}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                  Username <span className="text-red-500">*</span>
              </label>
              <input type="text" name="username" placeholder="username" value={profile.username} onChange={handleChange} className="input input-bordered w-full h-12 rounded-lg bg-transparent border-gray-300 text-base" required maxLength={255}/>
              <p className="text-xs text-gray-500">Must be unique</p>
            </div>
            {/* Email*/}
            {allowEmailEdit && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input type="email" name="email" placeholder="Enter email" value={profile.email} onChange={handleChange} className="input input-bordered w-full h-12 rounded-lg bg-transparent border-gray-300 text-base" required/>
                <p className="text-xs text-gray-500">Must be an active email account</p>
              </div>
            )}
            {/* Validation Errors */}
            {errors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2 text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium">Please fix the following errors:</p>
                      <ul className="list-disc list-inside text-sm mt-1">
                        {errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                </div>
              </div>
            )}
          </form>
        </div>
        {/* Modal Footer - Fixed at Bottom */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
            <div className="text-sm text-gray-500">
              Fields marked with <span className="text-red-500">*</span> are required
            </div>
            <div className="flex flex-wrap gap-3">
                <button type="button" className="btn h-12 rounded-lg btn-outline text-[#991b1b] border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]" onClick={close}>
                    Cancel
                </button>
                <button type="button" className="btn h-12 rounded-lg bg-[#991b1b] text-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b]" onClick={handleSave}>
                    Save Changes
                </button>
            </div>
          </div>
        </div>
      </div>
      {/* DaisyUI modal backdrop */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={close}>close</button>
      </form>
    </dialog>
  );
}
