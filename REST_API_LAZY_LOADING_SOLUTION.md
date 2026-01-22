# REST API and Lazy Loading - Solution Implemented

## The Problem with LAZY in REST APIs

When using `@ManyToOne(fetch = FetchType.LAZY)` in REST APIs:
- The relationship is not loaded initially
- It's only loaded when accessed (e.g., `emenda.institution.getName()`)
- **Problem**: By the time the REST endpoint returns JSON, the database session is closed
- **Result**: `LazyInitializationException` when Jackson tries to serialize the relationship

## Solution Implemented: DTO with Explicit Joins ✅

Instead of using JPA relationships, we use **Data Transfer Objects (DTOs)** that explicitly fetch and join related data when needed.

### Architecture:

```
Emenda (Entity)          Institution (Entity)        Councilor (Entity)
   |                            |                            |
   |-- institutionId (String)   |-- institutionId           |-- councilorId
   |-- councilorId (String)     |-- name                    |-- fullName
   |                            |-- email                   |
   |                            |                            |
   +------------------------------------------------------------+
                                |
                         EmendaDetailDTO
                    (Combines all data)
```

## Implementation:

### 1. Backend (Java/Quarkus)

#### EmendaDetailDTO.java
```java
public class EmendaDetailDTO {
    public String id;
    public String councilorId;
    public String councilorName;      // ← Joined from Councilor
    public String institutionId;
    public String institutionName;     // ← Joined from Institution
    public String institutionEmail;    // ← Joined from Institution
    // ... other emenda fields
}
```

#### EmendaService.java - New Methods
```java
// Get all emendas with institution and councilor names
public List<EmendaDetailDTO> listAllWithDetails() {
    List<Emenda> emendas = emendaRepository.listAll();
    return emendas.stream()
            .map(this::enrichEmendaWithDetails)
            .collect(Collectors.toList());
}

// Get single emenda with details
public EmendaDetailDTO findByIdWithDetails(String id) {
    Emenda emenda = findById(id);
    if (emenda == null) return null;
    return enrichEmendaWithDetails(emenda);
}

// Private method to fetch and join related data
private EmendaDetailDTO enrichEmendaWithDetails(Emenda emenda) {
    Institution institution = null;
    Councilor councilor = null;

    if (emenda.institutionId != null) {
        institution = institutionService.findByInstitutionId(emenda.institutionId);
    }
    if (emenda.councilorId != null) {
        councilor = councilorService.findByCouncilorId(emenda.councilorId);
    }

    return new EmendaDetailDTO(emenda, institution, councilor);
}
```

#### New REST Endpoints
- `GET /api/emendas` - Returns basic Emenda entities
- `GET /api/emendas/with-details` - Returns EmendaDetailDTO with institution and councilor names ✅
- `GET /api/emendas/{id}` - Returns basic Emenda entity
- `GET /api/emendas/{id}/with-details` - Returns single EmendaDetailDTO with details ✅

### 2. Frontend (React/TypeScript)

#### Updated EmendaDTO Interface
```typescript
export interface EmendaDTO {
  id?: string;
  councilorId?: string;
  councilorName?: string;      // ← NEW
  institutionId?: string;
  institutionName?: string;     // ← NEW
  institutionEmail?: string;    // ← NEW
  // ... other fields
}
```

#### Updated Service Methods
```typescript
listWithDetails: async (): Promise<EmendaDTO[]> => {
  const response = await api.get('/emendas/with-details');
  return response.data;
}

getByIdWithDetails: async (id: string): Promise<EmendaDTO> => {
  const response = await api.get(`/emendas/${id}/with-details`);
  return response.data;
}
```

#### EmendasPage Updates
- Now uses `emendaService.listWithDetails()` to fetch emendas
- Displays institution name and councilor name in emenda cards
- No need to make separate API calls to fetch institution/councilor data

## Benefits:

✅ **No LazyInitializationException**: All data is explicitly fetched before returning
✅ **Flexible**: Can use basic endpoint when you don't need related data (performance)
✅ **Performant**: Only fetches related data when needed via `/with-details` endpoint
✅ **REST-friendly**: JSON serialization works perfectly without JPA session issues
✅ **Decoupled**: Emenda can exist without Institution/Councilor in database
✅ **Type-safe**: Full TypeScript/Java type safety maintained

## Usage:

### When to use each endpoint:

1. **`GET /api/emendas`** - Use when you only need emenda data (faster)
2. **`GET /api/emendas/with-details`** - Use when you need to display institution/councilor names (frontend lists)
3. **`GET /api/emendas/{id}`** - Use when editing (don't need names)
4. **`GET /api/emendas/{id}/with-details`** - Use when viewing details (need all info)

### Frontend Display:

Emenda cards now show:
- Official Code
- Date
- Value
- Classification
- **Institution Name** ← NEW
- **Councilor Name** ← NEW
- Status

## Performance:

The current implementation does N+1 queries (one for emendas, then one for each institution/councilor).
This is acceptable for small datasets. For large datasets, you can optimize with:

1. **Batch fetching**: Collect all IDs and fetch in batches
2. **Native SQL joins**: Create custom queries with JOINs
3. **Caching**: Cache institution/councilor data

## Recommendation:

This is the **best approach for REST APIs** when you know you need related data on the frontend.
- Avoids JPA lazy loading issues
- Clean separation of concerns
- Easy to understand and maintain
- Flexible for different use cases

