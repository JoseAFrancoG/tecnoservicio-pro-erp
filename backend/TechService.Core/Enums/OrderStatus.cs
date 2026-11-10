namespace TechService.Core.Enums;

public static class OrderStatus
{
    public const string Recibido = "Recibido";
    public const string EnDiagnostico = "En Diagnostico";
    public const string EsperandoRepuesto = "Esperando Repuesto";
    public const string EnReparacion = "En Reparacion";
    public const string ListoParaEntrega = "Listo para Entrega";
    public const string Entregado = "Entregado";

    public static readonly string[] AllStatuses =
    [
        Recibido,
        EnDiagnostico,
        EsperandoRepuesto,
        EnReparacion,
        ListoParaEntrega,
        Entregado
    ];

    public static bool IsValid(string status)
    {
        return AllStatuses.Contains(status, StringComparer.OrdinalIgnoreCase);
    }
}
