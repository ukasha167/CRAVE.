const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

let menuCache = { data: null, timestamp: 0 };
const CACHE_TTL = 300000; // 5 minutes

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hash]
    );
    const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: newUser.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!password || password.length === 0) {
      return res.status(400).json({ error: 'Password cannot be empty' });
    }

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// GET /api/menu
app.get('/api/menu', async (req, res) => {
  try {
    const now = Date.now();
    if (menuCache.data && (now - menuCache.timestamp < CACHE_TTL)) {
      return res.status(200).json(menuCache.data);
    }

    const result = await pool.query('SELECT * FROM food_items');
    menuCache.data = result.rows;
    menuCache.timestamp = now;
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// POST /api/orders
app.post('/api/orders', verifyToken, async (req, res) => {
  const { user_id, total_amount, items } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING id',
      [user_id, total_amount]
    );
    const orderId = orderResult.rows[0].id;
    const itemInsertPromises = items.map(item =>
      client.query(
        'INSERT INTO order_items (order_id, food_item_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
        [orderId, item.id, item.quantity, item.price]
      )
    );
    await Promise.all(itemInsertPromises);
    await client.query('COMMIT');
    res.status(201).json({ message: 'Order placed successfully', orderId });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Transaction failed, order cancelled' });
  } finally {
    client.release();
  }
});

// GET /api/orders/user/:id
app.get('/api/orders/user/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        o.id,
        o.user_id,
        o.total_amount,
        o.status,
        o.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'food_item_id', oi.food_item_id,
              'name', f.name,
              'quantity', oi.quantity,
              'price_at_purchase', oi.price_at_purchase,
              'image_url', f.image_url
            ) ORDER BY oi.id ASC
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN food_items f ON oi.food_item_id = f.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC`,
      [req.params.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Failed to fetch order history:', error);
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
});

// GET /api/orders/:id
app.get('/api/orders/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        o.id,
        o.user_id,
        o.total_amount,
        o.status,
        o.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'food_item_id', oi.food_item_id,
              'name', f.name,
              'quantity', oi.quantity,
              'price_at_purchase', oi.price_at_purchase,
              'image_url', f.image_url
            ) ORDER BY oi.id ASC
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN food_items f ON oi.food_item_id = f.id
      WHERE o.id = $1
      GROUP BY o.id`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
