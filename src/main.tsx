import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { runMigrations } from "./lib/storage";

// Run data migrations on app start
runMigrations().catch(console.error);

createRoot(document.getElementById("root")!).render(<App />);
