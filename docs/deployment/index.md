# Ръководство за Разгръщане

## Общ Преглед

Този документ описва процеса на разгръщане на Системата за Медицински Прегледи. Системата се състои от frontend React приложение и backend Node.js API.

## Изисквания за Системата

### Основни Изисквания
- Node.js 16.x или по-нова версия
- PostgreSQL 13.x или по-нова версия
- npm 7.x или по-нова версия
- Git

### Изисквания за Сървъра
- Минимум 2GB RAM
- 20GB дисково пространство
- Ubuntu 20.04 LTS или по-нова версия
- SSL сертификат

## Подготовка на Средата

### Инсталиране на Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Инсталиране на PostgreSQL
```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Инсталиране на nginx
```bash
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Инсталиране на certbot
```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

## Разгръщане на Backend

### Подготовка на Кода
```bash
git clone https://github.com/your-username/medical-scheduler.git
cd medical-scheduler/backend
npm install
```

### Конфигурация на Средата
```bash
cp .env.example .env
# Редактирайте .env файла с вашите настройки
```

### PM2 Конфигурация
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'medical-scheduler-backend',
    script: 'dist/index.js',
    instances: 'max',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

### Стартиране на Приложението
```bash
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Разгръщане на Frontend

### Подготовка на Кода
```bash
cd ../frontend
npm install
```

### Конфигурация на Средата
```bash
cp .env.example .env
# Редактирайте .env файла с вашите настройки
```

### Създаване на Production Build
```bash
npm run build
```

### Конфигурация на nginx
```nginx
# /etc/nginx/sites-available/medical-scheduler
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/medical-scheduler/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Копиране на Файловете
```bash
sudo mkdir -p /var/www/medical-scheduler
sudo cp -r build /var/www/medical-scheduler/frontend/
sudo ln -s /etc/nginx/sites-available/medical-scheduler /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Конфигурация

### Получаване на SSL Сертификат
```bash
sudo certbot --nginx -d your-domain.com
```

### Автоматично Обновяване
```bash
sudo certbot renew --dry-run
```

## Мониторинг и Поддръжка

### Логване
```bash
# Backend логове
pm2 logs medical-scheduler-backend

# nginx логове
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Резервни Копия на Базата Данни
```bash
#!/bin/bash
# backup.sh
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/database"
mkdir -p $BACKUP_DIR
pg_dump -U postgres medical_scheduler > $BACKUP_DIR/backup_$TIMESTAMP.sql
```

### Планиране на Резервни Копия
```bash
0 2 * * * /path/to/backup.sh
```

## Сигурност

### Конфигурация на Файрвол
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### Редовни Обновявания
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

## Отстраняване на Проблеми

### Проверка на Статуса
```bash
# Проверка на Node.js процесите
pm2 status

# Проверка на nginx статуса
sudo systemctl status nginx

# Проверка на PostgreSQL статуса
sudo systemctl status postgresql
```

### Логване на Грешки
```bash
# Backend грешки
pm2 logs medical-scheduler-backend --err

# nginx грешки
sudo tail -f /var/log/nginx/error.log

# PostgreSQL грешки
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Често Срещани Проблеми

#### Проблем с Връзката към Базата Данни
- Проверете дали PostgreSQL работи
- Проверете credentials в .env файла
- Проверете дали портът е достъпен

#### Проблем с SSL Сертификата
- Проверете дали домейнът е правилно конфигуриран
- Проверете дали certbot е успешно инсталиран
- Проверете дали nginx конфигурацията е правилна

#### Проблем с Frontend API Заявките
- Проверете дали backend API работи
- Проверете CORS настройките
- Проверете дали SSL сертификатът е валиден 