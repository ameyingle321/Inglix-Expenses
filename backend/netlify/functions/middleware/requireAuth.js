const { supabaseAdmin } = require('../lib/supabaseAdmin');

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.error('Auth verification error:', error?.message || 'No user found');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Unexpected auth error:', err);
    res.status(500).json({ error: 'Internal Server Error during authentication' });
  }
};

module.exports = { requireAuth };
