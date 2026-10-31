# Security

## Reporting a problem
Please do not open a public issue for a security bug. Use GitHub's **Security > Report a vulnerability** on this repository, or contact the maintainer privately.

## For people who fork this project
- Never commit `.env`, `.env.local` or any key. Only `.env.example` (placeholders) belongs in Git.
- `SUPABASE_SERVICE_ROLE_KEY` is a master key. Put it only in your host's environment variables (Netlify). If it ever leaks, regenerate it in Supabase immediately.
- In Supabase > Authentication, turn **off** "Allow new users to sign up" and use a strong password plus 2FA on your Supabase and GitHub accounts.
- Keep Row Level Security **on** for every table. Run the SQL files in `supabase/` as they are.
- Set `ADMIN_EMAILS` to your own email only.
- Public pages never contain secrets. Admin changes go through server routes that check you are an admin.
