# Institution and Councilor Registration System

## Summary
Successfully created a complete registration system for Institutions and Councilors with full CRUD operations.

## Backend Implementation

### Entities Created:
1. **Institution** (`Institution.java`)
   - id (String UUID)
   - institutionId (String, unique)
   - name (String, required)
   - email (String)
   - phone (String)
   - address (String)
   - createTime, updateTime (OffsetDateTime)

2. **Councilor** (`Councilor.java`) - Already existed, created repository/service/resource
   - id (Long)
   - councilorId (String, unique)
   - fullName (String, required)
   - createTime, updateTime (OffsetDateTime)

### Repositories Created:
- `InstitutionRepository.java` - Panache repository with custom findByInstitutionId method
- `CouncilorRepository.java` - Panache repository with custom findByCouncilorId method

### Services Created:
- `InstitutionService.java` - CRUD operations for institutions
- `CouncilorService.java` - CRUD operations for councilors

### REST Resources Created:
- `InstitutionResource.java` - `/api/institutions` endpoints
  - GET `/api/institutions` - List all
  - GET `/api/institutions/{id}` - Get by ID
  - GET `/api/institutions/by-instituicao-id/{institutionId}` - Get by instituicao ID
  - POST `/api/institutions` - Create (with duplicate check)
  - PUT `/api/institutions/{id}` - Update
  - DELETE `/api/institutions/{id}` - Delete

- `CouncilorResource.java` - `/api/councilors` endpoints
  - GET `/api/councilors` - List all
  - GET `/api/councilors/{id}` - Get by ID
  - GET `/api/councilors/by-parlamentar-id/{councilorId}` - Get by parlamentar ID
  - POST `/api/councilors` - Create (with duplicate check)
  - PUT `/api/councilors/{id}` - Update
  - DELETE `/api/councilors/{id}` - Delete

## Frontend Implementation

### Services Created:
- `institutionService.ts` - API client for institutions
- `councilorService.ts` - API client for councilors

### Pages Created:
1. **InstitutionsPage.tsx** (`/painel/institutions`)
   - Table view with all institutions
   - Create/Edit modal with form
   - Delete functionality with confirmation
   - Fields: Institution ID, Name, Email, Phone, Address
   - Error handling for duplicate IDs

2. **CouncilorsPage.tsx** (`/painel/councilors`)
   - Table view with all councilors
   - Create/Edit modal with form
   - Delete functionality with confirmation
   - Fields: Councilor ID, Full Name
   - Error handling for duplicate IDs

### Routes Added:
- `/painel/institutions` - Protected route for institutions management
- `/painel/councilors` - Protected route for councilors management

### Dashboard Updated:
- Added "Gerenciar Instituições" button (purple gradient)
- Added "Gerenciar Vereadores" button (green gradient)
- Added shortcuts in sidebar for both pages

## Features:
✅ Full CRUD operations (Create, Read, Update, Delete)
✅ Duplicate ID validation
✅ Protected routes (requires authentication)
✅ Responsive UI with Tailwind CSS
✅ Modal forms for create/edit
✅ Loading states
✅ Error handling
✅ Confirmation dialogs for delete
✅ UUID for Institution IDs
✅ Auto-increment for Councilor IDs

## Usage:
1. Login to the system
2. Navigate to Dashboard (`/painel`)
3. Click "Gerenciar Instituições" or "Gerenciar Vereadores"
4. Use the "+ Nova Instituição" or "+ Novo Vereador" button to create
5. Click "Editar" to modify existing records
6. Click "Excluir" to delete records (with confirmation)

## Integration with Emendas:
The `councilorId` and `institutionId` fields in the Emenda entity can now reference these registered entities.

