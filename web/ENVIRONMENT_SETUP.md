# Environment Setup Guide

## Setting Up Environment Variables

Since this is a **Vite** project (not Create React App), you need to use the `VITE_` prefix for environment variables.

### 1. Create Environment Files

Create these files in your `web/` directory:

#### `.env.development` (for development)

```
VITE_API_BASE_URL=http://localhost:5000
```

#### `.env.production` (for production)

```
VITE_API_BASE_URL=https://erpexpress-1.onrender.com/api
VITE_FRONTEND_URL=https://erpexpress-x7fh-nh02khwlx-medazizzarrouks-projects.vercel.app
```

#### `.env` (default, will be used if no specific environment file exists)

```
VITE_API_BASE_URL=https://erpexpress-1.onrender.com/api
```

### 2. How It Works

- **Development**: When you run `npm run dev`, Vite will use `.env.development`
- **Production**: When you run `npm run build`, Vite will use `.env.production`
- **Fallback**: If no environment file is found, it will use the hardcoded fallback in `config.ts`

### 3. Accessing Environment Variables

In your code, you can now access the API base URL like this:

```typescript
// From config.ts (already set up)
import { API_BASE_URL } from "./api/config";

// Use it in your components
const response = await fetch(`${API_BASE_URL}/users`);
```

### 4. Important Notes

- **Vite Prefix**: Use `VITE_` prefix, not `REACT_APP_` (that's for Create React App)
- **Build Time**: Environment variables are embedded at build time
- **Security**: These variables are visible in the browser, so don't put secrets here
- **Restart Required**: You may need to restart your dev server after creating `.env` files

### 5. Current Configuration

Your `web/src/api/config.ts` is already set up to use:

```typescript
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://erpexpress-1.onrender.com/api";
```

This means:

- If `VITE_API_BASE_URL` is set in your environment file, it will use that
- If not set, it will fall back to `https://erpexpress-1.onrender.com/api`
