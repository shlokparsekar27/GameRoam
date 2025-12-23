# GameRoam 🎮

[![Vercel App](https://deploy-badge.vercel.app/vercel/gameroam)](https://gameroam.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern web application designed to help gamers track, manage, rent, and sell their physical game collections. GameRoam provides a centralized "Vault" for your library and a Marketplace to connect with other local gamers for trades and rentals.

### 🚀 [**View Live Demo**](https://gameroam.vercel.app)

---

## Features

GameRoam is a comprehensive Single-Page Application (SPA) built for the gaming community with a secure and real-time backend.

* **My Vault:** A personal dashboard to manage your game collection. Track games you own, wish to sell, or are willing to rent out.
* **Smart Tracking:** Organize games by status: *Library* (Collection), *Rent* (Available for Rent), *Sale* (For Sale), *Rented Out* (Away), *Rented In* (Borrowed), and *Sold* (History).
* **Marketplace:** Browse a public feed of games available for rent or purchase from other users. Filter by platform, city, or listing type.
* **Magic Wand Auto-Fill:** Easily add games to your vault by typing a title and clicking the "Magic Wand" to automatically fetch cover art from the RAWG API.
* **Real-Time Chat:** A private messaging system to negotiate prices, arrange meetups, or discuss games. Supports image and video sharing.
* **Community Feed:** Share moments, game reviews, or thoughts with the community in a dedicated social feed.
* **User Profiles:** Customizable profiles with avatars, bio, location, and stats on your vault size and community posts.
* **Responsive Design:** A sleek, dark-themed UI built with Tailwind CSS that looks great on desktop and mobile.

---

## Tech Stack

This project is built with a modern, powerful, and scalable tech stack.

* **Frontend:**
  * [**React**](https://reactjs.org/) (Vite)
  * [**Tailwind CSS**](https://tailwindcss.com/) for professional and responsive styling
  * [**Lucide React**](https://lucide.dev/) for beautiful icons
  * [**React Router**](https://reactrouter.com/) for client-side routing
* **Backend (BaaS):**
  * [**Supabase**](https://supabase.io/) for the database, authentication, storage, and real-time features.
    * **Database:** PostgreSQL
    * **Authentication:** Supabase Auth
    * **Storage:** Supabase Storage for user avatars and chat media
    * **Realtime:** Supabase Realtime for live chat messages
* **External APIs:**
  * [**RAWG Video Games API**](https://rawg.io/apidocs) for fetching game metadata and cover art.

---

## Getting Started

To get a local copy of this project up and running on your machine, follow these simple steps.

### Prerequisites

* You will need [Node.js](https://nodejs.org/) installed on your machine.
* You will need a free [Supabase](https://supabase.io/) account.
* You will need a free API Key from [RAWG.io](https://rawg.io/apidocs).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/shlokparsekar27/gameroam.git](https://github.com/shlokparsekar27/gameroam.git)
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd gameroam
    ```

3.  **Install NPM packages:**
    ```bash
    npm install
    ```

4.  **Set up your environment variables:**
    * Create a new file in the root directory named `.env`.
    * Add your Supabase credentials and RAWG API key as shown below:
        ```env
        VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
        VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
        VITE_RAWG_API_KEY="YOUR_RAWG_API_KEY"
        ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application should now be running on `http://localhost:5173/`.

---

## Deployment

This project is configured for seamless deployment on **Vercel**.

1.  Push your code to a GitHub repository.
2.  Import the project into Vercel.
3.  Add the Environment Variables (`VITE_SUPABASE_URL`, etc.) in the Vercel Project Settings.
4.  Deploy!

---

## Supabase Project Setup

This project requires a Supabase backend to be set up. You will need to create the following tables and buckets:

* **Tables:**
  * `profiles` (extends `auth.users`) - Stores user details like username, avatar, and location.
  * `games` - Stores game data, price, status, and owner_id.
  * `messages` - Stores chat history and media links.
  * `community_posts` - Stores user social posts and likes.
* **Storage Buckets:**
  * `avatars` (public) - For user profile pictures.
  * `chat-uploads` (authenticated) - For sharing images/videos in chat.

*Note: Ensure Row Level Security (RLS) policies are enabled to protect user data.*

---

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
