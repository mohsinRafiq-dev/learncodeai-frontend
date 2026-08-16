import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

import { useAuth } from "../../hooks/useAuth";
import { getProfileImageUrl } from "../../utils/imageUtils";
import { useSettings } from "../../contexts/PlatformSettingsContext";

interface NavItem {
  to: string;
  label: string;
  desc?: string;
}

/**
 * Grouped nav menu, styled as a terminal block to match the rest of the site.
 *
 * Opens on hover for pointer users and on click for everyone else — hover alone
 * is unusable on touch, and click alone feels sluggish on desktop. Escape and
 * click-outside both close it, and the trigger stays highlighted while any
 * child route is active so the user can see where they are.
 */
function NavDropdown({ label, items }: { label: string; items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  const hasActiveChild = items.some((i) => pathname.startsWith(i.to));

  // Close when the route changes, otherwise the menu lingers over the new page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-1.5 transition-all ${
          hasActiveChild || open
            ? "text-[#00b4d8] neon-text-cyan"
            : "text-[#6272a4] hover:text-[#00b4d8]"
        }`}
      >
        {label}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50">
          <div className="w-64 rounded-lg border border-[#00b4d8]/30 bg-[#0d1226] shadow-[0_0_30px_rgba(0,180,216,0.15)] overflow-hidden">
            {/* Terminal chrome, consistent with the panels elsewhere on the site */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#00b4d8]/15 bg-[#0a0e27]">
              <span className="w-2 h-2 rounded-full bg-[#ff5555]" />
              <span className="w-2 h-2 rounded-full bg-[#f1fa8c]" />
              <span className="w-2 h-2 rounded-full bg-[#50fa7b]" />
              <span className="ml-1.5 text-[10px] text-[#6272a4] font-mono">
                {label}/
              </span>
            </div>

            <div className="py-1">
              {items.map((item) => {
                const active = pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`block px-3 py-2.5 transition-colors group ${
                      active ? "bg-[#00b4d8]/10" : "hover:bg-[#1a1f3e]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[#00e676] text-xs">$</span>
                      <span
                        className={`text-sm font-mono transition-colors ${
                          active
                            ? "text-[#00b4d8]"
                            : "text-[#c9d1e6] group-hover:text-[#00b4d8]"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    {item.desc && (
                      <p className="text-[11px] text-[#6272a4] mt-0.5 ml-4 font-mono">
                        {item.desc}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { settings } = useSettings();
  const features = settings.features;
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

  // Ten flat links overflowed the bar and collided with the auth buttons below
  // ~1400px. Grouping the related ones into two dropdowns takes the top level
  // from ten items to five, which fits comfortably and reads better.
  //
  // Feature flags still apply, so an admin hiding a module removes its entry
  // (and the whole group if it empties).
  const learnItems = [
    { to: "/tutorials", label: "tutorials", desc: "72 guided lessons" },
    { to: "/courses", label: "courses", desc: "Structured paths" },
    { to: "/quizzes", label: "quizzes", desc: "Test yourself" },
    { to: "/editor", label: "code_editor", desc: "Run code instantly" },
  ];

  const communityItems = [
    ...(features.discussionsEnabled
      ? [{ to: "/discussions", label: "forum", desc: "Ask and answer" }]
      : []),
    { to: "/about", label: "about", desc: "What we're building" },
    { to: "/contact", label: "contact_us", desc: "Get in touch" },
  ];

  // Top-level links that stand alone.
  const directLinks = [
    { to: "/marketplace", label: "marketplace" },
    { to: "/pricing", label: "pricing" },
  ];

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 md:py-7 bg-[#0a0e27] w-full relative border-b border-[#00b4d8]/20">
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2 group">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.siteName}
              className="h-8 md:h-10 w-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <span className="text-2xl text-[#00b4d8]">&lt;/&gt;</span>
          )}
          <div className="font-bold text-xl md:text-2xl font-mono neon-text-cyan group-hover:neon-text-green transition-colors">
            {settings.siteName}
          </div>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden lg:flex items-center gap-6 xl:gap-8 font-medium text-sm xl:text-base font-mono">
        <Link
          to="/"
          className="text-[#6272a4] hover:text-[#00b4d8] hover:neon-text-cyan transition-all"
        >
          home
        </Link>

        <NavDropdown label="learn" items={learnItems} />

        {directLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="text-[#6272a4] hover:text-[#00b4d8] hover:neon-text-cyan transition-all"
          >
            {link.label}
          </Link>
        ))}

        {communityItems.length > 0 && (
          <NavDropdown label="community" items={communityItems} />
        )}
      </div>

      {/* Desktop Auth Section */}
      <div className="hidden lg:flex items-center gap-3">
        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            {/* Avatar Button */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-[#1a1f3e] transition-colors"
            >
              {user?.profilePicture &&
              getProfileImageUrl(user.profilePicture) ? (
                <img
                  src={getProfileImageUrl(user.profilePicture) || ""}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#8b5cf6]/50"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#8b5cf6] flex items-center justify-center text-white font-semibold border-2 border-[#8b5cf6]/50">
                  {getAvatarDisplay()}
                </div>
              )}
              <svg
                className={`w-4 h-4 text-[#6272a4] transition-transform ${
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
              <div className="absolute right-0 mt-2 w-64 bg-[#0d1230] border border-[#2a3050] rounded-xl shadow-lg shadow-[#8b5cf6]/10 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-[#2a3050]">
                  <div className="flex items-center space-x-3">
                    {user?.profilePicture &&
                    getProfileImageUrl(user.profilePicture) ? (
                      <img
                        src={getProfileImageUrl(user.profilePicture) || ""}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#8b5cf6]/50"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-lg">
                        {getAvatarDisplay()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-100 truncate">
                        {user?.name}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {user?.email}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          user?.role === "admin"
                            ? "bg-purple-900/30 text-purple-400"
                            : "bg-cyan-900/30 text-cyan-400"
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
                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-[#1a1f3e] hover:text-[#00b4d8] transition-colors"
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

                  {features.gamificationEnabled && (
                    <Link
                      to="/gamification"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-[#1a1f3e] hover:text-purple-400 transition-colors"
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
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      <span>Gamification</span>
                    </Link>
                  )}

                  <Link
                    to="/profile?tab=courses"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-[#1a1f3e] hover:text-[#00b4d8] transition-colors"
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
                    to="/progress"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-[#1a1f3e] hover:text-[#00b4d8] transition-colors"
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <span>Progress Dashboard</span>
                  </Link>

                  {/* Open to everyone: the Studio itself shows the application
                      form until a user is approved, so gating the link on the
                      creator role would hide the way in from the people who
                      need it most. */}
                  <Link
                    to="/creator"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-[#1a1f3e] hover:text-[#00b4d8] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Creator Studio</span>
                  </Link>

                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-[#1a1f3e] hover:text-[#8b5cf6] transition-colors"
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
                  <div className="border-t border-[#2a3050] my-2"></div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors w-full text-left"
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
                className="w-10 h-10 rounded-full object-cover border-2 border-[#8b5cf6]/50"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#8b5cf6] flex items-center justify-center text-white font-semibold border-2 border-[#8b5cf6]/50">
                {getAvatarDisplay()}
              </div>
            )}
            <svg
              className={`w-4 h-4 text-[#6272a4] transition-transform ${
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
              to="/progress"
              onClick={() => {
                setDropdownOpen(false);
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 px-4 py-3 text-[#6272a4] hover:text-[#00b4d8] hover:bg-[#0a0e27] transition-colors"
            >
              <span>📊</span>
              <span>progress_dashboard</span>
            </Link>

            <Link
              to="/gamification"
              onClick={() => {
                setDropdownOpen(false);
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 px-4 py-3 text-[#6272a4] hover:text-purple-400 hover:bg-[#0a0e27] transition-colors"
            >
              <span>🏆</span>
              <span>gamification</span>
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
            {/* Mobile keeps everything flat with section headings rather than
                nested dropdowns — a menu inside a menu on a small screen is
                more taps for no benefit. */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 text-[#6272a4] hover:text-[#00b4d8] hover:bg-[#1a1f3a] rounded-lg transition-colors font-mono"
            >
              &gt; home
            </Link>

            <p className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-widest text-[#3d4666] font-mono">
              learn
            </p>
            {learnItems.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-[#6272a4] hover:text-[#00b4d8] hover:bg-[#1a1f3a] rounded-lg transition-colors font-mono"
              >
                &gt; {link.label}
              </Link>
            ))}

            <p className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-widest text-[#3d4666] font-mono">
              explore
            </p>
            {directLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-[#6272a4] hover:text-[#00b4d8] hover:bg-[#1a1f3a] rounded-lg transition-colors font-mono"
              >
                &gt; {link.label}
              </Link>
            ))}

            <p className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-widest text-[#3d4666] font-mono">
              community
            </p>
            {communityItems.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-[#6272a4] hover:text-[#00b4d8] hover:bg-[#1a1f3a] rounded-lg transition-colors font-mono"
              >
                &gt; {link.label}
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
