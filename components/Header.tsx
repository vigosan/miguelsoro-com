import { useState } from "react";
import Image from "next/image";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import { 
  BiographyPageLink, 
  ContactPageLink, 
  IndexPageLink, 
  NewsPageLink 
} from "@/components/navigation/PageLinks";

export function Header() {
  const navigation = [
    { name: "Obra", Link: IndexPageLink },
    { name: "Noticias", Link: NewsPageLink },
    { name: "Biografía", Link: BiographyPageLink },
    { name: "Contacto", Link: ContactPageLink },
  ];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="pt-4" data-testid="main-header">
      <nav
        className="mx-auto flex items-center justify-between"
        aria-label="Global"
        data-testid="main-navigation"
      >
        <IndexPageLink className="text-md -m-1.5 h-auto w-32 p-1.5 text-xl lg:w-48 lg:text-2xl" data-testid="logo-link">
          <span className="sr-only">Miguel Soro</span>
          <Image
            src="/signature.webp"
            alt="Firma de Miguel Soro"
            width={200}
            height={42}
            priority
            aria-hidden
            data-testid="logo-image"
          />
        </IndexPageLink>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setMobileMenuOpen(true)}
            data-testid="mobile-menu-button"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-8" data-testid="desktop-navigation">
          {navigation.map(({ name, Link }) => (
            <Link key={name} className="text-sm leading-6 text-gray-900" data-testid={`nav-link-${name.toLowerCase().replace(/\s+/g, '-')}`}>
              {name}
            </Link>
          ))}
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
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white py-6 px-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10" data-testid="mobile-menu-panel">
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
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
                    className="-mx-3 block rounded-lg py-2 px-3 text-base leading-7 text-gray-900 hover:bg-gray-50"
                    data-testid={`mobile-nav-link-${name.toLowerCase().replace(/\s+/g, '-')}`}
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
