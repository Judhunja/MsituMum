# MsituMum Deployment Guide

## Production Deployment

### Prerequisites

- Node.js 16+ installed
- Linux/Ubuntu server (recommended)
- Domain name (optional)
- SSL certificate (recommended)

### 1. Server Setup

#### Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm git nginx
```

#### Create Application User
```bash
sudo useradd -m -s /bin/bash msitumum
sudo su - msitumum
```

### 2. Deploy Application

#### Clone Repository
```bash
git clone <your-repo-url> /home/msitumum/app
cd /home/msitumum/app
```

#### Install Dependencies
```bash
npm install --production
```

#### Configure Environment
```bash
cp .env.example .env
nano .env
```

Update production values:
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=<generate-strong-random-secret>
DATABASE_PATH=/home/msitumum/app/database/msitumum.db
UPLOAD_PATH=/home/msitumum/app/uploads
```

Generate secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Initialize Database
```bash
npm run init-db
```

### 3. Process Manager (PM2)

#### Install PM2
```bash
sudo npm install -g pm2
```

#### Start Application
```bash
pm2 start server/index.js --name msitumum
pm2 save
pm2 startup
```

#### Monitor Application
```bash
pm2 status
pm2 logs msitumum
pm2 monit
```

### 4. Nginx Reverse Proxy

#### Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/msitumum
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /uploads {
        alias /home/msitumum/app/uploads;
        expires 30d;
    }
}
```

#### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/msitumum /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL Certificate (Let's Encrypt)

#### Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### Obtain Certificate
```bash
sudo certbot --nginx -d your-domain.com
```

#### Auto-renewal
Certbot automatically sets up renewal. Verify:
```bash
sudo certbot renew --dry-run
```

### 6. Firewall Configuration

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 7. Database Backups

#### Create Backup Script
```bash
nano /home/msitumum/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/msitumum/backups"
DB_PATH="/home/msitumum/app/database/msitumum.db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $DB_PATH $BACKUP_DIR/msitumum_$DATE.db

# Keep only last 30 days
find $BACKUP_DIR -name "msitumum_*.db" -mtime +30 -delete
```

#### Make Executable
```bash
chmod +x /home/msitumum/backup.sh
```

#### Schedule with Cron
```bash
crontab -e
```

Add daily backup at 2 AM:
```
0 2 * * * /home/msitumum/backup.sh
```

### 8. Monitoring and Logging

#### PM2 Log Rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

#### System Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor resources
htop
pm2 monit
```

## Docker Deployment (Alternative)

### Create Dockerfile
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN npm run init-db

EXPOSE 5000

CMD ["node", "server/index.js"]
```

### Create docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./database:/app/database
      - ./uploads:/app/uploads
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

### Deploy with Docker
```bash
docker-compose up -d
docker-compose logs -f
```

## Cloud Deployment

### AWS EC2

1. Launch EC2 instance (Ubuntu 22.04)
2. Configure security groups (ports 22, 80, 443)
3. Follow standard deployment steps
4. Use RDS for database (optional)
5. S3 for file uploads (optional)

### DigitalOcean

1. Create Droplet (Ubuntu)
2. Follow standard deployment
3. Use Spaces for file storage (optional)

### Heroku

```bash
# Install Heroku CLI
heroku login
heroku create msitumum-app

# Configure
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

## Performance Optimization

### 1. Enable Compression
```bash
npm install compression
```

In `server/index.js`:
```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Database Optimization
```javascript
// Add indexes
CREATE INDEX idx_planting_date ON planting_records(planting_date);
CREATE INDEX idx_user_role ON users(role);
```

### 3. Caching
```bash
npm install redis
```

Implement Redis caching for dashboard analytics.

### 4. CDN for Static Files
- Use Cloudflare or AWS CloudFront
- Serve uploads from CDN
- Cache static assets

## Security Hardening

### 1. Environment Variables
Never commit `.env` to git:
```bash
echo ".env" >> .gitignore
```

### 2. Rate Limiting
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### 3. Helmet Security Headers
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 4. Input Validation
Already implemented with express-validator

### 5. SQL Injection Prevention
Already using parameterized queries

## Maintenance

### Update Application
```bash
cd /home/msitumum/app
git pull origin main
npm install --production
pm2 restart msitumum
```

### Database Migration
```bash
# Backup first
./backup.sh

# Run migrations
node server/scripts/migrate.js
```

### Check Health
```bash
curl http://localhost:5000/api/health
```

### View Logs
```bash
pm2 logs msitumum --lines 100
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Application Won't Start
```bash
pm2 logs msitumum
# Check for errors
node server/index.js  # Run directly to see errors
```

### High Memory Usage
```bash
pm2 monit
# Restart if needed
pm2 restart msitumum
```

### Database Locked
```bash
# Check for open connections
lsof /home/msitumum/app/database/msitumum.db
# Kill if necessary
```

### SSL Certificate Issues
```bash
sudo certbot renew --force-renewal
sudo systemctl restart nginx
```

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or AWS ELB
2. **Multiple Instances**: Run multiple PM2 instances
3. **Shared Database**: Use PostgreSQL or MySQL
4. **Shared Storage**: S3 or NFS for uploads

### Vertical Scaling

1. **Increase Server Resources**: CPU, RAM
2. **Optimize Queries**: Add indexes
3. **Cache Results**: Redis/Memcached

## Monitoring

### Application Monitoring
- PM2 Plus
- New Relic
- DataDog
- Custom healthcheck endpoints

### Server Monitoring
- Uptime monitoring (UptimeRobot)
- Log aggregation (ELK stack)
- Performance monitoring (Prometheus + Grafana)

### Alerts
```bash
# PM2 alerts
pm2 install pm2-slack
pm2 set pm2-slack:slack_url https://hooks.slack.com/...
```

## Backup and Recovery

### Full Backup
```bash
tar -czf msitumum-backup-$(date +%Y%m%d).tar.gz \
  /home/msitumum/app/database \
  /home/msitumum/app/uploads \
  /home/msitumum/app/.env
```

### Restore
```bash
tar -xzf msitumum-backup-YYYYMMDD.tar.gz -C /
pm2 restart msitumum
```

### Disaster Recovery
1. Keep backups in multiple locations
2. Document recovery procedures
3. Test recovery process quarterly
4. Maintain offsite backups

## Cost Optimization

### Small Scale (<1000 users)
- Single VPS: $5-10/month
- Basic monitoring: Free tier
- Let's Encrypt SSL: Free

### Medium Scale (1000-10000 users)
- Managed hosting: $20-50/month
- Database service: $15-30/month
- CDN: Pay as you go

### Large Scale (10000+ users)
- Multiple servers: $100+/month
- Managed database: $50+/month
- Load balancer: $20+/month
- CDN: $50+/month

## Compliance

### Data Protection
- Regular backups
- Encrypted connections (SSL)
- Access controls
- Audit logging

### GDPR Compliance (if applicable)
- User data export
- Data deletion
- Privacy policy
- Consent management

## Support

For deployment assistance:
- Email: devops@msitumum.org
- Documentation: GitHub Wiki
- Community: Discord/Slack channel
