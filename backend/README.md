# The Cream Collective - Backend API

Lightweight Express.js API for inventory management, sales tracking, and analytics.

## Setup
1. `npm install`
2. `npm start`

## Endpoints

### Bales
- `GET /api/bales` - List all bales
- `POST /api/bales` - Create a new bale
- `GET /api/bales/:id` - Get bale details with items summary

### Items
- `GET /api/items` - List items (supports `status`, `bale_id`, `department`, `category` query params)
- `GET /api/items/:id` - Single item detail
- `POST /api/items` - Add a unique item to a bale (generates SKU)
- `PATCH /api/items/:id/status` - Update item status (`Available`, `Reserved`, `Sold`)

### Reservations
- `POST /api/reservations` - Reserve an item for 30 minutes
- `DELETE /api/reservations/:id` - Release a reservation
- `POST /api/reservations/:id/convert` - Convert reservation to sale

### Sales
- `GET /api/sales` - List sales (supports `channel`, `payment_method`, `start_date`, `end_date` query params)
- `POST /api/sales` - Record a sale (marks item as Sold)

### Analytics
- `GET /api/analytics/bale-margins` - Profit per bale: sum of sale amounts minus bale cost
- `GET /api/analytics/turnover` - Get average days to sell by department/category
- `GET /api/analytics/channel-breakdown` - Sales count/value by channel

## Database
Uses Turso/SQLite via the `team-db` CLI tool.
The schema is managed by the Backend Developer.
