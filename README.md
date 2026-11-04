# Yad Byad Backend

Express and TypeScript API for a college-project student support platform, covering accounts, schedules, session requests, resources, complaints, reports, and notifications. The project is a demonstration application with no real users.

## Key features

- Student signup, authentication, profile editing, and password changes.
- Persistent recovery codes, verified password resets, and session revocation.
- Administrator recovery approval with a private dashboard notification.
- Existing exam, lecture, casual-session, matching, library, complaint, and report APIs.
- Report-window validation and local attachment storage.

Recovery approval is deliberately a dashboard demonstration: no email is delivered, no code is revealed, and acceptance does not bypass password-reset verification.

## Live backend

https://yadbyad-backend.vercel.app/

The latest local improvements have not been deployed.

## Tech stack

Express 4, TypeScript 5, MongoDB/Mongoose 8, jsonwebtoken, bcryptjs, Node crypto, Multer, Moment, Jest 29, and ts-jest. Report attachments use local disk.

## Prerequisites

- Node.js and npm. Verification used Node.js 24.13.0 and npm 11.12.1; no engine version is pinned.
- Access to MongoDB. Recovery acceptance uses transactions and requires Atlas or a replica set.

## Installation and environment

1. Open this repository's folder, `YadByad_Backend`.
2. Run `npm ci`.
3. Copy `.env.sample` to `.env` only if a local environment file does not exist.
4. Configure `PORT=9000`, `DB_URL`, and `JWT_Token` privately.
5. Optionally configure `RECOVERY_CODE_KEY` and `DNS_SERVERS`.
6. Run `npm run dev`.

`RECOVERY_CODE_KEY` is a stable private secret for recovery-code encryption. If absent, the existing JWT signing secret is used. Changing the encryption secret prevents existing codes from being decrypted. Configure a dedicated key before code creation if JWT signing-key rotation will be needed independently.

`DNS_SERVERS` accepts optional comma-separated resolver addresses. Never publish private environment values. The local environment is ignored and preserved; its removal from future Git tracking does not erase historical commits.

## Running and checks

```sh
npm run dev
npm test -- --runInBand
npm run build
node dist/index.js
```

Start the compiled server from this repository's root so the environment and `uploads/` directory resolve correctly. The build and all 42 backend regression tests passed after relocation. Tests use mocked persistence; earlier temporary-account API checks separately verified database-backed account flows and recovery-approval notifications.

## Account API

Paths are relative to `/api/v1/auth`.

| Method | Path                             | Behavior                                                        |
| ------ | -------------------------------- | --------------------------------------------------------------- |
| POST   | `/signup`                        | Public student signup; administrator roles rejected             |
| POST   | `/login`                         | Safe account fields and a persistent access session             |
| GET    | `/me`                            | Current authenticated profile                                   |
| GET    | `/recovery/code`                 | Own stored recovery code, authentication required               |
| POST   | `/recovery/verify`               | Verify email/code; issue ten-minute reset authorization         |
| POST   | `/forgotPassword`                | Consume reset authorization to update the password              |
| POST   | `/recovery/request`              | Queue administrator review without disclosing account existence |
| GET    | `/recovery/requests`             | Administrator request queue                                     |
| POST   | `/recovery/requests/:id/approve` | Accept pending request and notify its recipient atomically      |
| POST   | `/users/profile/:id`             | Edit own permitted personal fields                              |
| POST   | `/users/changePassword`          | Verify current password and replace the current session         |

Existing account listing, lookup, update, and soft-delete endpoints require administrator access. Public signup cannot create administrators. Self-profile edits cannot change student ID or role. Ordinary account responses exclude password hashes and recovery secrets.

Other route groups under `/api/v1` are `/schedule`, `/lecture`, `/casual`, `/slot`, `/library`, `/complain`, `/reports`, `/reportSlot`, and `/notifications`.

## Project structure

```text
YadByad_Backend/
├── index.ts
├── src/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── service/
│   ├── tests/
│   └── utils/
├── .env.sample
├── jest.unit.json
├── package-lock.json
└── tsconfig.json
```

This remains an independent Git repository inside `YadByad_Code`. Local dependencies, builds, uploads, private configuration, and external project documents do not belong in its tracked application source.

## Limitations

This college demo still needs a complete non-account authorization audit, dependency/security review, upload size/type policy, and durable hosted storage decision before production use. Application-level duplicate checks do not replace database unique indexes. Per-process rate limits are not distributed. No backend Vercel configuration was found in this checkout, so serverless entry behavior and file persistence require verification before redeployment. Historical secrets require a private review and rotation of any real exposed values before public publication.

## Dashboard and persistent sessions

Authenticated `GET /api/v1/dashboard` returns role-specific totals and status breakdowns. Personal records are scoped to the signed-in student. Login access sessions have no automatic expiry for this college demo. Explicit `POST /api/v1/auth/logout` increments the authentication version and revokes the account's existing sessions. Password changes and deletion also invalidate old sessions. Password-reset authorizations still expire after ten minutes. This persistent-session policy is demo-specific and needs review before real-user production use.

## Demo records

To populate a demo database with schedules, matches, report slots, reports, resources, complaints, recovery requests, and notifications, run:

```sh
npm run seed:demo -- <admin-username> <special-needs-username> <part-time-username>
```

Use three existing active demo accounts in the indicated role order. The script uses the configured database, keeps existing credentials, and skips records it already inserted. Sample report files are written to the local backend uploads folder.
