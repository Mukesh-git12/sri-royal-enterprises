# Sri Royal Enterprises — Render deployment

## Run locally

1. Open a terminal in this folder.
2. Run `npm start`.
3. Open `http://localhost:3000`.

## Deploy on Render

1. Unzip this package and upload it to a new GitHub repository.
2. In Render, select **New → Web Service** and connect that repository.
3. Set the **Root Directory** to `outputs`.
4. Use **Build Command**: `npm install`.
5. Use **Start Command**: `npm start`.
6. Create the service and connect a custom domain when ready.

The booking form always opens WhatsApp after submission. The built-in local file storage is suitable for testing only; use a managed database before relying on stored requests in production.
