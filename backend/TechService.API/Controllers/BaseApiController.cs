using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace TechService.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected int GetCurrentUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("userId");
        if (int.TryParse(idClaim, out int userId))
        {
            return userId;
        }

        return 1; // Fallback al usuario administrador por defecto si es invocado internamente
    }

    protected string GetCurrentUserEmail()
    {
        return User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
    }

    protected string GetCurrentUserRole()
    {
        return User.FindFirstValue(ClaimTypes.Role) ?? User.FindFirstValue("role") ?? string.Empty;
    }
}
