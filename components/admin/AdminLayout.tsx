import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { 
  HomeIcon, 
  PhotoIcon, 
  ShoppingBagIcon,
  Cog6ToothIcon
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
  { name: "Configuración", href: "/admin/settings", icon: Cog6ToothIcon },
];

export function AdminLayout({ children, title = "Admin - Miguel Soro" }: Props) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm">
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center px-6 border-b border-gray-200">
              <Link href="/admin" className="text-xl font-semibold text-gray-900">
                Miguel Soro Admin
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href;
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
                        isActive ? "text-gray-500" : "text-gray-400 group-hover:text-gray-500",
                        "mr-3 h-5 w-5 flex-shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User info */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">A</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <Link
                    href="/"
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Ver sitio web →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}