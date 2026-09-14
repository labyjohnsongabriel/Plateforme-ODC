# ============================================================================
#  setup-postgres.ps1
#  Configuration PostgreSQL pour ODC Platform (développement local)
# ============================================================================

param(
    [string]$DbName = "odc_db",
    [string]$DbUser = "odc_user",
    [string]$DbPassword = "OdC@2026!Secure",
    [string]$PgHost = "localhost",
    [int]$PgPort = 5432,
    [string]$SuperUser = "postgres"
)

Write-Host "🐘 Configuration PostgreSQL pour ODC Platform" -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------------------------
# 1. Vérifier que psql est disponible
# ---------------------------------------------------------------------------
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Host "❌ psql non trouvé dans le PATH" -ForegroundColor Red
    Write-Host "   Installez PostgreSQL depuis https://www.postgresql.org/download/" -ForegroundColor Yellow
    Write-Host "   Ou ajoutez-le au PATH (ex: C:\Program Files\PostgreSQL\15\bin)" -ForegroundColor Yellow
    exit 1
}

$psqlVersion = psql --version
Write-Host "✅ $psqlVersion détecté" -ForegroundColor Green

# ---------------------------------------------------------------------------
# 2. Demander le mot de passe superuser
# ---------------------------------------------------------------------------
$securePwd = Read-Host "Mot de passe du superutilisateur '$SuperUser'" -AsSecureString
$SuperPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePwd)
)

$env:PGPASSWORD = $SuperPassword

# ---------------------------------------------------------------------------
# 3. Créer l'utilisateur si nécessaire
# ---------------------------------------------------------------------------
Write-Host "`n🔍 Vérification de l'utilisateur '$DbUser'..." -ForegroundColor Yellow

$userExists = psql -h $PgHost -p $PgPort -U $SuperUser -d postgres -tAc `
    "SELECT 1 FROM pg_roles WHERE rolname='$DbUser'"

if ($userExists -eq "1") {
    Write-Host "ℹ️  Utilisateur '$DbUser' existe déjà" -ForegroundColor Yellow
    Write-Host "   Mise à jour du mot de passe..." -ForegroundColor Yellow
    psql -h $PgHost -p $PgPort -U $SuperUser -d postgres -c `
        "ALTER USER $DbUser WITH ENCRYPTED PASSWORD '$DbPassword';"
} else {
    Write-Host "➕ Création de l'utilisateur '$DbUser'..." -ForegroundColor Yellow
    psql -h $PgHost -p $PgPort -U $SuperUser -d postgres -c `
        "CREATE USER $DbUser WITH ENCRYPTED PASSWORD '$DbPassword' CREATEDB;"
}

# ---------------------------------------------------------------------------
# 4. Créer la base de données si nécessaire
# ---------------------------------------------------------------------------
Write-Host "`n🔍 Vérification de la base de données '$DbName'..." -ForegroundColor Yellow

$dbExists = psql -h $PgHost -p $PgPort -U $SuperUser -d postgres -tAc `
    "SELECT 1 FROM pg_database WHERE datname='$DbName'"

if ($dbExists -eq "1") {
    Write-Host "ℹ️  Base '$DbName' existe déjà" -ForegroundColor Yellow
} else {
    Write-Host "➕ Création de la base '$DbName'..." -ForegroundColor Yellow
    psql -h $PgHost -p $PgPort -U $SuperUser -d postgres -c `
        "CREATE DATABASE $DbName OWNER $DbUser ENCODING 'UTF8' LC_COLLATE 'fr_FR.UTF-8' LC_CTYPE 'fr_FR.UTF-8' TEMPLATE template0;"
}

# ---------------------------------------------------------------------------
# 5. Attribuer les privilèges
# ---------------------------------------------------------------------------
Write-Host "`n🔐 Attribution des privilèges..." -ForegroundColor Yellow

