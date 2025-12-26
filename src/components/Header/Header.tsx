import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

import { useAuth } from "../../hooks/useAuth";
import { getProfileImageUrl } from "../../utils/imageUtils";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownOpen(false);
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getAvatarDisplay = () => {
    if (user?.profilePicture) {
      return user.profilePicture;
    }
    return user?.name?.charAt(0).toUpperCase() || "U";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/tutorials", label: "Tutorials" },
    { to: "/editor", label: "Code Editor" },
    { to: "/contact", label: "Contact Us" },
  ];

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 md:py-7 bg-[#0a0e27] w-full relative border-b border-[#00b4d8]/20">
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl text-[#00b4d8]">&lt;/&gt;</span>
          <div className="font-bold text-xl md:text-2xl font-mono neon-text-cyan group-hover:neon-text-green transition-colors">
            LearnCode<span className="text-[#8b5cf6]">_</span>AI
          </div>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden lg:flex items-center gap-8 xl:gap-20 font-medium text-base xl:text-lg font-mono">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="text-[#6272a4] hover:text-[#00b4d8] transition-colors relative group"
          >
            <span className="group-hover:neon-text-cyan transition-all">
              {link.label.toLowerCase().replace(/ /g, "_")}
            </span>
          </Link>
        ))}
      </div>

      {/* Desktop Auth Section */}
      <div className="hidden lg:flex items-center gap-3">
        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            {/* Avatar Button */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              {user?.profilePicture &&
              getProfileImageUrl(user.profilePicture) ? (
                <img
                  src={getProfileImageUrl(user.profilePicture) || ""}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold border-2 border-gray-200">
                  {getAvatarDisplay()}
                </div>
              )}
              <svg
                className={`w-4 h-4 text-gray-600 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    {user?.profilePicture &&
                    getProfileImageUrl(user.profilePicture) ? (
                      <img
                        src={getProfileImageUrl(user.profilePicture) || ""}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {getAvatarDisplay()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {user?.name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {user?.email}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          user?.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user?.role?.charAt(0).toUpperCase()}
                        {user?.role?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/profile?tab=courses"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <span>My Courses</span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>Progress</span>
                  </Link>

                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-2"></div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              to="/signin"
              className="px-4 sm:px-6 py-2 neon-border-cyan bg-[#0a0e27] text-[#00b4d8] rounded font-mono hover:bg-[#1a1f3a] transition-colors font-medium text-sm sm:text-base"
            >
              login()
            </Link>
            <Link
              to="/signup"
              className="px-4 sm:px-6 py-2 bg-gradient-to-r from-[#00b4d8] to-[#8b5cf6] text-[#0a0e27] rounded font-mono hover:opacity-90 transition-opacity font-bold text-sm sm:text-base"
            >
              signup()
            </Link>
          </>
        )}
      </div>

      {/* Mobile: Menu Button + Profile */}
      <div className="lg:hidden flex items-center gap-2">
        <button
          onClick={() => {
            setMobileMenuOpen(!mobileMenuOpen);
            setDropdownOpen(false);
          }}
          className="flex items-center justify-center w-10 h-10 text-[#00b4d8]"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
        {isAuthenticated && (
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-1 relative"
          >
            {user?.profilePicture && getProfileImageUrl(user.profilePicture) ? (
              <img
                src={getProfileImageUrl(user.profilePicture) || ""}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold border-2 border-gray-200">
                {getAvatarDisplay()}
              </div>
            )}
            <svg
              className={`w-4 h-4 text-gray-600 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Mobile Dropdown Menu for Profile */}
      {isAuthenticated && dropdownOpen && (
        <div className="lg:hidden absolute right-4 top-16 mt-2 w-64 bg-[#1a1f3a] border border-[#00b4d8]/20 rounded-xl shadow-lg py-2 z-50 backdrop-blur-xl">
          {/* User Info */}
          <div className="px-4 py-3 w-full border-b border-[#00b4d8]/20">
            <div className="flex items-center space-x-3">
              {user?.profilePicture &&
              getProfileImageUrl(user.profilePicture) ? (
                <img
                  src={getProfileImageUrl(user.profilePicture) || ""}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#00b4d8]"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#8b5cf6] flex items-center justify-center text-[#0a0e27] font-bold text-lg">
                  {getAvatarDisplay()}
                </div>
              )}
              <div>
                <p className="font-semibold text-white font-mono">
                  {user?.name}
                </p>
                <p className="text-sm text-[#6272a4] font-mono">
                  {user?.email}
                </p>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-mono mt-1 ${
                    user?.role === "admin"
                      ? "bg-[#8b5cf6]/20 text-[#8b5cf6]"
                      : "bg-[#00b4d8]/20 text-[#00b4d8]"
                  }`}
                >
                  {user?.role?.charAt(0).toUpperCase()}
                  {user?.role?.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2 font-mono">
            <Link
              to="/profile"
              onClick={() => {
                setDropdownOpen(false);
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 px-4 py-3 text-[#6272a4] hover:text-[#00b4d8] hover:bg-[#0a0e27] transition-colors"
            >
              <span>👤</span>
              <span>my_profile</span>
            </Link>

            <Link
              to="/profile?tab=courses"
              onClick={() => {
                setDropdownOpen(false);
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 px-4 py-3 text-[#6272a4] hover:text-[#00b4d8] hover:bg-[#0a0e27] transition-colors"
            >
              <span>📚</span>
              <span>my_courses</span>
            </Link>

            <Link
              to="/profile"
              onClick={() => {
                setDropdownOpen(false);
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 px-4 py-3 text-[#6272a4] hover:text-[#00b4d8] hover:bg-[#0a0e27] transition-colors"
            >
              <span>📊</span>
              <span>progress</span>
            </Link>

            {user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => {
                  setDropdownOpen(false);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-3 text-[#6272a4] hover:text-[#00b4d8] hover:bg-[#0a0e27] transition-colors"
              >
                <span>⚙️</span>
                <span>admin</span>
              </Link>
            )}

            <div className="border-t border-[#00b4d8]/20 my-2"></div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 text-[#e91e63] hover:bg-[#e91e63]/10 transition-colors w-full text-left"
            >
              <span>🚪</span>
              <span>logout()</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Button - Removed standalone, now integrated above */}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#0a0e27] border-t border-[#00b4d8]/20 shadow-lg z-50 backdrop-blur-xl">
          <div className="flex flex-col p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-[#6272a4] hover:text-[#00b4d8] hover:bg-[#1a1f3a] rounded-lg transition-colors font-mono"
              >
                &gt; {link.label.toLowerCase().replace(/ /g, "_")}
              </Link>
            ))}

            {!isAuthenticated && (
              <div className="flex flex-col gap-2 pt-4 border-t border-[#00b4d8]/20">
                <Link
                  to="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-center neon-border-cyan bg-[#0a0e27] text-[#00b4d8] rounded hover:bg-[#1a1f3a] transition-colors font-mono"
                >
                  login()
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-center bg-gradient-to-r from-[#00b4d8] to-[#8b5cf6] text-[#0a0e27] rounded hover:opacity-90 transition-opacity font-mono font-bold"
                >
                  signup()
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
