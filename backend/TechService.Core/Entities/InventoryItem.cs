namespace TechService.Core.Entities;

public class InventoryItem
{
    public int Id { get; set; }
    public string CodigoSku { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public decimal PrecioCosto { get; set; }
    public decimal PrecioVenta { get; set; }
    public int CantidadStock { get; set; }
    public int AlertaStockMinimo { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    // Relaciones de navegación
    public virtual ICollection<OrderItem> ItemsOrden { get; set; } = new List<OrderItem>();
}
