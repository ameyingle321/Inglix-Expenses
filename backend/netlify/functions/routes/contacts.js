const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const { supabaseAdmin } = require('../lib/supabaseAdmin');

const router = express.Router();

router.use(requireAuth);

// Get user's contacts
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .eq('user_id', req.user.id)
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a contact
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    let linked_user_id = null;

    // Check if email belongs to a registered user
    if (email) {
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
        
      if (profileData) {
        linked_user_id = profileData.id;
      }
    }

    const { data, error } = await supabaseAdmin
      .from('contacts')
      .insert([{ 
        user_id: req.user.id, 
        name, 
        email, 
        linked_user_id 
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a contact
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('contacts')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
