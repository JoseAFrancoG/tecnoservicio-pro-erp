import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  ZoomIn,
  X,
  Plus,
  Loader2,
  Download,
  AlertCircle,
  Clock,
  User,
} from 'lucide-react';
import { OrderImage, OrderImageType } from '../../types';
import { ordersApi } from '../../api/ordersApi';

interface OrderPhotoGalleryProps {
  orderId: number;
  orderNumber: string;
  images: OrderImage[];
  onImagesUpdated: () => void;
  canEdit?: boolean;
}

const CATEGORIES: { type: OrderImageType; label: string; badgeColor: string }[] = [
  { type: 'Ingreso', label: 'Ingreso / Recepción', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { type: 'Diagnostico', label: 'Diagnóstico Técnico', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { type: 'Reparacion', label: 'Reparación / Cambio', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { type: 'Entrega', label: 'Entrega / Final', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
];

export const OrderPhotoGallery: React.FC<OrderPhotoGalleryProps> = ({
  orderId,
  orderNumber,
  images,
  onImagesUpdated,
  canEdit = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<OrderImage | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  // Form State
  const [photoType, setPhotoType] = useState<OrderImageType>('Ingreso');
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Filtered images
  const filteredImages = selectedCategory === 'Todos'
    ? images
    : images.filter((img) => img.type.toLowerCase() === selectedCategory.toLowerCase());

  // Compress & Resize image to keep base64 payload light (< 500KB)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor seleccione un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setPreviewDataUrl(compressedDataUrl);

          // Auto-suggest title if empty
          if (!photoTitle) {
            const fileNameClean = file.name.replace(/\.[^/.]+$/, '');
            setPhotoTitle(fileNameClean.length > 2 ? fileNameClean : `Evidencia ${photoType}`);
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewDataUrl) {
      setUploadError('Debe seleccionar o tomar una fotografía.');
      return;
    }
    if (!photoTitle.trim()) {
      setUploadError('El título de la fotografía es obligatorio.');
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadError(null);

      await ordersApi.uploadImage(orderId, {
        type: photoType,
        title: photoTitle.trim(),
        description: photoDescription.trim() || undefined,
        imageUrl: previewDataUrl,
      });

      // Reset
      setIsUploadModalOpen(false);
      setPreviewDataUrl(null);
      setPhotoTitle('');
      setPhotoDescription('');
      setPhotoType('Ingreso');

      onImagesUpdated();
    } catch (err: any) {
      setUploadError(err.response?.data?.Message || 'Error al guardar la evidencia fotográfica.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, imageId: number) => {
    e.stopPropagation();
    if (!window.confirm('¿Está seguro de eliminar esta evidencia fotográfica? Esta acción se registrará en la auditoría.')) {
      return;
    }

    try {
      setDeletingId(imageId);
      await ordersApi.deleteImage(orderId, imageId);
      if (lightboxImage?.id === imageId) {
        setLightboxImage(null);
      }
      onImagesUpdated();
    } catch (err: any) {
      alert('Error al eliminar la imagen: ' + (err.response?.data?.Message || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  const openLightbox = (img: OrderImage, index: number) => {
    setLightboxImage(img);
    setLightboxIndex(index);
  };

  const nextLightboxImage = () => {
    if (filteredImages.length === 0) return;
    const nextIdx = (lightboxIndex + 1) % filteredImages.length;
    setLightboxIndex(nextIdx);
    setLightboxImage(filteredImages[nextIdx]);
  };

  const prevLightboxImage = () => {
    if (filteredImages.length === 0) return;
    const prevIdx = (lightboxIndex - 1 + filteredImages.length) % filteredImages.length;
    setLightboxIndex(prevIdx);
    setLightboxImage(filteredImages[prevIdx]);
  };

  const getCategoryBadgeClass = (type: string) => {
    const cat = CATEGORIES.find((c) => c.type.toLowerCase() === type.toLowerCase());
    return cat ? cat.badgeColor : 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-sky-400" />
              Evidencias Fotográficas
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold">
              {images.length} {images.length === 1 ? 'foto' : 'fotos'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro visual del estado del equipo en recepción, diagnóstico, refacciones y entrega
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => {
              setPreviewDataUrl(null);
              setPhotoTitle('');
              setPhotoDescription('');
              setUploadError(null);
              setIsUploadModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-sky-600/30 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Evidencia</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setSelectedCategory('Todos')}
          className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
            selectedCategory === 'Todos'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          Todas ({images.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = images.filter((img) => img.type.toLowerCase() === cat.type.toLowerCase()).length;
          return (
            <button
              key={cat.type}
              type="button"
              onClick={() => setSelectedCategory(cat.type)}
              className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
                selectedCategory.toLowerCase() === cat.type.toLowerCase()
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Photo Grid */}
      {filteredImages.length === 0 ? (
        <div className="py-12 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-6 bg-slate-900/30">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3 border border-slate-700/60">
            <ImageIcon className="w-6 h-6 stroke-1" />
          </div>
          <p className="text-xs font-medium text-slate-300">No hay fotos en esta categoría</p>
          <p className="text-[11px] text-slate-500 max-w-sm mt-1">
            Capture fotografías con la cámara del dispositivo móvil o suba imágenes desde su equipo para respaldar el estado físico de la orden.
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg transition"
            >
              Subir primera fotografía
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredImages.map((img, idx) => (
            <div
              key={img.id}
              onClick={() => openLightbox(img, idx)}
              className="group relative bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg hover:shadow-sky-500/10 transition-all flex flex-col"
            >
              {/* Image Thumbnail */}
              <div className="aspect-[4/3] bg-slate-950 overflow-hidden relative">
                <img
                  src={img.imageUrl}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Hover overlay with action icons */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow transition">
                    <ZoomIn className="w-4 h-4" />
                  </span>

                  {canEdit && (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, img.id)}
                      disabled={deletingId === img.id}
                      title="Eliminar evidencia"
                      className="p-2 bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg shadow transition disabled:opacity-50"
                    >
                      {deletingId === img.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Badge top-left */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border backdrop-blur-md shadow-sm ${getCategoryBadgeClass(
                      img.type
                    )}`}
                  >
                    {img.type}
                  </span>
                </div>
              </div>

              {/* Caption */}
              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white truncate" title={img.title}>
                    {img.title}
                  </h4>
                  {img.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5" title={img.description}>
                      {img.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-1 border-t border-slate-800/60">
                  <span className="truncate max-w-[100px]">{img.uploadedByUserName}</span>
                  <span>{new Date(img.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload / Camera Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-sky-400" />
                  Nueva Evidencia Fotográfica
                </h3>
                <p className="text-xs text-slate-400">Orden de Servicio {orderNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitUpload} className="p-6 space-y-4">
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Image Preview & Picker */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Fotografía / Captura <span className="text-rose-400">*</span>
                </label>

                {previewDataUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-h-56 flex items-center justify-center group">
                    <img
                      src={previewDataUrl}
                      alt="Vista previa"
                      className="max-h-56 w-auto object-contain"
                    />
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewDataUrl(null)}
                        className="px-2.5 py-1 bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow transition"
                      >
                        Cambiar Foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Archivo / Galería */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-xl bg-slate-950/60 hover:bg-slate-800/40 text-center transition flex flex-col items-center justify-center gap-2 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-sky-500/20 text-slate-300 group-hover:text-sky-400 flex items-center justify-center transition">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-white">Subir Archivo</span>
                      <span className="text-[10px] text-slate-500">JPG, PNG, WebP</span>
                    </button>

                    {/* Tomar Foto / Cámara */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-4 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl bg-slate-950/60 hover:bg-slate-800/40 text-center transition flex flex-col items-center justify-center gap-2 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-emerald-500/20 text-slate-300 group-hover:text-emerald-400 flex items-center justify-center transition">
                        <Camera className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-white">Tomar Foto</span>
                      <span className="text-[10px] text-slate-500">Cámara del dispositivo</span>
                    </button>
                  </div>
                )}

                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />
              </div>

              {/* Category / Stage */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Etapa del Servicio <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.type}
                      onClick={() => setPhotoType(cat.type)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition text-center ${
                        photoType === cat.type
                          ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/30'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {cat.type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Título de la Evidencia <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  placeholder="Ej. Pantalla rota con fisura en esquina superior"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Detalles u Observaciones (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={photoDescription}
                  onChange={(e) => setPhotoDescription(e.target.value)}
                  placeholder="Detalles adicionales sobre el estado de la pieza o número de serie..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !previewDataUrl}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-sky-600/30 transition"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Guardar Evidencia</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getCategoryBadgeClass(lightboxImage.type)}`}>
                {lightboxImage.type}
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">{lightboxImage.title}</h3>
                <p className="text-xs text-slate-400">
                  Orden: {orderNumber} • Foto {lightboxIndex + 1} de {filteredImages.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={lightboxImage.imageUrl}
                download={`${orderNumber}-${lightboxImage.type}-${lightboxImage.id}.jpg`}
                title="Descargar fotografía"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Image Viewer with Prev / Next */}
          <div className="relative flex-1 flex items-center justify-center p-2 min-h-0">
            {filteredImages.length > 1 && (
              <button
                type="button"
                onClick={prevLightboxImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 shadow-xl transition"
              >
                ‹
              </button>
            )}

            <img
              src={lightboxImage.imageUrl}
              alt={lightboxImage.title}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
            />

            {filteredImages.length > 1 && (
              <button
                type="button"
                onClick={nextLightboxImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 shadow-xl transition"
              >
                ›
              </button>
            )}
          </div>

          {/* Bottom Bar Info */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
            <div>
              {lightboxImage.description && (
                <p className="text-slate-300 text-xs mb-1 max-w-2xl">{lightboxImage.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {lightboxImage.uploadedByUserName}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {new Date(lightboxImage.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
