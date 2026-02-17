import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const savedTheme = localStorage.getItem("theme");
const initialTheme = savedTheme === "light" ? "light" : "dark";
document.documentElement.classList.toggle("dark", initialTheme === "dark");

createRoot(document.getElementById("root")!).render(<App />);
