-- ============================================================================
-- TECHSERVICE PRO ERP - SEED DATA EN PESOS COLOMBIANOS (COP)
-- Script 03: Inserción de Datos Iniciales en Moneda COP (Codificación UTF-8)
-- ============================================================================

USE TechServiceProDb;
GO

SET NOCOUNT ON;

-- ----------------------------------------------------------------------------
-- 1. USUARIOS DEL SISTEMA
-- ----------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE CorreoElectronico = 'admin@techservice.com')
BEGIN
    INSERT INTO dbo.Usuarios (NombreCompleto, CorreoElectronico, ClaveHash, Rol, Activo, FechaCreacion)
    VALUES (
        N'Carlos Mendoza (Director de Operaciones)',
        N'admin@techservice.com',
        N'$2a$11$7/R5bS13p3L3XnO5iI0pTu7fC1gO014sM9UfX1e1sZ7m6qB5p4iQW', -- Admin123!
        N'Admin',
        1,
        DATEADD(MONTH, -6, SYSUTCDATETIME())
    );
END

IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE CorreoElectronico = 'tecnico@techservice.com')
BEGIN
    INSERT INTO dbo.Usuarios (NombreCompleto, CorreoElectronico, ClaveHash, Rol, Activo, FechaCreacion)
    VALUES (
        N'Andrés Valenzuela (Técnico Senior Hardware)',
        N'tecnico@techservice.com',
        N'$2a$11$7/R5bS13p3L3XnO5iI0pTu7fC1gO014sM9UfX1e1sZ7m6qB5p4iQW', -- Tech123! / Password123!
        N'Tech',
        1,
        DATEADD(MONTH, -6, SYSUTCDATETIME())
    );
END
GO

-- ----------------------------------------------------------------------------
-- 2. CLIENTES
-- ----------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Clientes WHERE NumeroDocumento = 'CLI-10203040')
BEGIN
    INSERT INTO dbo.Clientes (NumeroDocumento, NombreCompleto, Telefono, CorreoElectronico, Direccion, FechaCreacion)
    VALUES 
    (N'CLI-10203040', N'Mariana Restrepo Gómez', N'+57 310 456 7890', N'mariana.restrepo@empresa.com', N'Cra 43A # 18 Sur - 45, Medellín', DATEADD(MONTH, -5, SYSUTCDATETIME())),
    (N'CLI-20304050', N'Soluciones Digitales S.A.S.', N'+57 320 890 1234', N'soporte@solucionesdigitales.co', N'Av. Las Palmas Km 4 Edificio Alpha Of. 302, Medellín', DATEADD(MONTH, -4, SYSUTCDATETIME())),
    (N'CLI-30405060', N'Jorge Esteban Morales', N'+57 301 777 8899', N'jorge.morales@gmail.com', N'Calle 10 # 32 - 14, El Poblado, Medellín', DATEADD(MONTH, -3, SYSUTCDATETIME())),
    (N'CLI-40506070', N'Carolina Duarte Pardo', N'+57 315 222 3344', N'carolina.duarte@consultores.com', N'Transversal 39 # 72 - 10, Laureles, Medellín', DATEADD(MONTH, -2, SYSUTCDATETIME())),
    (N'CLI-50607080', N'Laboratorios Médicos del Valle', N'+57 318 666 4422', N'sistemas@labmedicos.org', N'Calle 5D # 38A - 35, Cali', DATEADD(MONTH, -1, SYSUTCDATETIME()));
END
GO

