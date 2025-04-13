# Deployment Guide

This guide provides instructions for deploying the Medical Appointment System to production environments.

## Deployment Options

The Medical Appointment System can be deployed using several methods:

1. **Traditional Deployment**: Deploying the backend and frontend separately on virtual machines or dedicated servers
2. **Docker Deployment**: Using Docker containers for both backend and frontend
3. **Cloud Platform Deployment**: Using cloud services like AWS, Azure, or Google Cloud

## Prerequisites

Regardless of the deployment method, you'll need:

- Node.js (v14 or higher)
- npm (v6 or higher)
- PostgreSQL (v12 or higher)
- Domain name (optional but recommended)
- SSL certificate (recommended for production)

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
# Database
DATABASE_URL=postgresql://username:password@hostname:port/database_name

# Authentication
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRATION=24h

# Server
PORT=3001
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend Environment Variables

Create a `.env.production` file in the frontend directory:

```
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_ENV=production
```

## Traditional Deployment

### Backend Deployment

1. Build the backend:

   ```bash
   cd backend
   npm install
   npm run build
   ```

2. Set up a process manager like PM2:

   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name medical-api
   pm2 save
   pm2 startup
   ```

3. Set up a reverse proxy with Nginx:

   ```nginx
   server {
       listen 80;
       server_name api.your-domain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Set up SSL with Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.your-domain.com
   ```

### Frontend Deployment

1. Build the frontend:

   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Deploy the build folder to a web server like Nginx:

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/frontend/build;

       location / {
           try_files $uri /index.html;
       }
   }
   ```

3. Set up SSL with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## Docker Deployment

### Docker Compose Setup

Create a `docker-compose.yml` file in the project root:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:13
    container_name: medical-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: medical_appointment
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: medical-api
    environment:
      DATABASE_URL: postgresql://postgres:your_password@postgres:5432/medical_appointment
      JWT_SECRET: your_secure_jwt_secret_key
      PORT: 3001
      NODE_ENV: production
      CORS_ORIGIN: https://your-domain.com
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        REACT_APP_API_URL: https://api.your-domain.com/api
    container_name: medical-client
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf:/etc/nginx/conf.d
      - ./nginx/certbot/conf:/etc/letsencrypt
      - ./nginx/certbot/www:/var/www/certbot
    depends_on:
      - backend
    restart: unless-stopped

  certbot:
    image: certbot/certbot
    volumes:
      - ./nginx/certbot/conf:/etc/letsencrypt
      - ./nginx/certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  postgres_data:
```

### Backend Dockerfile

Create a `Dockerfile` in the backend directory:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

### Frontend Dockerfile

Create a `Dockerfile` in the frontend directory:

```dockerfile
FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

Create a `nginx.conf` file in the `frontend/nginx` directory:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

### Deployment Steps

1. Set up Docker and Docker Compose on your server
2. Clone the repository to your server
3. Configure environment variables and domain names in the files
4. Start the containers:
   ```bash
   docker-compose up -d
   ```
5. Initialize SSL certificates:
   ```bash
   docker-compose run --rm certbot certonly --webroot -w /var/www/certbot -d your-domain.com
   ```
6. Restart the containers:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Cloud Platform Deployment

### AWS Deployment

#### Backend Deployment with Elastic Beanstalk

1. Create an Elastic Beanstalk environment:

   - Platform: Node.js
   - Application code: Upload your code

2. Set up environment variables in the Elastic Beanstalk console

3. Configure RDS for PostgreSQL database

4. Set up a custom domain with Route 53 and SSL with AWS Certificate Manager

#### Frontend Deployment with S3 and CloudFront

1. Build the frontend:

   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Create an S3 bucket and upload the build folder

3. Configure the S3 bucket for static website hosting

4. Set up CloudFront distribution with the S3 bucket as origin

5. Configure a custom domain with Route 53 and SSL with AWS Certificate Manager

### Azure Deployment

#### Backend Deployment with App Service

1. Create an App Service:

   - Runtime stack: Node.js
   - Operating System: Linux

2. Set up environment variables in the App Service configuration

3. Configure Azure Database for PostgreSQL

4. Set up a custom domain and SSL certificate

#### Frontend Deployment with Static Web Apps

1. Build the frontend:

   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Create an Azure Static Web App and deploy the build folder

3. Configure a custom domain and SSL certificate

### Google Cloud Deployment

#### Backend Deployment with Cloud Run

1. Build and push the backend Docker image to Google Container Registry

2. Create a Cloud Run service with the Docker image

3. Configure environment variables in the Cloud Run service

4. Set up Cloud SQL for PostgreSQL

5. Configure a custom domain and SSL certificate

#### Frontend Deployment with Firebase Hosting

1. Build the frontend:

   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Install Firebase CLI:

   ```bash
   npm install -g firebase-tools
   ```

3. Initialize Firebase Hosting:

   ```bash
   firebase init hosting
   ```

4. Deploy to Firebase Hosting:

   ```bash
   firebase deploy --only hosting
   ```

5. Configure a custom domain and SSL certificate

## Database Migration in Production

Before deploying a new version with database schema changes:

1. Create a backup of the production database
2. Apply migrations using Prisma:
   ```bash
   npx prisma migrate deploy
   ```

## Continuous Integration/Continuous Deployment (CI/CD)

### GitHub Actions Example

Create a `.github/workflows/deploy.yml` file:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "16"

      - name: Install backend dependencies
        run: |
          cd backend
          npm install

      - name: Build backend
        run: |
          cd backend
          npm run build

      - name: Install frontend dependencies
        run: |
          cd frontend
          npm install

      - name: Build frontend
        run: |
          cd frontend
          npm run build
        env:
          REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /path/to/project
            git pull
            cd backend
            npm install
            npm run build
            pm2 restart medical-api
            cd ../frontend
            npm install
            npm run build
            # Additional deployment steps as needed
```

## Monitoring and Logging

### Backend Monitoring with PM2

```bash
pm2 monit
pm2 logs medical-api
```

### Application Logging

Configure a logging service like Winston in the backend:

```javascript
// backend/src/utils/logger.js
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: "medical-api" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

module.exports = logger;
```

### Error Tracking

Consider integrating an error tracking service like Sentry:

```javascript
// backend/src/index.js
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// frontend/src/index.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_ENV,
});
```

## Backup Strategy

### Database Backup

Set up automated PostgreSQL backups:

```bash
# Create a backup script
cat > backup.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/path/to/backups"
BACKUP_FILE="$BACKUP_DIR/medical_db_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -h hostname -U username -d medical_appointment > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Delete backups older than 30 days
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete
EOF

