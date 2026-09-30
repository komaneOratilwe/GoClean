// This file creates one shared connection to your Supabase database.
// Every function in /api imports this instead of connecting separately.
//
// IMPORTANT: this uses the service_role key, not the anon key.
// The service_role key bypasses Row Level Security, which is correct
// here because these functions run on the server (never in the
// browser) and we WANT our backend to have full access. The anon key
// is no longer used anywhere in this project's backend.

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;