-- ----------------------------------------------------------------------------
-- 3. INVENTARIO DE REPUESTOS EN PESOS COLOMBIANOS (COP)
-- ----------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Inventario WHERE CodigoSku = 'REP-SSD-1TB-NVME')
BEGIN
    INSERT INTO dbo.Inventario (CodigoSku, Nombre, Categoria, PrecioCosto, PrecioVenta, CantidadStock, AlertaStockMinimo, FechaCreacion)
    VALUES
    (N'REP-SSD-1TB-NVME', N'SSD Kingston NV2 1TB PCIe 4.0 NVMe M.2', N'Almacenamiento', 170000.00, 260000.00, 14, 5, SYSUTCDATETIME()),
    (N'REP-SSD-500-NVME', N'SSD Crucial P3 500GB PCIe 3.0 NVMe M.2', N'Almacenamiento', 115000.00, 180000.00, 3, 5, SYSUTCDATETIME()), -- ALERTA CRÍTICA (3 <= 5)
    (N'REP-RAM-16GB-DDR4', N'Memoria RAM Corsair Vengeance SODIMM 16GB DDR4 3200MHz', N'Memoria RAM', 120000.00, 195000.00, 8, 4, SYSUTCDATETIME()),
    (N'REP-RAM-16GB-DDR5', N'Memoria RAM Crucial SODIMM 16GB DDR5 4800MHz', N'Memoria RAM', 175000.00, 280000.00, 2, 4, SYSUTCDATETIME()), -- ALERTA CRÍTICA (2 <= 4)
    (N'REP-FAN-ASUS-G14', N'Ventilador CPU/GPU Repuesto para Asus ROG Zephyrus G14', N'Refrigeración', 60000.00, 110000.00, 6, 3, SYSUTCDATETIME()),
    (N'REP-DISP-156-FHD', N'Pantalla IPS 15.6" Full HD 144Hz Slim eDP 30 pines', N'Pantallas', 280000.00, 450000.00, 1, 3, SYSUTCDATETIME()), -- ALERTA CRÍTICA (1 <= 3)
    (N'REP-BAT-DELL-56WH', N'Batería Original Dell XPS 15 56Wh Type H5H20', N'Baterías', 190000.00, 320000.00, 4, 2, SYSUTCDATETIME()),
    (N'REP-THM-MX4-4G', N'Pasta Térmica Arctic MX-4 4g Alto Rendimiento', N'Consumibles', 22000.00, 48000.00, 22, 6, SYSUTCDATETIME());
END
GO

-- ----------------------------------------------------------------------------
-- 4. ÓRDENES DE SERVICIO EN PESOS COLOMBIANOS (COP)
-- ----------------------------------------------------------------------------
DECLARE @AdminId INT = (SELECT TOP 1 Id FROM dbo.Usuarios WHERE CorreoElectronico = 'admin@techservice.com');
DECLARE @TecnicoId INT = (SELECT TOP 1 Id FROM dbo.Usuarios WHERE CorreoElectronico = 'tecnico@techservice.com');

DECLARE @Cliente1 INT = (SELECT TOP 1 Id FROM dbo.Clientes WHERE NumeroDocumento = 'CLI-10203040');
DECLARE @Cliente2 INT = (SELECT TOP 1 Id FROM dbo.Clientes WHERE NumeroDocumento = 'CLI-20304050');
DECLARE @Cliente3 INT = (SELECT TOP 1 Id FROM dbo.Clientes WHERE NumeroDocumento = 'CLI-30405060');
DECLARE @Cliente4 INT = (SELECT TOP 1 Id FROM dbo.Clientes WHERE NumeroDocumento = 'CLI-40506070');
DECLARE @Cliente5 INT = (SELECT TOP 1 Id FROM dbo.Clientes WHERE NumeroDocumento = 'CLI-50607080');

DECLARE @ItemSSD1TB INT = (SELECT TOP 1 Id FROM dbo.Inventario WHERE CodigoSku = 'REP-SSD-1TB-NVME');
DECLARE @ItemRAM16DDR4 INT = (SELECT TOP 1 Id FROM dbo.Inventario WHERE CodigoSku = 'REP-RAM-16GB-DDR4');
DECLARE @ItemPasta INT = (SELECT TOP 1 Id FROM dbo.Inventario WHERE CodigoSku = 'REP-THM-MX4-4G');
DECLARE @ItemPantalla INT = (SELECT TOP 1 Id FROM dbo.Inventario WHERE CodigoSku = 'REP-DISP-156-FHD');
DECLARE @ItemBateria INT = (SELECT TOP 1 Id FROM dbo.Inventario WHERE CodigoSku = 'REP-BAT-DELL-56WH');

