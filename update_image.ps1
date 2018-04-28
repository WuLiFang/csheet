$NUM_CORES = Get-WmiObject -Class Win32_ComputerSystem | Select-Object -ExpandProperty "NumberOfLogicalProcessors"
$env:SENTRY_DSN = Get-Content .\SENTRY_DSN
$env:NUM_WORKERS = (($NUM_CORES * 2) + 1)

docker-machine env | Invoke-Expression
docker-compose up -d
