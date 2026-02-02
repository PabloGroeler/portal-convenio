# Field Name Refactoring - Search and Replace Script

## Instructions
Use your IDE's "Find and Replace in Files" feature with these patterns.

**⚠️ IMPORTANT:**
1. Backup your code first (commit current state)
2. Apply replacements in the ORDER shown below
3. Use "Match Whole Word" option
4. Apply to: `src/**/*.java` and `frontend/src/**/*`

---

## Backend Java Files

### Phase 1: Field Access (emenda.fieldName)

```regex
Find: emenda\.councilorId
Replace: emenda.idParlamentar

Find: emenda\.officialCode
Replace: emenda.codigoOficial

Find: emenda\.date
Replace: emenda.data

Find: emenda\.value
Replace: emenda.valor

Find: emenda\.classification
Replace: emenda.classificacao

Find: emenda\.category
Replace: emenda.categoria

Find: emenda\.status([^C])
Replace: emenda.situacao$1

Find: emenda\.federalStatus
Replace: emenda.statusFederal

Find: emenda\.institutionId
Replace: emenda.idInstituicao

Find: emenda\.signedLink
Replace: emenda.linkAssinado

Find: emenda\.attachments
Replace: emenda.anexos

Find: emenda\.description
Replace: emenda.descricao

Find: emenda\.objectDetail
Replace: emenda.objetoDetalhado

Find: emenda\.createTime
Replace: emenda.dataCriacao

Find: emenda\.updateTime
Replace: emenda.dataAtualizacao
```

### Phase 2: DTO Field Declarations

```regex
Find: public String councilorId;
Replace: public String idParlamentar;

Find: public String officialCode;
Replace: public String codigoOficial;

Find: public LocalDate date;
Replace: public LocalDate data;

Find: public BigDecimal value;
Replace: public BigDecimal valor;

Find: public String classification;
Replace: public String classificacao;

Find: public String category;
Replace: public String categoria;

Find: public String status;
Replace: public String situacao;

Find: public String federalStatus;
Replace: public String statusFederal;

Find: public String institutionId;
Replace: public String idInstituicao;

Find: public String signedLink;
Replace: public String linkAssinado;

Find: public List<String> attachments;
Replace: public List<String> anexos;

Find: public String description;
Replace: public String descricao;

Find: public String objectDetail;
Replace: public String objetoDetalhado;

Find: public OffsetDateTime createTime;
Replace: public OffsetDateTime dataCriacao;

Find: public OffsetDateTime updateTime;
Replace: public OffsetDateTime dataAtualizacao;
```

### Phase 3: DTO Field Access (dto.fieldName)

```regex
Find: \.councilorId([^N])
Replace: .idParlamentar$1

Find: \.officialCode
Replace: .codigoOficial

Find: \.date([^A])
Replace: .data$1

Find: \.value([^>])
Replace: .valor$1

Find: \.classification
Replace: .classificacao

Find: \.category
Replace: .categoria

Find: \.status([^C|^F])
Replace: .situacao$1

Find: \.federalStatus
Replace: .statusFederal

Find: \.institutionId
Replace: .idInstituicao

Find: \.signedLink
Replace: .linkAssinado

Find: \.attachments
Replace: .anexos

Find: \.description
Replace: .descricao

Find: \.objectDetail
Replace: .objetoDetalhado

Find: \.createTime
Replace: .dataCriacao

Find: \.updateTime
Replace: .dataAtualizacao
```

### Phase 4: JSON Property Names (in tests and external DTOs)

```regex
Find: "councilorId"
Replace: "idParlamentar"

Find: "officialCode"
Replace: "codigoOficial"

Find: "date"
Replace: "data"

Find: "value"
Replace: "valor"

Find: "classification"
Replace: "classificacao"

Find: "category"
Replace: "categoria"

Find: "status"
Replace: "situacao"

Find: "federalStatus"
Replace: "statusFederal"

Find: "institutionId"
Replace: "idInstituicao"

Find: "signedLink"
Replace: "linkAssinado"

Find: "attachments"
Replace: "anexos"

Find: "description"
Replace: "descricao"

Find: "objectDetail"
Replace: "objetoDetalhado"

Find: "createTime"
Replace: "dataCriacao"

Find: "updateTime"
Replace: "dataAtualizacao"
```

