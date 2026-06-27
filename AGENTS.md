# Lucky Vault - AGENTS.md

## Project Structure

```
/root/luckydraw/           # root
├── android/               # Android app (Kotlin, Jetpack Compose, Hilt)
│   ├── app/src/main/java/com/luckyvault/
│   │   ├── data/          # Supabase client, repositories, models
│   │   ├── di/            # Hilt dependency injection
│   │   ├── ui/            # Screens, navigation, components
│   │   └── LuckyVaultApp.kt
│   ├── app/build.gradle   # Version, signing, dependencies
│   └── .github/workflows/ # CI/CD
├── backend/               # NestJS API (TypeScript, Prisma, PostgreSQL via Supabase)
│   ├── src/               # Modules: auth, draws, tickets, wallet, admin
│   ├── prisma/            # Database schema with RLS
│   └── package.json
├── frontend/              # React + Vite + Tailwind (TypeScript)
│   ├── src/
│   │   ├── components/    # Shared UI components
│   │   ├── pages/         # Route pages
│   │   ├── lib/           # API client, auth
│   │   └── types/         # TypeScript types
│   └── package.json
├── apks/                  # Built APKs (from CI)
└── AGENTS.md              # This file
```

## Key Commands

```bash
# Frontend
cd frontend && npm install && npm run dev    # Dev server on :5173

# Backend
cd backend && npm install && npm run start:dev  # API on :3000

# Android (CI only — never build locally)
# GitHub Actions builds on push to main
```

## Environment

- **Backend**: Requires `DATABASE_URL` (Supabase PostgreSQL), `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **Frontend**: Requires `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Android**: `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `BuildConfig` (debug: localhost, release: production)

## Important Notes

- **Never build Android locally.** Use GitHub Actions only.
- **Never commit secrets.** Use `.env` files (gitignored) and GitHub Secrets for CI.
- **APK version** is in `android/app/build.gradle` (`versionName` / `versionCode`).
- **Android NEVER connects directly to PostgreSQL.** Only Supabase URL + Anon Key.
- **RLS is mandatory** on every table. No exceptions.

---

# Supabase Security Architecture (Mandatory)

This project is a production application. Security is a top priority. Follow these rules without exception.

## 1. Never connect the Android app directly to PostgreSQL

The Android application MUST NEVER use:
- Direct PostgreSQL connection string
- Connection Pooler connection string
- Database username
- Database password
- Service Role Key

These credentials are server-side secrets and must never be embedded in the APK or any client-side code.

## 2. Android App Configuration

The Android application may only contain:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Use the official Supabase SDK for all client communication. All database access from the Android app must go through Supabase client APIs. Never use raw PostgreSQL connections from the mobile application.

## 3. Row Level Security

Every database table must have RLS enabled. Create explicit policies for every table. Never rely on client-side checks. Users must only be able to read/modify their own data. Administrative data must never be accessible from the client.

## 4. Backend Responsibilities

These operations MUST execute only on trusted server-side code (Backend or Supabase Edge Functions):
- Lucky Draw execution & winner selection
- Wallet credit/debit & prize payout
- Payment verification
- Ticket generation & validation
- QR verification
- KYC approval & fraud detection
- Admin operations & financial reporting
- Scheduled draws & system maintenance

These must never execute on the Android device.

## 5. Service Role Key

The Service Role Key must never be committed to Git, placed in the APK, stored in the repository, appear in logs, or be exposed to the client. Store it only in secure server environment variables or GitHub Secrets.

## 6. Secrets Management

All secrets must come from secure environment variables (GitHub Secrets, CI/CD Secrets, Server Environment Variables). Never hardcode API Keys, Database Passwords, JWT Secrets, Service Role Key, or Connection Strings.

## 7. Authentication

All users must authenticate using Supabase Auth. Every request must be tied to the authenticated user's JWT. Never trust user IDs supplied by the client. Always derive the authenticated user from the JWT.

## 8. Wallet Security

Wallet balances are server-controlled. The Android app must never calculate, credit, debit, or determine winnings. The client only displays data returned from secure backend endpoints.

## 9. Lucky Draw Security

The draw algorithm must execute only on the backend. Never expose draw logic, random seed, winning algorithm, or internal calculations. The Android app only displays published results.

## 10. Payments

All payment verification must occur on the backend. Never trust payment success reported by the client. Always verify transactions directly with the payment provider.

## 11. GitHub Actions

GitHub Actions must never expose secrets. Use GitHub Secrets for all sensitive values. Never print secret values in workflow logs.

## 12. Logging

Never log JWTs, Passwords, API Keys, Database Credentials, Connection Strings, or Service Role Keys. Sanitize all logs before output.

---

# Artifact Retrieval Policy

After every successful GitHub Actions workflow run:

1. Wait until the workflow has completed with a "Success" status.
2. Download the artifact containing the Release APK. If a Release APK is not available, download the Debug APK instead.
3. Extract the downloaded artifact.
4. Locate the generated APK using the following priority:

   Priority 1:
   app/build/outputs/apk/release/app-release.apk

   Priority 2:
   app/build/outputs/apk/debug/app-debug.apk

5. Copy the selected APK into the project's root directory under:

   apks/

6. If the directory does not exist, create it automatically.

7. Rename the APK to:

   LuckyVault.apk

   If multiple builds are being preserved, use:

   LuckyVault-v<versionName>-<versionCode>.apk

8. Ensure the final APK path is:

   apks/LuckyVault.apk

   or

   apks/LuckyVault-v<versionName>-<versionCode>.apk

9. Verify that the copied APK exists and has a valid file size greater than 0 bytes.

10. Report:
    - GitHub Actions run ID
    - Commit SHA
    - APK type (Release or Debug)
    - APK version
    - APK size
    - Final saved path

11. If the Release APK is unavailable, automatically fall back to the Debug APK and clearly state that the Debug APK was saved instead.

12. If no APK artifact can be found, inspect the GitHub Actions logs, fix the build or workflow, commit the fix, push to GitHub, rerun the workflow, and repeat until the APK is successfully produced and saved to:

    apks/LuckyVault.apk

GitHub Actions is the authoritative build environment. Never request or perform a local Gradle build unless I explicitly instruct you to do so.
