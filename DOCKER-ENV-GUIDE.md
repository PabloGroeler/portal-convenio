# 🐳 Docker Environment Variables Guide

## ❓ Where is the .env file in Docker?

**Answer:** The `.env` file is **NOT copied into Docker containers**. Instead, environment variables are loaded from it.

## 📋 How Environment Variables Work

### 1. Local Development (outside Docker)
- Quarkus reads from `.env` file in project root
- Used when running `mvnw quarkus:dev`

### 2. Docker Deployment
- `docker-compose.yml` uses `env_file: .env` to load variables
- Variables are passed to containers as environment variables
- **No physical .env file exists inside containers**

## 🔍 How to Check Environment Variables in Docker

### Option 1: Check All Variables in a Container
```bash
docker exec portal-emendas-backend printenv
```

### Option 2: Check Specific Variables
```bash
# Check email configuration
docker exec portal-emendas-backend printenv | findstr QUARKUS_MAILER

# Check database configuration
docker exec portal-emendas-backend printenv | findstr QUARKUS_DATASOURCE

# Check JWT configuration
docker exec portal-emendas-backend printenv | findstr JWT
```

### Option 3: Use the Script
```bash
check-docker-env.bat
```

## 📁 Current Setup

### docker-compose.yml Structure
```yaml
services:
  app:
    env_file:
      - .env  # ← Loads all variables from .env
    environment:
      # ← Can override specific variables here
      QUARKUS_DATASOURCE_JDBC_URL: jdbc:postgresql://postgres:5432/app_emendas
```

### Precedence Order (highest to lowest)
1. **`environment:` section in docker-compose.yml** - Highest priority
2. **`env_file:` loaded variables** - Medium priority
3. **Dockerfile ENV directives** - Lowest priority

## 🔐 Email Configuration in Docker

Your SMTP settings from `.env` are automatically loaded:
```
QUARKUS_MAILER_HOST=mail.sinop.mt.gov.br
QUARKUS_MAILER_PORT=465
QUARKUS_MAILER_USERNAME=sigadoc@sinop.mt.gov.br
QUARKUS_MAILER_PASSWORD=LwYc7@1FX9BZVa3
QUARKUS_MAILER_SSL=true
```

## 🛠️ How to Update Environment Variables

### Method 1: Update .env File (Recommended)
1. Edit `.env` file
2. Restart containers:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Method 2: Override in docker-compose.yml
1. Edit `docker-compose.yml`
2. Add/modify values in `environment:` section
3. Restart containers

### Method 3: Pass at Runtime (Temporary)
```bash
docker-compose up -d --env QUARKUS_MAILER_MOCK=true
```

## 🔄 After Changing .env

**IMPORTANT:** Always restart containers to apply changes:
```bash
# Full restart (recommended)
docker-compose down
docker-compose up -d

# Or just recreate backend
docker-compose up -d --force-recreate app
```

## ✅ Verify Changes Were Applied

```bash
# Check if new value is loaded
docker exec portal-emendas-backend printenv QUARKUS_MAILER_HOST

# Or check the application logs
docker logs portal-emendas-backend
```

## 📝 Important Notes

1. **Security:** Never commit `.env` to version control
2. **Production:** Use different `.env` file or environment-specific secrets
3. **Docker Networks:** Database host changes from `localhost` to `postgres` inside Docker
4. **Port Mapping:** 
   - Inside container: port 5432 (Postgres)
   - Outside container: port 5433 (mapped)

## 🧪 Testing Email Configuration in Docker

After starting containers, test email:
```bash
# From Windows
curl "http://localhost:8080/api/test-email/send?to=your-email@example.com"

# Or use the batch script
test-email.bat
```

## 🐞 Troubleshooting

### Problem: Changes not reflected
**Solution:** Restart containers
```bash
docker-compose restart app
```

### Problem: Can't connect to database
**Solution:** Check database name (use `app_emendas` not `app-emendas`)

### Problem: Email not sending
**Solution:** 
1. Check logs: `docker logs portal-emendas-backend`
2. Verify mock mode is disabled: `QUARKUS_MAILER_MOCK=false`
3. Test SMTP endpoint: `http://localhost:8080/api/test-email/config`

## 📚 Related Files

- `.env` - Local environment configuration
- `docker-compose.yml` - Docker services configuration
- `.dockerignore` - Files excluded from Docker build
- `check-docker-env.bat` - Script to check container variables
- `test-email.bat` - Script to test SMTP configuration
