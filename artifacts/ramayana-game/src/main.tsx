import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if (import.meta.env.DEV && "serviceWorker" in navigator) {
    navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
            for (const registration of registrations) {
                void registration.unregister();
            }
        })
        .catch(() => {
            // Ignore service worker cleanup errors in development.
        });
}

createRoot(document.getElementById("root")!).render(<App />);
