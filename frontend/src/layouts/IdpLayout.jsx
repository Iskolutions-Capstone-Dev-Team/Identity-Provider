import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import useSidebarState from "../hooks/useSidebarState";

export default function IdpLayout() {
  const { sidebarOpen, toggleSidebar, closeSidebar } = useSidebarState();

  return (
    <div className="flex min-h-screen bg-gray-200 text-gray-800 font-[Poppins]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <div className="flex-1 flex flex-col transition-all duration-300">
        <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 sm:p-6 pb-28 lg:pb-6"><Outlet /></main>
      </div>
    </div>
  );
}