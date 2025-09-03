# API Configuration

This directory contains the API configuration and services for the ERP Express frontend application.

## Configuration

The API base URL is centrally configured in `config.ts` and can be set via environment variables:

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
```

### Environment Variables

Create environment files in your `web/` directory:

- **`.env.development`**: `VITE_API_BASE_URL=http://localhost:5000`
- **`.env.production`**: `VITE_API_BASE_URL=/api`
- **`.env`**: Default fallback

**Note**: This is a Vite project, so use `VITE_` prefix, not `REACT_APP_`.

## Usage

### Using the centralized axios instance

All API calls should use the centralized `api` instance from `axios.ts`:

```typescript
import api from "./axios";

// GET request
const response = await api.get("/users");

// POST request
const response = await api.post("/users", userData);

// PUT request
const response = await api.put(`/users/${id}`, userData);

// DELETE request
await api.delete(`/users/${id}`);
```

### Building full API URLs

For cases where you need to build a full URL (like in the auth service), use the helper function:

```typescript
import { buildApiUrl } from "./config";

const fullUrl = buildApiUrl("/auth/connect");
// Result: "/api/auth/connect" (proxied through Vercel)
```

### Available Services

- `auth.ts` - Authentication services (login, register, refresh)
- `users.ts` - User management services
- `roles.ts` - Role management services
- `articles.ts` - Article management services
- `categories.ts` - Category management services
- `orders.ts` - Order management services
- `bon-de-commande.ts` - Purchase order services

## Environment Configuration

The API base URL can be configured via environment variables. To switch between environments:

1. **Create environment files** in your `web/` directory:

   - `.env.development` for development
   - `.env.production` for production
   - `.env` for default fallback

2. **Set the appropriate URL** in each file:

   - Development: `VITE_API_BASE_URL=http://localhost:5000`
   - Production: `VITE_API_BASE_URL=/api`

3. **Restart your dev server** after creating environment files

**Current fallback**: If no environment variable is set, it defaults to `/api` (proxied through Vercel)

## Authentication

The axios instance automatically includes authentication tokens in requests. Tokens are retrieved from localStorage and added to the Authorization header.
