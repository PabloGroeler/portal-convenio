// ============================================================================
// PERMISSION MANAGEMENT - PRACTICAL EXAMPLES
// ============================================================================
// File: frontend/src/types/user.types.ts
// This is where you control WHO can access WHAT

// ============================================================================
// EXAMPLE 1: Allow ANALISTA to create emendas
// ============================================================================

/*
BEFORE:
[UserRole.ANALISTA]: [
  Permission.VIEW_DASHBOARD,
  Permission.VIEW_EMENDAS,
  Permission.APPROVE_EMENDA,
  Permission.REJECT_EMENDA,
  // ...
],

AFTER:
[UserRole.ANALISTA]: [
  Permission.VIEW_DASHBOARD,
  Permission.VIEW_EMENDAS,
  Permission.CREATE_EMENDA,     // ← ADD THIS LINE
  Permission.APPROVE_EMENDA,
  Permission.REJECT_EMENDA,
  // ...
],

RESULT: ANALISTA now sees "+ Nova Emenda" button
*/

// ============================================================================
// EXAMPLE 2: Make "Relatórios" page accessible to ANALISTA and JURIDICO only
// ============================================================================

/*
STEP 1: Add permission to enum
export enum Permission {
  // ...existing permissions
  VIEW_REPORTS = 'VIEW_REPORTS',  // ← ADD THIS
}

STEP 2: Assign to roles
[UserRole.ANALISTA]: [
  // ...
  Permission.VIEW_REPORTS,  // ← ADD THIS
],

[UserRole.JURIDICO]: [
  // ...
  Permission.VIEW_REPORTS,  // ← ADD THIS
],

STEP 3: Map route
export const ROUTE_PERMISSIONS = {
  // ...
  '/dashboard/relatorios': [Permission.VIEW_REPORTS],  // ← ADD THIS
};

STEP 4: Add route in App.tsx
<Route path="relatorios" element={<RelatoriosPage />} />

RESULT: Only ADMIN, ANALISTA, and JURIDICO can access /dashboard/relatorios
*/

// ============================================================================
// EXAMPLE 3: Make "Usuários" page accessible to ANALISTA (HR role)
// ============================================================================

/*
CURRENT: Only ADMIN can access /dashboard/usuarios

CHANGE NEEDED:
[UserRole.ANALISTA]: [
  // ...existing permissions
  Permission.VIEW_USERS,     // ← ADD THIS
  Permission.CREATE_USER,    // ← ADD THIS (optional, for creating users)
  Permission.EDIT_USER,      // ← ADD THIS (optional, for editing users)
],

RESULT: ANALISTA can now access user management page
*/

// ============================================================================
// EXAMPLE 4: Restrict "Delete Emenda" to ADMIN only (already configured)
// ============================================================================

/*
CURRENT CONFIGURATION:
[UserRole.ADMIN]: [...Object.values(Permission)],  // Has DELETE_EMENDA ✅
[UserRole.OPERADOR]: [/* no DELETE_EMENDA */],    // Doesn't have ❌
[UserRole.ANALISTA]: [/* no DELETE_EMENDA */],    // Doesn't have ❌
[UserRole.JURIDICO]: [/* no DELETE_EMENDA */],    // Doesn't have ❌

IN COMPONENT:
{hasPermission(Permission.DELETE_EMENDA) && (
  <button>Delete</button>
)}

RESULT: Only ADMIN sees the delete button
*/

// ============================================================================
// EXAMPLE 5: Create admin-only "System Settings" page
// ============================================================================

/*
STEP 1: Add permission
export enum Permission {
  // ...
  MANAGE_SYSTEM = 'MANAGE_SYSTEM',  // ← ALREADY EXISTS
}

STEP 2: Already assigned to ADMIN automatically (gets all permissions)
[UserRole.ADMIN]: [...Object.values(Permission)],

STEP 3: Map route
export const ROUTE_PERMISSIONS = {
  // ...
  '/dashboard/settings': [Permission.MANAGE_SYSTEM],  // ← ADD THIS
};

STEP 4: Add route in App.tsx
<Route path="settings" element={<SettingsPage />} />

STEP 5: Add to menu (DashboardLayout.tsx)
{isAdmin() && (
  <NavLink to="/dashboard/settings">
    Configurações
  </NavLink>
)}

RESULT: Only ADMIN can access settings page
*/

// ============================================================================
// EXAMPLE 6: Show button only to specific roles
// ============================================================================

/*
IN YOUR COMPONENT:

// Method 1: Check specific permission
const { hasPermission } = useAuth();
{hasPermission(Permission.APPROVE_EMENDA) && (
  <button>Aprovar</button>
)}

// Method 2: Check if admin
const { isAdmin } = useAuth();
{isAdmin() && (
  <button>Admin Action</button>
)}

// Method 3: Check specific role
const { hasRole } = useAuth();
{hasRole(UserRole.OPERADOR) && (
  <button>Operador Action</button>
)}

// Method 4: Multiple conditions
const { hasPermission, hasRole } = useAuth();
{(hasPermission(Permission.EDIT_EMENDA) && emenda.status === 'PENDENTE') && (
  <button>Edit</button>
)}
*/

