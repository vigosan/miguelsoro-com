import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useNewsAdmin } from "@/hooks/useNewsAdmin";
import {
  News,
  CreateNewsData,
  NewsType,
  getNewsTypeInfo,
  formatNewsDate,
} from "@/domain/news";
import { Toaster, toast } from "react-hot-toast";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/admin/PageHeader";
import { ListSkeleton } from "@/components/ui/Skeleton";

type NewsFormData = CreateNewsData;

const PAGE_SIZE = 15;

export default function AdminNews() {
  const { news, loading, error, createNews, updateNews, deleteNews } =
    useNewsAdmin();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [formData, setFormData] = useState<NewsFormData>({
    title: "",
    description: "",
    type: "exposicion",
    date: new Date().toISOString().split("T")[0],
    location: "",
    externalUrl: "",
    published: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      if (editingNews) {
        const updated = await updateNews(editingNews.id, formData);
        if (updated) {
          toast.success("Noticia actualizada correctamente");
          resetForm();
        } else {
          toast.error("Error al actualizar la noticia");
        }
      } else {
        const created = await createNews(formData);
        if (created) {
          toast.success("Noticia creada correctamente");
          resetForm();
        } else {
          toast.error("Error al crear la noticia");
        }
      }
    } catch (error) {
      toast.error("Error al procesar la solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      description: newsItem.description,
      type: newsItem.type,
      date: newsItem.date.split("T")[0],
      location: newsItem.location || "",
      externalUrl: newsItem.externalUrl || "",
      published: newsItem.published,
    });
    setShowForm(true);
  };

  const handleDelete = async (newsItem: News) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar "${newsItem.title}"?`,
      )
    ) {
      const success = await deleteNews(newsItem.id);
      if (success) {
        toast.success("Noticia eliminada correctamente");
      } else {
        toast.error("Error al eliminar la noticia");
      }
    }
  };

  const resetForm = () => {
    setEditingNews(null);
    setFormData({
      title: "",
      description: "",
      type: "exposicion",
      date: new Date().toISOString().split("T")[0],
      location: "",
      externalUrl: "",
      published: true,
    });
    setShowForm(false);
  };

  const totalPages = Math.max(1, Math.ceil(news.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedNews = news.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Keep the current page in range as items are added/removed.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Noticias"
          description="Gestiona las noticias del sitio web"
        />
        <ListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <>
        <div className="flex justify-center items-center py-12">
          <div className="text-red-500">
            Error al cargar las noticias: {error}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Noticias"
          description="Gestiona las noticias del sitio web"
          action={
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors w-full sm:w-auto cursor-pointer"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nueva Noticia
            </button>
          }
        />

        {/* Form Modal */}
        {showForm && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="news-modal-title"
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 id="news-modal-title" className="text-xl font-semibold">
                    {editingNews ? "Editar Noticia" : "Nueva Noticia"}
                  </h2>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Cerrar"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type: e.target.value as NewsType,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                      >
                        <option value="premio">Premio</option>
                        <option value="exposicion">Exposición</option>
                        <option value="entrevista">Entrevista</option>
                        <option value="evento">Evento</option>
                        <option value="video">Video</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicación (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL externa (opcional)
                    </label>
                    <input
                      type="url"
                      value={formData.externalUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          externalUrl: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="published"
                      checked={formData.published}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          published: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="published"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Publicado
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? "Guardando…"
                      : `${editingNews ? "Actualizar" : "Crear"} Noticia`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* News List */}
        <div className="space-y-3">
          {/* Header Row */}
          <div className="bg-white px-4 py-3 border-b border-gray-200 rounded-t-lg">
            <div className="flex justify-between items-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span>NOTICIA</span>
              <span>TIPO</span>
            </div>
          </div>

          {/* News Items */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {pagedNews.map((newsItem, index) => {
              const typeInfo = getNewsTypeInfo(newsItem.type);
              return (
                <div
                  key={newsItem.id}
                  className={`p-4 ${index !== pagedNews.length - 1 ? "border-b border-gray-200" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="text-sm font-medium text-gray-900 truncate mb-1">
                        {newsItem.title}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {newsItem.description}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.textColor}`}
                      >
                        {typeInfo.label}
                      </span>
                      <button
                        onClick={() => handleEdit(newsItem)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(newsItem)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status and Date */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          newsItem.published
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {newsItem.published ? (
                          <>
                            <EyeIcon className="h-3 w-3 mr-1" />
                            Publicado
                          </>
                        ) : (
                          <>
                            <EyeSlashIcon className="h-3 w-3 mr-1" />
                            Borrador
                          </>
                        )}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatNewsDate(newsItem.date)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {news.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No hay noticias creadas aún.</div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Página {currentPage} de {totalPages} · {news.length} noticias
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <Toaster position="top-right" />
    </>
  );
}

AdminNews.getLayout = (page: ReactElement) => (
  <AdminLayout title="Gestión de Noticias">{page}</AdminLayout>
);
