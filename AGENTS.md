# Lucky Vault - AGENTS.md

## Project Structure

```
/root/luckydraw/           # root
├── android/               # Android app (Kotlin, Jetpack Compose, Hilt)
│   ├── app/src/main/java/com/luckyvault/
│   │   ├── data/          # API, repositories, models
│   │   ├── di/            # Hilt dependency injection
│   │   ├── ui/            # Screens, navigation, components
│   │   └── LuckyVaultApp.kt
│   ├── app/build.gradle   # Version, signing, dependencies
│   └── .github/workflows/ # CI/CD
├── backend/               # NestJS API (TypeScript, Prisma, PostgreSQL)
│   ├── src/               # Modules: auth, draws, tickets, wallet, admin
│   ├── prisma/            # Database schema
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

- **Backend**: Requires PostgreSQL, Redis, JWT_SECRET (see `backend/.env.example`)
- **Frontend**: Requires `VITE_API_BASE_URL` (see `frontend/.env.example`)
- **Android**: API URLs in `app/build.gradle` (debug: `10.0.2.2`, release: `api.luckyvault.app`)

## Important Notes

- **Never build Android locally.** Use GitHub Actions only.
- **Never commit secrets.** Use `.env` files (gitignored) and GitHub Secrets for CI.
- **APK version** is in `android/app/build.gradle` (`versionName` / `versionCode`).

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
