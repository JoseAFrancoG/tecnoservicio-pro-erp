import React from 'react';
import { InventoryItem } from '../../types';
import { Modal } from '../Modal';
import { Barcode } from './Barcode';
import { Printer, Tag, DollarSign, Package } from 'lucide-react';

interface BarcodeLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export const BarcodeLabelModal: React.FC<BarcodeLabelModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  if (!item) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handlePrintLabel = () => {
    const printWindow = window.open('', '_blank', 'width=500,height=400');
    if (!printWindow) {
      alert('Por favor permita ventanas emergentes para imprimir la etiqueta.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Etiqueta_${item.sku}</title>
        <style>
          @page {
            size: 60mm 40mm;
            margin: 2mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 4px;
            text-align: center;
            color: #000;
          }
          .title {
            font-size: 8px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
          }
          .item-name {
            font-size: 10px;
            font-weight: 700;
            line-height: 1.1;
            max-height: 22px;
            overflow: hidden;
            margin-bottom: 3px;
          }
          .barcode-container {
            display: flex;
            justify-content: center;
            margin: 2px 0;
          }
          .price {
            font-size: 13px;
            font-weight: 900;
            margin-top: 2px;
          }
          .footer-info {
            font-size: 8px;
            color: #333;
            display: flex;
            justify-content: space-between;
            padding: 0 4px;
            margin-top: 2px;
          }
        </style>
      </head>
      <body>
        <div class="title">TECNOSERVICIO PRO ERP</div>
        <div class="item-name">${item.name}</div>
        <div class="barcode-container">
          ${document.getElementById('barcode-label-svg')?.outerHTML || ''}
        </div>
        <div class="price">${formatCurrency(item.salePrice)}</div>
        <div class="footer-info">
          <span>CAT: ${item.category}</span>
          <span>SKU: ${item.sku}</span>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 200);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Etiqueta y Código de Barras de Repuesto"
      subtitle="Generación de código estándar Code 128 listo para etiquetado térmico de almacén"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Vista previa de etiqueta adhesiva térmica */}
        <div className="bg-gradient-to-b from-slate-100 to-slate-200 p-5 rounded-2xl border border-slate-300 shadow-inner flex justify-center">
          <div
            id="thermal-label-preview"
            className="w-80 bg-white rounded-xl p-4 border border-slate-300/80 shadow-md text-center flex flex-col items-center select-none"
          >
            <div className="w-full flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span>TecnoServicio Pro</span>
              <span className="text-sky-600 font-mono">{item.category}</span>
            </div>

            <h4 className="text-xs font-bold text-slate-900 leading-tight mb-2 line-clamp-2">
              {item.name}
            </h4>

            {/* Código de barras Code 128 */}
            <div id="barcode-label-svg" className="my-1">
              <Barcode value={item.sku} height={52} barWidth={1.7} showText={true} />
            </div>

            <div className="w-full mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  PVP Cliente
                </span>
                <span className="text-base font-extrabold text-emerald-600">
                  {formatCurrency(item.salePrice)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Disponibles
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {item.stockQuantity} unids.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ficha técnica rápida */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">SKU Referencia:</span>
            <span className="font-mono font-bold text-slate-800">{item.sku}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Costo de Entrada:</span>
            <span className="font-mono text-slate-700">{formatCurrency(item.costPrice)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Margen Bruto:</span>
            <span className="font-semibold text-emerald-600">
              +{(((item.salePrice - item.costPrice) / item.costPrice) * 100).toFixed(0)}%
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Alerta de Stock:</span>
            <span className="font-semibold text-rose-600">&le; {item.minStockAlert} unidades</span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handlePrintLabel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow transition"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span>Imprimir Etiqueta Adhesiva</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
