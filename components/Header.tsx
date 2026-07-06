import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import {
  BiographyPageLink,
  ContactPageLink,
  IndexPageLink,
  NewsPageLink,
  ObraPageLink,
} from "@/components/navigation/PageLinks";
import CartButton from "./cart/CartButton";

interface HeaderProps {
  transparent?: boolean;
}

export function Header({ transparent = false }: HeaderProps) {
  const router = useRouter();
  const navigation = [
    { name: "Obra", Link: ObraPageLink, href: "/obra" },
    { name: "Noticias", Link: NewsPageLink, href: "/noticias" },
    { name: "Biografía", Link: BiographyPageLink, href: "/biografia" },
    { name: "Contacto", Link: ContactPageLink, href: "/contacto" },
  ];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  const overlay = transparent && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 pt-4 pb-4 transition-colors duration-300 ${
        overlay ? "bg-transparent" : "bg-white/95 backdrop-blur-sm shadow-sm"
      }`}
      data-testid="main-header"
    >
      <nav
        className="max-w-5xl mx-auto flex items-center justify-between px-6 lg:px-12"
        aria-label="Global"
        data-testid="main-navigation"
      >
        <IndexPageLink
          className="text-md -m-1.5 h-auto w-32 p-1.5 text-xl lg:w-48 lg:text-2xl"
          data-testid="logo-link"
        >
          <span className="sr-only">Miguel Soro</span>
          <Image
            src="/signature.webp"
            alt="Firma de Miguel Soro"
            width={200}
            height={42}
            priority
            aria-hidden
            data-testid="logo-image"
            className={`transition-[filter] duration-300 ${
              overlay ? "brightness-0 invert" : "brightness-0"
            }`}
          />
        </IndexPageLink>

        <div className="flex items-center gap-4 lg:hidden">
          <CartButton
            className={
              overlay
                ? "text-white hover:text-white/70"
                : "text-black hover:text-gray-600"
            }
          />
          <button
            type="button"
            className={`-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 cursor-pointer transition-colors ${
              overlay ? "text-white" : "text-black"
            }`}
            onClick={() => setMobileMenuOpen(true)}
            data-testid="mobile-menu-button"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div
          className="hidden lg:flex lg:items-center lg:gap-x-10"
          data-testid="desktop-navigation"
        >
          {navigation.map(({ name, Link, href }) => {
            const active = router.pathname === href;
            return (
              <Link
                key={name}
                className={`group relative text-xs font-medium uppercase tracking-[0.18em] transition-colors cursor-pointer after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:transition-transform after:duration-300 after:ease-out after:bg-accent group-hover:after:scale-x-100 hover:after:scale-x-100 ${
                  active ? "after:scale-x-100" : "after:scale-x-0"
                } ${
                  overlay
                    ? "text-white/90 hover:text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]"
                    : active
                      ? "text-black"
                      : "text-gray-700 hover:text-black"
                }`}
                data-testid={`nav-link-${name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {name}
              </Link>
            );
          })}
          <CartButton
            className={
              overlay
                ? "text-white hover:text-white/70 [filter:drop-shadow(0_1px_8px_rgba(0,0,0,0.5))]"
                : "text-black hover:text-gray-600"
            }
          />
        </div>
      </nav>

      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        data-testid="mobile-menu-dialog"
      >
        <div className="fixed inset-0 z-10 bg-black/20" aria-hidden />
        <Dialog.Panel
          className="fixed inset-0 z-10 flex flex-col overflow-y-auto bg-white px-6 pb-10 pt-4"
          data-testid="mobile-menu-panel"
        >
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-900 cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="mobile-menu-close-button"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-7 w-7" aria-hidden="true" />
            </button>
          </div>

          <nav
            className="mt-auto flex flex-col gap-1 motion-safe:animate-[hero-rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both]"
            data-testid="mobile-navigation"
          >
            {navigation.map(({ name, Link, href }) => {
              const active = router.pathname === href;
              return (
                <Link
                  key={name}
                  className={`font-[family-name:var(--font-poster)] block py-2 text-5xl uppercase leading-none tracking-tight transition-colors active:text-gray-400 ${
                    active
                      ? "text-gray-900 border-l-4 border-accent pl-4"
                      : "text-gray-900"
                  }`}
                >
                  {name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-12 border-t border-gray-200 pt-8">
            <a
              href="https://www.instagram.com/miguelsoro/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm uppercase tracking-[0.2em] text-gray-500 transition-colors active:text-gray-900"
              data-testid="mobile-nav-instagram"
            >
              Instagram — @miguelsoro
            </a>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
