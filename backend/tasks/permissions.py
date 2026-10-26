# from rest_framework.permissions import SAFE_METHODS, BasePermission


# class IsAssigneeOrCreatorOrReadOnly(BasePermission):
#     """Anyone authenticated can read; only the assignee or creator can modify."""

#     def has_object_permission(self, request, view, obj):
#         if request.method in SAFE_METHODS:
#             return True
#         return obj.assigned_to or obj.created_by == request.user


from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAssigneeOrCreatorOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        if request.method == "DELETE":
            return obj.created_by_id == request.user.id

        return (
            obj.assigned_to_id == request.user.id
            or obj.created_by_id == request.user.id
        )

