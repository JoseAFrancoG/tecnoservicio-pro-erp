using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechService.Core.DTOs.Inventory;
using TechService.Core.Interfaces;

namespace TechService.API.Controllers;

[Authorize]
public class InventoryController : BaseApiController
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    /// <summary>
    /// Lista todos los ítems de repuestos y suministros de hardware en inventario.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<InventoryItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var items = await _inventoryService.GetAllAsync();
        return Ok(items);
    }

    /// <summary>
    /// Genera automáticamente el siguiente código SKU único para una categoría determinada.
    /// </summary>
    [HttpGet("next-sku")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNextSku([FromQuery] string? category)
    {
        var cat = string.IsNullOrWhiteSpace(category) ? "Almacenamiento" : category;
        var nextSku = await _inventoryService.GetNextSkuAsync(cat);
        return Ok(new { sku = nextSku, category = cat });
    }

    /// <summary>
    /// Registra un nuevo repuesto en el catálogo de inventario con sus costos y umbrales de alerta.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Tech")]
    [ProducesResponseType(typeof(InventoryItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateInventoryItemDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var created = await _inventoryService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }
}
