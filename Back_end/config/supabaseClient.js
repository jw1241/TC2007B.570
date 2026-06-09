const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("SUPABASE URL:", supabaseUrl);
console.log(
  "SERVICE ROLE:",
  serviceRoleKey?.slice(0, 20)
);

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey
);

function createAuthClient(token) {
  const { createClient } = require("@supabase/supabase-js");

  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );
};

module.exports = {
  supabase,
  supabaseAdmin,
  createAuthClient
};