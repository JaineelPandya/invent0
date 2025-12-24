from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """
    Permission class for Admin role.
    Admin can perform all CRUD operations.
    """
    message = "Only admins can perform this action."

    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'admin'
        )


class IsViewer(BasePermission):
    """
    Permission class for Viewer role.
    Viewer can only perform read operations (GET, HEAD, OPTIONS).
    """
    message = "Viewers can only view data."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Viewers can only use safe methods (read-only)
        if request.user.role == 'viewer':
            return request.method in SAFE_METHODS
        
        return True


class IsAdminOrReadOnly(BasePermission):
    """
    Permission class that allows:
    - Admin: Full CRUD access
    - Viewer: Read-only access (GET, HEAD, OPTIONS)
    """
    message = "You don't have permission to perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Allow read-only access for any authenticated user
        if request.method in SAFE_METHODS:
            return True

        # Write permissions only for admins
        return request.user.role == 'admin'


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission to allow owners or admins to edit.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions for any authenticated user
        if request.method in SAFE_METHODS:
            return True

        # Write permissions for admin
        if request.user.role == 'admin':
            return True

        # Write permissions for owner (if object has user field)
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user

        return False
