# TecnoServicio Pro ERP 🚀
### Sistema Empresarial de Gestión de Servicio Técnico de Hardware e Inventario

[![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2019%2F2022-CC292B?logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/sql-server)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 🏗️ Arquitectura del Monorepo

```
techservice-pro-erp/
├── database/
│   ├── 01_schema_and_tables.sql       # Tablas, PKs, FKs, constraints e índices optimizados
│   ├── 02_stored_procedures.sql       # sp_GetDashboardMetrics (múltiples result sets de alto rendimiento)
│   └── 03_seed_data.sql               # Usuarios (Admin/Tech), clientes, repuestos y órdenes de prueba
├── backend/
│   ├── TechService.sln                # Solución Visual Studio / .NET CLI
│   ├── TechService.Core/              # Domain: Entities, Interfaces, Enums, DTOs
│   ├── TechService.Infra/             # Persistencia: EF Core DbContext, Repositorios, Servicios ACID
│   └── TechService.API/               # Web API: Controladores, Middleware, Swagger Bearer, JWT Auth
└── frontend/                          # React 18 + Vite + TypeScript + Tailwind CSS
    ├── src/
    │   ├── api/                       # Cliente Axios con interceptor Bearer JWT
    │   ├── components/                # UI Enterprise: Sidebar, Navbar, StatusBadge, Modal, KPICards
    │   ├── context/                   # AuthContext con gestión de sesión y roles
    │   ├── features/                  # auth/, dashboard/, orders/, inventory/
    │   ├── types/                     # Interfaces TypeScript alineadas a los DTOs de C#
    │   ├── App.tsx                    # Layout unificado y enrutador por pestañas
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## ⚙️ Puesta en Marcha

### 1. Base de Datos (SQL Server)
Ejecute secuencialmente los scripts en SQL Server Management Studio (SSMS), Azure Data Studio o `sqlcmd`:
1. `database/01_schema_and_tables.sql`
2. `database/02_stored_procedures.sql`
3. `database/03_seed_data.sql`

### 2. Backend (.NET 8 Web API)
Configure la cadena de conexión en `backend/TechService.API/appsettings.json`:
```json
"ConnectionStrings": {
  "TechServiceDb": "Server=localhost;Database=TechServiceProDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;"
}
```
Inicie el backend desde la carpeta `backend/TechService.API`:
```bash
dotnet restore
dotnet run
```
* **Swagger UI:** `http://localhost:5000/swagger` (o puerto configurado por Kestrel).

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
| **Administrador** | `admin@techservice.com` | `Admin123!` | Control global, finanzas, creación de órdenes y catálogo de repuestos |
| **Técnico Hardware** | `tecnico@techservice.com` | `Tech123!` | Diagnóstico técnico, cambio de estados y asignación de repuestos con validación de stock |

> **Nota:** La pantalla de Login incluye botones de acceso con un solo clic (*Demo Admin* y *Demo Técnico*) para agilizar pruebas operativas.

---

## 🔒 Reglas Críticas de Negocio Implementadas

1. **Transacciones ACID en Deducción de Stock (`POST /api/orders/{id}/items`):**
   - Utiliza explícitamente `BeginTransactionAsync()` en EF Core.
   - Verifica existencia e idoneidad: `StockQuantity >= Quantity`.
   - Si no hay suficiente existencia, lanza excepción y hace `RollbackAsync()`, retornando código `400 Bad Request`.
   - Si es válido: descuenta el stock en `InventoryItems`, inserta en `OrderItems`, recalcula el costo total (`LaborCost + SUM(OrderItems.Subtotal)`), crea registro de auditoría en `OrderHistory` y ejecuta `CommitAsync()`.

2. **Auditoría Automática de Estados (`PATCH /api/orders/{id}/status`):**
   - Actualiza el estado del equipo (`Recibido`, `En Diagnostico`, `Esperando Repuesto`, `En Reparacion`, `Listo para Entrega`, `Entregado`).
   - Inserta automáticamente la trazabilidad en `OrderHistory` con el usuario que efectuó la acción y marca `CompletedAt` si el estado final es `Entregado`.

3. **Dashboard de Alto Rendimiento (`GET /api/dashboard/summary`):**
   - Ejecuta directamente `sp_GetDashboardMetrics` procesando 3 Result Sets en una sola llamada a base de datos para KPIs globales, histórico semestral por categorías y alertas críticas de stock.
