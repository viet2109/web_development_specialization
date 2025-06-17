import { ReactNode, useState } from "react";
import { FiMenu, FiSidebar, FiX } from "react-icons/fi";

interface Props {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
  rightbar?: ReactNode;
}

function HeaderSidebarRightbarLayout(props: Props) {
  const { header, sidebar, rightbar, children } = props;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightbarOpen, setRightbarOpen] = useState(false);

  // Chỉ hiển thị các toggle button khi có sidebar tương ứng
  const hasHeader = !!header;
  const hasSidebar = !!sidebar;
  const hasRightbar = !!rightbar;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header - chỉ hiển thị khi có header */}
      {hasHeader && (
        <header className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-gray-700/60 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center justify-between p-4 px-5">
            <div className="flex items-center space-x-4">
              {/* Left sidebar toggle - chỉ hiển thị khi có sidebar */}
              {hasSidebar && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 mr-2"
                >
                  {sidebarOpen ? <FiX size={20} /> : <FiSidebar size={20} />}
                </button>
              )}
            </div>

            {/* Header content - centered */}
            <div className="flex-1 flex justify-center">
              <div className="flex-1">{header}</div>
            </div>

            {/* Right sidebar toggle - chỉ hiển thị khi có rightbar */}
            <div className="flex items-center space-x-4">
              {hasRightbar && (
                <button
                  onClick={() => setRightbarOpen(!rightbarOpen)}
                  className="xl:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                >
                  {rightbarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      <div className="flex">
        {/* Left Sidebar - chỉ hiển thị khi có sidebar */}
        {hasSidebar && (
          <aside
            className={`
            fixed inset-y-0 left-0 z-40 w-80 bg-white/90 dark:bg-gray-900/95 backdrop-blur-md border-r border-slate-200/60 dark:border-gray-700/60
            transform transition-transform duration-300 ease-in-out
            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
            ${hasHeader ? "mt-16" : "mt-0"}
          `}
          >
            <div className="flex flex-col h-full">
              <nav className="flex-1 px-4 py-6">{sidebar}</nav>
              
            </div>
          </aside>
        )}

        {/* Main Content - điều chỉnh margin dựa trên việc có sidebar hay không */}
        <main
          className={`
            flex-1
            ${hasSidebar ? "ml-0 lg:ml-80" : "ml-0"}
            ${hasRightbar ? "mr-0 xl:mr-80" : "mr-0"}
          `}
        >
          <div className="p-6 lg:p-8">{children}</div>
        </main>

        {/* Right Sidebar - chỉ hiển thị khi có rightbar */}
        {hasRightbar && (
          <aside
            className={`
            fixed inset-y-0 right-0 z-40 w-80 bg-white/90 dark:bg-gray-900/95 backdrop-blur-md border-l border-slate-200/60 dark:border-gray-700/60
            transform transition-transform duration-300 ease-in-out
            ${
              rightbarOpen
                ? "translate-x-0"
                : "translate-x-full xl:translate-x-0"
            }
            ${hasHeader ? "mt-16" : "mt-0"}
          `}
          >
            <div className="flex flex-col h-full">
              <nav className="flex-1 px-4 py-6 space-y-2">{rightbar}</nav>
            </div>
          </aside>
        )}
      </div>

      {/* Mobile Overlays - chỉ hiển thị khi cần thiết */}
      {hasSidebar && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {hasRightbar && rightbarOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-30 xl:hidden"
          onClick={() => setRightbarOpen(false)}
        />
      )}
    </div>
  );
}

export default HeaderSidebarRightbarLayout;
