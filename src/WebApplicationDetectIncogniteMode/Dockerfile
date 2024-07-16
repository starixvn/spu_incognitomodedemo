FROM hub.nexdev.net/base/dotnet/core/sdk:5.0 AS builder
WORKDIR /src

COPY ["./src/WebApplicationDetectIncogniteMode/WebApplicationDetectIncogniteMode.csproj", "WebApplicationDetectIncogniteMode/"]

WORKDIR "/src/WebApplicationDetectIncogniteMode"

RUN dotnet restore -v n

COPY ./src/WebApplicationDetectIncogniteMode .

RUN dotnet publish -r linux-x64 --self-contained false -c Release -o /app

FROM hub.nexdev.net/base/dotnet/core/aspnet:5.0-alpine AS base

WORKDIR /app

COPY --from=builder /app .

ENV TZ="America/La_Paz"

ENTRYPOINT ["dotnet", "WebApplicationDetectIncogniteMode.dll"]