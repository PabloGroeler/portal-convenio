# Field Name Translation to Portuguese - Implementation Plan

## ⚠️ BREAKING CHANGE WARNING
This refactoring changes ALL Java field names from English to Portuguese. This is a major breaking change that affects:
- Backend entity fields
- DTOs
- Services
- Resources (APIs)
- Frontend TypeScript interfaces
- All API calls

**Estimated Impact:** 50+ files

---

## Translation Map

### Emenda Entity Fields
| Old English Name | New Portuguese Name | Type |
|------------------|---------------------|------|
| councilorId | idParlamentar | String |
| officialCode | codigoOficial | String |
| date | data | LocalDate |
| value | valor | BigDecimal |
| classification | classificacao | String |
| category | categoria | String |
| status | situacao | String |
| federalStatus | statusFederal | String |
| institutionId | idInstituicao | String |
| signedLink | linkAssinado | String |
| attachments | anexos | List<String> |
| description | descricao | String |
| objectDetail | objetoDetalhado | String |
| createTime | dataCriacao | OffsetDateTime |
| updateTime | dataAtualizacao | OffsetDateTime |

**Note:** Fields already in Portuguese remain unchanged:
- numeroEmenda
- exercicio
- esfera
- existeConvenio
- numeroConvenio
- anoConvenio
- statusCicloVida
- previsaoConclusao
- justificativa

---

## Implementation Strategy

### Phase 1: Backend Entities ✅
- [x] Emenda.java - DONE

### Phase 2: Backend DTOs (Need to update)
- [ ] EmendaDetailDTO.java
- [ ] ExternalEmendaDTO.java  
- [ ] Any other DTOs

### Phase 3: Backend Services (Need to update)
- [ ] EmendaService.java
- [ ] EmendaValidationService.java
- [ ] PublicDataImportService.java
- [ ] EmendaExternalSyncService.java
- [ ] Any other services

### Phase 4: Backend Resources/Controllers (Need to update)
- [ ] EmendasResource.java
- [ ] Any other resources

### Phase 5: Backend Tests (Need to update)
- [ ] EmendasResourceTest.java
- [ ] EmendasCicloVidaResourceTest.java
- [ ] Any other tests

### Phase 6: Frontend TypeScript Interfaces (Need to update)
- [ ] Emenda interface in EmendasPage.tsx
- [ ] EmendaDTO in emendaService.ts
- [ ] All API calls

### Phase 7: Frontend Service Calls (Need to update)
- [ ] emendaService.ts
- [ ] All axios calls
- [ ] Response mapping

### Phase 8: Frontend Components (Need to update)
- [ ] EmendasPage.tsx (form fields, display, state)
- [ ] Any other components using Emenda

---

## Risk Assessment

### HIGH RISK ⚠️
- **API Contract Breaking:** All API requests/responses will have different field names
- **Data Mapping:** Frontend won't understand backend responses without updates
- **Runtime Errors:** Missing field errors will occur if not updated completely

### MITIGATION
1. ✅ Use feature branch
2. ⚠️ Update ALL files in ONE commit (atomic change)
3. ⚠️ Test thoroughly before merging
4. ⚠️ Update frontend AND backend together
5. ⚠️ Cannot deploy one without the other

---

## Recommended Approach

### Option A: Complete Refactoring (RECOMMENDED)
Update everything at once:
1. Backend entities
2. Backend DTOs  
3. Backend services
4. Backend resources
5. Backend tests
6. Frontend interfaces
7. Frontend services
8. Frontend components
9. Test end-to-end
10. Deploy together

**Pros:** Clean, consistent, no half-translated code  
**Cons:** Large change, must be atomic

### Option B: Add Compatibility Layer (NOT RECOMMENDED)
Keep both English and Portuguese fields temporarily with mappers.

**Pros:** Gradual migration  
**Cons:** Confusing, maintenance nightmare, technical debt

---

## CURRENT STATUS

✅ **Emenda Entity** - Fields translated to Portuguese  
⚠️ **Everything Else** - Still using English field names (BROKEN STATE)

**Decision Required:** 
- Continue with full refactoring? (Recommended)
- Rollback Emenda.java changes?

---

## If Continuing: Next Steps

1. Update EmendaDetailDTO.java with Portuguese field names
2. Update all services that reference Emenda fields
3. Update all resources (API controllers)
4. Update all tests
5. Update frontend TypeScript interfaces
6. Update frontend service calls
7. Update frontend components
8. Run comprehensive tests
9. Deploy atomically (backend + frontend together)

---

## Estimated Time
- Backend updates: 2-3 hours
- Frontend updates: 2-3 hours  
- Testing: 1-2 hours
- **Total: 5-8 hours**

---

## Alternative: ROLLBACK

If this change is too extensive, we can rollback the Emenda.java changes and keep English field names.

**Command to rollback:**
```bash
git checkout HEAD -- src/main/java/org/acme/entity/Emenda.java
```

---

## User Decision Required

**Question:** Do you want to:
1. **Continue** with full Portuguese field refactoring (5-8 hours work)?
2. **Rollback** and keep English field names?
3. **Pause** and decide later?

Please advise on how to proceed.

