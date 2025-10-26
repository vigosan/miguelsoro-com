import { useState } from "react";
import {
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

interface FiltersProps {
  filters: {
    productType: string;
    status: string;
  };
  onFiltersChange: (filters: any) => void;
  availableTypes: string[];
  resultCount: number;
}

export function Filters({
  filters,
  onFiltersChange,
  availableTypes,
  resultCount,
}: FiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleProductTypeChange = (productType: string) => {
    onFiltersChange({ ...filters, productType });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({ ...filters, status });
  };

  const clearFilters = () => {
    onFiltersChange({ productType: "", status: "" });
  };

  const hasActiveFilters = filters.productType || filters.status;

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {resultCount} obra{resultCount !== 1 ? "s" : ""} encontrada
          {resultCount !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FunnelIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Filtros</span>
          {hasActiveFilters && (
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
              {(filters.productType ? 1 : 0) + (filters.status ? 1 : 0)}
            </span>
          )}
          {isExpanded ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Filters Content */}
      {isExpanded && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Filtrar por:</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de producto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={filters.productType}
                onChange={(e) => handleProductTypeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="">Todos</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="">Todos</option>
                <option value="AVAILABLE">Disponible</option>
                <option value="NOT_AVAILABLE">No disponible</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
