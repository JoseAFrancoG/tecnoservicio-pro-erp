namespace TechService.Core.Entities;

public class ServiceOrder
{
    public int Id { get; set; }
    public string NumeroOrden { get; set; } = string.Empty;
    public int ClienteId { get; set; }
    public int? TecnicoId { get; set; }
    public string TipoDispositivo { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string NumeroSerie { get; set; } = string.Empty;
    public string FallaReportada { get; set; } = string.Empty;
    public string? DiagnosticoTecnico { get; set; }
    public string Estado { get; set; } = string.Empty;
    public decimal CostoManoObra { get; set; }
    public decimal CostoTotal { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public DateTime? FechaFinalizacion { get; set; }

    // Relaciones de navegación
    public virtual Customer Cliente { get; set; } = null!;
    public virtual User? Tecnico { get; set; }
    public virtual ICollection<OrderItem> ItemsOrden { get; set; } = new List<OrderItem>();
    public virtual ICollection<OrderHistory> HistorialOrden { get; set; } = new List<OrderHistory>();
    public virtual ICollection<OrderImage> EvidenciasFotograficas { get; set; } = new List<OrderImage>();
}
