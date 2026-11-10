using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TechService.API.Middleware;
using TechService.Core.Interfaces;
using TechService.Infra.Data;
using TechService.Infra.Repositories;
using TechService.Infra.Services;

var builder = WebApplication.CreateBuilder(args);

// ----------------------------------------------------------------------------
// 1. CONFIGURACIÓN DE BASE DE DATOS (EF CORE + SQL SERVER)
// ----------------------------------------------------------------------------
var connectionString = builder.Configuration.GetConnectionString("TechServiceDb")
    ?? "Server=(localdb)\\mssqllocaldb;Database=TechServiceProDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;";

builder.Services.AddDbContext<TechServiceDbContext>(options =>
{
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null);
        sqlOptions.CommandTimeout(60);
    });
});

// ----------------------------------------------------------------------------
// 2. INYECCIÓN DE DEPENDENCIAS (CLEAN ARCHITECTURE)
// ----------------------------------------------------------------------------
// Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Repositorios
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IInventoryRepository, InventoryRepository>();
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();

// Servicios de Aplicación y Dominio
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// ----------------------------------------------------------------------------
// 3. AUTENTICACIÓN JWT (BEARER TOKEN)
// ----------------------------------------------------------------------------
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "TechServiceProEnterpriseKey_2026_UltraSecureSecretJWTKey_MustBe32CharsOrLonger!";
var issuer = jwtSettings["Issuer"] ?? "TechServiceProAPI";
var audience = jwtSettings["Audience"] ?? "TechServiceProFrontend";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = issuer,
        ValidateAudience = true,
        ValidAudience = audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// ----------------------------------------------------------------------------
// 4. POLÍTICA DE CORS (PERMITIENDO FRONTEND REACT)
// ----------------------------------------------------------------------------
var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
    ?? new[] { "http://localhost:5173", "http://127.0.0.1:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendCorsPolicy", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ----------------------------------------------------------------------------
// 5. CONTROLADORES Y SERIALIZACIÓN JSON
// ----------------------------------------------------------------------------
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddEndpointsApiExplorer();

// ----------------------------------------------------------------------------
// 6. SWAGGER / OPENAPI CON SOPORTE BEARER TOKEN
// ----------------------------------------------------------------------------
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TecnoServicio Pro ERP - Web API",
        Version = "v1.0",
        Description = "API RESTful empresarial de alto rendimiento para gestión de servicio técnico de hardware e inventario.",
        Contact = new OpenApiContact
        {
            Name = "Arquitectura de Software TecnoServicio Pro",
            Email = "dev@tecnoservicio.com"
        }
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Autenticación JWT usando el esquema Bearer. Ingrese 'Bearer' seguido de un espacio y su token. Ejemplo: 'Bearer eyJhbGciOi...'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header
            },
            new List<string>()
        }
    });
});

var app = builder.Build();

// ----------------------------------------------------------------------------
// 7. PIPELINE DE MIDDLEWARES HTTP
// ----------------------------------------------------------------------------
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TecnoServicio Pro ERP API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("FrontendCorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
