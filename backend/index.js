const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the frontend build directory
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));

const PORT = process.env.PORT || 3000;

// Helper to clean up expired reservations
async function cleanupReservations() {
  // Update items status back to Available
  db.query(`
    UPDATE items 
    SET status = 'Available'
    WHERE id IN (
      SELECT item_id FROM reservations 
      WHERE status = 'active' AND expires_at < datetime('now')
    )
  `);
  
  // Mark reservations as expired
  db.query(`
    UPDATE reservations 
    SET status = 'expired'
    WHERE status = 'active' AND expires_at < datetime('now')
  `);
}

// Bales
app.get('/api/bales', (req, res) => {
  const bales = db.query("SELECT * FROM bales ORDER BY arrival_date DESC");
  res.json(bales);
});

app.post('/api/bales', (req, res) => {
  const { bale_type, department, cost } = req.body;
  const id = uuidv4();
  db.query(`
    INSERT INTO bales (id, bale_type, department, cost)
    VALUES (${db.sanitize(id)}, ${db.sanitize(bale_type)}, ${db.sanitize(department)}, ${db.sanitize(cost)})
  `);
  res.status(201).json({ id });
});

app.get('/api/bales/:id', (req, res) => {
  const { id } = req.params;
  const bale = db.query(`SELECT * FROM bales WHERE id = ${db.sanitize(id)}`);
  if (!bale || bale.length === 0) return res.status(404).json({ error: "Bale not found" });
  
  const itemsSummary = db.query(`
    SELECT 
      status, COUNT(*) as count, SUM(price) as total_value
    FROM items 
    WHERE bale_id = ${db.sanitize(id)}
    GROUP BY status
  `);
  
  res.json({ ...bale[0], items_summary: itemsSummary });
});

// Items
app.get('/api/items', (req, res) => {
  cleanupReservations();
  const { status, bale_id, department, category } = req.query;
  let sql = "SELECT i.*, b.department FROM items i JOIN bales b ON i.bale_id = b.id";
  const conditions = [];
  if (status) conditions.push(`i.status = ${db.sanitize(status)}`);
  if (bale_id) conditions.push(`i.bale_id = ${db.sanitize(bale_id)}`);
  if (department) conditions.push(`b.department = ${db.sanitize(department)}`);
  if (category) conditions.push(`i.category = ${db.sanitize(category)}`);
  
  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }
  sql += " ORDER BY i.created_at DESC";
  
  const items = db.query(sql);
  res.json(items);
});

app.get('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const item = db.query(`SELECT i.*, b.department FROM items i JOIN bales b ON i.bale_id = b.id WHERE i.id = ${db.sanitize(id)}`);
  if (!item || item.length === 0) return res.status(404).json({ error: "Item not found" });
  res.json(item[0]);
});

app.post('/api/items', (req, res) => {
  const { bale_id, category, size, price, image_urls } = req.body;
  const id = uuidv4();
  
  // Generate SKU: [BaleIDPrefix]-[ShortCategory]-[Sequence]
  const countRes = db.query(`SELECT COUNT(*) as count FROM items WHERE bale_id = ${db.sanitize(bale_id)}`);
  const sequence = (countRes[0].count + 1).toString().padStart(3, '0');
  const shortCategory = category.substring(0, 3).toUpperCase();
  const balePrefix = bale_id.substring(0, 4).toUpperCase();
  const sku = `${balePrefix}-${shortCategory}-${sequence}`;
  
  db.query(`
    INSERT INTO items (id, sku, bale_id, category, size, price, image_urls)
    VALUES (${db.sanitize(id)}, ${db.sanitize(sku)}, ${db.sanitize(bale_id)}, ${db.sanitize(category)}, ${db.sanitize(size)}, ${db.sanitize(price)}, ${db.sanitize(JSON.stringify(image_urls))})
  `);
  
  res.status(201).json({ id, sku });
});

app.patch('/api/items/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['Available', 'Reserved', 'Sold'].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  
  db.query(`UPDATE items SET status = ${db.sanitize(status)} WHERE id = ${db.sanitize(id)}`);
  res.json({ message: "Status updated" });
});

// Reservations
app.post('/api/reservations', (req, res) => {
  const { item_id, customer_phone, channel } = req.body;
  const id = uuidv4();
  
  // Check if item is available
  const item = db.query(`SELECT status FROM items WHERE id = ${db.sanitize(item_id)}`);
  if (!item || item.length === 0) return res.status(404).json({ error: "Item not found" });
  if (item[0].status !== 'Available') return res.status(400).json({ error: "Item not available" });
  
  // Set item to Reserved
  db.query(`UPDATE items SET status = 'Reserved' WHERE id = ${db.sanitize(item_id)}`);
  
  // Create reservation entry (30 mins from now)
  db.query(`
    INSERT INTO reservations (id, item_id, customer_phone, channel, expires_at)
    VALUES (${db.sanitize(id)}, ${db.sanitize(item_id)}, ${db.sanitize(customer_phone)}, ${db.sanitize(channel)}, datetime('now', '+30 minutes'))
  `);
  
  res.status(201).json({ id });
});

