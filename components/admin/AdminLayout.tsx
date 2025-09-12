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
  ArrowRightOnRectangleIcon
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
        {/* Sidebar */}
        <div className="w-14 sm:w-16 lg:w-64 bg-white shadow-sm">
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center justify-center lg:justify-start px-2 sm:px-3 lg:px-6 border-b border-gray-200">
              <Link href="/admin" className="text-base lg:text-xl font-semibold text-gray-900 truncate">
                <span className="hidden lg:block">Miguel Soro Admin</span>
                <span className="block lg:hidden text-center">MS</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-1 sm:px-2 lg:px-3 py-4">
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
                      "group flex items-center px-2 sm:px-3 py-2 text-sm font-medium rounded-md lg:justify-start justify-center cursor-pointer"
                    )}
                    title={item.name}
                  >
                    <item.icon
                      className={cn(
                        isActive ? "text-gray-700" : "text-gray-600 group-hover:text-gray-800",
                        "lg:mr-3 mr-0 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    <span className="hidden lg:block truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User info */}
            <div className="border-t border-gray-200 p-1 sm:p-2 lg:p-4">
              <div className="flex items-center lg:flex-row flex-col">
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">A</span>
                </div>
                <div className="lg:ml-3 ml-0 lg:block hidden">
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-600 hover:text-gray-800 cursor-pointer flex items-center gap-1 mt-1"
                    data-testid="logout-button"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="h-3 w-3" />
                    Logout
                  </button>
                </div>
                {/* Mobile logout button */}
                <div className="lg:hidden mt-2">
                  <button
                    onClick={handleLogout}
                    className="p-1 text-gray-600 hover:text-gray-800 cursor-pointer"
                    data-testid="logout-button-mobile"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}