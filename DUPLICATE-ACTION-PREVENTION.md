# Duplicate Action Prevention - Implementation

## Issue Fixed
Users could spam-click action buttons (Aprovar, Devolver, Reprovar) multiple times, causing duplicate API calls and unwanted state changes.

## Solution Implemented

### 1. Added Action Tracking State
```typescript
// Track last action taken per emenda to prevent duplicate consecutive actions
const [lastActionByEmenda, setLastActionByEmenda] = useState<Record<string, string>>({});
```

**Purpose:** Stores the last action executed for each emenda by ID.

---

### 2. Duplicate Action Check in `handleAcao`

**Before any action is executed, the system now checks:**

```typescript
// Check if this is a duplicate action (same action on same emenda)
const lastAction = lastActionByEmenda[selectedEmenda.id];
if (lastAction === acao) {
  console.log(`[EmendasPage] Duplicate action ${acao} ignored for emenda ${selectedEmenda.id}`);
  alert(`A ação "${acao}" já foi executada nesta emenda. Escolha uma ação diferente ou feche e reabra a emenda.`);
  return;
}
```

**What happens:**
- ✅ If the user tries to execute the same action twice → **BLOCKED** with alert message
- ✅ If the user tries a different action → **ALLOWED** (e.g., Aprovar → Devolver)
- ✅ Prevents accidental duplicate API calls

---

### 3. Simultaneous Action Prevention

**Already existed but reinforced:**

```typescript
// Prevent multiple simultaneous actions
if (executingAction) {
  console.log('[EmendasPage] Action already in progress, ignoring click');
  return;
}
```

**What happens:**
- ✅ If an action is in progress → subsequent clicks are ignored
- ✅ Prevents race conditions

---

### 4. Record Successful Actions

**After a successful action:**

```typescript
// Record this action as the last one for this emenda
setLastActionByEmenda((prev) => ({
  ...prev,
  [selectedEmenda.id]: acao,
}));
```

**What happens:**
- ✅ Action is recorded as "last action" for this emenda
- ✅ Next click of same action will be blocked

---

### 5. Clear Tracking on Modal Close

**When modal is closed:**

```typescript
const closeModal = () => {
  // Clear last action tracking for the emenda being closed
  if (selectedEmenda?.id) {
    setLastActionByEmenda((prev) => {
      const updated = { ...prev };
      delete updated[selectedEmenda.id];
      return updated;
    });
  }
  // ...rest of cleanup
};
```

**What happens:**
- ✅ Last action tracking is cleared for the closed emenda
- ✅ When reopened, the same action can be used again
- ✅ Prevents memory leaks from accumulating tracking data

---

## User Experience

### Scenario 1: Duplicate Action (BLOCKED)
```
1. User opens emenda
2. User clicks "Aprovar" → ✅ Action executes
3. User clicks "Aprovar" again → ❌ BLOCKED with message:
   "A ação 'APROVAR' já foi executada nesta emenda. 
    Escolha uma ação diferente ou feche e reabra a emenda."
```

### Scenario 2: Different Action (ALLOWED)
```
1. User opens emenda
2. User clicks "Aprovar" → ✅ Action executes
3. User clicks "Devolver" → ✅ Action executes (different action)
```

### Scenario 3: Reopen Emenda (ALLOWED)
```
1. User opens emenda
2. User clicks "Aprovar" → ✅ Action executes
3. User closes modal
4. User reopens same emenda
5. User clicks "Aprovar" → ✅ Action executes (tracking cleared)
```

### Scenario 4: Spam Clicks (BLOCKED)
```
1. User opens emenda
2. User rapidly clicks "Aprovar" 5 times
   → Click 1: ✅ Executes
   → Click 2-5: ❌ Ignored (executingAction = true)
```

---

## Technical Details

### State Structure
```typescript
lastActionByEmenda: {
  "emenda-id-1": "APROVAR",
  "emenda-id-2": "DEVOLVER",
  "emenda-id-3": "REPROVAR"
}
```

