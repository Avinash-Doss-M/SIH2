# Events Page Routing

There are now two separate Events pages:

- `/public-events`: Publicly visible, shows only approved/upcoming events. No login required.
- `/user-events`: Authenticated users only. Allows alumni to request events, students to register, and admins to manage/approve.

Update your router to include:

```tsx
import PublicEvents from './pages/PublicEvents';
import UserEvents from './pages/UserEvents';

<Route path="/public-events" element={<PublicEvents />} />
<Route path="/user-events" element={<UserEvents />} />
```

Update navigation as needed. The default "Events" link in the navbar now points to `/public-events`.
# Alumni Connect Platform

## Project Overview

Alumni Connect is a comprehensive platform designed to connect alumni, students, and educational institutions. It facilitates networking, mentorship, events, job postings, and community engagement.

## Features

- **User Management**: Alumni, student, and admin roles with secure authentication
- **Networking**: Connect with fellow alumni and current students
- **Events**: Create, manage, and participate in alumni events
- **Job Board**: Post and browse job opportunities
- **Mentorship**: Facilitate mentor-mentee relationships
- **Admin Dashboard**: Comprehensive admin tools for platform management
- **Contact System**: Direct communication channels

## How to Development Setup

You can edit this application using your preferred IDE. Clone this repository and start developing locally.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deployment

This project can be deployed to any modern hosting platform that supports React applications:

- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Deploy directly from GitHub with continuous integration
- **Firebase Hosting**: Google's hosting solution with excellent performance
- **AWS Amplify**: Scalable hosting with built-in CI/CD

## Environment Variables

Make sure to set up the following environment variables for Supabase integration:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

The project uses Supabase as the backend. Run the SQL scripts in the project root to set up the required database tables and policies.
