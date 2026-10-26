from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAssigneeOrCreatorOrReadOnly(BasePermission):
    """Anyone authenticated can read; only the assignee or creator can modify."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.assigned_to or obj.created_by == request.user
