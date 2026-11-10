using TechService.Core.DTOs.Orders;
using TechService.Core.Entities;
using TechService.Core.Enums;
using TechService.Core.Interfaces;

namespace TechService.Infra.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IInventoryRepository _inventoryRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public OrderService(
        IOrderRepository orderRepository,
        IInventoryRepository inventoryRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _orderRepository = orderRepository;
        _inventoryRepository = inventoryRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<ServiceOrderSummaryDto>> GetOrdersAsync(string? status, string? search)
    {
        var orders = await _orderRepository.GetOrdersAsync(status, search);

        return orders.Select(o => new ServiceOrderSummaryDto
        {
            Id = o.Id,
            OrderNumber = o.NumeroOrden,
            CustomerId = o.ClienteId,
            CustomerName = o.Cliente.NombreCompleto,
            CustomerPhone = o.Cliente.Telefono ?? string.Empty,
            TechnicianId = o.TecnicoId,
            TechnicianName = o.Tecnico?.NombreCompleto,
            DeviceType = o.TipoDispositivo,
            Brand = o.Marca,
            Model = o.Modelo,
            SerialNumber = o.NumeroSerie,
            Status = o.Estado,
            LaborCost = o.CostoManoObra,
            TotalCost = o.CostoTotal,
            CreatedAt = o.FechaCreacion,
            CompletedAt = o.FechaFinalizacion
        }).ToList();
    }

    public async Task<ServiceOrderDetailDto> GetOrderByIdAsync(int id)
    {
        var order = await _orderRepository.GetOrderWithDetailsAsync(id);
        if (order == null)
        {
            throw new KeyNotFoundException($"Orden de servicio con Id {id} no encontrada.");
        }

        return MapToDetailDto(order);
    }

    public async Task<ServiceOrderDetailDto> CreateOrderAsync(CreateServiceOrderDto dto, int currentUserId)
    {
        var nextOrderNumber = await _orderRepository.GenerateNextOrderNumberAsync();

        var order = new ServiceOrder
        {
            NumeroOrden = nextOrderNumber,
            ClienteId = dto.CustomerId,
            TecnicoId = dto.TechnicianId,
            TipoDispositivo = dto.DeviceType.Trim(),
            Marca = dto.Brand.Trim(),
            Modelo = dto.Model.Trim(),
            NumeroSerie = dto.SerialNumber.Trim(),
            FallaReportada = dto.ReportedIssue.Trim(),
            DiagnosticoTecnico = dto.TechnicalDiagnosis?.Trim(),
            Estado = OrderStatus.Recibido,
            CostoManoObra = dto.LaborCost,
            CostoTotal = dto.LaborCost,
            FechaCreacion = DateTime.UtcNow
        };

        await _orderRepository.AddOrderAsync(order);
        await _unitOfWork.SaveChangesAsync();

        var history = new OrderHistory
        {
            OrdenServicioId = order.Id,
            EstadoAnterior = null,
            EstadoNuevo = OrderStatus.Recibido,
            Comentario = "Ingreso inicial de la orden de servicio en recepción.",
            UsuarioModificoId = currentUserId,
            FechaModificacion = DateTime.UtcNow
        };

        await _orderRepository.AddOrderHistoryAsync(history);
        await _unitOfWork.SaveChangesAsync();

        return await GetOrderByIdAsync(order.Id);
    }

    public async Task<ServiceOrderDetailDto> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusDto dto, int currentUserId)
    {
        if (!OrderStatus.IsValid(dto.Status))
        {
            throw new ArgumentException($"El estado '{dto.Status}' no es un estado válido del sistema.");
        }

        var order = await _orderRepository.GetOrderByIdAsync(orderId);
        if (order == null)
        {
            throw new KeyNotFoundException($"Orden con Id {orderId} no encontrada.");
        }

        var previousStatus = order.Estado;
        order.Estado = dto.Status;

        if (dto.TechnicalDiagnosis != null)
        {
            order.DiagnosticoTecnico = dto.TechnicalDiagnosis.Trim();
        }

        if (dto.LaborCost.HasValue && dto.LaborCost.Value >= 0)
        {
            order.CostoManoObra = dto.LaborCost.Value;
            var partsTotal = order.ItemsOrden.Sum(i => i.Subtotal);
            order.CostoTotal = order.CostoManoObra + partsTotal;
        }

        if (dto.Status == OrderStatus.Entregado && order.FechaFinalizacion == null)
        {
            order.FechaFinalizacion = DateTime.UtcNow;
        }

        var history = new OrderHistory
        {
            OrdenServicioId = order.Id,
            EstadoAnterior = previousStatus,
            EstadoNuevo = dto.Status,
            Comentario = dto.Comment?.Trim() ?? $"Cambio de estado a {dto.Status}",
            UsuarioModificoId = currentUserId,
            FechaModificacion = DateTime.UtcNow
        };

        _orderRepository.UpdateOrder(order);
        await _orderRepository.AddOrderHistoryAsync(history);
        await _unitOfWork.SaveChangesAsync();

        return await GetOrderByIdAsync(orderId);
    }

    public async Task<ServiceOrderDetailDto> AddOrderItemAsync(int orderId, AddOrderItemDto dto, int currentUserId)
    {
        if (dto.Quantity <= 0)
        {
            throw new ArgumentException("La cantidad debe ser mayor a cero.");
        }

        await _unitOfWork.BeginTransactionAsync();

        try
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null)
            {
                throw new KeyNotFoundException($"Orden de servicio con Id {orderId} no encontrada.");
            }

            var inventoryItem = await _inventoryRepository.GetByIdAsync(dto.InventoryItemId);
            if (inventoryItem == null)
            {
                throw new KeyNotFoundException($"Ítem de inventario con Id {dto.InventoryItemId} no encontrado.");
            }

            // Regla de verificación de stock
            if (inventoryItem.CantidadStock < dto.Quantity)
            {
                throw new InvalidOperationException(
                    $"Stock insuficiente para el repuesto '{inventoryItem.Nombre}'. Disponible: {inventoryItem.CantidadStock}, Solicitado: {dto.Quantity}.");
            }

            // Descuento de inventario
            inventoryItem.CantidadStock -= dto.Quantity;
            _inventoryRepository.Update(inventoryItem);

            var unitPrice = inventoryItem.PrecioVenta;
            var subtotal = unitPrice * dto.Quantity;

            var orderItem = new OrderItem
            {
                OrdenServicioId = order.Id,
                InventarioItemId = inventoryItem.Id,
                Cantidad = dto.Quantity,
                PrecioUnitario = unitPrice,
                Subtotal = subtotal,
                FechaCreacion = DateTime.UtcNow
            };

            await _orderRepository.AddOrderItemAsync(orderItem);
            await _unitOfWork.SaveChangesAsync();

            // Recalcular TotalCost = LaborCost + SUM(OrderItems.Subtotal)
            var allItemsSubtotal = order.ItemsOrden.Sum(i => i.Subtotal) + subtotal;
            order.CostoTotal = order.CostoManoObra + allItemsSubtotal;

            var history = new OrderHistory
            {
                OrdenServicioId = order.Id,
                EstadoAnterior = order.Estado,
                EstadoNuevo = order.Estado,
                Comentario = $"Repuesto asignado: {inventoryItem.Nombre} x{dto.Quantity} (${subtotal:N2})",
                UsuarioModificoId = currentUserId,
                FechaModificacion = DateTime.UtcNow
            };

            _orderRepository.UpdateOrder(order);
            await _orderRepository.AddOrderHistoryAsync(history);

            await _unitOfWork.CommitAsync();

            return await GetOrderByIdAsync(orderId);
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    private static ServiceOrderDetailDto MapToDetailDto(ServiceOrder order)
    {
        return new ServiceOrderDetailDto
        {
            Id = order.Id,
            OrderNumber = order.NumeroOrden,
            CustomerId = order.ClienteId,
            CustomerName = order.Cliente.NombreCompleto,
            CustomerDocument = order.Cliente.NumeroDocumento,
            CustomerPhone = order.Cliente.Telefono ?? string.Empty,
            CustomerEmail = order.Cliente.CorreoElectronico ?? string.Empty,
            CustomerAddress = order.Cliente.Direccion ?? string.Empty,
            TechnicianId = order.TecnicoId,
            TechnicianName = order.Tecnico?.NombreCompleto,
            TechnicianEmail = order.Tecnico?.CorreoElectronico,
            DeviceType = order.TipoDispositivo,
            Brand = order.Marca,
            Model = order.Modelo,
            SerialNumber = order.NumeroSerie,
            ReportedIssue = order.FallaReportada,
            TechnicalDiagnosis = order.DiagnosticoTecnico,
            Status = order.Estado,
            LaborCost = order.CostoManoObra,
            TotalCost = order.CostoTotal,
            CreatedAt = order.FechaCreacion,
            CompletedAt = order.FechaFinalizacion,
            Items = order.ItemsOrden.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                InventoryItemId = oi.InventarioItemId,
                Sku = oi.InventarioItem?.CodigoSku ?? string.Empty,
                ItemName = oi.InventarioItem?.Nombre ?? string.Empty,
                Quantity = oi.Cantidad,
                UnitPrice = oi.PrecioUnitario,
                Subtotal = oi.Subtotal,
                CreatedAt = oi.FechaCreacion
            }).ToList(),
            History = order.HistorialOrden.OrderByDescending(h => h.FechaModificacion).Select(h => new OrderHistoryDto
            {
                Id = h.Id,
                PreviousStatus = h.EstadoAnterior,
                NewStatus = h.EstadoNuevo,
                Comment = h.Comentario,
                ChangedByUserId = h.UsuarioModificoId,
                ChangedByUserName = h.UsuarioModifico?.NombreCompleto ?? "Sistema",
                ChangedAt = h.FechaModificacion
            }).ToList()
        };
    }


}
