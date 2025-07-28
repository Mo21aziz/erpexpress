// src/layouts/MainLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/common/sidebar/Sidebar";
import { Header } from "@/components/common/header/header";

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar - always rendered but width changes */}
      <div className="hidden md:block">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Mobile Sidebar Overlay - only when open */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={toggleSidebar}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar isOpen={true} toggleSidebar={toggleSidebar} />
          </div>
        </div>
      )}

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
