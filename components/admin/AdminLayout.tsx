import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { 
  HomeIcon, 
  PhotoIcon, 
  ShoppingBagIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";

type Props = {
  children?: ReactNode;
  title?: string;
};

const navigation = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },
  { name: "Cuadros", href: "/admin/pictures", icon: PhotoIcon },
  { name: "Pedidos", href: "/admin/orders", icon: ShoppingBagIcon },
  { name: "Tipos de Producto", href: "/admin/product-types", icon: Cog6ToothIcon },
  { name: "Configuración", href: "/admin/settings", icon: Cog6ToothIcon },
];

export function AdminLayout({ children, title = "Admin - Miguel Soro" }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check authentication on client side
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/check-auth');
        if (!response.ok) {
          router.push('/admin/login');
          return;
        }
      } catch (error) {
        router.push('/admin/login');
        return;
      }
      setIsLoading(false);
    };

    // Skip auth check for login page
    if (router.pathname === '/admin/login') {
      setIsLoading(false);
      return;
    }

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/admin/login');
    }
  };

  const handleMenuOpen = () => {
    setIsMobileMenuOpen(true);
    // Small delay to allow DOM to update before starting animation
    setTimeout(() => {
      setIsAnimating(true);
    }, 10);
  };

  const handleMenuClose = () => {
    setIsAnimating(false);
    // Shorter timeout to match faster animation
    setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 200);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <div className="flex h-screen">
        {/* Mobile menu button - positioned right */}
        {!isMobileMenuOpen && (
          <div className="lg:hidden fixed top-4 right-4 z-50">
            <button
              onClick={handleMenuOpen}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 bg-white shadow-md"
            >
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Mobile drawer overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            {/* Overlay background - blur effect like iOS */}
            <div 
              className={cn(
                "fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-200 ease-out",
                isAnimating ? "opacity-100" : "opacity-0"
              )}
              onClick={handleMenuClose}
            />
            
            {/* Drawer panel - slides down from top */}
            <div className={cn(
              "fixed top-0 left-0 right-0 bg-white shadow-2xl transition-all duration-200 ease-out",
              "max-h-[85vh] overflow-hidden rounded-b-3xl",
              isAnimating ? "translate-y-0 opacity-100" : "-translate-y-full opacity-95"
            )}>
              {/* Drawer header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-gray-50">
                <Link href="/admin" className="text-lg font-semibold text-gray-900">
                  Miguel Soro Admin
                </Link>
                <button
                  onClick={handleMenuClose}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Drawer content */}
              <div className="flex flex-col h-full max-h-[calc(85vh-73px)]">
                {/* Navigation */}
                <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
                  {navigation.map((item) => {
                    const isActive = item.href === '/admin/settings' 
                      ? router.pathname.startsWith('/admin/settings')
                      : router.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={handleMenuClose}
                        className={cn(
                          isActive
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700 hover:bg-gray-50",
                          "group flex items-center px-4 py-3 text-base font-medium transition-colors duration-200 w-full"
                        )}
                      >
                        <item.icon
                          className={cn(
                            isActive ? "text-gray-700" : "text-gray-500 group-hover:text-gray-700",
                            "mr-3 h-6 w-6 flex-shrink-0"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                {/* User info at bottom */}
                <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">A</span>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-base font-medium text-gray-900">Admin</p>
                      <button
                        onClick={handleLogout}
                        className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer flex items-center gap-1 mt-1 transition-colors duration-200"
                        data-testid="logout-button-mobile"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden lg:flex lg:w-64 bg-white shadow-sm">
          <div className="flex h-full w-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center justify-start px-6 border-b border-gray-200">
              <Link href="/admin" className="text-xl font-semibold text-gray-900 truncate">
                Miguel Soro Admin
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navigation.map((item) => {
                const isActive = item.href === '/admin/settings' 
                  ? router.pathname.startsWith('/admin/settings')
                  : router.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md"
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive ? "text-gray-700" : "text-gray-600 group-hover:text-gray-800",
                        "mr-3 h-6 w-6 flex-shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop user info */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">A</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-600 hover:text-gray-800 cursor-pointer flex items-center gap-1 mt-1"
                    data-testid="logout-button"
                  >
                    <ArrowRightOnRectangleIcon className="h-3 w-3" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Mobile header spacer */}
          <div className="lg:hidden h-16 flex items-center justify-center">
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          </div>
          
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}