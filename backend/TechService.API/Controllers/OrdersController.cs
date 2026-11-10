using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechService.Core.DTOs.Orders;
using TechService.Core.Interfaces;

namespace TechService.API.Controllers;

[Authorize]
public class OrdersController : BaseApiController
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    /// <summary>
    /// Obtiene la lista de órdenes de servicio con soporte para filtros de estado y búsqueda por texto.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ServiceOrderSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrders([FromQuery] string? status, [FromQuery] string? search)
    {
        var orders = await _orderService.GetOrdersAsync(status, search);
        return Ok(orders);
    }

    /// <summary>
    /// Obtiene los detalles completos de una orden de servicio incluyendo cliente, técnico, repuestos e historial.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ServiceOrderDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrderById(int id)
    {
        var order = await _orderService.GetOrderByIdAsync(id);
        return Ok(order);
    }

    /// <summary>
    /// Registra una nueva orden de servicio generando automáticamente el número consecutivo ORD-2026-XXXX.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ServiceOrderDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOrder([FromBody] CreateServiceOrderDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var currentUserId = GetCurrentUserId();
        var createdOrder = await _orderService.CreateOrderAsync(dto, currentUserId);
        return CreatedAtAction(nameof(GetOrderById), new { id = createdOrder.Id }, createdOrder);
    }

    /// <summary>
    /// Actualiza el estado de una orden de servicio y genera la trazabilidad en OrderHistory.
    /// </summary>
    [HttpPatch("{id:int}/status")]
    [ProducesResponseType(typeof(ServiceOrderDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var currentUserId = GetCurrentUserId();
        var updatedOrder = await _orderService.UpdateOrderStatusAsync(id, dto, currentUserId);
        return Ok(updatedOrder);
    }

    /// <summary>
    /// Agrega un repuesto de hardware a la orden mediante una transacción ACID que descuenta inventario y recalcula costos.
    /// </summary>
    [HttpPost("{id:int}/items")]
    [ProducesResponseType(typeof(ServiceOrderDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddOrderItem(int id, [FromBody] AddOrderItemDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var currentUserId = GetCurrentUserId();
        var order = await _orderService.AddOrderItemAsync(id, dto, currentUserId);
        return Ok(order);
    }
}
