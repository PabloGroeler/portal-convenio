# 🚀 RBAC Quick Start Guide

## ✅ Implementation Complete!

The Role-Based Access Control system is now **fully implemented** in your frontend.

## 🎯 What You Can Do Now

### 1. Use Permission Checks in Any Component

```typescript
import { useAuth } from '../context/AuthContext';
import { Permission } from '../types/user.types';

const MyComponent = () => {
  const { hasPermission, isAdmin } = useAuth();

  return (
    <>
      {hasPermission(Permission.CREATE_EMENDA) && (
        <button>Create</button>
      )}
      {isAdmin() && <div>Admin Panel</div>}
    </>
  );
};
```

### 2. The Dashboard Menu is Already Working!
- Login with different user roles
- See different menu items automatically
- Try accessing restricted routes - you'll see "Access Denied"

### 3. Add Permission Checks to Your Existing Buttons

**Example for Emendas Page:**
Find your action buttons and wrap them:
```typescript
{hasPermission(Permission.APPROVE_EMENDA) && (
  <button onClick={handleApprove}>Aprovar</button>
)}
```

## 📂 Key Files

1. **Permissions Definition:** `src/types/user.types.ts`
2. **Permission Hook:** `src/hooks/usePermissions.ts`
3. **Auth Context:** `src/context/AuthContext.tsx` (enhanced)
4. **Protected Routes:** `src/components/ProtectedRoute.tsx` (enhanced)
5. **Dynamic Menu:** `src/components/DashboardLayout.tsx` (enhanced)

## 🔑 Available Methods

From `useAuth()`:
- `hasPermission(permission)` - Check single permission
- `hasAnyPermission([permissions])` - Check if has ANY permission
- `hasRole(role)` - Check user's role
- `isAdmin()` - Check if user is admin
- `user.role` - Get user's role

## 👥 User Roles

- **ADMIN** - Full access
- **OPERADOR** - Institution operators
- **ANALISTA** - Government analysts
- **JURIDICO** - Legal reviewers

## 🎨 Example Usage Pattern

```typescript
// Pattern 1: Hide/Show buttons
{hasPermission(Permission.CREATE_EMENDA) && <CreateButton />}

// Pattern 2: Conditional logic
if (hasPermission(Permission.APPROVE_EMENDA)) {
  // Enable approval workflow
}

// Pattern 3: Role-based rendering
{isAdmin() && <AdminPanel />}
{hasRole(UserRole.ANALISTA) && <AnalystTools />}
```

## 🧪 Testing

1. **Login as different users** with different roles
2. **Check the dashboard menu** - it changes automatically
3. **Try accessing routes** - unauthorized routes show "Access Denied"
4. **Add permission checks** to your buttons and test

## 📝 Common Permissions

- `Permission.VIEW_EMENDAS` - View emendas
- `Permission.CREATE_EMENDA` - Create emendas
- `Permission.EDIT_EMENDA` - Edit emendas
- `Permission.APPROVE_EMENDA` - Approve emendas
- `Permission.REJECT_EMENDA` - Reject emendas
- `Permission.VIEW_INSTITUTIONS` - View institutions
- `Permission.EDIT_INSTITUTION` - Edit institutions
- `Permission.VIEW_COUNCILORS` - View councilors
- `Permission.VIEW_USERS` - View users (admin only)

## 🎉 You're Ready!

Start adding permission checks to your components. The system is:
- ✅ Fully functional
- ✅ No errors
- ✅ Type-safe
- ✅ Ready to use

**Just import and use!** 🚀
