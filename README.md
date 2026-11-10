# TecnoServicio Pro ERP 🚀
### Sistema Empresarial de Gestión de Servicio Técnico de Hardware, Inventario y Facturación

[![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2019%2F2022%2FLocalDB-CC292B?logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/sql-server)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 🏗️ Arquitectura del Monorepo

```
techservice-pro-erp/
├── database/
│   ├── 01_schema_and_tables.sql       # Tablas, PKs, FKs, constraints, índices e historial
│   ├── 02_stored_procedures.sql       # sp_GetDashboardMetrics (múltiples result sets de alto rendimiento)
│   └── 03_seed_data.sql               # Usuarios (Admin/Tech), clientes, repuestos y órdenes en COP
├── backend/
│   ├── TechService.sln                # Solución Visual Studio / .NET CLI (net10.0)
│   ├── TechService.Core/              # Dominio: Entidades, Interfaces, Enums, DTOs
│   ├── TechService.Infra/             # Persistencia: EF Core DbContext, Repositorios, Servicios ACID
│   └── TechService.API/               # Web API: Controladores, Middleware, Swagger Bearer, JWT Auth
└── frontend/                          # React 18 + Vite + TypeScript + Tailwind CSS
    ├── src/
    │   ├── api/                       # Cliente Axios con interceptor Bearer JWT
    │   ├── components/                # UI Enterprise: Sidebar, Navbar, StatusBadge, Modal, KPICards
    │   │   ├── barcode/               # Generador e impresión Code 128 + Escáner por cámara/láser
    │   │   └── orders/                # Galería de evidencias fotográficas con Lightbox y cámara
    │   ├── context/                   # AuthContext con gestión de sesión y roles
    │   ├── features/                  # auth/, dashboard/, orders/, inventory/
    │   ├── types/                     # Interfaces TypeScript alineadas a los DTOs de C#
    │   ├── utils/                     # Generador nativo de reportes en PDF de órdenes de servicio
    │   ├── App.tsx                    # Layout unificado y enrutador por pestañas
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## 🌟 Características Principales

1. **Gestión Completa de Órdenes de Servicio:**
   - Registro de equipos, marcas, modelos, series y fallas reportadas.
   - Diagnóstico técnico, costos de mano de obra y liquidación en Pesos Colombianos (COP).
   - Generación y descarga directa de órdenes en formato **PDF listo para imprimir** con términos de garantía y firmas.

2. **Registro de Evidencias Fotográficas:**
   - Soporte para adjuntar fotografías del estado físico del equipo por etapas: *Ingreso / Recepción*, *Diagnóstico Técnico*, *Reparación / Cambio* y *Entrega / Final*.
   - Captura directa con la cámara del dispositivo móvil o carga de imágenes desde el disco.
   - Compresión automática en el navegador (Canvas) y almacenamiento portable en Base64 en base de datos.
   - Visor Lightbox a pantalla completa con descarga individual e integración en el reporte PDF.

3. **Control de Inventario y Código de Barras (Code 128):**
   - Generación automática de códigos SKU únicos por categoría (`REP-DIS-XXXX`, `REP-BAT-XXXX`, etc.).
   - Generador visual de etiquetas de código de barras Code 128 en formato vectorial SVG para impresión.
   - Lector y escáner de códigos de barras mediante la cámara web/móvil o lectores físicos láser USB con confirmación sonora (audio beep).

4. **Trazabilidad y Transacciones ACID:**
   - Deducción atómica de repuestos de almacén con validación de stock y rollback ante inconsistencias.
   - Historial y auditoría automática de cada cambio de estado, fecha y usuario responsable.

---

## ⚙️ Puesta en Marcha

### 1. Base de Datos (SQL Server)
Ejecute secuencialmente los scripts en SQL Server Management Studio (SSMS), Azure Data Studio o `sqlcmd`:
1. `database/01_schema_and_tables.sql`
2. `database/02_stored_procedures.sql`
3. `database/03_seed_data.sql`

### 2. Backend (.NET 10 Web API)
Configure la cadena de conexión en `backend/TechService.API/appsettings.json`:
```json
"ConnectionStrings": {
  "TechServiceDb": "Server=(localdb)\\mssqllocaldb;Database=TechServiceProDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;"
}
```
Inicie el backend desde la carpeta `backend/TechService.API`:
```bash
dotnet restore
dotnet run
```
* **Swagger UI:** `https://localhost:53092/swagger`

### 3. Frontend (React + Vite + TypeScript + Tailwind)
Desde la carpeta `frontend/`:
```bash
npm install
npm run dev
```
* Acceda a `http://localhost:5173`.

---

## 🔑 Credenciales Semilla (Demo)

| Rol | Correo Electrónico | Contraseña | Capacidades |
|---|---|---|---|
| **Administrador** | `admin@techservice.com` | `Admin123!` | Control global, métricas financieras, creación de órdenes y catálogo |
| **Técnico Hardware** | `tecnico@techservice.com` | `Tech123!` | Diagnóstico técnico, cambio de estados, asignación de repuestos y fotos |

> **Nota:** La pantalla de inicio de sesión incluye botones de acceso con un solo clic (*Demo Admin* y *Demo Técnico*).
