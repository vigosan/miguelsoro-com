interface FiltersProps {
  filters: {
    productType: string;
    inStock: boolean | null;
    status: string;
  };
  onFiltersChange: (filters: any) => void;
  availableTypes: string[];
}

export function Filters({ filters, onFiltersChange, availableTypes }: FiltersProps) {
  const handleProductTypeChange = (productType: string) => {
    onFiltersChange({ ...filters, productType });
  };

  const handleStockChange = (inStock: boolean | null) => {
    onFiltersChange({ ...filters, inStock });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({ ...filters, status });
  };

  const clearFilters = () => {
    onFiltersChange({ productType: '', inStock: null, status: '' });
  };

  const hasActiveFilters = filters.productType || filters.inStock !== null || filters.status;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tipo de producto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de producto
          </label>
          <select
            value={filters.productType}
            onChange={(e) => handleProductTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los tipos</option>
            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Disponibilidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Disponibilidad
          </label>
          <select
            value={filters.inStock === null ? '' : filters.inStock.toString()}
            onChange={(e) => 
              handleStockChange(
                e.target.value === '' ? null : e.target.value === 'true'
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las obras</option>
            <option value="true">Con existencias</option>
            <option value="false">Sin existencias</option>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="AVAILABLE">Disponible</option>
            <option value="SOLD">Vendido</option>
          </select>
        </div>
      </div>
    </div>
  );
}