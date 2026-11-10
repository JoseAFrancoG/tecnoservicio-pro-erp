namespace TechService.Core.Entities;

public class OrderHistory
{
    public int Id { get; set; }
    public int OrdenServicioId { get; set; }
    public string? EstadoAnterior { get; set; }
    public string EstadoNuevo { get; set; } = string.Empty;
    public string? Comentario { get; set; }
    public int UsuarioModificoId { get; set; }
    public DateTime FechaModificacion { get; set; } = DateTime.UtcNow;

    // Relaciones de navegación
    public virtual ServiceOrder OrdenServicio { get; set; } = null!;
    public virtual User UsuarioModifico { get; set; } = null!;
}