-- ORDEN 1: Entregada en el mes actual
IF NOT EXISTS (SELECT 1 FROM dbo.OrdenesServicio WHERE NumeroOrden = 'ORD-2026-0001')
BEGIN
    INSERT INTO dbo.OrdenesServicio (NumeroOrden, ClienteId, TecnicoId, TipoDispositivo, Marca, Modelo, NumeroSerie, FallaReportada, DiagnosticoTecnico, Estado, CostoManoObra, CostoTotal, FechaCreacion, FechaFinalizacion)
    VALUES ('ORD-2026-0001', @Cliente1, @TecnicoId, N'Laptop', N'Dell', N'XPS 15 9500', N'DLXPS-99281-B', N'No enciende con cargador ni batería, recalentamiento previo.', N'Batería con corto en circuito de protección y pasta térmica degradada. Se reemplazó batería y se ejecutó mantenimiento térmico integral.', 'Entregado', 150000.00, 518000.00, DATEADD(DAY, -7, SYSUTCDATETIME()), DATEADD(DAY, -1, SYSUTCDATETIME()));

    DECLARE @Ord1Id INT = SCOPE_IDENTITY();

    INSERT INTO dbo.ItemsOrden (OrdenServicioId, InventarioItemId, Cantidad, PrecioUnitario, Subtotal)
    VALUES 
    (@Ord1Id, @ItemBateria, 1, 320000.00, 320000.00),
    (@Ord1Id, @ItemPasta, 1, 48000.00, 48000.00);

    INSERT INTO dbo.HistorialOrdenes (OrdenServicioId, EstadoAnterior, EstadoNuevo, Comentario, UsuarioModificoId, FechaModificacion)
    VALUES 
    (@Ord1Id, NULL, N'Recibido', N'Equipo recibido en mostrador con cargador original.', @AdminId, DATEADD(DAY, -7, SYSUTCDATETIME())),
    (@Ord1Id, N'Recibido', N'En Diagnostico', N'Asignado a banco de pruebas para medición de voltajes.', @TecnicoId, DATEADD(DAY, -6, SYSUTCDATETIME())),
    (@Ord1Id, N'En Diagnostico', N'En Reparacion', N'Falla confirmada en batería. Procediendo a reemplazo y limpieza interna.', @TecnicoId, DATEADD(DAY, -4, SYSUTCDATETIME())),
    (@Ord1Id, N'En Reparacion', N'Listo para Entrega', N'Pruebas de estrés y carga exitosas durante 4 horas continuas.', @TecnicoId, DATEADD(DAY, -2, SYSUTCDATETIME())),
    (@Ord1Id, N'Listo para Entrega', N'Entregado', N'Cliente retira el equipo a entera satisfacción con pago completo.', @AdminId, DATEADD(DAY, -1, SYSUTCDATETIME()));
END

-- ORDEN 2: Entregada en mes anterior
IF NOT EXISTS (SELECT 1 FROM dbo.OrdenesServicio WHERE NumeroOrden = 'ORD-2026-0002')
BEGIN
    INSERT INTO dbo.OrdenesServicio (NumeroOrden, ClienteId, TecnicoId, TipoDispositivo, Marca, Modelo, NumeroSerie, FallaReportada, DiagnosticoTecnico, Estado, CostoManoObra, CostoTotal, FechaCreacion, FechaFinalizacion)
    VALUES ('ORD-2026-0002', @Cliente2, @TecnicoId, N'Laptop', N'Lenovo', N'ThinkPad T14 Gen 2', N'LNVTP-33104-X', N'Lentitud extrema y pantallas azules continuas.', N'Sector de arranque de disco dañado por impacto mecánico. Se migró a SSD NVMe de 1TB e instalación limpia de sistema operativo.', 'Entregado', 120000.00, 380000.00, DATEADD(MONTH, -1, SYSUTCDATETIME()), DATEADD(MONTH, -1, DATEADD(DAY, 4, SYSUTCDATETIME())));

    DECLARE @Ord2Id INT = SCOPE_IDENTITY();

    INSERT INTO dbo.ItemsOrden (OrdenServicioId, InventarioItemId, Cantidad, PrecioUnitario, Subtotal)
    VALUES (@Ord2Id, @ItemSSD1TB, 1, 260000.00, 260000.00);

    INSERT INTO dbo.HistorialOrdenes (OrdenServicioId, EstadoAnterior, EstadoNuevo, Comentario, UsuarioModificoId, FechaModificacion)
    VALUES 
    (@Ord2Id, NULL, N'Recibido', N'Recibido por mensajería corporativa especializada.', @AdminId, DATEADD(MONTH, -1, SYSUTCDATETIME())),
    (@Ord2Id, N'Recibido', N'En Diagnostico', N'Prueba CrystalDiskInfo arrojó 35% de vida útil en unidad original.', @TecnicoId, DATEADD(MONTH, -1, DATEADD(DAY, 1, SYSUTCDATETIME()))),
    (@Ord2Id, N'En Diagnostico', N'Listo para Entrega', N'Instalación y clonación terminada con respaldo de datos exitoso.', @TecnicoId, DATEADD(MONTH, -1, DATEADD(DAY, 3, SYSUTCDATETIME()))),
    (@Ord2Id, N'Listo para Entrega', N'Entregado', N'Facturación corporativa cerrada a conformidad.', @AdminId, DATEADD(MONTH, -1, DATEADD(DAY, 4, SYSUTCDATETIME())));
