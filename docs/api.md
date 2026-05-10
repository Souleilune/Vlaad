# API Overview

Base URL: `/api/v1`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google`
- `POST /auth/forgot-password`
- `GET /auth/session`

## Reports

- `GET /reports`
- `GET /reports/:id`
- `POST /reports`
- `PATCH /reports/:id`
- `POST /reports/:id/flag`
- `POST /reports/:id/images`

## Emergency Requests

- `GET /emergencies`
- `POST /emergencies`
- `PATCH /emergencies/:id/status`

## Notifications

- `GET /notifications`
- `PATCH /notifications/:id/read`

## Moderation

- `GET /moderation/queue`
- `POST /moderation/reports/:id/verify`
- `POST /moderation/reports/:id/reject`

## Admin

- `GET /admin/users`
- `PATCH /admin/users/:id/role`
- `POST /admin/announcements`

## Analytics

- `GET /analytics/overview`
- `GET /analytics/heatmap`

## Verified Sources

- `GET /verified-sources`
- `POST /verified-sources`
- `PATCH /verified-sources/:id`
