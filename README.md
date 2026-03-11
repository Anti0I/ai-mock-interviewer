# AI Mock Interviewer

AI Mock Interviewer is a web application designed to help users prepare for job interviews. It leverages AI to simulate a real interview experience, allowing users to practice their answers to common questions and receive feedback to improve their performance.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Authentication**: [Clerk](https://clerk.com/)
-   **Database ORM**: [Prisma](https://www.prisma.io/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)

## Features

-   **User Authentication**: Secure sign-up and sign-in functionality managed by Clerk.
-   **User Data Sync**: Automatically creates a new user profile in the database upon sign-up using Clerk Webhooks.
-   **Credit System**: New users start with 2 free interview credits.
-   **Interactive Interview Chat**: A chat interface where users can interact with an AI interviewer.
-   **Database Persistence**: User data, interview sessions, and chat messages are stored in a PostgreSQL database.

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

-   Node.js (v20 or later)
-   npm, yarn, or pnpm
-   A PostgreSQL database instance
-   A Clerk account

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Anti0I/ai-mock-interviewer.git
    cd ai-mock-interviewer
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the following environment variables. You will need to get the values from your PostgreSQL database provider and your Clerk dashboard.

    ```env
    # PostgreSQL Connection URL for Prisma
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

    # Clerk Authentication Keys
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key

    # Clerk Webhook Secret for user creation sync
    CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
    ```

4.  **Push the database schema:**
    This command will apply the schema defined in `prisma/schema.prisma` to your database.
    ```sh
    npx prisma db push
    ```

5.  **Run the development server:**
    ```sh
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The project follows the standard Next.js App Router structure.

-   `app/`: Contains all the routes, pages, and UI components.
    -   `app/api/`: API routes for the application, including the Clerk webhook endpoint.
    -   `app/sections/`: Contains major UI sections of the homepage like the Navbar and Hero.
-   `lib/`: Contains utility functions and library initializations, such as the Prisma client instance.
-   `prisma/`: Contains the Prisma schema (`schema.prisma`) which defines the database models.
