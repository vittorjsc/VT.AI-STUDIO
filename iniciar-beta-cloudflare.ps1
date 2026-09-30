$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$cloudflared = Join-Path $env:LOCALAPPDATA 'VT-AI-Studio\cloudflared.exe'
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$nodeExe = if ($nodeCommand) { $nodeCommand.Source } else { Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
$logDir = Join-Path $projectRoot 'dados-vt-ai\logs'
$tunnelProcess = $null
$serverProcess = $null

if (-not (Test-Path -LiteralPath $cloudflared)) { throw "Cloudflared nao encontrado em $cloudflared. Peca ao Codex para reinstala-lo." }
if (-not (Test-Path -LiteralPath $nodeExe)) { throw 'Node.js nao encontrado. Instale o Node.js 22.5 ou mais recente.' }
if (Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue) { throw 'A porta 4173 ja esta em uso. Feche a outra janela da VT.AI e tente novamente.' }

New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$tunnelLog = Join-Path $logDir "cloudflare-$stamp.log"
$tunnelOutputLog = Join-Path $logDir "cloudflare-saida-$stamp.log"
$serverLog = Join-Path $logDir "servidor-$stamp.log"
$serverErrorLog = Join-Path $logDir "servidor-erros-$stamp.log"

$userKey = [Environment]::GetEnvironmentVariable('OPENAI_API_KEY', 'User')
if ($userKey) { $env:OPENAI_API_KEY = $userKey }
if (-not $env:OPENAI_API_KEY) { Write-Warning 'A chave OpenAI nao esta configurada. Login funcionara, mas a geracao de artes nao.' }

$setupCode = [Environment]::GetEnvironmentVariable('VT_AI_SETUP_CODE', 'User')
if (-not $setupCode) {
    $bytes = New-Object byte[] 32
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $setupCode = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
    [Environment]::SetEnvironmentVariable('VT_AI_SETUP_CODE', $setupCode, 'User')
}
$env:VT_AI_SETUP_CODE = $setupCode
$env:PORT = '4173'
Remove-Item Env:RAILWAY_PROJECT_ID -ErrorAction SilentlyContinue
Remove-Item Env:RAILWAY_PUBLIC_DOMAIN -ErrorAction SilentlyContinue

try {
    Write-Host 'Abrindo tunel HTTPS gratuito da Cloudflare...'
    $tunnelProcess = Start-Process -FilePath $cloudflared -ArgumentList @('tunnel', '--url', 'http://127.0.0.1:4173') -WorkingDirectory $projectRoot -RedirectStandardOutput $tunnelOutputLog -RedirectStandardError $tunnelLog -WindowStyle Hidden -PassThru
    $publicUrl = $null
    for ($i = 0; $i -lt 120; $i++) {
        if ($tunnelProcess.HasExited) { throw "O tunel encerrou antes de receber um link. Veja $tunnelLog" }
        if (Test-Path -LiteralPath $tunnelLog) {
            $logContent = Get-Content -LiteralPath $tunnelLog -Raw
            if ($logContent) {
                $match = [regex]::Match($logContent, 'https://[a-z0-9-]+\.trycloudflare\.com')
                if ($match.Success) { $publicUrl = $match.Value; break }
            }
        }
        Start-Sleep -Milliseconds 500
    }
    if (-not $publicUrl) { throw "A Cloudflare nao forneceu um link em 60 segundos. Veja $tunnelLog" }

    $env:VT_AI_PUBLIC_ORIGIN = $publicUrl
    $serverProcess = Start-Process -FilePath $nodeExe -ArgumentList 'server.mjs' -WorkingDirectory $projectRoot -RedirectStandardOutput $serverLog -RedirectStandardError $serverErrorLog -WindowStyle Hidden -PassThru
    $healthy = $false
    $publicHost = ([Uri]$publicUrl).Host
    for ($i = 0; $i -lt 60; $i++) {
        if ($serverProcess.HasExited) { throw "O servidor VT.AI encerrou. Veja $serverErrorLog" }
        try {
            # Consultar o DNS público evita o cache negativo do Windows logo após criar o subdomínio.
            $edge = Resolve-DnsName -Name $publicHost -Type A -Server 1.1.1.1 -ErrorAction SilentlyContinue | Where-Object IPAddress | Select-Object -First 1
            $curlArgs = @('--silent', '--show-error', '--max-time', '8')
            if ($edge) { $curlArgs += @('--resolve', "${publicHost}:443:$($edge.IPAddress)") }
            $response = (& curl.exe @curlArgs "$publicUrl/api/health" 2>$null) | ConvertFrom-Json
            if ($response.ok) { $healthy = $true; break }
        } catch { }
        Start-Sleep -Seconds 1
    }
    if (-not $healthy) { throw "O link publico nao respondeu. Veja $tunnelLog e $serverErrorLog" }

    Write-Host ''
    Write-Host 'VT.AI STUDIO BETA ESTA NO AR' -ForegroundColor Green
    Write-Host "Link para compartilhar: $publicUrl"
    Write-Host 'Abra o link e crie sua conta de administrador antes de convidar amigos.'
    Write-Host "Para ver o codigo de instalacao, execute no PowerShell: [Environment]::GetEnvironmentVariable('VT_AI_SETUP_CODE','User')"
    Write-Host 'Mantenha esta janela e o computador abertos enquanto seus amigos testam.'
    Write-Host 'O link muda quando o tunel reinicia. Feche esta janela para encerrar o beta.'
    while (-not $tunnelProcess.HasExited -and -not $serverProcess.HasExited) { Start-Sleep -Seconds 3 }
    Write-Warning "Um processo encerrou. Veja os registros em $logDir"
} finally {
    if ($serverProcess -and -not $serverProcess.HasExited) { Stop-Process -Id $serverProcess.Id -ErrorAction SilentlyContinue }
    if ($tunnelProcess -and -not $tunnelProcess.HasExited) { Stop-Process -Id $tunnelProcess.Id -ErrorAction SilentlyContinue }
}
