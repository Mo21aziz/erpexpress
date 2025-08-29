# Backend Configuration Guide

## Environment Variables

Create a `.env` file in your `backend/` directory with the following variables:

### Basic Configuration

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL="mysql://erp_user:erp_pass@localhost:3306/erp_db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
```

### CORS Configuration

```bash
# CORS Configuration
# Comma-separated list of allowed origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://erpexpress.onrender.com,https://erpexpress-x7fh.vercel.app
```

### Production Configuration

```bash
# Production Environment
NODE_ENV=production
CORS_ORIGINS=https://erpexpress.onrender.com,https://erpexpress-x7fh.vercel.app
```

## How CORS Works

The CORS configuration automatically allows requests from:

- **Development**: `http://localhost:5173`, `http://localhost:3000`, etc.
- **Production**: `https://erpexpress.onrender.com` and any domains you specify

## Testing CORS

1. **Start your backend server**:

   ```bash
   npm run dev
   ```

2. **Test CORS endpoint**:

   ```bash
   curl -H "Origin: http://localhost:5173" http://localhost:5000/api/cors-test
   ```

3. **Check server logs** for CORS information and blocked origins.

## Troubleshooting

### Common Issues

1. **"Cannot find name 'process'" Error**:

   - ✅ **Fixed**: Installed `@types/node` and `@types/cors`
   - ✅ **Fixed**: Updated `tsconfig.json` with proper Node.js types

2. **CORS Errors**:

   - Check that your frontend origin is in the allowed list
   - Verify the `.env` file is in the correct location
   - Restart the server after changing environment variables

3. **TypeScript Errors**:
   - Run `npm run type-check` to check for type errors
   - Ensure all type definitions are installed

### Environment Variable Priority

1. **Environment file** (`.env`)
2. **Default values** in `environment.config.ts`
3. **Hardcoded fallbacks** in individual config files

## Security Notes

- **Never commit** `.env` files to version control
- **Use strong JWT secrets** in production
- **Limit CORS origins** to only what's necessary
- **Environment variables** are visible in the browser for frontend, but secure for backend
