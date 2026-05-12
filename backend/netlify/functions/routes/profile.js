const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const { supabaseAdmin } = require('../lib/supabaseAdmin');

const router = express.Router();

router.use(requireAuth);

// Get current user's profile
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.put('/', async (req, res) => {
  try {
    const { display_name, avatar_url } = req.body;
    
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ display_name, avatar_url, updated_at: new Date().toISOString() })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
