import { ReactNode, useState } from "react";
import { FiSidebar, FiX } from "react-icons/fi";

interface Props {
  children: ReactNode;
  header: ReactNode;
  sidebar: ReactNode;
}

function HeaderSideBarLayout(props: Props) {
  const { header, sidebar, children } = props;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-gray-700/60 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-center px-4 py-3">
          <div className="flex flex-1 items-center space-x-4 mx-auto max-w-7xl">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            >
              {sidebarOpen ? <FiX size={20} /> : <FiSidebar size={20} />}
            </button>
            {header}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
          fixed inset-y-0 left-0 z-40 w-80 bg-white/90 dark:bg-gray-900/95 backdrop-blur-md border-r border-slate-200/60 dark:border-gray-700/60
          transform transition-transform duration-300 ease-in-out
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
          ${!sidebarOpen ? "-translate-x-full" : ""}
          mt-16
        `}
        >
          <div className="flex flex-col h-full">
            <nav className="flex-1 px-4 py-6 space-y-2">{sidebar}</nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-0 lg:ml-80">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default HeaderSideBarLayout;
