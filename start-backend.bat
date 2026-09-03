@echo off

echo Iniciando Backend (.NET)...
cd /d "C:\Users\Alejandro\Desktop\TradingProject\Meta-xi-Api-main\Meta-xi-Api-main"
start "Backend" cmd /k dotnet run
echo Iniciando Frontend (Angular)...
cd /d "C:\Users\Alejandro\Desktop\TradingProject\Meta-xi-Client-main\Meta-xi-Client-main"
start "Frontend" cmd /k ng serve

echo Ambos servidores lanzados correctamente.