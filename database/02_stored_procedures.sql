-- ============================================================================
-- TECHSERVICE PRO ERP - PROCEDIMIENTOS ALMACENADOS EN ESPAÑOL
-- Script 02: Procedimientos Almacenados de Alto Rendimiento
-- ============================================================================

USE TechServiceProDb;
GO

IF OBJECT_ID(N'dbo.sp_GetDashboardMetrics', N'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetDashboardMetrics;
GO

CREATE PROCEDURE dbo.sp_GetDashboardMetrics
AS
BEGIN
    SET NOCOUNT ON;
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

    DECLARE @FechaActual DATETIME2 = SYSUTCDATETIME();
    DECLARE @InicioMesActual DATETIME2 = DATEFROMPARTS(YEAR(@FechaActual), MONTH(@FechaActual), 1);
    DECLARE @InicioHaceSeisMeses DATETIME2 = DATEADD(MONTH, -5, @InicioMesActual);

    -- ------------------------------------------------------------------------
    -- RESULT SET 1: Métricas Globales / KPIs Escalares
    -- ------------------------------------------------------------------------
    SELECT 
        -- Total de órdenes activas (en cualquier fase excepto Entregado)
        (SELECT COUNT(1) 
         FROM dbo.OrdenesServicio WITH (NOLOCK) 
         WHERE Estado <> 'Entregado') AS ActiveOrders,

        -- Equipos terminados y listos para ser entregados al cliente
        (SELECT COUNT(1) 
         FROM dbo.OrdenesServicio WITH (NOLOCK) 
         WHERE Estado = 'Listo para Entrega') AS ReadyForDelivery,

        -- Ingresos totales recaudados en el mes corriente (Solo órdenes Entregadas)
        ISNULL((
            SELECT SUM(CostoTotal) 
            FROM dbo.OrdenesServicio WITH (NOLOCK) 
            WHERE Estado = 'Entregado' 
              AND FechaFinalizacion >= @InicioMesActual
        ), 0.00) AS CurrentMonthRevenue,

        -- Cantidad de ítems con stock crítico que requieren reposición
        (SELECT COUNT(1) 
         FROM dbo.Inventario WITH (NOLOCK) 
         WHERE CantidadStock <= AlertaStockMinimo) AS LowStockAlertsCount;

    -- ------------------------------------------------------------------------
    -- RESULT SET 2: Resumen de Ingresos de los Últimos 6 Meses (Servicios vs Repuestos)
    -- ------------------------------------------------------------------------
    ;WITH SeriesMeses AS (
        SELECT 0 AS OffsetMes
        UNION ALL SELECT 1
        UNION ALL SELECT 2
        UNION ALL SELECT 3
        UNION ALL SELECT 4
        UNION ALL SELECT 5
    ),
    MesesCalendario AS (
        SELECT 
            DATEADD(MONTH, -OffsetMes, @InicioMesActual) AS InicioMes,
            EOMONTH(DATEADD(MONTH, -OffsetMes, @InicioMesActual)) AS FinMes,
            YEAR(DATEADD(MONTH, -OffsetMes, @InicioMesActual)) AS [Year],
            MONTH(DATEADD(MONTH, -OffsetMes, @InicioMesActual)) AS [MonthNumber],
            FORMAT(DATEADD(MONTH, -OffsetMes, @InicioMesActual), 'yyyy-MM') AS [PeriodKey],
            CASE MONTH(DATEADD(MONTH, -OffsetMes, @InicioMesActual))
                WHEN 1 THEN 'Ene' WHEN 2 THEN 'Feb' WHEN 3 THEN 'Mar'
                WHEN 4 THEN 'Abr' WHEN 5 THEN 'May' WHEN 6 THEN 'Jun'
                WHEN 7 THEN 'Jul' WHEN 8 THEN 'Ago' WHEN 9 THEN 'Sep'
                WHEN 10 THEN 'Oct' WHEN 11 THEN 'Nov' WHEN 12 THEN 'Dic'
            END AS [MonthName]
        FROM SeriesMeses
    ),
    OrdenesEntregadas AS (
        SELECT 
            os.Id AS OrdenServicioId,
            os.FechaFinalizacion,
            os.CostoManoObra,
            os.CostoTotal,
            ISNULL(SUM(it.Subtotal), 0.00) AS CostoRepuestos
        FROM dbo.OrdenesServicio os WITH (NOLOCK)
        LEFT JOIN dbo.ItemsOrden it WITH (NOLOCK) ON os.Id = it.OrdenServicioId
        WHERE os.Estado = 'Entregado'
          AND os.FechaFinalizacion >= @InicioHaceSeisMeses
        GROUP BY os.Id, os.FechaFinalizacion, os.CostoManoObra, os.CostoTotal
    )
    SELECT 
        mc.[Year],
        mc.[MonthNumber],
        mc.[PeriodKey],
        mc.[MonthName],
        ISNULL(SUM(oe.CostoManoObra), 0.00) AS ServiceRevenue,
        ISNULL(SUM(oe.CostoRepuestos), 0.00) AS PartsRevenue,
        ISNULL(SUM(oe.CostoTotal), 0.00) AS TotalRevenue
    FROM MesesCalendario mc
    LEFT JOIN OrdenesEntregadas oe 
        ON oe.FechaFinalizacion >= mc.InicioMes 
       AND oe.FechaFinalizacion <= DATEADD(SECOND, 86399, CAST(mc.FinMes AS DATETIME2))
    GROUP BY mc.[Year], mc.[MonthNumber], mc.[PeriodKey], mc.[MonthName]
    ORDER BY mc.[Year] ASC, mc.[MonthNumber] ASC;

    -- ------------------------------------------------------------------------
    -- RESULT SET 3: Detalle de Ítems de Inventario con Stock Crítico
    -- ------------------------------------------------------------------------
    SELECT 
        Id,
        CodigoSku AS Sku,
        Nombre AS Name,
        Categoria AS Category,
        PrecioCosto AS CostPrice,
        PrecioVenta AS SalePrice,
        CantidadStock AS StockQuantity,
        AlertaStockMinimo AS MinStockAlert
    FROM dbo.Inventario WITH (NOLOCK)
    WHERE CantidadStock <= AlertaStockMinimo
    ORDER BY CantidadStock ASC, Nombre ASC;

END
GO