# Make the script executable
chmod +x backup.sh

# Add to crontab to run daily at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/backup.sh") | crontab -
```

## Security Considerations

1. **Keep dependencies updated**:

   ```bash
   npm audit
   npm update
   ```

2. **Configure security headers in Nginx**:

   ```nginx
   add_header X-Content-Type-Options "nosniff";
   add_header X-Frame-Options "SAMEORIGIN";
   add_header X-XSS-Protection "1; mode=block";
   add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.your-domain.com;";
   ```

3. **Rate limiting**:

   ```nginx
   limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

   location /api/ {
       limit_req zone=api burst=20 nodelay;
       proxy_pass http://backend;
   }
   ```

4. **Regular security audits and penetration testing**

## Troubleshooting

### Common Deployment Issues

1. **Database connection issues**:

   - Check the DATABASE_URL environment variable
   - Verify network connectivity and firewall rules
   - Check PostgreSQL logs

2. **CORS errors**:

   - Verify the CORS_ORIGIN environment variable
   - Check that the frontend is making requests to the correct API URL

3. **SSL certificate issues**:

   - Check certificate expiration dates
   - Verify certificate paths in Nginx configuration

4. **Performance issues**:
   - Monitor server resources (CPU, memory, disk)
   - Check application logs for slow queries or operations
   - Consider scaling resources or optimizing code

### Getting Help

If you encounter deployment issues:

1. Check the application logs
2. Review the documentation
3. Reach out to the development team