psql -h $PgHost -p $PgPort -U $SuperUser -d postgres -c `
    "GRANT ALL PRIVILEGES ON DATABASE $DbName TO $DbUser;"

# Se connecter à la base pour les privilèges sur le schéma
$env:PGPASSWORD = $DbPassword
psql -h $PgHost -p $PgPort -U $DbUser -d $DbName -c `
    "GRANT ALL ON SCHEMA public TO $DbUser;
     ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DbUser;
     ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DbUser;"

# ---------------------------------------------------------------------------
# 6. Activer les extensions PostgreSQL
# ---------------------------------------------------------------------------
Write-Host "`n🧩 Activation des extensions PostgreSQL..." -ForegroundColor Yellow

psql -h $PgHost -p $PgPort -U $DbUser -d $DbName -c `
    "CREATE EXTENSION IF NOT EXISTS ""uuid-ossp"";
     CREATE EXTENSION IF NOT EXISTS ""pgcrypto"";
     CREATE EXTENSION IF NOT EXISTS ""pg_trgm"";
     CREATE EXTENSION IF NOT EXISTS ""unaccent"";"

# ---------------------------------------------------------------------------
# 7. Créer la base de test
# ---------------------------------------------------------------------------
Write-Host "`n🧪 Création de la base de test..." -ForegroundColor Yellow

$env:PGPASSWORD = $SuperPassword
$testDb = "${DbName}_test"

$testExists = psql -h $PgHost -p $PgPort -U $SuperUser -d postgres -tAc `
    "SELECT 1 FROM pg_database WHERE datname='$testDb'"

if ($testExists -ne "1") {
    psql -h $PgHost -p $PgPort -U $SuperUser -d postgres -c `
        "CREATE DATABASE $testDb OWNER $DbUser ENCODING 'UTF8';"

    $env:PGPASSWORD = $DbPassword
    psql -h $PgHost -p $PgPort -U $DbUser -d $testDb -c `
        "CREATE EXTENSION IF NOT EXISTS ""uuid-ossp"";
         CREATE EXTENSION IF NOT EXISTS ""pgcrypto"";
         CREATE EXTENSION IF NOT EXISTS ""pg_trgm"";"
    Write-Host "✅ Base de test '$testDb' créée" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Base de test '$testDb' existe déjà" -ForegroundColor Yellow
}

# ---------------------------------------------------------------------------
# 8. Test de connexion final
# ---------------------------------------------------------------------------
Write-Host "`n🧪 Test de connexion..." -ForegroundColor Yellow

$env:PGPASSWORD = $DbPassword
$test = psql -h $PgHost -p $PgPort -U $DbUser -d $DbName -tAc "SELECT version();"

if ($test) {
    Write-Host "✅ Connexion réussie !" -ForegroundColor Green
    Write-Host "   $test" -ForegroundColor Gray
} else {
    Write-Host "❌ Échec de la connexion" -ForegroundColor Red
    exit 1
}

# Nettoyer la variable
Remove-Item Env:\PGPASSWORD

# ---------------------------------------------------------------------------
# 9. Résumé
# ---------------------------------------------------------------------------
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         ✅ POSTGRESQL CONFIGURÉ AVEC SUCCÈS                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Récapitulatif :" -ForegroundColor Cyan
Write-Host "   Hôte        : $PgHost:$PgPort"
Write-Host "   Base dev    : $DbName"
Write-Host "   Base test   : $testDb"
Write-Host "   Utilisateur : $DbUser"
Write-Host ""
Write-Host "📝 Configuration .env :" -ForegroundColor Cyan
Write-Host "   DB_HOST=$PgHost"
Write-Host "   DB_PORT=$PgPort"
Write-Host "   DB_USERNAME=$DbUser"
Write-Host "   DB_PASSWORD=$DbPassword"
Write-Host "   DB_NAME=$DbName"
Write-Host ""
Write-Host "🚀 Prochaine étape :" -ForegroundColor Yellow
Write-Host "   npm run migration:run"
Write-Host "   npm run seed"
Write-Host ""