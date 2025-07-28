# API Endpoints

## General

- `GET /api` — API root
- `GET /test` — Test server

## Auth

- `POST /api/auth/connect` — User login

## Users

- `GET /api/users` — List all users
- `GET /api/users/paginated` — Paginated users
- `GET /api/users/count` — User count
- `POST /api/users` — Create user
- `POST /api/users/search` — Search user by condition
- `GET /api/users/:id/with-role` — Get user with role
- `GET /api/users/:id` — Get user by ID
- `PUT /api/users/:id` — Update user
- `DELETE /api/users/:id` — Delete user

## Roles

- `GET /api/roles` — List all roles
- `GET /api/roles/paginated` — Paginated roles
- `GET /api/roles/count` — Role count
- `POST /api/roles` — Create role
- `GET /api/roles/:id` — Get role by ID
- `PUT /api/roles/:id` — Update role
- `POST /api/roles/:id/duplicate` — Duplicate role
- `DELETE /api/roles/:id` — Delete role

## Categories

- `GET /api/category` — List all categories
- `GET /api/category/paginated` — Paginated categories
- `GET /api/category/:id` — Get category by ID
- `POST /api/category/add` — Create category
- `PUT /api/category/:id` — Update category
- `DELETE /api/category/:id` — Delete category

## Articles

- `GET /api/articles` — List all articles
- `POST /api/articles` — Create article
- `GET /api/articles/:id` — Get article by ID
- `PUT /api/articles/:id` — Update article
- `DELETE /api/articles/:id` — Delete article
- `GET /api/articles/by-category/:categoryId` — Get article by commande category