---

## Frontend TypeScript Files

### Phase 5: Interface Fields (frontend/src/**/*.ts, *.tsx)

```typescript
Find: councilorId:
Replace: idParlamentar:

Find: officialCode:
Replace: codigoOficial:

Find: date:
Replace: data:

Find: value:
Replace: valor:

Find: classification:
Replace: classificacao:

Find: category:
Replace: categoria:

Find: status:
Replace: situacao:

Find: federalStatus:
Replace: statusFederal:

Find: institutionId:
Replace: idInstituicao:

Find: signedLink:
Replace: linkAssinado:

Find: attachments:
Replace: anexos:

Find: description:
Replace: descricao:

Find: objectDetail:
Replace: objetoDetalhado:

Find: createTime:
Replace: dataCriacao:

Find: updateTime:
Replace: dataAtualizacao:
```

### Phase 6: Object Property Access (frontend)

```typescript
Find: \.councilorId
Replace: .idParlamentar

Find: \.officialCode
Replace: .codigoOficial

Find: \.date
Replace: .data

Find: \.value
Replace: .valor

Find: \.classification
Replace: .classificacao

Find: \.category
Replace: .categoria

Find: \.status
Replace: .situacao

Find: \.federalStatus
Replace: .statusFederal

Find: \.institutionId
Replace: .idInstituicao

Find: \.signedLink
Replace: .linkAssinado

Find: \.attachments
Replace: .anexos

Find: \.description
Replace: .descricao

Find: \.objectDetail
Replace: .objetoDetalhado

Find: \.createTime
Replace: .dataCriacao

Find: \.updateTime
Replace: .dataAtualizacao
```

### Phase 7: String Literals in Frontend

```typescript
Find: 'councilorId'
Replace: 'idParlamentar'

Find: 'officialCode'
Replace: 'codigoOficial'

Find: 'date'
Replace: 'data'

Find: 'value'
Replace: 'valor'

Find: 'classification'
Replace: 'classificacao'

Find: 'category'
Replace: 'categoria'

Find: 'status'
Replace: 'situacao'

Find: 'federalStatus'
Replace: 'statusFederal'

Find: 'institutionId'
Replace: 'idInstituicao'

Find: 'signedLink'
Replace: 'linkAssinado'

Find: 'attachments'
Replace: 'anexos'

Find: 'description'
Replace: 'descricao'

Find: 'objectDetail'
Replace: 'objetoDetalhado'

Find: 'createTime'
Replace: 'dataCriacao'

Find: 'updateTime'
Replace: 'dataAtualizacao'
```

---

## Post-Replacement Verification

### 1. Check for Compilation Errors
```bash
# Backend
./mvnw compile

# Frontend
cd frontend
npm run build
```

### 2. Search for Remaining English Field Names
```bash
# Should return 0 results
grep -r "\.councilorId" src/
grep -r "\.officialCode" src/
grep -r "\.attachments" src/
```

### 3. Manual Review Required
- Test file JSON bodies
- External API DTOs (might need to keep English if external API uses English)
- Comments and documentation

---

## Alternative: Automated Script

If you prefer, I can create a Node.js script that does all replacements automatically:

```javascript
// replace-fields.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const replacements = {
  'councilorId': 'idParlamentar',
  'officialCode': 'codigoOficial',
  // ... all mappings
};

// Apply to all .java, .ts, .tsx files
// ... implementation
```

---

## Estimated Time

- **Manual with IDE Find/Replace:** 2-3 hours
- **Automated script:** 30 minutes
- **Testing:** 1-2 hours
- **Total:** 3-5 hours

---

## Rollback Plan

If something goes wrong:
```bash
git checkout HEAD -- .
git clean -fd
```

Or restore from your backup commit.

---

## What Would You Prefer?

1. **Manual IDE Find/Replace** - Use patterns above (safer, you control each change)
2. **I create automated script** - Faster but higher risk
3. **I do it file-by-file** - Slower but most thorough

Please advise which approach you'd like.

