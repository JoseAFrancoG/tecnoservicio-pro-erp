namespace TechService.Core.Entities;

public class User
{
    public int Id { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string CorreoElectronico { get; set; } = string.Empty;
    public string ClaveHash { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty; // 'Admin' | 'Tech'
    public bool Activo { get; set; } = true;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    // Relaciones de navegación
    public virtual ICollection<ServiceOrder> OrdenesAsignadas { get; set; } = new List<ServiceOrder>();
    public virtual ICollection<OrderHistory> HistorialModificaciones { get; set; } = new List<OrderHistory>();
}
