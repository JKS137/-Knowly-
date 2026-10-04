# Supabase & PostgreSQL Setup Guide for Knowly

This document explains how to set up the production database for Knowly on Supabase or any standard PostgreSQL provider (Neon, AWS RDS, GCP Cloud SQL).

---

## 1. Quick Setup in Supabase Dashboard

1. Log into your [Supabase Dashboard](https://app.supabase.com) and create a new project.
2. In the left navigation, click on **SQL Editor**.
3. Create a **New query**.
4. Paste the entire content of `src/db/schema.sql` into the SQL editor.
5. Click **Run** to execute the script and provision all tables, indexes, and Row Level Security (RLS) policies.

---

## 2. Environment Variables

Add the following to your production `.env` file or Vercel Environment Variables:

```bash
# Supabase connection
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-public-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret"

# Or Direct PostgreSQL Connection String:
DATABASE_URL="postgresql://postgres:yourpassword@db.your-project.supabase.co:5432/postgres"
```

---

## 3. Security Considerations

- **Never** expose the `SUPABASE_SERVICE_ROLE_KEY` in client-side code (`VITE_` variables).
- Public users should only query the sanitized view `public_question_options` or query through the server-side API endpoints (`/api/quizzes/:shortId`) which strip `is_correct`.
- Submissions must only be scored using server-side SQL functions or via the API backend (`/api/quizzes/:shortId/submit`).
