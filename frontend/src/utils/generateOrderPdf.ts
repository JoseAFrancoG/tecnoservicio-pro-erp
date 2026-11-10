import { ServiceOrderDetail } from '../types';

export const generateOrderPdf = (order: ServiceOrderDetail) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalParts = order.items.reduce((acc, it) => acc + it.subtotal, 0);

  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) {
    alert('Por favor permita las ventanas emergentes (pop-ups) en su navegador para generar el PDF.');
    return;
  }

  const itemsRows =
    order.items.length === 0
      ? `<tr><td colspan="5" style="text-align:center; padding: 12px; color: #64748b; font-style: italic;">No se requirieron repuestos de almacén para este servicio.</td></tr>`
      : order.items
          .map(
            (it) => `
            <tr>
              <td style="padding: 10px; font-family: monospace; font-weight: 600; color: #334155;">${it.sku}</td>
              <td style="padding: 10px; color: #1e293b;">${it.itemName}</td>
              <td style="padding: 10px; text-align: center; font-weight: bold;">${it.quantity}</td>
              <td style="padding: 10px; text-align: right; color: #475569;">${formatCurrency(it.unitPrice)}</td>
              <td style="padding: 10px; text-align: right; font-weight: bold; color: #0f172a;">${formatCurrency(it.subtotal)}</td>
            </tr>
          `
          )
          .join('');

  const historyRows =
    order.history.length === 0
      ? `<tr><td colspan="4" style="text-align:center; padding: 8px; color: #64748b;">Sin eventos registrados.</td></tr>`
      : order.history
          .map(
            (h) => `
            <tr>
              <td style="padding: 6px 10px; font-size: 11px; color: #64748b;">${formatDate(h.changedAt)}</td>
              <td style="padding: 6px 10px; font-size: 11px; font-weight: 600; color: #0284c7;">${h.newStatus}</td>
              <td style="padding: 6px 10px; font-size: 11px; color: #334155;">${h.comment || '-'}</td>
              <td style="padding: 6px 10px; font-size: 11px; color: #475569;">${h.changedByUserName}</td>
            </tr>
          `
          )
          .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Orden_${order.orderNumber}.pdf</title>
      <style>
        @page {
          size: letter;
          margin: 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 20px;
          background-color: #ffffff;
          font-size: 12px;
          line-height: 1.4;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0284c7;
          padding-bottom: 14px;
          margin-bottom: 18px;
        }
        .brand-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
        .brand-sub {
          font-size: 11px;
          color: #64748b;
          margin: 2px 0 0 0;
        }
        .order-badge {
          text-align: right;
        }
        .order-number {
          font-size: 18px;
          font-weight: 800;
          font-family: monospace;
          color: #0284c7;
          margin: 0;
        }
        .status-pill {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          background-color: #f1f5f9;
          color: #334155;
          margin-top: 4px;
          border: 1px solid #cbd5e1;
        }
        .grid-2 {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }
        .card {
          flex: 1;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
        }
        .card-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #0284c7;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4px;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        .field-row {
          margin-bottom: 4px;
        }
        .field-label {
          font-weight: 600;
          color: #64748b;
          font-size: 11px;
        }
        .field-val {
          color: #0f172a;
        }
        .section-title {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          margin: 16px 0 8px 0;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 14px;
          font-size: 11px;
        }
        th {
          background-color: #f1f5f9;
          color: #475569;
          text-transform: uppercase;
          font-weight: 700;
          font-size: 10px;
          padding: 8px 10px;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
        }
        td {
          border-bottom: 1px solid #f1f5f9;
        }
        .totals-container {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
          margin-bottom: 18px;
        }
        .totals-box {
          width: 280px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 12px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          font-size: 11px;
        }
        .total-row.grand {
          border-top: 2px solid #0284c7;
          margin-top: 6px;
          padding-top: 8px;
          font-size: 14px;
          font-weight: 800;
          color: #0284c7;
        }
        .terms {
          font-size: 9px;
          color: #64748b;
          background: #f8fafc;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          margin-top: 16px;
        }
        .signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
          padding-top: 20px;
        }
        .sign-box {
          width: 42%;
          text-align: center;
          border-top: 1px solid #94a3b8;
          padding-top: 6px;
          font-size: 11px;
          color: #334155;
        }
        .watermark {
          position: fixed;
          top: 40%;
          left: 20%;
          transform: rotate(-30deg);
          font-size: 68px;
          font-weight: 900;
          color: rgba(2, 132, 199, 0.05);
          pointer-events: none;
          text-transform: uppercase;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="watermark">${order.status}</div>

      <!-- Action Bar -->
      <div class="no-print" style="margin-bottom: 18px; padding: 10px; background: #e0f2fe; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 12px; color: #0369a1; font-weight: 600;">Vista preliminar de impresión de documento comercial</span>
        <button onclick="window.print()" style="padding: 8px 16px; background: #0284c7; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
          🖨️ Imprimir / Guardar en PDF
        </button>
      </div>

      <!-- Header -->
      <div class="header">
        <div>
          <h1 class="brand-title">TECNOSERVICIO PRO ERP</h1>
          <p class="brand-sub">Servicio Técnico Especializado de Hardware, Diagnóstico & Mantenimiento</p>
          <p class="brand-sub">NIT: 901.458.723-1 • Medellín, Colombia • Tel: (+57) 310 456 7890</p>
        </div>
        <div class="order-badge">
          <p class="order-number">${order.orderNumber}</p>
          <div class="status-pill">${order.status.toUpperCase()}</div>
          <p style="font-size: 10px; color: #64748b; margin-top: 4px;">Emisión: ${formatDate(order.createdAt)}</p>
        </div>
      </div>

      <!-- Cards Grid: Cliente & Dispositivo -->
      <div class="grid-2">
        <div class="card">
          <div class="card-title">Información del Cliente</div>
          <div class="field-row"><span class="field-label">Nombre / Razón Social: </span><span class="field-val" style="font-weight: 600;">${order.customerName}</span></div>
          <div class="field-row"><span class="field-label">Documento / NIT: </span><span class="field-val font-mono">${order.customerDocument}</span></div>
          <div class="field-row"><span class="field-label">Teléfono: </span><span class="field-val">${order.customerPhone || 'N/A'}</span></div>
          <div class="field-row"><span class="field-label">Email: </span><span class="field-val">${order.customerEmail || 'N/A'}</span></div>
          <div class="field-row"><span class="field-label">Dirección: </span><span class="field-val">${order.customerAddress || 'N/A'}</span></div>
        </div>

        <div class="card">
          <div class="card-title">Datos del Equipo en Laboratorio</div>
          <div class="field-row"><span class="field-label">Dispositivo: </span><span class="field-val" style="font-weight: 600;">${order.deviceType}</span></div>
          <div class="field-row"><span class="field-label">Marca y Modelo: </span><span class="field-val">${order.brand} ${order.model}</span></div>
          <div class="field-row"><span class="field-label">Número de Serie: </span><span class="field-val" style="font-family: monospace; font-weight: 700;">${order.serialNumber}</span></div>
          <div class="field-row"><span class="field-label">Técnico Encargado: </span><span class="field-val">${order.technicianName || 'Por Asignar'}</span></div>
          <div class="field-row"><span class="field-label">Entrega / Cierre: </span><span class="field-val">${formatDate(order.completedAt)}</span></div>
        </div>
      </div>

      <!-- Falla y Diagnóstico -->
      <div style="margin-bottom: 14px;">
        <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 10px; margin-bottom: 8px;">
          <strong style="color: #b45309; font-size: 11px; text-transform: uppercase;">Sintomatología / Falla Reportada por Cliente:</strong>
          <p style="margin: 4px 0 0 0; color: #78350f; font-style: italic;">"${order.reportedIssue}"</p>
        </div>

        ${
          order.technicalDiagnosis
            ? `
          <div style="background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 6px; padding: 10px;">
            <strong style="color: #15803d; font-size: 11px; text-transform: uppercase;">Diagnóstico Técnico & Solución Aplicada:</strong>
            <p style="margin: 4px 0 0 0; color: #166534;">${order.technicalDiagnosis}</p>
          </div>
        `
            : ''
        }
      </div>

      <!-- Tabla de Repuestos -->
      <div class="section-title">Repuestos de Hardware & Consumibles Asignados</div>
      <table>
        <thead>
          <tr>
            <th style="text-align: left; width: 18%;">Código SKU</th>
            <th style="text-align: left;">Descripción de la Pieza</th>
            <th style="text-align: center; width: 10%;">Cant.</th>
            <th style="text-align: right; width: 18%;">Precio Unit.</th>
            <th style="text-align: right; width: 18%;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      ${
        order.images && order.images.length > 0
          ? `
        <div class="section-title">Registro y Evidencias Fotográficas (${order.images.length})</div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px;">
          ${order.images
            .map(
              (img) => `
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; background: #f8fafc; font-size: 10px;">
              <div style="height: 120px; overflow: hidden; background: #0f172a; display: flex; align-items: center; justify-content: center;">
                <img src="${img.imageUrl}" alt="${img.title}" style="max-height: 120px; max-width: 100%; object-fit: cover;" />
              </div>
              <div style="padding: 6px 8px;">
                <span style="display: inline-block; padding: 2px 5px; font-size: 9px; font-weight: bold; border-radius: 4px; background: #e0f2fe; color: #0369a1; text-transform: uppercase;">
                  ${img.type}
                </span>
                <div style="font-weight: 600; color: #1e293b; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${img.title}
                </div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `
          : ''
      }

      <!-- Resumen de Costos -->
      <div class="totals-container">
        <div class="totals-box">
          <div class="total-row">
            <span style="color: #64748b;">Subtotal Repuestos:</span>
            <span style="font-weight: 600;">${formatCurrency(totalParts)}</span>
          </div>
          <div class="total-row">
            <span style="color: #64748b;">Mano de Obra Especializada:</span>
            <span style="font-weight: 600;">${formatCurrency(order.laborCost)}</span>
          </div>
          <div class="total-row grand">
            <span>TOTAL LIQUIDADO:</span>
            <span>${formatCurrency(order.totalCost)}</span>
          </div>
        </div>
      </div>

      <!-- Trazabilidad resumida -->
      <div class="section-title">Historial de Estados y Auditoría</div>
      <table>
        <thead>
          <tr>
            <th style="text-align: left; width: 25%;">Fecha y Hora</th>
            <th style="text-align: left; width: 20%;">Estado</th>
            <th style="text-align: left;">Observaciones</th>
            <th style="text-align: left; width: 20%;">Registrado Por</th>
          </tr>
        </thead>
        <tbody>
          ${historyRows}
        </tbody>
      </table>

      <!-- Cláusula de Garantía -->
      <div class="terms">
        <strong>Términos de Garantía y Entrega:</strong>
        Todo servicio cuenta con 90 días calendario de garantía sobre mano de obra y repuestos sustituidos, contados a partir de la fecha de retiro. La garantía no cubre fallas por sobretensión eléctrica externa, derrames de líquidos o manipulación de precintos de seguridad por terceros no autorizados.
      </div>

      <!-- Firmas -->
      <div class="signatures">
        <div class="sign-box">
          Firma Técnico Especialista<br>
          <strong>${order.technicianName || 'TecnoServicio Pro ERP'}</strong>
        </div>
        <div class="sign-box">
          Firma Recibido a Satisfacción del Cliente<br>
          <strong>${order.customerName}</strong><br>
          C.C. / NIT: ${order.customerDocument}
        </div>
      </div>

      <script>
        window.onload = function() {
          // Si el usuario lo prefiere, activa automáticamente el cuadro de impresión
          setTimeout(function() {
            window.print();
          }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
