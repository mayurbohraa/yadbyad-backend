# Yad Byad Backend

*Empowering student success through peer collaboration.*

## About the project

This Express API powers Yad Byad, a student peer-support application delivered through a freelance engagement for a client’s college project.

## Key features

- Student accounts, session revocation, profile changes, and recovery-code password reset.
- Administrator recovery approval with a private dashboard notification.
- Role-specific dashboard summaries, schedules, matching, resources, complaints, and report review.
- Report submission windows and durable MongoDB GridFS attachments. Report owners and administrators can open attachments through the authenticated API.

## Live backend

https://yadbyad-backend.vercel.app/

## Tech stack

Express 4, TypeScript 5, MongoDB and GridFS, Mongoose 8, Multer, jsonwebtoken, bcryptjs, and Jest 29 with ts-jest.

## Prerequisites

- Node.js and npm. Verification used Node.js 24.13.0 and npm 11.12.1.
- MongoDB Atlas or another replica set for the recovery-approval transaction.

## Installation and setup

1. Open `YadByad_Backend` and run `npm ci`.
2. Copy `.env.sample` to `.env` if one does not exist.
3. Set the backend environment variables below.
4. Run `npm run dev`.

## Environment configuration

| Variable | Purpose |
| --- | --- |
| `DB_URL` | Private MongoDB connection string for application records and report files |
| `JWT_Token` | Private signing secret |
| `PORT` | Set to `9000` for the standard local setup |
| `RECOVERY_CODE_KEY` | Optional stable encryption key. Defaults to the signing secret |
| `DNS_SERVERS` | Optional comma-separated DNS resolvers |

Keep secrets in private environment settings. Preserve the configured recovery-code encryption key so previously issued codes remain readable.

## Running locally

| Task | Command |
| --- | --- |
| Development server | `npm run dev` |
| Unit tests | `npm test -- --runInBand` |
| Production build | `npm run build` |
| Run the compiled server | `node dist/index.js` |

For a demo database with three existing active accounts, run `npm run seed:demo -- <admin-username> <special-needs-username> <part-time-username>`. The seed preserves credentials and stores the sample report attachments in GridFS.

## Deployment and report storage

Vercel detects the Express app exported by `index.ts`. Configure `DB_URL` and `JWT_Token` in the Production environment. The root route checks startup. `/api/v1/health` checks database readiness.

New report uploads are limited to 4 MB and stored in MongoDB. `GET /api/v1/reports/:id/file` requires a valid session and restricts access to the report owner or an administrator. Older local attachments can be opened where the original file is still available.

## Project structure

```text
YadByad_Backend/
├── index.ts
├── scripts/          # Demo data and attachment seed
├── src/
│   ├── controllers/ # HTTP request handling
│   ├── middlewares/ # Authentication and request guards
│   ├── models/      # MongoDB schemas
│   ├── routes/      # API endpoints
│   ├── service/     # Data operations and GridFS storage
│   ├── tests/       # Backend regression tests
│   └── utils/       # Account security and upload handling
└── .env.sample
```
