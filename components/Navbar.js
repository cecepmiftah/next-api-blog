"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  FaBars,
  FaTimes,
  FaUser,
  FaSignOutAlt,
  FaPlus,
  FaHome,
  FaFileAlt,
  FaUsers,
  FaCog,
  FaSearch,
  FaBell,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { MdDashboard, MdCreate } from "react-icons/md";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Toggle dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".user-menu") &&
        !event.target.closest(".user-avatar")
      ) {
        setShowUserMenu(false);
      }
      if (
        !event.target.closest(".notifications-menu") &&
        !event.target.closest(".notification-bell")
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    if (isDarkMode) {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Navigation links
  const navLinks = [
    { href: "/", label: "Home", icon: <FaHome /> },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <MdDashboard />,
      requiresAuth: true,
    },
    { href: "/posts", label: "Posts", icon: <FaFileAlt /> },
    {
      href: "/posts/create",
      label: "Create",
      icon: <MdCreate />,
      requiresAuth: true,
    },
    // { href: "/users", label: "Users", icon: <FaUsers />, requiresAuth: true },
    // { href: "/editor", label: "Editor", icon: <FaFileAlt /> },
  ];

  // User menu items
  const userMenuItems = [
    { href: "/profile", label: "Profile", icon: <FaUser /> },
    { href: "/settings", label: "Settings", icon: <FaCog /> },
    { type: "divider" },
    { action: handleSignOut, label: "Sign Out", icon: <FaSignOutAlt /> },
  ];

  // Notification items (example)
  const notifications = [
    {
      id: 1,
      text: "New comment on your post",
      time: "5 min ago",
      unread: true,
    },
    {
      id: 2,
      text: "Post published successfully",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      text: "Welcome to our platform!",
      time: "2 days ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <>
      {/* Navbar Container */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50 shadow-xl"
            : "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo & Search */}
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>

              {/* Logo */}
              <Link href="/" className="ml-2 lg:ml-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">E</span>
                  </div>
                  <div className="hidden md:block">
                    <h1 className="text-md font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      EditorJS Blog
                    </h1>
                  </div>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center ml-10 space-x-1">
                {navLinks.map((link) => {
                  if (link.requiresAuth && !session) return null;

                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href));

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30"
                          : "text-slate-300 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <span className="text-base">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Section - Actions & User */}
            <div className="flex items-center space-x-3">
              {/* Search Bar (Desktop) */}
              <div className="hidden md:flex items-center relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search posts..."
                    className="w-64 pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label={
                  isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
              </button>

              {/* Create Post Button (Mobile) */}
              {session && (
                <Link
                  href="/create-post"
                  className="md:hidden p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-opacity"
                  aria-label="Create post"
                >
                  <FaPlus size={18} />
                </Link>
              )}

              {/* Notifications */}
              <div className="relative notification-bell">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative"
                  aria-label="Notifications"
                >
                  <FaBell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="notifications-menu absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-700">
                      <h3 className="text-lg font-bold text-white">
                        Notifications
                      </h3>
                      <p className="text-sm text-slate-400">
                        {unreadCount} unread
                      </p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-slate-700/50 hover:bg-slate-700/50 cursor-pointer ${
                            notification.unread ? "bg-blue-500/5" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-2 h-2 mt-2 rounded-full ${
                                notification.unread
                                  ? "bg-blue-500"
                                  : "bg-slate-600"
                              }`}
                            />
                            <div className="flex-1">
                              <p className="text-white">{notification.text}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-slate-900/50 border-t border-slate-700">
                      <Link
                        href="/notifications"
                        className="text-center block text-sm text-blue-400 hover:text-blue-300"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              {status === "loading" ? (
                <div className="w-10 h-10 rounded-full bg-slate-700 animate-pulse" />
              ) : session ? (
                <div className="relative user-avatar">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-800 transition-colors"
                    aria-label="User menu"
                  >
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-10 h-10 rounded-full border-2 border-slate-600"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold">
                          {session.user?.name?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-white">
                        {session.user?.name || "User"}
                      </p>
                      <p className="text-xs text-slate-400 truncate max-w-[120px]">
                        {session.user?.email || "user@example.com"}
                      </p>
                    </div>
                  </button>

                  {/* User Menu Dropdown */}
                  {showUserMenu && (
                    <div className="user-menu absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                      <div className="p-4 border-b border-slate-700">
                        <div className="flex items-center gap-3">
                          {session.user?.image ? (
                            <img
                              src={session.user.image}
                              alt={session.user.name || "User"}
                              className="w-12 h-12 rounded-full border-2 border-slate-600"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {session.user?.name?.charAt(0) || "U"}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white">
                              {session.user?.name || "User"}
                            </p>
                            <p className="text-sm text-slate-400 truncate">
                              {session.user?.email || "user@example.com"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        {userMenuItems.map((item, index) => {
                          if (item.type === "divider") {
                            return (
                              <div
                                key={`divider-${index}`}
                                className="my-2 border-t border-slate-700"
                              />
                            );
                          }

                          if (item.action) {
                            return (
                              <button
                                key={item.label}
                                onClick={item.action}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                              >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                              </button>
                            );
                          }

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                            >
                              <span>{item.icon}</span>
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-xl font-medium transition-opacity"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden ${isMenuOpen ? "block" : "hidden"}`}>
          <div className="px-4 pt-2 pb-4 space-y-2 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search posts..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                if (link.requiresAuth && !session) return null;

                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Info in Mobile Menu */}
            {session && (
              <div className="pt-4 mt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-3 px-4 py-3">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-12 h-12 rounded-full border-2 border-slate-600"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {session.user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-white">
                      {session.user?.name || "User"}
                    </p>
                    <p className="text-sm text-slate-400">
                      {session.user?.email || "user@example.com"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 mt-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl"
                  >
                    <FaUser />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl"
                  >
                    <FaCog />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl"
                  >
                    <FaSignOutAlt />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}

            {/* Auth Buttons in Mobile Menu */}
            {!session && (
              <div className="pt-4 mt-4 border-t border-slate-700/50">
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-medium text-center transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-xl font-medium text-center transition-opacity"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;
