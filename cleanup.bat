@echo off
echo Cleaning up processes on ports 8761 and 8900...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8761') do (
    echo Found process %%a on port 8761, killing it...
    taskkill /F /PID %%a
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8900') do (
    echo Found process %%a on port 8900, killing it...
    taskkill /F /PID %%a
)

echo Force killing all java.exe processes just to be sure...
taskkill /F /IM java.exe

echo Cleanup completed successfully!
pause
