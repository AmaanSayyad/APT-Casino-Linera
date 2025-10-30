@echo off
REM Simple Linera Local Network Starter

echo 🚀 Starting Simple Linera Local Network...

REM Stop any existing containers
docker stop linera-simple >nul 2>&1
docker rm linera-simple >nul 2>&1

REM Create a simple config file
echo Creating config file...
echo { > proxy-config.json
echo   "server": { >> proxy-config.json
echo     "host": "0.0.0.0", >> proxy-config.json
echo     "port": 8080 >> proxy-config.json
echo   }, >> proxy-config.json
echo   "internal_host": "0.0.0.0", >> proxy-config.json
echo   "internal_port": 19100, >> proxy-config.json
echo   "external_protocol": "Grpc" >> proxy-config.json
echo } >> proxy-config.json

REM Start a simple Linera container with interactive mode for testing
echo 🌐 Starting Linera container...
docker run -d ^
  --name linera-simple ^
  -p 8080:8080 ^
  -p 19100:19100 ^
  -v "%CD%:/workspace" ^
  us-docker.pkg.dev/linera-io-dev/linera-public-registry/linera:latest ^
  sh -c "cd /workspace && echo 'Linera container started. Use docker exec to interact.' && tail -f /dev/null"

REM Wait for container to start
timeout /t 5 /nobreak >nul

REM Check if container is running
docker ps | findstr linera-simple >nul
if errorlevel 1 (
    echo ❌ Failed to start Linera container
    docker logs linera-simple
    exit /b 1
) else (
    echo ✅ Linera container is running!
    echo 🐳 Container name: linera-simple
    echo 📝 To interact with Linera:
    echo    docker exec -it linera-simple /bin/sh
    echo 🛑 To stop: docker stop linera-simple ^&^& docker rm linera-simple
    echo.
    echo 🔧 Available Linera tools in container:
    echo    /linera - Main CLI tool
    echo    /linera-proxy - Proxy server
    echo    /linera-server - Server node
)

pause