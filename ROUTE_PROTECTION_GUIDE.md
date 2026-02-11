# 🔒 Route Protection & Permission Management Guide

## 📚 Table of Contents
1. [How Route Protection Works](#how-route-protection-works)
2. [Managing Profile Permissions](#managing-profile-permissions)
3. [Adding New Protected Routes](#adding-new-protected-routes)
4. [Quick Reference](#quick-reference)

---

## 🔐 How Route Protection Works

### Overview
The system uses **3 layers of protection**:

```
┌─────────────────────────────────────────────┐
│  Layer 1: Authentication Check              │
│  (Is user logged in?)                       │
└─────────────────────────────────────────────┘
              ↓ YES
┌─────────────────────────────────────────────┐
│  Layer 2: Route Permission Check            │
│  (Does user's role have required permission?)│
└─────────────────────────────────────────────┘
              ↓ YES
┌─────────────────────────────────────────────┐
│  Layer 3: Component Rendered                │
│  (User sees the page)                       │
└─────────────────────────────────────────────┘
```

---

### Step-by-Step Protection Flow

#### **Step 1: User Tries to Access a Route**
```typescript
// User navigates to: /dashboard/usuarios
```

#### **Step 2: ProtectedRoute Component Intercepts**
```typescript
// File: src/components/ProtectedRoute.tsx

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, hasAnyPermission } = useAuth();
  
  // CHECK 1: Is user logged in?
  if (!isAuthenticated) {
    return <Navigate to="/login" />; // ❌ Redirect to login
  }
  
  // CHECK 2: Does route require permissions?
  const routePermissions = ROUTE_PERMISSIONS['/dashboard/usuarios'];
  // routePermissions = [Permission.VIEW_USERS]
  
  // CHECK 3: Does user have ANY of the required permissions?
  if (!hasAnyPermission(routePermissions)) {
    return <AccessDeniedPage />; // ❌ Show "Access Denied"
  }
  
  return children; // ✅ Allow access
};
```

#### **Step 3: Permission Check Logic**
```typescript
// File: src/context/AuthContext.tsx

const hasAnyPermission = (permissions: Permission[]): boolean => {
  // Get user's role
  const userRole = user.role; // e.g., "OPERADOR"
  
  // Get all permissions for this role
  const userPermissions = ROLE_PERMISSIONS[userRole];
  // For OPERADOR: [VIEW_DASHBOARD, CREATE_EMENDA, ...]
  
  // Check if user has ANY of the required permissions
  return permissions.some(p => userPermissions.includes(p));
};
```

---

## 👥 Managing Profile Permissions

### Current Profiles (Roles)

| Profile | Description | Access Level |
|---------|-------------|--------------|
| **ADMIN** | System Administrator | Full access to everything |
| **OPERADOR** | Institution Operator | Create/edit emendas, manage their institution |
| **ANALISTA** | Government Analyst | Approve/reject emendas, view reports |
| **JURIDICO** | Legal Reviewer | Approve/reject emendas, review documents |

---

### How to Control What Each Profile Can See

All permissions are configured in **ONE FILE**: `src/types/user.types.ts`

#### **File Location:**
```
frontend/src/types/user.types.ts
```

#### **Configuration Structure:**

```typescript
// 1️⃣ Define all available permissions
export enum Permission {
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  VIEW_EMENDAS = 'VIEW_EMENDAS',
  CREATE_EMENDA = 'CREATE_EMENDA',
  EDIT_EMENDA = 'EDIT_EMENDA',
  DELETE_EMENDA = 'DELETE_EMENDA',
  APPROVE_EMENDA = 'APPROVE_EMENDA',
  REJECT_EMENDA = 'REJECT_EMENDA',
  VIEW_USERS = 'VIEW_USERS',
  // ... more permissions
}

// 2️⃣ Assign permissions to each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admin gets ALL permissions
    ...Object.values(Permission)
  ],
  
  [UserRole.OPERADOR]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_EMENDAS,
    Permission.CREATE_EMENDA,
    Permission.EDIT_EMENDA,
    // Only these permissions ↑
  ],
  
  [UserRole.ANALISTA]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_EMENDAS,
    Permission.APPROVE_EMENDA,
    Permission.REJECT_EMENDA,
    // Only these permissions ↑
  ],
  
  [UserRole.JURIDICO]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_EMENDAS,
    Permission.APPROVE_EMENDA,
    Permission.REJECT_EMENDA,
    Permission.MANAGE_INSTITUTION_DOCS,
    // Only these permissions ↑
  ],
};

// 3️⃣ Define which routes require which permissions
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/dashboard': [Permission.VIEW_DASHBOARD],
  '/dashboard/emendas': [Permission.VIEW_EMENDAS],
  '/dashboard/instituicoes': [Permission.VIEW_INSTITUTIONS],
  '/dashboard/usuarios': [Permission.VIEW_USERS], // ⚠️ Only ADMIN has this
  '/dashboard/profile': [Permission.VIEW_PROFILE],
  // ... more routes
};
```

---

### 📝 Examples: Controlling Access

#### **Example 1: Make "Usuários" Page Admin-Only**

**Current State:** Already configured ✅

```typescript
// Route requires VIEW_USERS permission
ROUTE_PERMISSIONS: {
  '/dashboard/usuarios': [Permission.VIEW_USERS]
}

// Only ADMIN has VIEW_USERS permission
ROLE_PERMISSIONS: {
  [UserRole.ADMIN]: [...Object.values(Permission)], // Has VIEW_USERS ✅
  [UserRole.OPERADOR]: [...], // No VIEW_USERS ❌
  [UserRole.ANALISTA]: [...], // No VIEW_USERS ❌
  [UserRole.JURIDICO]: [...], // No VIEW_USERS ❌
}
```

**Result:**
- ✅ ADMIN can access `/dashboard/usuarios`
- ❌ OPERADOR sees "Access Denied"
- ❌ ANALISTA sees "Access Denied"
- ❌ JURIDICO sees "Access Denied"

---

#### **Example 2: Allow ANALISTA to Create Emendas**

**Change:** Add `CREATE_EMENDA` permission to ANALISTA role

**Edit File:** `src/types/user.types.ts`

```typescript
[UserRole.ANALISTA]: [
  Permission.VIEW_DASHBOARD,
  Permission.VIEW_EMENDAS,
  Permission.CREATE_EMENDA,    // ← ADD THIS LINE
  Permission.APPROVE_EMENDA,
  Permission.REJECT_EMENDA,
  Permission.VIEW_INSTITUTIONS,
  Permission.VIEW_COUNCILORS,
  Permission.VIEW_REPORTS,
  Permission.EXPORT_DATA,
  Permission.VIEW_PROFILE,
  Permission.EDIT_PROFILE,
],
```

**Result:** ANALISTA now sees "+ Nova Emenda" button

---

#### **Example 3: Create New Admin-Only Route**

**Scenario:** You want to create `/dashboard/relatorios` page for ADMIN only

**Step 1:** Add new permission (if needed)
```typescript
export enum Permission {
  // ...existing permissions
  VIEW_ADVANCED_REPORTS = 'VIEW_ADVANCED_REPORTS', // ← NEW
}
```

**Step 2:** Assign permission to role
```typescript
[UserRole.ADMIN]: [...Object.values(Permission)], // Gets new permission automatically ✅
```

**Step 3:** Define route permission
```typescript
ROUTE_PERMISSIONS: {
  // ...existing routes
  '/dashboard/relatorios': [Permission.VIEW_ADVANCED_REPORTS], // ← NEW
}
```

**Step 4:** Add route in App.tsx
```typescript
<Route path="relatorios" element={<RelatoriosPage />} />
```

**Done!** Only ADMIN can access the new route.

---

#### **Example 4: Allow Multiple Roles to Access a Route**

**Scenario:** Both ANALISTA and JURIDICO can approve emendas

**Solution:** They both need `APPROVE_EMENDA` permission

```typescript
ROLE_PERMISSIONS: {
  [UserRole.ANALISTA]: [
    // ...
    Permission.APPROVE_EMENDA, // ✅ Has it
  ],
  
  [UserRole.JURIDICO]: [
    // ...
    Permission.APPROVE_EMENDA, // ✅ Has it
  ],
}

// Route accepts ANY user with APPROVE_EMENDA permission
ROUTE_PERMISSIONS: {
  '/dashboard/emendas': [Permission.VIEW_EMENDAS], // Both can view
}
```

---

## 🆕 Adding New Protected Routes

### Quick Guide

#### **1. Create the Page Component**
```typescript
// src/pages/MyNewPage.tsx
const MyNewPage = () => {
  return <div>My Protected Page</div>;
};
export default MyNewPage;
```

#### **2. Add Permission (if new)**
```typescript
// src/types/user.types.ts
export enum Permission {
  // ...
  VIEW_MY_NEW_PAGE = 'VIEW_MY_NEW_PAGE', // ← ADD
}
```

#### **3. Assign Permission to Roles**
```typescript
// src/types/user.types.ts
ROLE_PERMISSIONS: {
  [UserRole.ADMIN]: [...Object.values(Permission)],
  [UserRole.OPERADOR]: [
    // ...
    Permission.VIEW_MY_NEW_PAGE, // ← ADD if OPERADOR should see it
  ],
}
```

#### **4. Define Route Permission**
```typescript
// src/types/user.types.ts
ROUTE_PERMISSIONS: {
  // ...
  '/dashboard/my-new-page': [Permission.VIEW_MY_NEW_PAGE], // ← ADD
}
```

#### **5. Add Route to App.tsx**
```typescript
// src/App.tsx
<Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
  {/* ...existing routes */}
  <Route path="my-new-page" element={<MyNewPage />} /> {/* ← ADD */}
</Route>
```

#### **6. Add to Dashboard Menu (Optional)**
```typescript
// src/components/DashboardLayout.tsx
<NavLink to="/dashboard/my-new-page">
  My New Page
</NavLink>
```

**Done!** Your route is now protected. 🎉

---

## 📊 Quick Reference

### Current Role Capabilities

#### **ADMIN** 🔑
- ✅ Everything (all permissions)
- Can manage users
- Can delete anything
- System configuration

#### **OPERADOR** 👷
- ✅ Create/edit emendas
- ✅ Manage their own institution
- ✅ Upload documents
- ❌ Cannot approve/reject emendas
- ❌ Cannot manage users

#### **ANALISTA** 📊
- ✅ View all emendas
- ✅ Approve/reject emendas
- ✅ View reports
- ✅ Export data
- ❌ Cannot create emendas
- ❌ Cannot manage users

#### **JURIDICO** ⚖️
- ✅ View all emendas
- ✅ Approve/reject emendas
- ✅ Review documents
- ✅ View reports
- ❌ Cannot create emendas
- ❌ Cannot manage users

---

### Permission Check Examples

#### **In Components:**
```typescript
import { useAuth } from '../context/AuthContext';
import { Permission } from '../types/user.types';

const MyComponent = () => {
  const { hasPermission } = useAuth();
  
  return (
    <div>
      {hasPermission(Permission.CREATE_EMENDA) && (
        <button>+ Nova Emenda</button>
      )}
      
      {hasPermission(Permission.APPROVE_EMENDA) && (
        <button>Aprovar</button>
      )}
    </div>
  );
};
```

#### **Using PermissionGate:**
```typescript
import PermissionGate from '../components/PermissionGate';
import { Permission } from '../types/user.types';

<PermissionGate permissions={[Permission.DELETE_EMENDA]}>
  <button>Delete</button>
</PermissionGate>
```

---

## 🎯 Common Scenarios

### **Scenario 1: User Without Permission Tries to Access Route**
1. User types `/dashboard/usuarios` in browser
2. ProtectedRoute checks: `hasAnyPermission([Permission.VIEW_USERS])`
3. Returns `false` for non-admin users
4. Shows "Acesso Negado" page
5. User clicks "Voltar" to go back

### **Scenario 2: User Logs In**
1. Login successful
2. Backend returns user object with `role: "OPERADOR"`
3. Frontend stores in localStorage and AuthContext
4. `ROLE_PERMISSIONS[OPERADOR]` defines what user can do
5. Dashboard menu only shows routes user has permission for
6. Buttons show/hide based on permissions

### **Scenario 3: Admin Creates New User**
1. Admin assigns role (e.g., ANALISTA)
2. New user logs in
3. System automatically applies ANALISTA permissions
4. User sees only what ANALISTA can access
5. No extra configuration needed!

---

## 🔧 Troubleshooting

### **Problem: User can't access a page they should see**

**Solution:**
1. Check if route is in `ROUTE_PERMISSIONS`
2. Check if user's role has the required permission in `ROLE_PERMISSIONS`
3. Clear browser cache and localStorage
4. Re-login

### **Problem: Permission button not showing**

**Solution:**
1. Check `hasPermission()` is used correctly
2. Verify user object has `role` field
3. Check console for errors
4. Verify ROLE_PERMISSIONS includes the permission

### **Problem: "Access Denied" page showing incorrectly**

**Solution:**
1. Check `ROUTE_PERMISSIONS` mapping is correct
2. Verify path matches exactly (case-sensitive)
3. Check if route requires permissions it shouldn't

---

## 📁 Files to Edit

When managing permissions, you'll typically edit these files:

1. **`src/types/user.types.ts`** - Main permission configuration
   - Add new permissions
   - Assign permissions to roles
   - Define route permissions

2. **`src/App.tsx`** - Route definitions
   - Add new routes
   - Wrap with ProtectedRoute

3. **`src/components/DashboardLayout.tsx`** - Menu items
   - Add navigation links
   - Show/hide based on permissions

4. **Page Components** - Permission checks
   - Hide/show buttons
   - Disable features

---

## ✅ Best Practices

1. **Always use ProtectedRoute** for routes that need authentication
2. **Define permissions at route level** in ROUTE_PERMISSIONS
3. **Use hasPermission() for buttons/actions** in components
4. **Keep permission names descriptive** (e.g., VIEW_USERS, not SEE_PAGE)
5. **Test with different roles** after changes
6. **Document custom permissions** in code comments

---

## 🎓 Summary

**Route protection is automatic when you:**
1. ✅ Wrap route with `<ProtectedRoute>`
2. ✅ Define permission in `Permission` enum
3. ✅ Assign permission to role in `ROLE_PERMISSIONS`
4. ✅ Map route to permission in `ROUTE_PERMISSIONS`

**That's it!** The system handles the rest automatically. 🚀

---

**Need help?** Check the existing configurations in `src/types/user.types.ts` for examples!
