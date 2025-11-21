# FilmTrack

A React SPA (Single Page Application) for tracking movies you've watched with ratings and genre filtering, featuring a unique desktop-like user interface.

## Project Structure

-   `frontend/` - React app built with Vite
-   `backend/` - Express.js API with Sequelize ORM

## Getting Started

### Development

To run both the frontend and backend servers in development mode with hot-reloading:

```bash
npm run dev
```

### Production

To build the frontend for production and start both servers:

```bash
./start_production.sh
```

To stop the production servers:

```bash
./stop_production.sh
```

## Tech Stack

-   **Frontend**: React, Vite
-   **Backend**: Express.js, Sequelize
-   **Database**: SQLite
-   **Features**: CRUD operations, genre filtering, movie ratings

## Design Patterns

This application utilizes several design patterns:

-   **Component-Based Architecture**: The frontend is built using React, which promotes the use of reusable and self-contained components.
-   **State Management**: The `useState` and `useEffect` hooks in React are used for managing component state and side effects, following the observer pattern.
-   **Singleton**: The database connection in the backend can be considered a singleton, ensuring that a single instance is used throughout the application.

## Single Page Application (SPA)

FilmTrack is a Single Page Application. The desktop metaphor, with its windows and taskbar, provides a unique user experience where different sections of the application can be opened and managed like applications on a desktop, without ever leaving the single page.