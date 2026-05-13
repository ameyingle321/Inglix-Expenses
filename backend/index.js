const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ─── Supabase Admin Client (uses service role key to bypass RLS) ───────────────
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Auth Middleware ───────────────────────────────────────────────────────────
// Verifies the Bearer JWT sent by the frontend, then attaches user to req.user
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header." });
  }

  const token = authHeader.split(" ")[1];

  // Use the anon client to validate the user's JWT
  const supabaseUser = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user }, error } = await supabaseUser.auth.getUser();

  if (error || !user) {
    return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }

  req.user = user;
  next();
}

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Expense Tracker backend is running." });
});

// ══════════════════════════════════════════════════════════════════════════════
// EXPENSES
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/expenses — fetch all expenses + splits for current user
app.get("/api/expenses", requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("expenses")
    .select(`
      *,
      expense_splits (
        id,
        contact_id,
        owed_amount,
        is_settled,
        contacts ( id, name, email )
      )
    `)
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/expenses — create a new expense (with optional splits)
app.post("/api/expenses", requireAuth, async (req, res) => {
  const { amount, description, category, expense_date, splits } = req.body;

  if (!amount || !description) {
    return res.status(400).json({ error: "amount and description are required." });
  }

  // Insert the expense
  const { data: expense, error: expenseError } = await supabaseAdmin
    .from("expenses")
    .insert({
      user_id: req.user.id,
      amount,
      description,
      category: category || "Other",
      expense_date: expense_date || new Date().toISOString(),
    })
    .select()
    .single();

  if (expenseError) return res.status(500).json({ error: expenseError.message });

  // Insert splits if provided
  if (splits && splits.length > 0) {
    const splitRows = splits.map((s) => ({
      expense_id: expense.id,
      contact_id: s.contact_id,
      owed_amount: s.owed_amount,
      is_settled: s.is_settled ?? false,
    }));

    const { error: splitsError } = await supabaseAdmin
      .from("expense_splits")
      .insert(splitRows);

    if (splitsError) return res.status(500).json({ error: splitsError.message });
  }

  res.status(201).json(expense);
});

// PUT /api/expenses/:id — update an expense
app.put("/api/expenses/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { amount, description, category, expense_date } = req.body;

  const { data, error } = await supabaseAdmin
    .from("expenses")
    .update({ amount, description, category, expense_date })
    .eq("id", id)
    .eq("user_id", req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Expense not found." });
  res.json(data);
});

// DELETE /api/expenses/:id — delete an expense (cascades splits via DB)
app.delete("/api/expenses/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

// PUT /api/expenses/splits/:splitId/settle — mark a split as settled
app.put("/api/expenses/splits/:splitId/settle", requireAuth, async (req, res) => {
  const { splitId } = req.params;
  const { is_settled } = req.body;

  const { data, error } = await supabaseAdmin
    .from("expense_splits")
    .update({ is_settled })
    .eq("id", splitId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Split not found." });
  res.json(data);
});

// ══════════════════════════════════════════════════════════════════════════════
// CONTACTS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/contacts — fetch all contacts for current user
app.get("/api/contacts", requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("contacts")
    .select("*")
    .eq("user_id", req.user.id)
    .order("name", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/contacts — add a new contact
app.post("/api/contacts", requireAuth, async (req, res) => {
  const { name, email } = req.body;

  if (!name) return res.status(400).json({ error: "name is required." });

  const { data, error } = await supabaseAdmin
    .from("contacts")
    .insert({ user_id: req.user.id, name, email })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// DELETE /api/contacts/:id — delete a contact
app.delete("/api/contacts/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from("contacts")
    .delete()
    .eq("id", id)
    .eq("user_id", req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

// ══════════════════════════════════════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/profile — get current user's profile
app.get("/api/profile", requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", req.user.id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Profile not found." });
  res.json(data);
});

// PUT /api/profile — update current user's profile
app.put("/api/profile", requireAuth, async (req, res) => {
  const { display_name, avatar_url } = req.body;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ display_name, avatar_url, updated_at: new Date().toISOString() })
    .eq("id", req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});