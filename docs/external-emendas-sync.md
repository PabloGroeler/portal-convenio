# External Emendas Sync

This project can import "emendas" from the external API:

`GET https://emendas.sinop.mt.leg.br/admin-api/api/public/v1/amendments`

## Configure the token

The external API requires an `Authorization: Bearer <token>` header.

You can configure the token in one of three ways:

### 1) Environment variable (recommended)

**PowerShell**
```powershell
$env:EXTERNAL_EMENDAS_API_TOKEN="YOUR_TOKEN_HERE"
```

### 2) JVM system property

```bash
./mvnw quarkus:dev -Dexternal-emendas-api.token=YOUR_TOKEN_HERE
```

### 3) application.properties (not recommended for real secrets)

In `src/main/resources/application.properties`:
```properties
external-emendas-api.token=YOUR_TOKEN_HERE
```

## Run sync

Endpoint:

`POST /api/emendas/sync-external`

Example:
```bash
curl -X POST "http://localhost:8080/api/emendas/sync-external"
```

If the backend user auth is required in your environment:
```bash
curl -X POST "http://localhost:8080/api/emendas/sync-external" \
  -H "Authorization: Bearer YOUR_APP_JWT"
```

## Troubleshooting

- **400 error token not configured**: the backend process does not have access to the token. Ensure you set the environment variable in the same terminal session where you started Quarkus.
- **502 Unauthorized (401) from external**: token is being sent but rejected (expired/invalid permissions).

