import { ArrowUp, Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useStore } from "../context/StoreContext";

function NavLinks({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  const { cartCount, currentUser } = useStore();
  return (
    <div className={className}>
      <NavLink to="/shop" className="chip-link" onClick={onNavigate}>
        Shop
      </NavLink>
      {currentUser?.isAdmin ? (
        <NavLink to="/admin" className="chip-link" onClick={onNavigate}>
          Admin
        </NavLink>
      ) : null}
      <NavLink to="/account" className="chip-link" onClick={onNavigate}>
        Account
      </NavLink>
      <NavLink
        to="/auth"
        className={({ isActive }) =>
          `chip-link${isActive ? " active" : ""}${!currentUser ? " chip-link-cta" : ""}`
        }
        onClick={onNavigate}
      >
        {currentUser ? "Switch User" : "Login/Register"}
      </NavLink>
      <NavLink to="/cart" className="btn btn-light icon-btn" onClick={onNavigate}>
        <ShoppingBag size={18} />
        Cart ({cartCount})
      </NavLink>
      <NavLink to="/account" className="btn btn-moss icon-btn" onClick={onNavigate}>
        <UserRound size={18} />
        {currentUser ? currentUser.name.split(" ")[0] : "Guest"}
      </NavLink>
    </div>
  );
}

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  const closeMenu = () => setMobileMenuOpen(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: close menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) closeBtnRef.current?.focus();
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) document.body.classList.add("mobile-menu-open");
    else document.body.classList.remove("mobile-menu-open");
    return () => document.body.classList.remove("mobile-menu-open");
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 420);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="app-frame">
      <nav className="top-nav brutal-block">
        <div className="brand-wrap">
          <div className="brand-tag">Storefront</div>
          <NavLink to="/" className="brand-mark">
            EARTH/CO
          </NavLink>
        </div>

        <NavLinks className="nav-links nav-links-desktop" />

        <button
          type="button"
          ref={hamburgerRef}
          className="hamburger-btn btn btn-light"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileMenuOpen}
        >
          <Menu size={22} />
        </button>
      </nav>

      {mobileMenuOpen && (
        <>
          <div
            className="mobile-menu-backdrop"
            onClick={() => {
              closeMenu();
              hamburgerRef.current?.focus();
            }}
            aria-hidden
          />
          <div className="mobile-menu brutal-block" role="dialog" aria-label="Main menu">
            <div className="mobile-menu-header">
              <span className="mobile-menu-title">Menu</span>
              <button
                type="button"
                ref={closeBtnRef}
                className="btn btn-light mobile-menu-close"
                onClick={() => {
                  closeMenu();
                  hamburgerRef.current?.focus();
                }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <NavLinks onNavigate={closeMenu} className="mobile-menu-links" />
          </div>
        </>
      )}

      <Outlet />

      {showScrollTop ? (
        <button
          type="button"
          className="btn btn-dark scroll-top-btn"
          onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" })}
          aria-label="Scroll back to top"
        >
          <ArrowUp size={18} />
        </button>
      ) : null}

      <footer className="footer brutal-block">
        <div>
          <h3>EARTH/CO MARKET</h3>
          <p>Structured commerce with grounded materials and modern utility.</p>
        </div>
        <div>
          <h4>Customer</h4>
          <p>Shipping</p>
          <p>Returns</p>
          <p>Support</p>
        </div>
        <div>
          <h4>Collections</h4>
          <p>Outerwear</p>
          <p>Footwear</p>
          <p>Bags</p>
        </div>
        <div>
          <h4>Values</h4>
          <p>Earth-first materials</p>
          <p>Low-impact production</p>
          <p>Carbon-neutral shipping</p>
        </div>
      </footer>
    </div>
  );
}
