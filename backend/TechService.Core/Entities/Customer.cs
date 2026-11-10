namespace TechService.Core.Entities;

public class Customer
{
    public int Id { get; set; }
    public string NumeroDocumento { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? CorreoElectronico { get; set; }
    public string? Direccion { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    // Relaciones de navegación
    public virtual ICollection<ServiceOrder> OrdenesServicio { get; set; } = new List<ServiceOrder>();
}
