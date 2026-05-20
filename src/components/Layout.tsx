import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  School,
  Bell
} from 'lucide-react';

export function Layout({ children }: { children: ReactNode }) {
  const { currentUser, logout, schools } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const currentSchool = isSuperAdmin
    ? null
    : schools.find(s => s.id === currentUser?.school_id);

  const superAdminMenu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/super-admin' },
    { name: 'Add School', icon: School, path: '/super-admin/add-school' },
  ];

  const schoolAdminMenu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/school-admin' },
    { name: 'Students', icon: Users, path: '/school-admin/students' },
    { name: 'Collect Fee', icon: CreditCard, path: '/school-admin/collect-fee' },
    { name: 'Pending Fees', icon: Bell, path: '/school-admin/pending-fees' },
    { name: 'Reports', icon: FileText, path: '/school-admin/reports' },
    { name: 'Settings', icon: Settings, path: '/school-admin/settings' },
  ];

  const menu = isSuperAdmin ? superAdminMenu : schoolAdminMenu;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 text-xl font-bold text-blue-600">
          <School size={28} />
          <span>Fee Manager</span>
        </div>
        {!isSuperAdmin && currentSchool && (
          <div className="mt-2 text-sm text-gray-600 font-medium">
            {currentSchool.school_name}
          </div>
        )}
        {isSuperAdmin && (
          <div className="mt-2 text-sm text-gray-600 font-medium">
            Super Admin
          </div>
        )}
      </div>
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {menu.map((item) => {
          const isActive = location.pathname === item.path ||
                           (location.pathname.startsWith(item.path) && item.path !== '/super-admin' && item.path !== '/school-admin');
          return (
            <button
              key={item.name}
              onClick={() => {
                navigate(item.path);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
              {item.name}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-gray-800 bg-opacity-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col z-50 transform transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
             <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2 text-lg font-bold text-blue-600">
            <School size={24} />
            <span>Fee Manager</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600 p-2">
            <Menu size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
