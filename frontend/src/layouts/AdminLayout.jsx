// frontend/src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import { 
  FaBell, 
  FaUserCircle, 
  FaSearch, 
  FaCog,
  FaEnvelope,
  FaSignOutAlt,
  FaMoon,
  FaSun
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Mock notifications
  useEffect(() => {
    setNotifications([
      { id: 1, message: 'New deposit request from John Smith', time: '2 min ago', read: false },
      { id: 2, message: 'Withdrawal approved for Sarah Johnson', time: '15 min ago', read: false },
      { id: 3, message: 'User verification pending: Mike Wilson', time: '1 hour ago', read: true },
    ]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-30 h-full`}>
          <AdminSidebar />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation */}
          <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
            <div className="px-6 py-3">
              <div className="flex items-center justify-between">
                {/* Left section */}
                <div className="flex items-center">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 lg:hidden"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h1 className="text-xl font-semibold text-gray-800 dark:text-white ml-3">
                    Admin Dashboard
                  </h1>
                </div>

                {/* Search */}
                <div className="hidden md:block flex-1 max-w-md mx-8">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users, transactions, trades..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Right section */}
                <div className="flex items-center space-x-4">
                  {/* Dark mode toggle */}
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
                  </button>

                  {/* Messages */}
                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative">
                    <FaEnvelope size={20} />
                    <span className="absolute top-0 right-0 h-4 w-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                      3
                    </span>
                  </button>

                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                    >
                      <FaBell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.map(notif => (
                            <div
                              key={notif.id}
                              className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                                !notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                              }`}
                            >
                              <p className="text-sm text-gray-800 dark:text-gray-200">{notif.message}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.time}</p>
                            </div>
                          ))}
                        </div>
                        <div className="p-2 text-center border-t border-gray-200 dark:border-gray-700">
                          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                            View all notifications
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Settings */}
                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FaCog size={20} />
                  </button>

                  {/* User menu */}
                  <div className="flex items-center space-x-3 pl-2 border-l border-gray-200 dark:border-gray-700">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Admin User</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Super Administrator</p>
                    </div>
                    <div className="relative group">
                      <FaUserCircle size={40} className="text-gray-600 dark:text-gray-300 cursor-pointer" />
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block">
                        <div className="p-2">
                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            Profile
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            Account Settings
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center"
                          >
                            <FaSignOutAlt className="mr-2" size={14} />
                            Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;