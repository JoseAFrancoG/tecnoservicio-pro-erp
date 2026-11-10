-- ============================================================================
-- TECHSERVICE PRO ERP - BASE DE DATOS EN ESPAÑOL
-- Script 01: Esquema, Tablas, Restricciones e Índices
-- Motor: Microsoft SQL Server 2019 / 2022 / LocalDB
-- ============================================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'TechServiceProDb')
BEGIN
    CREATE DATABASE TechServiceProDb;
END
GO

USE TechServiceProDb;
GO

-- 1. Tabla de Usuarios del Sistema (Técnicos y Administradores)
IF OBJECT_ID(N'dbo.Usuarios', N'U') IS NOT NULL DROP TABLE dbo.Usuarios;
IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL DROP TABLE dbo.Users;

CREATE TABLE dbo.Usuarios (
    Id INT IDENTITY(1,1) NOT NULL,
    NombreCompleto NVARCHAR(150) NOT NULL,
    CorreoElectronico NVARCHAR(150) NOT NULL,
    ClaveHash NVARCHAR(255) NOT NULL,
    Rol NVARCHAR(20) NOT NULL,
    Activo BIT NOT NULL CONSTRAINT DF_Usuarios_Activo DEFAULT 1,
    FechaCreacion DATETIME2(7) NOT NULL CONSTRAINT DF_Usuarios_FechaCreacion DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Usuarios PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT UQ_Usuarios_CorreoElectronico UNIQUE NONCLUSTERED (CorreoElectronico),
    CONSTRAINT CK_Usuarios_Rol CHECK (Rol IN ('Admin', 'Tech'))
);
GO

-- 2. Tabla de Clientes
IF OBJECT_ID(N'dbo.Clientes', N'U') IS NOT NULL DROP TABLE dbo.Clientes;
IF OBJECT_ID(N'dbo.Customers', N'U') IS NOT NULL DROP TABLE dbo.Customers;

CREATE TABLE dbo.Clientes (
    Id INT IDENTITY(1,1) NOT NULL,
    NumeroDocumento NVARCHAR(50) NOT NULL,
    NombreCompleto NVARCHAR(150) NOT NULL,
    Telefono NVARCHAR(50) NULL,
    CorreoElectronico NVARCHAR(150) NULL,
    Direccion NVARCHAR(250) NULL,
    FechaCreacion DATETIME2(7) NOT NULL CONSTRAINT DF_Clientes_FechaCreacion DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Clientes PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT UQ_Clientes_NumeroDocumento UNIQUE NONCLUSTERED (NumeroDocumento)
);
GO

-- 3. Tabla de Inventario de Repuestos y Componentes de Hardware
IF OBJECT_ID(N'dbo.Inventario', N'U') IS NOT NULL DROP TABLE dbo.Inventario;
IF OBJECT_ID(N'dbo.InventoryItems', N'U') IS NOT NULL DROP TABLE dbo.InventoryItems;

CREATE TABLE dbo.Inventario (
    Id INT IDENTITY(1,1) NOT NULL,
    CodigoSku NVARCHAR(50) NOT NULL,
    Nombre NVARCHAR(150) NOT NULL,
    Categoria NVARCHAR(100) NOT NULL,
    PrecioCosto DECIMAL(18,2) NOT NULL,
    PrecioVenta DECIMAL(18,2) NOT NULL,
    CantidadStock INT NOT NULL CONSTRAINT DF_Inventario_CantidadStock DEFAULT 0,
    AlertaStockMinimo INT NOT NULL CONSTRAINT DF_Inventario_AlertaStockMinimo DEFAULT 5,
    FechaCreacion DATETIME2(7) NOT NULL CONSTRAINT DF_Inventario_FechaCreacion DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Inventario PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT UQ_Inventario_CodigoSku UNIQUE NONCLUSTERED (CodigoSku),
    CONSTRAINT CK_Inventario_PrecioCosto CHECK (PrecioCosto >= 0),
    CONSTRAINT CK_Inventario_PrecioVenta CHECK (PrecioVenta >= 0),
    CONSTRAINT CK_Inventario_CantidadStock CHECK (CantidadStock >= 0)
);
GO