### Action Flow
```
┌─────────────────────────────────────────────┐
│ User clicks action button                   │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ Check: Is action already executing?         │
│ if (executingAction) → BLOCK                │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ Check: Is this a duplicate action?          │
│ if (lastAction === acao) → BLOCK + ALERT    │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ Execute action via API                      │
│ setExecutingAction(true)                    │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ Record action in tracking                   │
│ setLastActionByEmenda({...})                │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ Update UI and refresh data                  │
│ setExecutingAction(false)                   │
└─────────────────────────────────────────────┘
```

---

## Benefits

✅ **Prevents accidental duplicates** - User can't approve twice by mistake  
✅ **Clear feedback** - Alert message explains why action was blocked  
✅ **Flexible** - Allows different actions on same emenda  
✅ **Clean state** - Tracking cleared when modal closes  
✅ **No backend changes** - Pure frontend solution  
✅ **Performance** - Prevents unnecessary API calls  

---

## Testing Checklist

- [x] Click "Aprovar" twice → Second click blocked
- [x] Click "Aprovar" then "Devolver" → Both execute
- [x] Rapidly click "Reprovar" → Only first click executes
- [x] Close and reopen emenda → Can use same action again
- [x] Alert message appears for duplicate action
- [x] No console errors
- [x] Action executes successfully after waiting

---

## Edge Cases Handled

### Multiple Emendas
```
✅ Each emenda tracks its own last action independently
✅ Actions on different emendas don't interfere
```

### Modal Close/Reopen
```
✅ Tracking cleared on close
✅ Fresh state when reopened
✅ No stale action blocks
```

### API Failure
```
✅ Action not recorded if API call fails
✅ User can retry the same action
✅ executingAction properly reset in finally block
```

### Network Delay
```
✅ executingAction prevents spam during slow network
✅ Action recorded only after successful response
```

---

## Code Changes Summary

**File:** `frontend/src/pages/EmendasPage.tsx`

**Changes:**
1. Added `lastActionByEmenda` state (line ~48)
2. Added duplicate check in `handleAcao` (line ~410-416)
3. Added action recording after success (line ~436-440)
4. Added tracking cleanup in `closeModal` (line ~261-268)

**Lines added:** ~20 lines
**Breaking changes:** None
**Backward compatible:** Yes

---

## User-Facing Changes

### Alert Message (Portuguese)
```
"A ação 'APROVAR' já foi executada nesta emenda. 
 Escolha uma ação diferente ou feche e reabra a emenda."
```

**When shown:**
- User tries to execute the same action twice in a row

**User actions to resolve:**
- Choose a different action (e.g., Devolver instead of Aprovar)
- Close and reopen the emenda modal
- Refresh the page

---

## Performance Impact

**Memory:** Minimal - O(n) where n = number of emendas with actions taken  
**CPU:** Negligible - Simple object lookup (O(1))  
**Network:** Reduced - Prevents unnecessary duplicate API calls  
**UX:** Improved - Faster response (no waiting for duplicate API call to fail)  

---

## Future Enhancements (Optional)

### Option 1: Time-based Reset
```typescript
// Clear tracking after 5 minutes
useEffect(() => {
  const timer = setInterval(() => {
    setLastActionByEmenda({});
  }, 5 * 60 * 1000);
  return () => clearInterval(timer);
}, []);
```

### Option 2: Disable Button After Use
```typescript
<button 
  disabled={lastActionByEmenda[selectedEmenda.id] === 'APROVAR'}
  onClick={() => handleAcao('APROVAR')}
>
  Aprovar
</button>
```

### Option 3: Visual Indicator
```typescript
{lastActionByEmenda[selectedEmenda.id] === 'APROVAR' && (
  <span className="text-green-600">✓ Já aprovado</span>
)}
```

---

## Status

✅ **IMPLEMENTED AND TESTED**

**Date:** January 31, 2026  
**Issue:** Duplicate action execution  
**Solution:** Action tracking with duplicate prevention  
**Impact:** Positive - Better UX, fewer API calls  
**Risk:** Low - No breaking changes  

---

**Ready to use!** The fix prevents duplicate actions while maintaining flexibility for different actions on the same emenda.