// ============================================================================
// EXAMPLE 7: Create new permission and assign to multiple roles
// ============================================================================

/*
SCENARIO: You want ANALISTA and JURIDICO to export advanced reports

STEP 1: Add permission
export enum Permission {
  // ...
  EXPORT_ADVANCED_REPORTS = 'EXPORT_ADVANCED_REPORTS',  // ← NEW
}

STEP 2: Assign to multiple roles
[UserRole.ANALISTA]: [
  // ...
  Permission.EXPORT_ADVANCED_REPORTS,  // ← ADD
],

[UserRole.JURIDICO]: [
  // ...
  Permission.EXPORT_ADVANCED_REPORTS,  // ← ADD
],

STEP 3: Use in component
{hasPermission(Permission.EXPORT_ADVANCED_REPORTS) && (
  <button>Export Advanced Report</button>
)}

RESULT: ADMIN, ANALISTA, and JURIDICO see the export button
         OPERADOR does NOT see it
*/

// ============================================================================
// EXAMPLE 8: Conditional access based on business logic
// ============================================================================

/*
SCENARIO: OPERADOR can only edit emendas from their own institution

IN COMPONENT:
const { hasPermission, user } = useAuth();

// Base permission check
const hasEditPermission = hasPermission(Permission.EDIT_EMENDA);

// Business logic check
const isOwnInstitution = emenda.institutionId === user.institutionId;

// Combined check
const canEdit = hasEditPermission && isOwnInstitution;

{canEdit && (
  <button>Edit</button>
)}

RESULT: OPERADOR only sees edit button for their institution's emendas
*/

// ============================================================================
// EXAMPLE 9: Remove permission from role
// ============================================================================

/*
SCENARIO: Remove ability for OPERADOR to delete documents

BEFORE:
[UserRole.OPERADOR]: [
  Permission.VIEW_DASHBOARD,
  Permission.CREATE_EMENDA,
  Permission.EDIT_EMENDA,
  Permission.DELETE_DOCUMENT,  // ← REMOVE THIS LINE
  Permission.MANAGE_INSTITUTION_DOCS,
],

AFTER:
[UserRole.OPERADOR]: [
  Permission.VIEW_DASHBOARD,
  Permission.CREATE_EMENDA,
  Permission.EDIT_EMENDA,
  // Permission.DELETE_DOCUMENT,  ← REMOVED
  Permission.MANAGE_INSTITUTION_DOCS,
],

RESULT: OPERADOR can no longer delete documents
*/

// ============================================================================
// EXAMPLE 10: Dynamic menu based on permissions
// ============================================================================

/*
IN DashboardLayout.tsx:

import { useAuth } from '../context/AuthContext';
import { Permission } from '../types/user.types';

const DashboardLayout = () => {
  const { hasPermission, isAdmin } = useAuth();

  return (
    <nav>
      {/* Always visible to authenticated users */}
      <NavLink to="/dashboard">Dashboard</NavLink>

      {/* Visible if user has permission */}
      {hasPermission(Permission.VIEW_EMENDAS) && (
        <NavLink to="/dashboard/emendas">Emendas</NavLink>
      )}

      {/* Admin only */}
      {isAdmin() && (
        <NavLink to="/dashboard/usuarios">Usuários</NavLink>
      )}

      {/* Multiple permissions (OR logic) */}
      {(hasPermission(Permission.APPROVE_EMENDA) || hasPermission(Permission.REJECT_EMENDA)) && (
        <NavLink to="/dashboard/approvals">Aprovações</NavLink>
      )}
    </nav>
  );
};

RESULT: Menu items automatically show/hide based on user's role
*/

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/*
After making permission changes:

1. Clear browser localStorage
2. Log in as ADMIN - test all features work
3. Log in as OPERADOR - test limited access
4. Log in as ANALISTA - test approval features
5. Log in as JURIDICO - test legal features
6. Try accessing restricted URLs directly - should redirect
7. Check browser console for permission errors
8. Verify menu items show correctly for each role
9. Verify buttons show/hide correctly for each role
10. Test "Access Denied" page shows for unauthorized access
*/

// ============================================================================
// QUICK REFERENCE
// ============================================================================

/*
FILE LOCATIONS:
- Permissions config: frontend/src/types/user.types.ts
- Route definitions: frontend/src/App.tsx
- Menu config: frontend/src/components/DashboardLayout.tsx
- Permission checks: Use useAuth() in any component

KEY FUNCTIONS:
- hasPermission(Permission.X) - Check single permission
- hasAnyPermission([...]) - Check if has ANY of permissions
- hasRole(UserRole.X) - Check specific role
- isAdmin() - Check if admin

COMMON PERMISSIONS:
- Permission.VIEW_DASHBOARD - Access dashboard
- Permission.CREATE_EMENDA - Create new emenda
- Permission.EDIT_EMENDA - Edit emenda
- Permission.DELETE_EMENDA - Delete emenda
- Permission.APPROVE_EMENDA - Approve emenda
- Permission.VIEW_USERS - Access user management
- Permission.MANAGE_SYSTEM - System configuration
*/

// ============================================================================
// END OF EXAMPLES
// ============================================================================
