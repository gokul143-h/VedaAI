param(
  [Parameter(Mandatory = $true)]
  [string]$ApiKey,
  [ValidateSet('groq', 'meta')]
  [string]$Provider = 'groq'
)

$ErrorActionPreference = 'Stop'

$envName = if ($Provider -eq 'meta') { 'LLAMA_API_KEY' } else { 'GROQ_API_KEY' }

Write-Host "Adding $envName to Vercel (production, preview, development)..."

foreach ($target in @('production', 'preview', 'development')) {
  $ApiKey | npx vercel env add $envName $target --force
}

if ($Provider -eq 'groq') {
  'groq' | npx vercel env add AI_PROVIDER production --force
  'groq' | npx vercel env add AI_PROVIDER preview --force
  'groq' | npx vercel env add AI_PROVIDER development --force
} else {
  'meta' | npx vercel env add AI_PROVIDER production --force
  'meta' | npx vercel env add AI_PROVIDER preview --force
  'meta' | npx vercel env add AI_PROVIDER development --force
}

'false' | npx vercel env add USE_MOCK_AI production --force
'false' | npx vercel env add USE_MOCK_AI preview --force
'false' | npx vercel env add USE_MOCK_AI development --force

Write-Host "Done. Redeploy with: npx vercel --prod"
