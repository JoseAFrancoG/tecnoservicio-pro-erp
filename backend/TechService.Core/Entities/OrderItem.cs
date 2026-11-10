namespace TechService.Core.Entities;

public class OrderItem
{
    public int Id { get; set; }
    public int OrdenServicioId { get; set; }
    public int InventarioItemId { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    // Relaciones de navegación
    public virtual ServiceOrder OrdenServicio { get; set; } = null!;
    public virtual InventoryItem InventarioItem { get; set; } = null!;
}
