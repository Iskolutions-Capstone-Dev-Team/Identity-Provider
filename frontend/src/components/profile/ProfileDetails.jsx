export default function ProfileDetails({ profile }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Username
                </label>
                <div className="input input-bordered border-gray-300 h-12 rounded-lg text-base w-full bg-gray-50 flex items-center">
                    <span className="text-gray-800" id="usernameValue">{profile.username}</span>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    First Name
                </label>
                <div className="input input-bordered border-gray-300 h-12 rounded-lg text-base w-full bg-gray-50 flex items-center">
                    <span className="text-gray-800" id="firstName">{profile.firstName}</span>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Middle Name
                </label>
                <div className="input input-bordered border-gray-300 h-12 rounded-lg text-base w-full bg-gray-50 flex items-center">
                    <span className="text-gray-800" id="middleName">{profile.middleName}</span>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Last Name
                </label>
                <div className="input input-bordered border-gray-300 h-12 rounded-lg text-base w-full bg-gray-50 flex items-center">
                    <span className="text-gray-800" id="lastName">{profile.lastName}</span>
                </div>
            </div>

            <div className="md:col-span-2 mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Audit Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card bg-white shadow-lg rounded-2xl">
                        <div className="card-body p-4">
                            <h4 className="card-title text-sm text-gray-500">Created At</h4>
                            <p className="text-gray-800 font-medium text-base" id="createdAt">2023-08-15 10:30:45</p>
                        </div>
                    </div>
                    <div className="card bg-white shadow-lg rounded-2xl">
                        <div className="card-body p-4">
                            <h4 className="card-title text-sm text-gray-500">Updated At</h4>
                            <p className="text-gray-800 font-medium text-base" id="updatedAt">2024-01-20 14:25:10</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}