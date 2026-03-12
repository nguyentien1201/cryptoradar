# 🚀 CryptoRadar VN

> Công cụ theo dõi crypto toàn diện — danh mục, cảnh báo, whale alert, sentiment — cho nhà đầu tư Việt

## 📁 Cấu trúc dự án (Monorepo)

```
cryptoradar/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/       # JWT Auth, Register/Login
│   │   │   │   ├── portfolio/  # Holdings, P&L
│   │   │   │   ├── alerts/     # Price alerts + BullMQ
│   │   │   │   ├── prices/     # CoinGecko + Redis cache
│   │   │   │   ├── news/       # CryptoPanic crawler
│   │   │   │   ├── whale/      # Whale Alert crawler
│   │   │   │   ├── payments/   # Stripe + MoMo
│   │   │   │   ├── notifications/ # Email + Telegram
│   │   │   │   └── websocket/  # Socket.IO gateway
│   │   │   └── database/
│   │   │       └── entities/   # TypeORM entities
│   │   └── Dockerfile
│   └── web/                    # Next.js 14 Frontend
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   ├── components/     # UI components
│       │   ├── stores/         # Zustand state
│       │   └── lib/            # API client
│       └── Dockerfile
└── packages/
    └── shared/                 # TypeScript types chia sẻ
```

## 🏗️ Tech Stack

| Layer       | Tech                                  |
|-------------|---------------------------------------|
| Frontend    | Next.js 14 (App Router), Tailwind CSS |
| State       | Zustand, SWR                          |
| Charts      | Recharts, Lightweight Charts          |
| Backend     | NestJS 10                             |
| Database    | PostgreSQL + TypeORM                  |
| Cache       | Redis (ioredis)                       |
| Queue       | BullMQ                                |
| WebSocket   | Socket.IO (NestJS Gateway)            |
| Auth        | JWT + Passport                        |
| Email       | Nodemailer (Resend SMTP)              |
| Telegram    | Telegraf                              |
| Payments    | Stripe + MoMo                         |
| Deploy Web  | Vercel                                |
| Deploy API  | Railway / Render                      |
| CI/CD       | GitHub Actions                        |

## 🚀 Chạy local

### Yêu cầu
- Node.js 20+
- Docker & Docker Compose

### Bước 1: Clone & Install
```bash
git clone https://github.com/your-org/cryptoradar-vn
cd cryptoradar-vn
npm install
```

### Bước 2: Start database
```bash
docker compose up postgres redis -d
```

### Bước 3: Setup env
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Edit .env với API keys của bạn
```

### Bước 4: Run migrations
```bash
npm run db:migrate
```

### Bước 5: Start dev servers
```bash
npm run dev
# API: http://localhost:4000
# Web: http://localhost:3000
# Swagger: http://localhost:4000/api/docs
```

## 🌐 Deploy

### Frontend → Vercel
```bash
cd apps/web
npx vercel --prod
```

### Backend → Railway
```bash
# 1. Tạo project trên railway.app
# 2. Add PostgreSQL và Redis services
# 3. Connect GitHub repo
# 4. Set environment variables
railway up
```

### Full Docker
```bash
docker compose up -d
```

## 🔑 API Keys cần thiết

| Service        | Free tier               | Đăng ký tại              |
|----------------|-------------------------|--------------------------|
| CoinGecko      | 30 req/min              | coingecko.com/api        |
| CryptoPanic    | 500 req/day             | cryptopanic.com          |
| Whale Alert    | 10 req/min              | whale-alert.io           |
| Resend (Email) | 3,000 email/month       | resend.com               |
| Telegram Bot   | Miễn phí                | @BotFather trên Telegram |
| Stripe         | 2.9% + 30¢/transaction  | stripe.com               |
| MoMo Business  | Liên hệ MoMo Business   | business.momo.vn         |

## 📊 Phase Roadmap

### ✅ Phase 1 — MVP (Tuần 1–3)
- [x] Auth (JWT + Refresh tokens)
- [x] Portfolio tracking + P&L
- [x] Price alerts (Email + Telegram)
- [x] Dashboard overview

### 🔄 Phase 2 — Growth (Tuần 4–6)
- [x] Sentiment & News feed
- [x] Whale Alert tracking
- [x] WebSocket realtime prices
- [x] Fear & Greed Index

### 💰 Phase 3 — Monetize (Tuần 7–8)
- [x] Free vs Pro paywall
- [x] Stripe integration
- [x] MoMo integration
- [x] Landing page SEO

## 🔒 Security

- Password hashing: bcrypt (12 rounds)
- JWT: 15 phút access token + 30 ngày refresh token
- Rate limiting: 100 req/60s per IP
- Helmet.js security headers
- Input validation: class-validator
- SQL injection: TypeORM parameterized queries

## 📝 API Documentation

Swagger UI tại: `http://localhost:4000/api/docs`

Endpoints chính:
- `POST /api/v1/auth/register` — Đăng ký
- `POST /api/v1/auth/login` — Đăng nhập  
- `GET /api/v1/portfolio/stats` — P&L stats
- `POST /api/v1/alerts` — Tạo cảnh báo
- `GET /api/v1/prices/market` — Dữ liệu thị trường
- `GET /api/v1/news/fear-greed` — Fear & Greed
- `GET /api/v1/whale` — Whale transactions
- `POST /api/v1/payments/stripe/checkout` — Thanh toán Stripe

---

Built with ❤️ for nhà đầu tư Việt Nam
