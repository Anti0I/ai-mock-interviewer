# AI Mock Interviewer

> AI-powered platform that simulates real-world technical interviews and provides real-time, low-latency conversational feedback.

---

## Overview

Automated SaaS application that provides interactive interview sessions. It manages user authentication, syncs data securely to a cloud database, streams AI responses in real-time, and stores complete interview histories for candidate review.

---

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

---

## AI Engine

**Model:** `gemini-2.5-flash`
**SDK:** Vercel AI SDK 6

Acts as a professional technical recruiter. It handles real-time text streaming, dynamic context processing, and adapts its questions based on candidate responses. 

---

## Database & ORM

* **Engine:** PostgreSQL (hosted on Supabase)
* **ORM:** Prisma
* **Purpose:** Stores user profiles, manages interview credit balances, and saves complete chat histories for future review.

---

## Authentication & Security

* **Provider:** Clerk Core 3
* **Routing:** Edge protection via `proxy.ts`
* **Sync:** Serverless API webhooks automatically synchronize Clerk user creation events directly to the Supabase database.

---

## Installation

```bash
git clone [https://github.com/Anti0I/ai-mock-interviewer.git](https://github.com/Anti0I/ai-mock-interviewer.git)
cd ai-mock-interviewer

npm install
```
## Create .env
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

DATABASE_URL=your_supabase_transaction_pooler_url
DIRECT_URL=your_supabase_session_url

GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

## Run
```bash
npm run dev
```
## (Optional) Run Cloudflare tunnel for webhook local testing:
```bash
cloudflared tunnel url http://localhost:3000
``
