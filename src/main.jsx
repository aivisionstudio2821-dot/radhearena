import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Instagram,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import "./styles.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const WHATSAPP_NUMBER =
  import.meta.env.VITE_WHATSAPP_NUMBER || "917046706848";

const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

const DAY_RATE = 800;
const NIGHT_RATE = 1100;

const slots = Array.from({ length: 18 }, (_, i) => i + 6);

const hourLabel = (hour) => {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:00 ${suffix}`;
};

const safeHourLabel = (hour) => {
  if (hour >= 24) return "12:00 AM";
  return hourLabel(hour);
};

const priceForHour = (hour) =>
  hour >= 17 ? NIGHT_RATE : DAY_RATE;

const todayString = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000)
    .toISOString()
    .split("T")[0];
};

/* =========================================================
   CINEMATIC INTRO
========================================================= */
function CinematicIntro({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDone();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#050505",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        overflow: "hidden",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, #d52b38, #8d0f18 65%, #3b0509)",
          border: "3px solid #f4f1e8",
          boxShadow: "0 0 45px rgba(167,25,36,.8)",
          marginBottom: "38px",
        }}
      />

      <div
        style={{
          fontSize: "clamp(30px, 9vw, 64px)",
          fontWeight: 900,
          letterSpacing: "-2px",
          textAlign: "center",
        }}
      >
        YOUR GAME.
      </div>

      <div
        style={{
          marginTop: "14px",
          color: "#C9A86A",
          fontSize: "clamp(14px, 4vw, 22px)",
          fontWeight: 700,
          letterSpacing: "4px",
          textAlign: "center",
        }}
      >
        RADHE BOX CRICKET
      </div>
    </div>
  );
}
}

/* =========================================================
   APP
========================================================= */

function App() {
  const [intro, setIntro] = useState(true);
  const [secret, setSecret] = useState(false);

  const scrollToBooking = () => {
    document
      .getElementById("booking")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const keyHandler = (e) => {
      if (
        (e.code === "Space" || e.code === "Enter") &&
        !e.target.matches("input, textarea, select")
      ) {
        setSecret(true);
      }

      if (e.key === "Escape") {
        setSecret(false);
      }
    };

    window.addEventListener("keydown", keyHandler);

    return () =>
      window.removeEventListener("keydown", keyHandler);
  }, []);

  return (
    <>
      {intro && <CinematicIntro onDone={() => setIntro(false)} />}

      <CustomCursor />

      <ScrollBall />

      <Navbar onSecret={() => setSecret(true)} />

      <main>
        <Hero onBook={scrollToBooking} />
        <Stats />
        <About />
        <Arena />
        <Booking />
        <Contact />
      </main>

      <footer className="footer">
        <div>
          <strong>RADHE</strong>
          <span>BOX CRICKET</span>
        </div>

        <p>
          YOUR GAME. YOUR NIGHT.
        </p>

        <small>
          © 2026 Radhe Box Cricket. All rights reserved.
        </small>
      </footer>

      <SecretCricket
        open={secret}
        onClose={() => setSecret(false)}
      />
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