END

-- ORDEN 3: Listo para Entrega
IF NOT EXISTS (SELECT 1 FROM dbo.OrdenesServicio WHERE NumeroOrden = 'ORD-2026-0003')
BEGIN
    INSERT INTO dbo.OrdenesServicio (NumeroOrden, ClienteId, TecnicoId, TipoDispositivo, Marca, Modelo, NumeroSerie, FallaReportada, DiagnosticoTecnico, Estado, CostoManoObra, CostoTotal, FechaCreacion, FechaFinalizacion)
    VALUES ('ORD-2026-0003', @Cliente3, @TecnicoId, N'Laptop', N'Asus', N'ROG Zephyrus G14', N'ASROG-88410-Q', N'Pantalla rota tras golpe en esquina superior.', N'Se instaló panel IPS FHD 144Hz Slim nuevo con calibración de color.', 'Listo para Entrega', 160000.00, 610000.00, DATEADD(DAY, -5, SYSUTCDATETIME()), NULL);

    DECLARE @Ord3Id INT = SCOPE_IDENTITY();

    INSERT INTO dbo.ItemsOrden (OrdenServicioId, InventarioItemId, Cantidad, PrecioUnitario, Subtotal)
    VALUES (@Ord3Id, @ItemPantalla, 1, 450000.00, 450000.00);

    INSERT INTO dbo.HistorialOrdenes (OrdenServicioId, EstadoAnterior, EstadoNuevo, Comentario, UsuarioModificoId, FechaModificacion)
    VALUES 
    (@Ord3Id, NULL, N'Recibido', N'Ingreso de equipo gaming para cambio de pantalla.', @AdminId, DATEADD(DAY, -5, SYSUTCDATETIME())),
    (@Ord3Id, N'Recibido', N'En Reparacion', N'Instalando pantalla de reemplazo y asegurando bisagras.', @TecnicoId, DATEADD(DAY, -3, SYSUTCDATETIME())),
    (@Ord3Id, N'En Reparacion', N'Listo para Entrega', N'Pantalla verificada a 144Hz sin píxeles muertos.', @TecnicoId, DATEADD(HOUR, -6, SYSUTCDATETIME()));
END

-- ORDEN 4: En Reparación
IF NOT EXISTS (SELECT 1 FROM dbo.OrdenesServicio WHERE NumeroOrden = 'ORD-2026-0004')
BEGIN
    INSERT INTO dbo.OrdenesServicio (NumeroOrden, ClienteId, TecnicoId, TipoDispositivo, Marca, Modelo, NumeroSerie, FallaReportada, DiagnosticoTecnico, Estado, CostoManoObra, CostoTotal, FechaCreacion, FechaFinalizacion)
    VALUES ('ORD-2026-0004', @Cliente4, @TecnicoId, N'Workstation Desktop', N'HP', N'Z2 Tower G5', N'HPZ2-55019-W', N'Se congela al renderizar en Blender y AutoCAD.', N'Falta de memoria RAM e insuficiencia térmica. Se renovó pasta térmica y módulo RAM.', 'En Reparacion', 110000.00, 353000.00, DATEADD(DAY, -3, SYSUTCDATETIME()), NULL);

    DECLARE @Ord4Id INT = SCOPE_IDENTITY();

    INSERT INTO dbo.ItemsOrden (OrdenServicioId, InventarioItemId, Cantidad, PrecioUnitario, Subtotal)
    VALUES 
    (@Ord4Id, @ItemRAM16DDR4, 1, 195000.00, 195000.00),
    (@Ord4Id, @ItemPasta, 1, 48000.00, 48000.00);

    INSERT INTO dbo.HistorialOrdenes (OrdenServicioId, EstadoAnterior, EstadoNuevo, Comentario, UsuarioModificoId, FechaModificacion)
    VALUES 
    (@Ord4Id, NULL, N'Recibido', N'Ingreso de torre de trabajo de arquitectura.', @AdminId, DATEADD(DAY, -3, SYSUTCDATETIME())),
    (@Ord4Id, N'Recibido', N'En Diagnostico', N'Diagnóstico térmico muestra 94°C en procesador y saturación de memoria RAM.', @TecnicoId, DATEADD(DAY, -2, SYSUTCDATETIME())),
    (@Ord4Id, N'En Diagnostico', N'En Reparacion', N'Cliente aprobó presupuesto. En proceso de ensamble y limpieza profunda.', @TecnicoId, DATEADD(DAY, -1, SYSUTCDATETIME()));
