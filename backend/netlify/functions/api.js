const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

const profileRoutes = require('./routes/profile');
const contactsRoutes = require('./routes/contacts');
const expensesRoutes = require('./routes/expenses');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/profile', profileRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Run local server if not in Netlify environment
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`🚀 Backend local server running on http://localhost:${PORT}`));
}

module.exports.handler = serverless(app);