-- 4. Tabla de Órdenes de Servicio Técnico
IF OBJECT_ID(N'dbo.HistorialOrdenes', N'U') IS NOT NULL DROP TABLE dbo.HistorialOrdenes;
IF OBJECT_ID(N'dbo.OrderHistory', N'U') IS NOT NULL DROP TABLE dbo.OrderHistory;
IF OBJECT_ID(N'dbo.ItemsOrden', N'U') IS NOT NULL DROP TABLE dbo.ItemsOrden;
IF OBJECT_ID(N'dbo.OrderItems', N'U') IS NOT NULL DROP TABLE dbo.OrderItems;
IF OBJECT_ID(N'dbo.OrdenesServicio', N'U') IS NOT NULL DROP TABLE dbo.OrdenesServicio;
IF OBJECT_ID(N'dbo.ServiceOrders', N'U') IS NOT NULL DROP TABLE dbo.ServiceOrders;

CREATE TABLE dbo.OrdenesServicio (
    Id INT IDENTITY(1,1) NOT NULL,
    NumeroOrden NVARCHAR(50) NOT NULL,
    ClienteId INT NOT NULL,
    TecnicoId INT NULL,
    TipoDispositivo NVARCHAR(100) NOT NULL,
    Marca NVARCHAR(100) NOT NULL,
    Modelo NVARCHAR(100) NOT NULL,
    NumeroSerie NVARCHAR(100) NOT NULL,
    FallaReportada NVARCHAR(MAX) NOT NULL,
    DiagnosticoTecnico NVARCHAR(MAX) NULL,
    Estado NVARCHAR(50) NOT NULL,
    CostoManoObra DECIMAL(18,2) NOT NULL CONSTRAINT DF_OrdenesServicio_CostoManoObra DEFAULT 0.00,
    CostoTotal DECIMAL(18,2) NOT NULL CONSTRAINT DF_OrdenesServicio_CostoTotal DEFAULT 0.00,
    FechaCreacion DATETIME2(7) NOT NULL CONSTRAINT DF_OrdenesServicio_FechaCreacion DEFAULT SYSUTCDATETIME(),
    FechaFinalizacion DATETIME2(7) NULL,
    CONSTRAINT PK_OrdenesServicio PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT UQ_OrdenesServicio_NumeroOrden UNIQUE NONCLUSTERED (NumeroOrden),
    CONSTRAINT FK_OrdenesServicio_Clientes FOREIGN KEY (ClienteId) REFERENCES dbo.Clientes(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_OrdenesServicio_Usuarios_Tecnico FOREIGN KEY (TecnicoId) REFERENCES dbo.Usuarios(Id) ON DELETE SET NULL,
    CONSTRAINT CK_OrdenesServicio_Estado CHECK (Estado IN ('Recibido', 'En Diagnostico', 'Esperando Repuesto', 'En Reparacion', 'Listo para Entrega', 'Entregado')),
    CONSTRAINT CK_OrdenesServicio_CostoManoObra CHECK (CostoManoObra >= 0),
    CONSTRAINT CK_OrdenesServicio_CostoTotal CHECK (CostoTotal >= 0)
);
GO

-- 5. Tabla de Repuestos/Ítems asignados a una Orden
CREATE TABLE dbo.ItemsOrden (
    Id INT IDENTITY(1,1) NOT NULL,
    OrdenServicioId INT NOT NULL,
    InventarioItemId INT NOT NULL,
    Cantidad INT NOT NULL,
    PrecioUnitario DECIMAL(18,2) NOT NULL,
    Subtotal DECIMAL(18,2) NOT NULL,
    FechaCreacion DATETIME2(7) NOT NULL CONSTRAINT DF_ItemsOrden_FechaCreacion DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_ItemsOrden PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_ItemsOrden_OrdenesServicio FOREIGN KEY (OrdenServicioId) REFERENCES dbo.OrdenesServicio(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ItemsOrden_Inventario FOREIGN KEY (InventarioItemId) REFERENCES dbo.Inventario(Id) ON DELETE NO ACTION,
    CONSTRAINT CK_ItemsOrden_Cantidad CHECK (Cantidad > 0),
    CONSTRAINT CK_ItemsOrden_PrecioUnitario CHECK (PrecioUnitario >= 0),
    CONSTRAINT CK_ItemsOrden_Subtotal CHECK (Subtotal >= 0)
);
GO

-- 6. Tabla de Histórico y Trazabilidad de Estados de la Orden
CREATE TABLE dbo.HistorialOrdenes (
    Id INT IDENTITY(1,1) NOT NULL,
    OrdenServicioId INT NOT NULL,
    EstadoAnterior NVARCHAR(50) NULL,
    EstadoNuevo NVARCHAR(50) NOT NULL,
    Comentario NVARCHAR(MAX) NULL,
    UsuarioModificoId INT NOT NULL,
    FechaModificacion DATETIME2(7) NOT NULL CONSTRAINT DF_HistorialOrdenes_FechaModificacion DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_HistorialOrdenes PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_HistorialOrdenes_OrdenesServicio FOREIGN KEY (OrdenServicioId) REFERENCES dbo.OrdenesServicio(Id) ON DELETE CASCADE,
    CONSTRAINT FK_HistorialOrdenes_Usuarios FOREIGN KEY (UsuarioModificoId) REFERENCES dbo.Usuarios(Id) ON DELETE NO ACTION
);
GO

-- 7. Tabla de Evidencias Fotográficas y Registro de Imágenes
IF OBJECT_ID(N'dbo.EvidenciasFotograficas', N'U') IS NOT NULL DROP TABLE dbo.EvidenciasFotograficas;

CREATE TABLE dbo.EvidenciasFotograficas (
    Id INT IDENTITY(1,1) NOT NULL,
    OrdenServicioId INT NOT NULL,
    Tipo NVARCHAR(50) NOT NULL,
    Titulo NVARCHAR(150) NOT NULL,
    Descripcion NVARCHAR(MAX) NULL,
    UrlImagen NVARCHAR(MAX) NOT NULL,
    SubidoPorUsuarioId INT NOT NULL,
    FechaCreacion DATETIME2(7) NOT NULL CONSTRAINT DF_EvidenciasFotograficas_FechaCreacion DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_EvidenciasFotograficas PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_EvidenciasFotograficas_OrdenesServicio FOREIGN KEY (OrdenServicioId) REFERENCES dbo.OrdenesServicio(Id) ON DELETE CASCADE,
    CONSTRAINT FK_EvidenciasFotograficas_Usuarios FOREIGN KEY (SubidoPorUsuarioId) REFERENCES dbo.Usuarios(Id) ON DELETE NO ACTION
);
GO

-- ============================================================================
-- ÍNDICES DE RENDIMIENTO EN ESPAÑOL
-- ============================================================================

CREATE NONCLUSTERED INDEX IX_OrdenesServicio_Estado ON dbo.OrdenesServicio(Estado) INCLUDE (CostoTotal, FechaFinalizacion);
CREATE NONCLUSTERED INDEX IX_OrdenesServicio_ClienteId ON dbo.OrdenesServicio(ClienteId);
CREATE NONCLUSTERED INDEX IX_OrdenesServicio_TecnicoId ON dbo.OrdenesServicio(TecnicoId);
CREATE NONCLUSTERED INDEX IX_OrdenesServicio_NumeroSerie ON dbo.OrdenesServicio(NumeroSerie);

CREATE NONCLUSTERED INDEX IX_Inventario_AlertaStock ON dbo.Inventario(CantidadStock, AlertaStockMinimo);
CREATE NONCLUSTERED INDEX IX_ItemsOrden_OrdenServicioId ON dbo.ItemsOrden(OrdenServicioId);
CREATE NONCLUSTERED INDEX IX_HistorialOrdenes_OrdenServicioId ON dbo.HistorialOrdenes(OrdenServicioId, FechaModificacion DESC);
GO
