export default function SuccessStep({ onClose }) {
    return (
        <div className="custom-scrollbar">
            <div className="bg-linear-to-r from-green-600 to-green-500 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold">Success!</h3>
                        <p className="text-white/90 mt-1">Password changed successfully</p>
                    </div>
                </div>
            </div>
            <div class="p-6 bg-white">
                <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">Password Updated</h4>
                    <p className="text-gray-600 mb-6">
                        Your password has been changed successfully. You will be logged out automatically for security reasons.
                    </p>
        
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-left">
                                <p className="text-sm text-blue-800">
                                <span className="font-semibold">Security Note:</span> For security purposes, you'll need to log in again with your new password on your next session.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">Security Activity Logged</h5>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="text-left">
                                    <p className="text-sm font-medium text-gray-800">Password Change</p>
                                    <p className="text-xs text-gray-500">Just now</p>
                                </div>
                                <span className="badge badge-sm bg-green-100 text-green-800 border-0">
                                    Completed
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-center w-full">
                    <button type="button" className="btn h-12 rounded-lg bg-[#991b1b] text-white border-[#991b1b] hover:bg-[#ffd700] hover:border-[#ffd700] hover:text-[#991b1b] px-8" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}