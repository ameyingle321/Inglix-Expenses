const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const { supabaseAdmin } = require('../lib/supabaseAdmin');

const router = express.Router();

router.use(requireAuth);

// Get expenses
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('expenses')
      .select(`
        *,
        expense_splits (*, contacts(*))
      `)
      .eq('user_id', req.user.id)
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create expense + splits
router.post('/', async (req, res) => {
  try {
    const { amount, description, category, expense_date, splits } = req.body;

    if (!amount || !description) {
      return res.status(400).json({ error: 'Amount and description are required' });
    }

    // 1. Insert Expense
    const { data: expense, error: expenseError } = await supabaseAdmin
      .from('expenses')
      .insert([{
        user_id: req.user.id,
        amount,
        description,
        category,
        expense_date: expense_date || new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (expenseError) throw expenseError;

    // 2. Insert Splits
    if (splits && splits.length > 0) {
      const splitsToInsert = splits.map(split => ({
        expense_id: expense.id,
        contact_id: split.contact_id,
        owed_amount: split.owed_amount,
        is_settled: split.is_settled || false,
        settled_at: split.is_settled ? new Date().toISOString() : null
      }));

      const { error: splitsError } = await supabaseAdmin
        .from('expense_splits')
        .insert(splitsToInsert);

      if (splitsError) {
        // Rollback (manual since no RPC transaction here)
        await supabaseAdmin.from('expenses').delete().eq('id', expense.id);
        throw splitsError;
      }
    }

    // Fetch the complete inserted record
    const { data: finalExpense, error: finalError } = await supabaseAdmin
      .from('expenses')
      .select(`*, expense_splits (*, contacts(*))`)
      .eq('id', expense.id)
      .single();
      
    if (finalError) throw finalError;

    res.status(201).json(finalExpense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { amount, description, category, expense_date } = req.body;
    
    // Validate ownership
    const { data: existing, error: checkError } = await supabaseAdmin
        .from('expenses')
        .select('id')
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .single();
        
    if (checkError || !existing) {
        return res.status(404).json({ error: 'Expense not found' });
    }

    const { data, error } = await supabaseAdmin
      .from('expenses')
      .update({ amount, description, category, expense_date })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('expenses')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark split as settled/unsettled
router.put('/splits/:splitId/settle', async (req, res) => {
    try {
        const { is_settled } = req.body;
        
        // Verify ownership via the parent expense
        const { data: splitData, error: splitError } = await supabaseAdmin
            .from('expense_splits')
            .select('expense_id, expenses!inner(user_id)')
            .eq('id', req.params.splitId)
            .single();
            
        if (splitError || !splitData || splitData.expenses.user_id !== req.user.id) {
             return res.status(404).json({ error: 'Split not found or unauthorized' });
        }
        
        const { data, error } = await supabaseAdmin
            .from('expense_splits')
            .update({ 
                is_settled, 
                settled_at: is_settled ? new Date().toISOString() : null 
            })
            .eq('id', req.params.splitId)
            .select()
            .single();
            
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