app.delete('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const reservation = db.query(`SELECT item_id FROM reservations WHERE id = ${db.sanitize(id)}`);
  if (!reservation || reservation.length === 0) return res.status(404).json({ error: "Reservation not found" });
  
  // Mark item as available
  db.query(`UPDATE items SET status = 'Available' WHERE id = ${db.sanitize(reservation[0].item_id)}`);
  // Delete or mark reservation as expired/cancelled
  db.query(`DELETE FROM reservations WHERE id = ${db.sanitize(id)}`);
  
  res.json({ message: "Reservation released" });
});

app.post('/api/reservations/:id/convert', (req, res) => {
  const { id } = req.params;
  const { payment_method, transaction_id } = req.body;
  
  const resEntry = db.query(`SELECT * FROM reservations WHERE id = ${db.sanitize(id)}`);
  if (!resEntry || resEntry.length === 0) return res.status(404).json({ error: "Reservation not found" });
  
  const item = db.query(`SELECT price FROM items WHERE id = ${db.sanitize(resEntry[0].item_id)}`);
  
  // Create sale
  const saleId = uuidv4();
  db.query(`
    INSERT INTO sales (id, item_id, amount, channel, payment_method, transaction_id, customer_phone)
    VALUES (${db.sanitize(saleId)}, ${db.sanitize(resEntry[0].item_id)}, ${db.sanitize(item[0].price)}, ${db.sanitize(resEntry[0].channel)}, ${db.sanitize(payment_method)}, ${db.sanitize(transaction_id)}, ${db.sanitize(resEntry[0].customer_phone)})
  `);
  
  // Update item status
  db.query(`UPDATE items SET status = 'Sold' WHERE id = ${db.sanitize(resEntry[0].item_id)}`);
  
  // Update reservation status
  db.query(`UPDATE reservations SET status = 'converted' WHERE id = ${db.sanitize(id)}`);
  
  res.json({ sale_id: saleId });
});

// Sales
app.get('/api/sales', (req, res) => {
  const { channel, payment_method, start_date, end_date } = req.query;
  let sql = "SELECT s.*, i.sku, i.category FROM sales s JOIN items i ON s.item_id = i.id";
  const conditions = [];
  if (channel) conditions.push(`s.channel = ${db.sanitize(channel)}`);
  if (payment_method) conditions.push(`s.payment_method = ${db.sanitize(payment_method)}`);
  if (start_date) conditions.push(`s.sale_date >= ${db.sanitize(start_date)}`);
  if (end_date) conditions.push(`s.sale_date <= ${db.sanitize(end_date)}`);
  
  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }
  sql += " ORDER BY s.sale_date DESC";
  
  const sales = db.query(sql);
  res.json(sales);
});

app.post('/api/sales', (req, res) => {
  const { item_id, amount, channel, payment_method, transaction_id, customer_phone } = req.body;
  const id = uuidv4();
  
  // Mark item as sold
  db.query(`UPDATE items SET status = 'Sold' WHERE id = ${db.sanitize(item_id)}`);
  
  // Clear any active reservations for this item
  db.query(`UPDATE reservations SET status = 'converted' WHERE item_id = ${db.sanitize(item_id)} AND status = 'active'`);
  
  db.query(`
    INSERT INTO sales (id, item_id, amount, channel, payment_method, transaction_id, customer_phone)
    VALUES (${db.sanitize(id)}, ${db.sanitize(item_id)}, ${db.sanitize(amount)}, ${db.sanitize(channel)}, ${db.sanitize(payment_method)}, ${db.sanitize(transaction_id)}, ${db.sanitize(customer_phone)})
  `);
  
  res.status(201).json({ id });
});

// Analytics
app.get('/api/analytics/bale-margins', (req, res) => {
  const sql = `
    SELECT 
      b.id as bale_id,
      b.bale_type,
      b.department,
      b.cost as bale_cost,
      IFNULL(SUM(s.amount), 0) as total_sales,
      (IFNULL(SUM(s.amount), 0) - b.cost) as net_profit,
      CASE WHEN b.cost > 0 THEN ((IFNULL(SUM(s.amount), 0) - b.cost) / b.cost) * 100 ELSE 0 END as roi_percent
    FROM bales b
    LEFT JOIN items i ON b.id = i.bale_id
    LEFT JOIN sales s ON i.id = s.item_id
    GROUP BY b.id
  `;
  const result = db.query(sql);
  res.json(result);
});

app.get('/api/analytics/turnover', (req, res) => {
  const sql = `
    SELECT 
      b.department,
      i.category,
      AVG(julianday(s.sale_date) - julianday(i.created_at)) as avg_days_to_sell
    FROM items i
    JOIN sales s ON i.id = s.item_id
    JOIN bales b ON i.bale_id = b.id
    GROUP BY b.department, i.category
  `;
  const result = db.query(sql);
  res.json(result);
});

app.get('/api/analytics/channel-breakdown', (req, res) => {
  const sql = `
    SELECT 
      channel,
      COUNT(*) as sale_count,
      SUM(amount) as total_value
    FROM sales
    GROUP BY channel
  `;
  const result = db.query(sql);
  res.json(result);
});

// Fallback for SPA (Single Page Application)
app.use((req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
