import { useLocation, useNavigate } from "react-router-dom";

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

function SidebarIcon({ iconPath, isActive }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor"
      className={`h-5 w-5 shrink-0 transition duration-300 ${
        isActive ? "text-[#5a0b12]" : "text-current"
      }`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
    </svg>
  );
}

function SidebarTooltip({ label }) {
  return (
    <span className="pointer-events-none absolute left-full top-1/2 ml-3 hidden -translate-y-1/2 rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(123,13,21,0.96),rgba(43,3,7,0.98))] px-3 py-2 text-sm font-medium text-white opacity-0 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.95)] transition duration-200 group-hover:opacity-100 lg:block">
      {label}
    </span>
  );
}

function SidebarMenuItem({ isOpen, item, isActive, onClick }) {
  const buttonClassName = `flex h-14 w-full items-center overflow-hidden rounded-[1.35rem] border transition-all duration-300 ${
    isOpen ? "justify-start px-3" : "justify-center px-0"
  } ${
    isActive
      ? "border-[#f8d24e]/40 bg-[linear-gradient(135deg,rgba(248,210,78,0.96),rgba(255,215,0,0.86))] text-[#5a0b12] shadow-[0_22px_40px_-26px_rgba(248,210,78,0.95)]"
      : "border-white/8 bg-white/[0.03] text-white/80 hover:border-white/16 hover:bg-white/[0.1] hover:text-white"
  }`;

  const labelClassName = `min-w-0 overflow-hidden whitespace-nowrap text-left text-sm font-semibold tracking-[0.01em] transition-all duration-300 ${
    isOpen ? "ml-3 max-w-40 opacity-100" : "ml-0 max-w-0 opacity-0"
  }`;

  return (
    <li className="group relative">
      <button onClick={onClick} className={buttonClassName}>
        <SidebarIcon iconPath={item.iconPath} isActive={isActive} />
        <span className={labelClassName}>{item.name}</span>
      </button>
      {!isOpen ? <SidebarTooltip label={item.name} /> : null}
    </li>
  );
}

export default function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const railWidthClassName = isOpen ? "w-80" : "w-32";
  const sidebarWidthClassName = isOpen ? "w-72" : "w-24";

  const handleLogout = () => {
    navigate("/logout", { replace: true });
  };

  return (
    <>
      <div className={`hidden shrink-0 overflow-x-hidden transition-[width] duration-300 ease-out lg:block ${railWidthClassName}`}>
        <aside className={`fixed bottom-4 left-4 top-4 z-30 flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(123,13,21,0.97),rgba(43,3,7,0.98))] shadow-[0_32px_90px_-38px_rgba(15,23,42,0.95)] backdrop-blur-2xl transition-[width] duration-300 ease-out ${sidebarWidthClassName}`}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(248,210,78,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" />

          <div className="relative flex h-full flex-col">
            <div className="px-3 pt-3">
              <button onClick={toggleSidebar}
                className={`flex w-full items-center rounded-[1.6rem] border border-white/10 bg-white/[0.06] px-3 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-300 hover:border-[#f8d24e]/20 hover:bg-white/[0.1] ${
                  isOpen ? "gap-3" : "justify-center"
                }`}
              >
                <img src="/assets/images/IDP_Logo.png" alt="IDP Logo" className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_10px_18px_rgba(248,210,78,0.3)] transition duration-300 hover:scale-[1.03]"
                />

                <div className={`min-w-0 overflow-hidden transition-all duration-300 ${
                    isOpen
                      ? "max-w-44 translate-x-0 opacity-100"
                      : "max-w-0 -translate-x-2 opacity-0"
                  }`}
                >
                  <h1 className="truncate text-2xl font-bold tracking-[0.05em] text-white">
                    PUPTIDP
                  </h1>
                  <span className="mt-1 inline-flex rounded-full border border-[#f8d24e]/30 bg-[#f8d24e]/15 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#f8d24e]">
                    ver.2026
                  </span>
                </div>
              </button>
            </div>

            <div className="idp-sidebar-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 pb-4 pt-5">
              <div className="space-y-5">
                {menuSections.map((section) => (
                  <div key={section.title}>
                    <div className="mb-3 flex h-5 items-center overflow-hidden px-2">
                      <p
                        className={`whitespace-nowrap text-[0.65rem] font-semibold tracking-[0.28em] text-[#f8d24e]/70 transition-all duration-300 ${
                          isOpen
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-2 opacity-0"
                        }`}
                      >
                        {section.title}
                      </p>
                    </div>

                    <ul className="space-y-2">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.path;

                        return (
                          <SidebarMenuItem
                            key={item.path}
                            isOpen={isOpen}
                            item={item}
                            isActive={isActive}
                            onClick={() => navigate(item.path)}
                          />
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-3 pb-3 pt-2">
              <ul className="space-y-2">
                <SidebarMenuItem
                  isOpen={isOpen}
                  item={{
                    name: "Logout",
                    iconPath:
                      "M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15",
                  }}
                  isActive={false}
                  onClick={handleLogout}
                />
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed bottom-5 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-[28rem] -translate-x-1/2 lg:hidden">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(123,13,21,0.94),rgba(43,3,7,0.98))] p-2 shadow-[0_28px_60px_-28px_rgba(15,23,42,0.9)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(248,210,78,0.16),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_34%)]" />

          <div className="relative flex items-center gap-2">
            {mobileMenuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <button key={item.path} onClick={() => navigate(item.path)}
                  className={`relative flex flex-1 items-center justify-center py-3 text-white/70 transition-all duration-300 ${
                    isActive ? "text-[#f8d24e]" : "hover:text-white"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"
                    className={`h-5 w-5 transition-all duration-300 ${
                      isActive
                        ? "scale-110 drop-shadow-[0_0_14px_rgba(248,210,78,0.72)]"
                        : ""
                    }`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath}/>
                  </svg>
                  <span className={`absolute bottom-1 h-1.5 w-1.5 rounded-full bg-[#f8d24e] transition-all duration-300 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
              );
            })}

            <button onClick={handleLogout} className="flex flex-1 items-center justify-center py-3 text-white/70 transition-all duration-300 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}