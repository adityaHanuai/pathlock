# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["TaskManagerApi.csproj", "./"]
RUN dotnet restore "TaskManagerApi.csproj"

# Copy the remaining source and build
COPY . .
RUN dotnet publish "TaskManagerApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:5173
EXPOSE 5173
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TaskManagerApi.dll"]
