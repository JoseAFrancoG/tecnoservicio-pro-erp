using System.Net;
using System.Text.Json;

namespace TechService.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ha ocurrido una excepción no controlada: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message) = exception switch
        {
            KeyNotFoundException knf => (HttpStatusCode.NotFound, knf.Message),
            ArgumentException arg => (HttpStatusCode.BadRequest, arg.Message),
            InvalidOperationException inv => (HttpStatusCode.BadRequest, inv.Message),
            UnauthorizedAccessException una => (HttpStatusCode.Unauthorized, una.Message),
            _ => (HttpStatusCode.InternalServerError, "Ha ocurrido un error inesperado en el servidor.")
        };

        context.Response.StatusCode = (int)statusCode;

        var errorResponse = new
        {
            StatusCode = (int)statusCode,
            Message = message,
            Detail = exception.Message,
            Timestamp = DateTime.UtcNow
        };

        var json = JsonSerializer.Serialize(errorResponse);
        return context.Response.WriteAsync(json);
    }
}
