Write-Host "Teste Cadastro Investidor - EMAIL NOVO" -ForegroundColor Cyan

$payload = '{
    "name": "Teste Investidor Novo",
    "email": "investidor.teste.novo.2024@exemplo.com", 
    "phone": "11888777666",
    "city": "Rio de Janeiro",
    "address": "Avenida Teste Nova, 456, Copacabana"
}'

Write-Host "Payload com EMAIL NOVO:" -ForegroundColor Yellow
Write-Host $payload

Write-Host "Enviando requisicao para /api/investors..." -ForegroundColor Cyan

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/investors" -Method POST -ContentType "application/json" -Body $payload -UseBasicParsing

Write-Host "Status:" $response.StatusCode -ForegroundColor Green
Write-Host "Resposta:" $response.Content -ForegroundColor White 