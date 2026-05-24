param(
  [Parameter(Mandatory = $true)]
  [string]$BackendUrl,
  [string]$GroqApiKey = ''
)

$ErrorActionPreference = 'Stop'

$BackendUrl = $BackendUrl.Trim().TrimEnd('/')
$WsUrl = if ($BackendUrl.StartsWith('https://')) {
  "wss://$($BackendUrl.Substring(8))/ws"
} else {
  "ws://$($BackendUrl.Substring(7))/ws"
}

Write-Host "Connecting Vercel frontend to backend at $BackendUrl"

foreach ($target in @('production', 'preview', 'development')) {
  $BackendUrl | npx vercel env add BACKEND_API_URL $target --force
  $BackendUrl | npx vercel env add NEXT_PUBLIC_API_URL $target --force
  $WsUrl | npx vercel env add NEXT_PUBLIC_WS_URL $target --force
}

if ($GroqApiKey) {
  foreach ($target in @('production', 'preview', 'development')) {
    $GroqApiKey | npx vercel env add GROQ_API_KEY $target --force
    'groq' | npx vercel env add AI_PROVIDER $target --force
    'false' | npx vercel env add USE_MOCK_AI $target --force
  }
}

Write-Host "Done. Redeploy frontend: npx vercel --prod"
Write-Host "Verify: https://vedaai-omega.vercel.app/api/config"
