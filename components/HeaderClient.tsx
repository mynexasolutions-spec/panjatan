"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NavigationLink, SiteSettings } from "@/lib/cms";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";
import { Search, User, ShoppingBag, CheckCircle2, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCustomer } from "@/context/CustomerContext";

export default function HeaderClient({ settings, navLinks, announcementText }: { settings: SiteSettings; navLinks: NavigationLink[]; announcementText?: string | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cartCount } = useCart();
  const { customer } = useCustomer();
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

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-[9999] bg-white transition-shadow duration-300">
        {/* Top Announcement Bar - Dark Green */}
        <div className="bg-[#0D3B23] text-white text-xs py-1.5 px-3 md:px-8 border-b border-emerald-900 overflow-hidden">
          <div className="max-w-wrap mx-auto flex items-center justify-center gap-3 md:gap-2 whitespace-nowrap">
            {/* Left Items with Green Checkmarks */}
            {/* <div className="flex items-center gap-2.5 md:gap-6 text-[10px] md:text-xs font-medium tracking-wide min-w-0">
              <span className="inline-flex items-center gap-1 opacity-90">
                <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-400 shrink-0" /> GMP Certified
              </span>
              <span className="inline-flex items-center gap-1 opacity-90">
                <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-400 shrink-0" /> ISO Certified
              </span>
              <span className="inline-flex items-center gap-1 opacity-90">
                <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-400 shrink-0" /> 100% Ayurvedic
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 opacity-90">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> No Harmful Chemicals
              </span>
            </div> */}

            {/* Right Side Announcement */}
            {announcementText && (
              <div className="hidden sm:block  iterms-center text-[11px] md:text-xs font-medium tracking-wide text-emerald-100 truncate">
                {announcementText}
              </div>
            )}
          </div>
        </div>

        {/* Main Navbar */}
        <div className={`transition-all duration-300 ${scrolled ? "shadow-md bg-white/95 backdrop-blur-md" : "bg-white"}`}>
          <div className="max-w-wrap mx-auto px-4 md:px-8 flex items-center justify-between h-[68px] md:h-[76px]">
            {/* Brand Logo */}
            <a href="/" className="shrink-0 transition-transform duration-300 hover:scale-[1.03] active:scale-95">
              <Image
                src="/panjatan-logo.jpeg"
                alt={settings.site_name}
                width={160}
                height={50}
                className="h-10 md:h-12 w-auto object-contain"
                priority
              />
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
              <div className="relative hidden lg:block">
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
                    className="p-2 text-gray-700 hover:text-[#0D3B23] transition-all duration-200 hover:scale-110 active:scale-90"
                    title="Search"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* User Account / Profile */}
              <a
                href={customer ? "/profile" : "/login"}
                className="p-2 text-gray-700 hover:text-[#0D3B23] transition-all duration-200 hover:scale-110 active:scale-90"
                title={customer ? `My Account — ${customer.fullName}` : "Login"}
              >
                <User className="w-5 h-5" />
              </a>

              {/* Cart Icon with Counter */}
              <button
                onClick={() => setCartOpen(true)}
                className="p-2 text-gray-700 hover:text-[#0D3B23] transition-all duration-200 hover:scale-110 active:scale-90 relative"
                title="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                <span key={cartCount} className="absolute top-1 right-0.5 w-4 h-4 bg-[#0D3B23] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-fade-in">
                  {cartCount}
                </span>
              </button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setOpen(!open)}
                className="lg:hidden p-2 text-gray-700 hover:text-[#0D3B23] transition-transform duration-200 active:scale-90"
                aria-label="Toggle menu"
              >
                <span className="inline-flex transition-transform duration-300" style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>
                  {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </span>
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
                <span>{settings.support_phone}</span>
                <span>•</span>
                <span>{settings.support_email}</span>
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
