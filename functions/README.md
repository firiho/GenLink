# Firebase Functions

This folder contains Firebase Cloud Functions for backend logic.

## Setup

1. **Install dependencies:**
```bash
cd functions
npm install
```

2. **Set your Firebase project:**
Edit `.firebaserc` in the root folder and replace `your-firebase-project-id` with your Firebase project ID.

3. **Build:**
```bash
npm run build
```

## Development

**Local testing with emulators:**
```bash
npm run serve
```
Emulator UI: http://localhost:4000

## Deploy

```bash
npm run deploy
```

Or deploy a specific function:
```bash
firebase deploy --only functions:handleUserSignup
```

## Structure

```
functions/
├── src/
│   ├── index.ts          # Main entry point
│   ├── config/           # Configuration
│   ├── utils/            # Utility functions
│   └── auth/             # Auth functions (signup)
└── package.json
```

## Available Functions

### `handleUserSignup`
Handles user signup by creating user profiles and organization documents in Firestore after Firebase Auth creates the account.

## Adding New Functions

1. Create a new folder in `src/` (e.g., `src/payments/`)
2. Create `index.ts` in that folder
3. Export your function(s)
4. Export from `src/index.ts`: `export * from "./payments";`
5. Build and deploy

Example:
```typescript
// src/payments/index.ts
import { onCall } from "firebase-functions/v2/https";
import { config } from "../config";

export const myFunction = onCall({ region: config.region }, async (request) => {
  // Your logic here
  return { success: true };
});
```

