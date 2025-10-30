using TaskManagerApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Register TaskService
builder.Services.AddSingleton<TaskService>();

//  Add CORS support
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173") // React app URL
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Add Controllers and Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Enable Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//  Use the CORS policy
app.UseCors("AllowFrontend");

app.MapControllers();

app.Run();
