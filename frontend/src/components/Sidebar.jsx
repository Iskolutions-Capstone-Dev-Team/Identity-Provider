import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../auth/services/authService";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuSections = [
    {
      title: "IDENTITY MANAGEMENT",
      items: [
        {
          name: "User Pool",
          path: "/user-pool",
          iconPath:
            "M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z",
        },
        {
          name: "Roles",
          path: "/roles",
          iconPath:
            "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
        },
        {
          name: "App Client",
          path: "/app-client",
          iconPath:
            "M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418",
        },
      ],
    },
    {
      title: "AUDIT",
      items: [
        {
          name: "Audit Logs",
          path: "/audit-logs",
          iconPath:
            "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
        },
      ],
    },
  ];

  const mobileMenuItems = menuSections.flatMap((section) => section.items);

  const handleLogout = () => {
    navigate("/logout", { replace: true });
  };

  return (
    <>  
      <div className={`hidden lg:block shrink-0 transition-[width] duration-300 ease-in-out ${isOpen ? "w-64" : "w-20"}`}>
        <div className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-[#991b1b] border-red-900 transition-[width] duration-300 ease-in-out ${isOpen ? "w-64" : "w-20"}`}>
          <div className="h-24 flex items-center border-b border-red-900 px-3">
            <button onClick={toggleSidebar} className="flex items-center gap-2 w-full transition-all duration-300 ease-in-out">
              <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className={`object-contain transition-all duration-300 ease-in-out hover:scale-110 ${isOpen ? "h-16 w-16" : "h-14 w-14"}`}/>
              <div className={`flex flex-col transition-all duration-300 ease-in-out${isOpen ? "opacity-100 translate-x-0 ml-2" : "opacity-0 -translate-x-2 w-0 overflow-hidden"}`}>
                <h1 className="text-white text-3xl font-bold leading-tight">PUPTIDP</h1>
                <span className="inline-flex bg-[#ffd700] font-extrabold text-black px-2 rounded-md text-xs w-fit">ver.2026</span>
              </div>
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-5">
            {menuSections.map((section) => (
              <div key={section.title}>
                <div className="h-6 mb-2 px-3 overflow-hidden">
                  <p className={`text-xs font-extrabold tracking-widest text-red-200/80 uppercase whitespace-nowrap transition-opacity duration-200 ${
                    isOpen ? "opacity-100" : "opacity-0" }`}
                  >
                    {section.title}
                  </p>
                </div>
                <ul className="space-y-2">                                                                                                                                                                                                                                                                                                                                                       
                  {section.items.map((item, idx) => {
                    const isActive = location.pathname === item.path;

                    return (
                      <li key={`${section.title}-${idx}`} className="relative group">
                        <button onClick={() => {
                            navigate(item.path);
                            if (window.innerWidth < 1024) toggleSidebar();
                          }}
                          className={`flex items-center h-12 w-full rounded-2xl transition-all duration-300 ease-in-out overflow-hidden
                            ${isOpen ? "justify-start px-2" : "justify-center px-0"}
                            ${isActive ? "bg-[#ffd700] text-[#991b1b] shadow-lg" : "text-white hover:bg-[#7f1d1d]"}
                          `}
                        >
                          <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 transition-colors duration-300 ${isActive ? "text-[#991b1b]" : "text-white"}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath}/>
                            </svg>
                          </div>

                          <span className={`overflow-hidden whitespace-nowrap font-semibold transition-all duration-300 ease-in-out ${
                              isOpen ? "max-w-40 opacity-100 ml-3" : "w-0 opacity-0 ml-0"
                            } ${isActive ? "text-[#991b1b]" : ""}`}
                          >
                            {item.name}
                          </span>
                        </button>

                        {!isOpen && (
                          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded-md text-sm bg-[#991b1b] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                            {item.name}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-red-900 px-2 pb-2 pt-12">
            <button onClick={handleLogout} className={`flex items-center h-11 w-full rounded-2xl transition-all duration-300 ease-in-out overflow-hidden hover:bg-red-900
              ${isOpen ? "justify-start px-2" : "px-0 justify-center"}`}
            >
              <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white transition-all duration-300 ease-in-out">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                </svg>
              </div>
              <span className={`min-w-0 overflow-hidden whitespace-nowrap font-semibold text-white transition-all duration-300 ease-in-out
                  ${isOpen
                    ? "max-w-30 opacity-100 ml-3"
                    : "max-w-0 opacity-0 ml-0"
                  }
                `}
              >Logout</span>
            </button>
            {!isOpen && (
              <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded-md text-sm bg-[#991b1b] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">Logout</span>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-105">
        <div className="w-full px-2 py-2 gap-2 rounded-3xl bg-[#991b1b]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.45)] border border-[#991b1b] flex items-center justify-between">
          {mobileMenuItems.map((item, idx) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className={`flex-1 flex items-center justify-center p-2 rounded-3xl transition-all duration-300
                  ${isActive
                    ? "bg-[#ffd700] text-[#991b1b] shadow-[0_0_14px_rgba(185,28,28,0.6)]"
                    : "text-white/70 hover:text-white hover:bg-[#7f1d1d]"
                  }
                `}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath}/>
                </svg>
              </button>
            );
          })}
          <button onClick={handleLogout} className="flex-1 flex items-center justify-center p-2 rounded-2xl text-white/70 hover:text-white hover:bg-[#7f1d1d] transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
