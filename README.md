# Yad Byad Backend

## Project Overview

The Yad Byad API supports academic peer assistance through account management, session scheduling, matching requests, resources, complaints, and reports. It stores application records and report attachments in MongoDB and serves the companion web interface.

## Project Preview

<img src="documents/project-preview.webp" alt="Yad Byad Backend application screens and visual identity" width="520">

Companion application screens and visual identity. Branding mockups are presentation concepts.

## Key Features

- Student accounts, profiles, persistent sessions, and explicit session revocation.
- Recovery codes and administrator-reviewed recovery requests with private notifications.
- Dashboard summaries, exam/lecture/casual sessions, and matching requests.
- Resources, complaints, report slots, and report review.
- GridFS report attachments with authenticated owner/administrator access.

## Live Website & Related Repository

Frontend repository: https://github.com/mayurbohraa/yadbyad-frontend

API deployment: https://yadbyad-backend.vercel.app/

## Tech Stack

- **Server:** Node.js, Express 4, TypeScript 5.
- **Data:** MongoDB, Mongoose 8, GridFS.
- **Security and files:** jsonwebtoken, bcryptjs, Multer.
- **Checks:** Jest 29, ts-jest, TypeScript compiler.

## Prerequisites

Node.js, npm, and MongoDB. Recovery approval uses transactions and requires a replica set, such as MongoDB Atlas. Node.js 24 is used for this documentation verification.

## Installation & Setup

1. Clone and open the backend:

   ```sh
   git clone https://github.com/mayurbohraa/yadbyad-backend.git
   cd yadbyad-backend
   ```

2. Install dependencies:

   ```sh
   npm ci
   ```

3. For a fresh setup, copy `.env.sample` to `.env`. Set `DB_URL`, a private `JWT_Token` signing secret, and `PORT=9000` for the standard frontend connection.
4. Optionally set a stable `RECOVERY_CODE_KEY`; otherwise encryption uses `JWT_Token`. Changing the encryption key can make stored recovery codes unreadable. `DNS_SERVERS` optionally supplies comma-separated resolver addresses.
5. Keep environment values private. With no `PORT`, the code defaults to `5000`; the supplied environment template selects `9000`.

## Running Locally

Development:

```sh
npm run dev
```

Compile and run the compiled server:

```sh
npm run build
```

```sh
node dist/index.js
```

`npm start` is also a development watcher; it is not the compiled production command.

Run tests:

```sh
npm test -- --runInBand
```

The root `/` reports liveness; `/api/v1/health` checks database readiness. Sessions persist until logout or a security change; access-token expiry is not enforced by the current middleware.

## Project Structure

```text
index.ts              # Express entry, database connection, and listener
src/
├── controllers/      # HTTP handling
├── middlewares/      # Session and request middleware
├── models/           # MongoDB schemas
├── routes/           # API route groups
├── service/          # Feature operations and file storage
├── tests/            # Backend regression tests
└── utils/            # Account security, uploads, and errors
scripts/              # Demo-data tools
documents/            # Public application preview
.env.sample           # Private configuration template
```
