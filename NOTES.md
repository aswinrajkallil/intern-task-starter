# Notes

## Bugs fixed
- Fixed task status filtering by aligning the frontend query parameter with the backend parameter expected by the API.
- Fixed task statistics to count overdue tasks consistently with the task overdue indicator.
- Fixed task permission handling so only the assignee or creator can edit tasks, and only the creator can delete them.
- Added backend tests for authentication, task listing, statistics, and edit/delete permissions.

## Improvements with more time
- Add frontend tests for task filtering, marking tasks as done, and refreshing statistics.
- Improve API error messages and add more detailed loading indicators.
- Add pagination and more comprehensive API performance tests.
- Improve the task interface for mobile screens and accessibility.

## Tradeoffs / assumptions
- All authenticated users can view tasks, while editing and deleting are restricted by backend permissions.
- Task statistics are calculated for tasks assigned to the currently authenticated user.
- Tasks without a due date appear after tasks with due dates.
- A task is overdue when its due date has passed and its status is not `done`.
- Basic Authentication is used for the provided demo setup.
