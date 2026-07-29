"use client";

import { useEffect, useState } from "react";
import { navLinks, SITE } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";
import { Search, User, ShoppingBag, CheckCircle2, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cartCount } = useCart();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchInput(false);
      setOpen(false);
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const checkUserSession = () => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; gulshan-user-session=`);
      if (parts.length === 2) {
        const val = parts.pop()?.split(";").shift();
        if (val) {
          try {
            const session = JSON.parse(decodeURIComponent(val));
            setUser({ id: session.id, email: session.email, user_metadata: { role: session.role, full_name: session.full_name } });
            return;
          } catch (e) {}
        }
      }

      const mockAdmin = document.cookie.includes("mock-admin-logged-in=true");
      if (mockAdmin) {
        setUser({ id: "mock-admin-id", email: "admin@panjatanayurveda.com", user_metadata: { role: "admin" } });
        return;
      }

      setUser(null);
    };

    const supabase = createClient();
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setUser(data.user);
        }
      }).catch(() => {});
    }

    window.addEventListener("gulshan-login-status-change", checkUserSession);
    return () => {
      window.removeEventListener("gulshan-login-status-change", checkUserSession);
    };
  }, []);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-[9999] bg-white transition-shadow duration-300">
        {/* Top Announcement Bar - Dark Green */}
        <div className="bg-[#0D3B23] text-white text-xs py-2 px-4 md:px-8 border-b border-emerald-900">
          <div className="max-w-wrap mx-auto flex flex-wrap items-center justify-between gap-2">
            {/* Left Items with Green Checkmarks */}
            <div className="flex items-center flex-wrap gap-4 md:gap-6 text-[11px] md:text-xs font-medium tracking-wide">
              <span className="inline-flex items-center gap-1.5 opacity-90">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> GMP Certified
              </span>
              <span className="inline-flex items-center gap-1.5 opacity-90">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ISO Certified
              </span>
              <span className="inline-flex items-center gap-1.5 opacity-90">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Ayurvedic
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 opacity-90">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No Harmful Chemicals
              </span>
            </div>

            {/* Right Side Announcement */}
            <div className="text-[11px] md:text-xs font-medium tracking-wide text-emerald-100 ml-auto sm:ml-0">
              Free Delivery on orders above ₹499
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className={`transition-all duration-300 ${scrolled ? "shadow-md bg-white/95 backdrop-blur-md" : "bg-white"}`}>
          <div className="max-w-wrap mx-auto px-4 md:px-8 flex items-center justify-between h-[68px] md:h-[76px]">
            {/* Brand Logo */}
            <a href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#0D3B23] text-white flex items-center justify-center font-bold text-xl shadow-sm">
                <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 8C15 8 13.5 9 12 10.5C10.5 9 9 8 7 8C4 8 2 10.5 2 13.5C2 17.5 7 21 12 21C17 21 22 17.5 22 13.5C22 10.5 20 8 17 8ZM12 19C8 16.5 4 13.8 4 12C4 10.8 5.2 9.5 7 9.5C8.8 9.5 10.2 10.7 11.2 12.1L12 13.2L12.8 12.1C13.8 10.7 15.2 9.5 17 9.5C18.8 9.5 20 10.8 20 12C20 13.8 16 16.5 12 19Z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-lg md:text-xl tracking-tight text-[#0D3B23] uppercase">
                  Panjatan
                </span>
                <span className="text-[10px] tracking-[0.25em] font-bold text-amber-700 uppercase -mt-1">
                  Ayurveda
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-body text-[15px] font-semibold text-gray-800 hover:text-[#0D3B23] transition-colors relative py-1 group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#0D3B23] transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </nav>

            {/* Action Icons */}
            <div className="flex items-center gap-4 md:gap-5">
              {/* Search Toggle */}
              <div className="relative">
                {showSearchInput ? (
                  <form onSubmit={handleSearch} className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-gray-50 border border-gray-300 rounded-full px-3 py-1.5 shadow-sm z-10 w-60">
                    <input
                      type="text"
                      placeholder="Search Ayurvedic products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-xs text-gray-800 focus:outline-none w-full pr-2"
                      autoFocus
                    />
                    <button type="submit" className="text-[#0D3B23] hover:scale-110 transition-transform">
                      <Search className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setShowSearchInput(false)} className="ml-1 text-gray-400 hover:text-gray-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowSearchInput(true)}
                    className="p-2 text-gray-700 hover:text-[#0D3B23] transition-colors"
                    title="Search"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* User Account / Profile */}
              <a
                href={user ? "/profile" : "/login"}
                className="p-2 text-gray-700 hover:text-[#0D3B23] transition-colors"
                title={user ? "My Account" : "Login"}
              >
                <User className="w-5 h-5" />
              </a>

              {/* Cart Icon with Counter */}
              <button
                onClick={() => setCartOpen(true)}
                className="p-2 text-gray-700 hover:text-[#0D3B23] transition-colors relative"
                title="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute top-1 right-0.5 w-4 h-4 bg-[#0D3B23] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setOpen(!open)}
                className="lg:hidden p-2 text-gray-700 hover:text-[#0D3B23]"
                aria-label="Toggle menu"
              >
                {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {open && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-5 shadow-xl animate-fade-in">
            <nav className="flex flex-col gap-4">
              <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-4 py-2 mb-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm w-full focus:outline-none"
                />
                <button type="submit" className="text-[#0D3B23]">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-medium text-gray-800 text-base py-1 border-b border-gray-50 hover:text-[#0D3B23]"
                >
                  {link.label}
                </a>
              ))}

              <div className="pt-2 flex items-center gap-4 text-xs text-gray-600">
                <span>{SITE.phone}</span>
                <span>•</span>
                <span>{SITE.email}</span>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Cart Drawer component */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
