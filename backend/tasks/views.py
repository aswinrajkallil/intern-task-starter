from rest_framework import permissions, viewsets

from .models import Task
from .permissions import IsAssigneeOrCreatorOrReadOnly
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsAssigneeOrCreatorOrReadOnly]

    def get_queryset(self):
        queryset = Task.objects.all().order_by("due_date")
        status_param = self.request.query_params.get("state")
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset

    def perform_create(self, serializer):
        creator = serializer.validated_data.get("created_by") or self.request.user
        serializer.save(created_by=creator)
