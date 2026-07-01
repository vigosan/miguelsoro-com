import { useEffect, useState } from "react";
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
  const navigation = [
    { name: "Obra", Link: ObraPageLink },
    { name: "Noticias", Link: NewsPageLink },
    { name: "Biografía", Link: BiographyPageLink },
    { name: "Contacto", Link: ContactPageLink },
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
        overlay
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-sm shadow-sm"
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
          {navigation.map(({ name, Link }) => (
            <Link
              key={name}
              className={`group relative text-xs font-medium uppercase tracking-[0.18em] transition-colors cursor-pointer after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100 hover:after:scale-x-100 ${
                overlay
                  ? "text-white/90 hover:text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.5)] after:bg-white"
                  : "text-gray-700 hover:text-black after:bg-black"
              }`}
              data-testid={`nav-link-${name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {name}
            </Link>
          ))}
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
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel
          className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white py-6 px-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10"
          data-testid="mobile-menu-panel"
        >
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700 cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="mobile-menu-close-button"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6" data-testid="mobile-navigation">
                {navigation.map(({ name, Link }) => (
                  <Link
                    key={name}
                    className="-mx-3 block rounded-lg py-2 px-3 text-base leading-7 text-gray-900 hover:bg-gray-50 cursor-pointer"
                    data-testid={`mobile-nav-link-${name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
