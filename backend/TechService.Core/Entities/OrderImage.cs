namespace TechService.Core.Entities;

public class OrderImage
{
    public int Id { get; set; }
    public int OrdenServicioId { get; set; }
    public string Tipo { get; set; } = string.Empty; // 'Ingreso', 'Diagnostico', 'Reparacion', 'Entrega'
    public string Titulo { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string UrlImagen { get; set; } = string.Empty; // Base64 data URI o URL
    public int SubidoPorUsuarioId { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    // Relaciones de navegación
    public virtual ServiceOrder OrdenServicio { get; set; } = null!;
    public virtual User SubidoPorUsuario { get; set; } = null!;
}