END

-- ORDEN 5: Esperando Repuesto
IF NOT EXISTS (SELECT 1 FROM dbo.OrdenesServicio WHERE NumeroOrden = 'ORD-2026-0005')
BEGIN
    INSERT INTO dbo.OrdenesServicio (NumeroOrden, ClienteId, TecnicoId, TipoDispositivo, Marca, Modelo, NumeroSerie, FallaReportada, DiagnosticoTecnico, Estado, CostoManoObra, CostoTotal, FechaCreacion, FechaFinalizacion)
    VALUES ('ORD-2026-0005', @Cliente5, @TecnicoId, N'All In One', N'Apple', N'iMac 24" M1', N'APLMC-10928-M', N'Ruido fuerte de ventilación interna y reinicios intermitentes.', N'Ventilador interno desgastado con rodamiento desalineado.', 'Esperando Repuesto', 180000.00, 180000.00, DATEADD(DAY, -4, SYSUTCDATETIME()), NULL);

    DECLARE @Ord5Id INT = SCOPE_IDENTITY();

    INSERT INTO dbo.HistorialOrdenes (OrdenServicioId, EstadoAnterior, EstadoNuevo, Comentario, UsuarioModificoId, FechaModificacion)
    VALUES 
    (@Ord5Id, NULL, N'Recibido', N'Recepción en laboratorio para revisión especializada Apple Silicon.', @AdminId, DATEADD(DAY, -4, SYSUTCDATETIME())),
    (@Ord5Id, N'Recibido', N'En Diagnostico', N'Desmontaje de pantalla con cinta de corte para inspección.', @TecnicoId, DATEADD(DAY, -3, SYSUTCDATETIME())),
    (@Ord5Id, N'En Diagnostico', N'Esperando Repuesto', N'Pieza pedida al proveedor externo con seguimiento.', @TecnicoId, DATEADD(DAY, -2, SYSUTCDATETIME()));
END

-- ORDEN 6: En Diagnóstico
IF NOT EXISTS (SELECT 1 FROM dbo.OrdenesServicio WHERE NumeroOrden = 'ORD-2026-0006')
BEGIN
    INSERT INTO dbo.OrdenesServicio (NumeroOrden, ClienteId, TecnicoId, TipoDispositivo, Marca, Modelo, NumeroSerie, FallaReportada, DiagnosticoTecnico, Estado, CostoManoObra, CostoTotal, FechaCreacion, FechaFinalizacion)
    VALUES ('ORD-2026-0006', @Cliente1, @TecnicoId, N'Consola / PC SFF', N'Valve', N'Steam Deck OLED', N'VLVSD-77123-O', N'Gatillo L2 trabado y botón R1 sin respuesta táctil.', NULL, 'En Diagnostico', 95000.00, 95000.00, DATEADD(HOUR, -8, SYSUTCDATETIME()), NULL);

    DECLARE @Ord6Id INT = SCOPE_IDENTITY();

    INSERT INTO dbo.HistorialOrdenes (OrdenServicioId, EstadoAnterior, EstadoNuevo, Comentario, UsuarioModificoId, FechaModificacion)
    VALUES 
    (@Ord6Id, NULL, N'Recibido', N'Ingreso de consola portátil con estuche oficial.', @AdminId, DATEADD(HOUR, -8, SYSUTCDATETIME())),
    (@Ord6Id, N'Recibido', N'En Diagnostico', N'Asignado a técnico para revisión de controles internos.', @TecnicoId, DATEADD(HOUR, -4, SYSUTCDATETIME()));
END
GO
