
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Task


class TaskApiTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.alice = User.objects.create_user(
            "alice", password="password123"
        )
        self.bob = User.objects.create_user(
            "bob", password="password123"
        )

        Task.objects.create(
            title="Sample",
            assigned_to=self.alice,
            created_by=self.alice,
            due_date=timezone.now() + timedelta(days=1),
        )

    def test_list_requires_auth(self):
        response = self.client.get("/api/tasks/")
        self.assertEqual(response.status_code, 401)

    def test_list_tasks(self):
        self.client.force_authenticate(self.alice)

        response = self.client.get("/api/tasks/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

    def test_stats_count_only_current_users_tasks(self):
        self.client.force_authenticate(self.alice)

        Task.objects.create(
            title="In progress task",
            status="in_progress",
            assigned_to=self.alice,
            created_by=self.bob,
        )
        Task.objects.create(
            title="Completed task",
            status="done",
            assigned_to=self.alice,
            created_by=self.bob,
            due_date=timezone.now() - timedelta(days=2),
        )
        Task.objects.create(
            title="Overdue task",
            status="todo",
            assigned_to=self.alice,
            created_by=self.bob,
            due_date=timezone.now() - timedelta(days=2),
        )
        Task.objects.create(
            title="Bob's task",
            status="todo",
            assigned_to=self.bob,
            created_by=self.bob,
        )

        response = self.client.get("/api/tasks/stats/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data,
            {
                "todo": 2,
                "in_progress": 1,
                "done": 1,
                "overdue": 1,
            },
        )

    def test_assignee_can_edit_task(self):
        self.client.force_authenticate(self.alice)
        task = Task.objects.get(title="Sample")

        response = self.client.patch(
            f"/api/tasks/{task.id}/",
            {"title": "Updated title"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)

    def test_non_assignee_non_creator_cannot_edit_task(self):
        self.client.force_authenticate(self.bob)
        task = Task.objects.get(title="Sample")

        response = self.client.patch(
            f"/api/tasks/{task.id}/",
            {"title": "Unauthorized update"},
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_creator_can_delete_task(self):
        self.client.force_authenticate(self.alice)
        task = Task.objects.get(title="Sample")

        response = self.client.delete(f"/api/tasks/{task.id}/")

        self.assertEqual(response.status_code, 204)

    def test_assignee_cannot_delete_task_created_by_someone_else(self):
        task = Task.objects.get(title="Sample")
        task.created_by = self.bob
        task.save()

        self.client.force_authenticate(self.alice)

        response = self.client.delete(f"/api/tasks/{task.id}/")

        self.assertEqual(response.status_code, 403)
