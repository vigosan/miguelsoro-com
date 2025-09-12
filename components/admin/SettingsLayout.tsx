import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  CogIcon,
  GlobeAltIcon,
  CurrencyEuroIcon,
  PhotoIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

type SettingsLayoutProps = {
  children: ReactNode;
  title?: string;
};

const tabs = [
  { id: 'general', name: 'General', icon: CogIcon, href: '/admin/settings/general' },
  { id: 'tienda', name: 'Tienda', icon: GlobeAltIcon, href: '/admin/settings/tienda' },
  { id: 'pagos', name: 'Pagos', icon: CurrencyEuroIcon, href: '/admin/settings/pagos' },
  { id: 'inventario', name: 'Inventario', icon: PhotoIcon, href: '/admin/settings/inventario' },
  { id: 'admin', name: 'Admin', icon: ShieldCheckIcon, href: '/admin/settings/admin' },
];

export function SettingsLayout({ children, title = "Configuración - Admin" }: SettingsLayoutProps) {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <AdminLayout title={title}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Gestiona la configuración global del sitio y la tienda
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Mobile/Tablet Navigation */}
          <div className="lg:hidden">
            <nav className="flex space-x-1 overflow-x-auto pb-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentPath === tab.href;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => router.push(tab.href)}
                    className={`flex-shrink-0 flex flex-col items-center px-3 py-2 text-xs font-medium rounded-md transition-colors min-w-0 cursor-pointer ${
                      isActive
                        ? 'bg-gray-100 text-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-1 flex-shrink-0" />
                    <span className="truncate">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:w-64 flex-shrink-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentPath === tab.href;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => router.push(tab.href)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-gray-100 text-gray-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}