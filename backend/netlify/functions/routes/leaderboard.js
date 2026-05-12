const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const { supabaseAdmin } = require('../lib/supabaseAdmin');

const router = express.Router();

router.use(requireAuth);

// Get leaderboard (Top spenders among user's contacts)
router.get('/', async (req, res) => {
  try {
    // 1. Get all expenses and their splits for this user
    const { data: expenses, error } = await supabaseAdmin
      .from('expenses')
      .select(`
        amount,
        expense_splits (
          owed_amount,
          is_settled,
          contacts (
            id,
            name,
            avatar_url:linked_user_id(avatar_url)
          )
        )
      `)
      .eq('user_id', req.user.id);

    if (error) throw error;

    // 2. Aggregate data per contact
    const contactStats = {};

    expenses.forEach(expense => {
      expense.expense_splits.forEach(split => {
        if (!split.contacts) return;
        
        const contactId = split.contacts.id;
        
        if (!contactStats[contactId]) {
          // Flatten nested avatar_url from the join
          const avatar_url = split.contacts.avatar_url?.avatar_url || null;
          
          contactStats[contactId] = {
            id: contactId,
            name: split.contacts.name,
            avatar_url,
            total_owed_to_user: 0,
            total_settled: 0,
            total_pending: 0
          };
        }

        const amt = parseFloat(split.owed_amount || 0);
        contactStats[contactId].total_owed_to_user += amt;
        
        if (split.is_settled) {
          contactStats[contactId].total_settled += amt;
        } else {
          contactStats[contactId].total_pending += amt;
        }
      });
    });

    // Convert to array and sort by total pending (or total owed, depending on preference)
    const leaderboard = Object.values(contactStats)
      .sort((a, b) => b.total_pending - a.total_pending);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
