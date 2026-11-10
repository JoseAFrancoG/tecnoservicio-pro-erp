using Microsoft.EntityFrameworkCore;
using TechService.Core.Entities;

namespace TechService.Infra.Data;

public class TechServiceDbContext : DbContext
{
    public TechServiceDbContext(DbContextOptions<TechServiceDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<ServiceOrder> ServiceOrders => Set<ServiceOrder>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderHistory> OrderHistories => Set<OrderHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Configuración de Usuarios (Mapeo a dbo.Usuarios con columnas en español)
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Usuarios");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NombreCompleto).HasColumnName("NombreCompleto").HasMaxLength(150).IsRequired();
            entity.Property(e => e.CorreoElectronico).HasColumnName("CorreoElectronico").HasMaxLength(150).IsRequired();
            entity.HasIndex(e => e.CorreoElectronico).IsUnique();
            entity.Property(e => e.ClaveHash).HasColumnName("ClaveHash").HasMaxLength(255).IsRequired();
            entity.Property(e => e.Rol).HasColumnName("Rol").HasMaxLength(20).IsRequired();
            entity.Property(e => e.Activo).HasColumnName("Activo").HasDefaultValue(true);
            entity.Property(e => e.FechaCreacion).HasColumnName("FechaCreacion").HasDefaultValueSql("SYSUTCDATETIME()");
        });

        // 2. Configuración de Clientes (Mapeo a dbo.Clientes con columnas en español)
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.ToTable("Clientes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NumeroDocumento).HasColumnName("NumeroDocumento").HasMaxLength(50).IsRequired();
            entity.HasIndex(e => e.NumeroDocumento).IsUnique();
            entity.Property(e => e.NombreCompleto).HasColumnName("NombreCompleto").HasMaxLength(150).IsRequired();
            entity.Property(e => e.Telefono).HasColumnName("Telefono").HasMaxLength(50);
            entity.Property(e => e.CorreoElectronico).HasColumnName("CorreoElectronico").HasMaxLength(150);
            entity.Property(e => e.Direccion).HasColumnName("Direccion").HasMaxLength(250);
            entity.Property(e => e.FechaCreacion).HasColumnName("FechaCreacion").HasDefaultValueSql("SYSUTCDATETIME()");
        });

        // 3. Configuración de Inventario (Mapeo a dbo.Inventario con columnas en español)
        modelBuilder.Entity<InventoryItem>(entity =>
        {
            entity.ToTable("Inventario");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CodigoSku).HasColumnName("CodigoSku").HasMaxLength(50).IsRequired();
            entity.HasIndex(e => e.CodigoSku).IsUnique();
            entity.Property(e => e.Nombre).HasColumnName("Nombre").HasMaxLength(150).IsRequired();
            entity.Property(e => e.Categoria).HasColumnName("Categoria").HasMaxLength(100).IsRequired();
            entity.Property(e => e.PrecioCosto).HasColumnName("PrecioCosto").HasPrecision(18, 2).IsRequired();
            entity.Property(e => e.PrecioVenta).HasColumnName("PrecioVenta").HasPrecision(18, 2).IsRequired();
            entity.Property(e => e.CantidadStock).HasColumnName("CantidadStock").HasDefaultValue(0);
            entity.Property(e => e.AlertaStockMinimo).HasColumnName("AlertaStockMinimo").HasDefaultValue(5);
            entity.Property(e => e.FechaCreacion).HasColumnName("FechaCreacion").HasDefaultValueSql("SYSUTCDATETIME()");
        });

        // 4. Configuración de Órdenes de Servicio (Mapeo a dbo.OrdenesServicio con columnas en español)
        modelBuilder.Entity<ServiceOrder>(entity =>
        {
            entity.ToTable("OrdenesServicio");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NumeroOrden).HasColumnName("NumeroOrden").HasMaxLength(50).IsRequired();
            entity.HasIndex(e => e.NumeroOrden).IsUnique();
            entity.Property(e => e.ClienteId).HasColumnName("ClienteId").IsRequired();
            entity.Property(e => e.TecnicoId).HasColumnName("TecnicoId");
            entity.Property(e => e.TipoDispositivo).HasColumnName("TipoDispositivo").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Marca).HasColumnName("Marca").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Modelo).HasColumnName("Modelo").HasMaxLength(100).IsRequired();
            entity.Property(e => e.NumeroSerie).HasColumnName("NumeroSerie").HasMaxLength(100).IsRequired();
            entity.Property(e => e.FallaReportada).HasColumnName("FallaReportada").IsRequired();
            entity.Property(e => e.DiagnosticoTecnico).HasColumnName("DiagnosticoTecnico");
            entity.Property(e => e.Estado).HasColumnName("Estado").HasMaxLength(50).IsRequired();
            entity.Property(e => e.CostoManoObra).HasColumnName("CostoManoObra").HasPrecision(18, 2).HasDefaultValue(0.00m);
            entity.Property(e => e.CostoTotal).HasColumnName("CostoTotal").HasPrecision(18, 2).HasDefaultValue(0.00m);
            entity.Property(e => e.FechaCreacion).HasColumnName("FechaCreacion").HasDefaultValueSql("SYSUTCDATETIME()");
            entity.Property(e => e.FechaFinalizacion).HasColumnName("FechaFinalizacion");

            entity.HasOne(e => e.Cliente)
                  .WithMany(c => c.OrdenesServicio)
                  .HasForeignKey(e => e.ClienteId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Tecnico)
                  .WithMany(u => u.OrdenesAsignadas)
                  .HasForeignKey(e => e.TecnicoId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // 5. Configuración de Items de Orden (Mapeo a dbo.ItemsOrden con columnas en español)
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.ToTable("ItemsOrden");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OrdenServicioId).HasColumnName("OrdenServicioId").IsRequired();
            entity.Property(e => e.InventarioItemId).HasColumnName("InventarioItemId").IsRequired();
            entity.Property(e => e.Cantidad).HasColumnName("Cantidad").IsRequired();
            entity.Property(e => e.PrecioUnitario).HasColumnName("PrecioUnitario").HasPrecision(18, 2).IsRequired();
            entity.Property(e => e.Subtotal).HasColumnName("Subtotal").HasPrecision(18, 2).IsRequired();
            entity.Property(e => e.FechaCreacion).HasColumnName("FechaCreacion").HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasOne(e => e.OrdenServicio)
                  .WithMany(o => o.ItemsOrden)
                  .HasForeignKey(e => e.OrdenServicioId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.InventarioItem)
                  .WithMany(i => i.ItemsOrden)
                  .HasForeignKey(e => e.InventarioItemId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 6. Configuración de Historial de Orden (Mapeo a dbo.HistorialOrdenes con columnas en español)
        modelBuilder.Entity<OrderHistory>(entity =>
        {
            entity.ToTable("HistorialOrdenes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OrdenServicioId).HasColumnName("OrdenServicioId").IsRequired();
            entity.Property(e => e.EstadoAnterior).HasColumnName("EstadoAnterior").HasMaxLength(50);
            entity.Property(e => e.EstadoNuevo).HasColumnName("EstadoNuevo").HasMaxLength(50).IsRequired();
            entity.Property(e => e.Comentario).HasColumnName("Comentario");
            entity.Property(e => e.UsuarioModificoId).HasColumnName("UsuarioModificoId").IsRequired();
            entity.Property(e => e.FechaModificacion).HasColumnName("FechaModificacion").HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasOne(e => e.OrdenServicio)
                  .WithMany(o => o.HistorialOrden)
                  .HasForeignKey(e => e.OrdenServicioId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.UsuarioModifico)
                  .WithMany(u => u.HistorialModificaciones)
                  .HasForeignKey(e => e.UsuarioModificoId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
