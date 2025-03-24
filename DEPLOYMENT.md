
# Deployment Guide for NOGURA Seat Reservation System

This guide will walk you through the process of deploying this application to your own hosting environment.

## Prerequisites

Before deploying, make sure you have:

1. Access to a hosting service (shared hosting, VPS, cloud service, etc.)
2. Node.js installed on your local machine
3. Git (optional, for version control)
4. Access to your Supabase project (or plans to create a new one)

## Step 1: Prepare Your Application for Production

First, build your application for production:

```bash
# Install dependencies (if not already done)
npm install

# Build the application
npm run build
```

This will create a `dist` directory with optimized production files.

## Step 2: Configure Supabase

You have two options for Supabase:

### Option A: Continue using the existing Supabase project

1. Make sure your RLS (Row Level Security) policies are properly configured
2. Update CORS settings in your Supabase dashboard to allow requests from your new domain
3. Ensure your authentication redirect URLs are updated to include your new domain

### Option B: Create a new Supabase project

1. Create a new project at [https://supabase.com](https://supabase.com)
2. Execute all the necessary SQL migrations to set up your database schema
3. Configure authentication providers as needed
4. Set up RLS policies to secure your data

## Step 3: Update Supabase Configuration

If you're using a new Supabase project, update the Supabase client configuration:

1. Open `src/integrations/supabase/client.ts`
2. Replace the Supabase URL and anon key with your new project values
3. Rebuild the application with `npm run build` after making these changes

## Step 4: Deploy to Your Hosting

### Traditional Web Hosting

1. Upload the contents of the `dist` directory to your web hosting (via FTP, SFTP, or your host's control panel)
2. Configure your web server to serve the `index.html` file for all routes (for SPA routing)

For Apache, create or modify `.htaccess` file in your root directory:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

For Nginx, update your server configuration:
```nginx
location / {
  root   /path/to/your/dist;
  index  index.html;
  try_files $uri $uri/ /index.html;
}
```

### Docker Deployment

1. Create a Dockerfile in your project root:

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. Create an nginx.conf file:

```
server {
    listen 80;
    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

3. Build and run the Docker container:

```bash
docker build -t nogura-app .
docker run -p 80:80 nogura-app
```

### Platform-specific Deployments

#### Netlify

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Create a `netlify.toml` file in your project root:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

3. Deploy to Netlify: `netlify deploy --prod`

#### Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. Deploy to Vercel: `vercel --prod`

## Step 5: Post-Deployment Checks

After deploying, verify:

1. All routes work correctly (test navigation)
2. Authentication flows (login/signup) function properly
3. Database operations are working
4. Email verification and password reset (if applicable)

## Step 6: Additional Configuration (if needed)

### Environment Variables

If you need to use environment variables, configure them according to your hosting platform.

### CORS Configuration

If you experience CORS issues, ensure your Supabase project has the correct CORS origins configured.

### Database Backups

Set up regular backups of your Supabase database to prevent data loss.

## Troubleshooting

- **404 Errors**: Ensure your server is configured to handle SPA routing
- **API Errors**: Check network requests for CORS or authentication issues
- **Authentication Issues**: Verify Supabase auth settings and redirect URLs

For more detailed help, consult the documentation for your specific hosting provider and Supabase.
