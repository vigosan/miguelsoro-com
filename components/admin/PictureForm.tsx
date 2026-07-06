import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "@/utils/formatCurrency";
import { slugify } from "@/utils/slug";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";

export interface PictureFormValues {
  title: string;
  description: string;
  price: string;
  size: string;
  slug: string;
  productTypeId: string;
  stock: string;
  imageUrl: string;
}

type ProductType = {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isActive?: boolean;
};

interface Props {
  initialValues: PictureFormValues;
  // Create mode derives the slug from the title; edit mode never touches it
  // so published URLs stay stable.
  autoSlugFromTitle?: boolean;
  submitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (values: PictureFormValues) => void;
  previewExtra?: ReactNode;
}

export function PictureForm({
  initialValues,
  autoSlugFromTitle = false,
  submitting,
  submitLabel,
  submittingLabel,
  onSubmit,
  previewExtra,
}: Props) {
  const [formData, setFormData] = useState<PictureFormValues>(initialValues);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await fetch("/api/admin/product-types");
        if (!response.ok) {
          throw new Error("Failed to fetch product types");
        }
        const data = await response.json();
        setProductTypes(data.productTypes);
      } catch (error) {
        console.error("Error fetching product types:", error);
        toast.error("Error al cargar los tipos de producto");
      }
    };

    fetchProductTypes();
  }, []);

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug:
        autoSlugFromTitle && !slugManuallyEdited ? slugify(title) : prev.slug,
    }));
  };

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-2">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow rounded-lg p-6 space-y-6"
        >
          <Input
            label="Título *"
            type="text"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            placeholder="Ej: Eddy Merckx - El Canibal"
          />

          <Textarea
            label="Descripción"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            placeholder="Descripción del cuadro..."
          />

          <Select
            label="Tipo de Producto *"
            value={formData.productTypeId}
            onChange={(e) =>
              setFormData({ ...formData, productTypeId: e.target.value })
            }
            required
          >
            <option value="">Selecciona un tipo</option>
            {productTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.displayName}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Precio (€) *"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
              placeholder="450.00"
            />

            <Input
              label="Stock *"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
              required
              placeholder="1"
            />

            <Input
              label="Tamaño"
              type="text"
              value={formData.size}
              onChange={(e) =>
                setFormData({ ...formData, size: e.target.value })
              }
              placeholder="120x90 cm"
            />
          </div>

          <div>
            <Input
              label="URL slug *"
              type="text"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
              placeholder="eddy-merckx-el-canibal"
            />
            <p className="text-sm text-gray-500 mt-1">
              URL: /pictures/{formData.slug || "url-del-cuadro"}
            </p>
            {autoSlugFromTitle && !slugManuallyEdited && (
              <p className="text-xs text-gray-700 mt-1">
                Se genera automáticamente desde el título
              </p>
            )}
          </div>

          <ImageUpload
            currentImageUrl={formData.imageUrl}
            onImageUploaded={(url) =>
              setFormData({ ...formData, imageUrl: url })
            }
            onImageRemoved={() => setFormData({ ...formData, imageUrl: "" })}
          />

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Link
              href="/admin/pictures"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {submitting ? submittingLabel : submitLabel}
            </button>
          </div>
        </form>
      </div>

      {/* Preview */}
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Vista Previa
          </h3>

          {formData.imageUrl ? (
            <div className="mb-4">
              <Image
                src={formData.imageUrl}
                alt={formData.title}
                width={600}
                height={192}
                className="w-full h-48 object-cover rounded-lg border"
              />
            </div>
          ) : (
            <div className="mb-4 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <PhotoIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}

          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900">
                {formData.title || "Sin título"}
              </h4>
              <p className="text-sm text-gray-500">
                {formData.size || "Sin tamaño"}
              </p>
              <p className="text-sm text-gray-700">
                {productTypes.find((t) => t.id === formData.productTypeId)
                  ?.displayName || "Sin tipo"}
              </p>
            </div>

            <div>
              <p className="text-lg font-bold text-gray-900">
                {formData.price
                  ? formatCurrency(Math.round(parseFloat(formData.price) * 100))
                  : "€0.00"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    parseInt(formData.stock) > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {parseInt(formData.stock) > 0 ? "Disponible" : "No disponible"}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Stock: {formData.stock || 0}
                </span>
              </div>
            </div>

            {formData.description && (
              <p className="text-sm text-gray-600 line-clamp-3">
                {formData.description}
              </p>
            )}
          </div>
        </div>

        {previewExtra}
      </div>
    </div>
  );
}
