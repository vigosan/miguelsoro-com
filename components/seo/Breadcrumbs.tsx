import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

interface BreadcrumbItem {
  name: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav className={`mb-8 ${className}`} aria-label="Breadcrumb">
      <ol 
        className="flex items-center space-x-2 text-sm"
        itemScope 
        itemType="https://schema.org/BreadcrumbList"
      >
        {items.map((item, index) => (
          <li 
            key={item.href}
            className={`flex items-center ${item.current ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {!item.current ? (
              <Link 
                href={item.href} 
                className="hover:text-gray-700 transition-colors"
                itemProp="item"
              >
                <span itemProp="name">{item.name}</span>
              </Link>
            ) : (
              <span 
                className="truncate max-w-xs sm:max-w-sm md:max-w-md"
                itemProp="name"
                aria-current="page"
              >
                {item.name}
              </span>
            )}
            <meta itemProp="position" content={(index + 1).toString()} />
            
            {index < items.length - 1 && (
              <ChevronRightIcon 
                className="ml-2 h-4 w-4 text-gray-400 flex-shrink-0" 
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}