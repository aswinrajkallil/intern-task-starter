from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Task


class TaskApiTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.alice = User.objects.create_user("alice", password="password123")
        self.bob = User.objects.create_user("bob", password="password123")
        Task.objects.create(
            title="Sample", assigned_to=self.alice, created_by=self.alice,
            due_date=timezone.now(),
        )

    def test_list_requires_auth(self):
        response = self.client.get("/api/tasks/")
        self.assertEqual(response.status_code, 401)

    def test_list_tasks(self):
        self.client.force_authenticate(self.alice)
        response = self.client.get("/api/tasks/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
