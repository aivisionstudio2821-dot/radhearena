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
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setPhase(4), 2000),
      setTimeout(() => setPhase(5), 2500),
      setTimeout(() => setPhase(6), 3000),
      setTimeout(() => setPhase(7), 3500),
      setTimeout(() => setPhase(8), 4000),
      setTimeout(() => setPhase(9), 4500),
      setTimeout(() => onDone(), 5200),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const words = [
    "YOUR GAME.",
    "YOUR NIGHT.",
    "WORK HARD.",
    "PLAY HARDER.",
    "ONE PITCH.",
    "ENDLESS GAMES.",
    "NO EXCUSES.",
    "JUST PLAY.",
  ];

  return (
    <div
      className={`cinematic-intro phase-${phase}`}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100svh",
        minHeight: "100svh",
        background: "#000",
        zIndex: 99999,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="intro-noise" />
      <div className="intro-grid" />

      {/* PARTICLES */}
      <div className="intro-particles">
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${50 + Math.cos(i) * (10 + i * 1.4)}%`,
              top: `${50 + Math.sin(i) * (8 + i * 1.2)}%`,
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              background: "#C9A86A",
              opacity: phase >= 4 ? 0.8 : 0,
              transform: `scale(${phase >= 4 ? 1 : 0})`,
              transition: "all 0.5s ease",
            }}
          />
        ))}
      </div>

      {/* CRICKET BALL */}
      <div
        className="intro-ball"
        style={{
          position: "absolute",
          left: phase >= 4 ? "50%" : "115%",
          top: "50%",
          width: "clamp(52px, 14vw, 78px)",
          height: "clamp(52px, 14vw, 78px)",
          borderRadius: "50%",
          zIndex: 40,
          transform: `
            translate(-50%, -50%)
            rotate(${phase * 720}deg)
            scale(${phase >= 4 ? 1 : 0.85})
          `,
          background:
            "radial-gradient(circle at 30% 25%, #e94b4b 0%, #a71924 42%, #45070b 100%)",
          boxShadow:
            "0 0 25px rgba(167,25,36,.7), 0 0 90px rgba(167,25,36,.35)",
          transition:
            "left 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1)",
        }}
      >
        <span
          style={{
            position: "absolute",
            width: "92%",
            height: "10px",
            left: "4%",
            top: "45%",
            borderTop: "2px dashed rgba(255,255,255,.9)",
            transform: "rotate(-35deg)",
          }}
        />

        <span
          style={{
            position: "absolute",
            inset: "8px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,.12)",
          }}
        />
      </div>

      {/* FLASH */}
      <div
        className="intro-flash"
        style={{
          position: "absolute",
          width: "45vw",
          height: "45vw",
          maxWidth: "320px",
          maxHeight: "320px",
          borderRadius: "50%",
          background: "#fff",
          filter: "blur(35px)",
          opacity: phase === 4 ? 0.9 : 0,
          zIndex: 30,
          transition: "opacity .18s ease",
          pointerEvents: "none",
        }}
      />

      {/* TEXT */}
      <div
        className="intro-copy"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "94vw",
          height: "130px",
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        {words.map((word, index) => {
          const wordPhase = index + 1;
          const visible = phase === wordPhase;

          return (
            <div
              key={word}
              className={`intro-word word-${wordPhase}`}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                fontFamily: '"Barlow Condensed", sans-serif',
                fontWeight: 900,
                fontSize: "clamp(2.7rem, 12.5vw, 5rem)",
                lineHeight: 0.88,
                letterSpacing: "-0.045em",
                whiteSpace: "nowrap",
                color: "#F4F1E8",
                opacity: visible ? 1 : 0,
                transform: visible
                  ? "translateY(0) scale(1)"
                  : "translateY(20px) scale(.95)",
                filter: visible ? "blur(0)" : "blur(8px)",
                transition:
                  "opacity .28s ease, transform .28s ease, filter .28s ease",
                pointerEvents: "none",
              }}
            >
              {word}
            </div>
          );
        })}

        {/* FINAL */}
        <div
          className="intro-final"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            fontFamily: '"Barlow Condensed", sans-serif',
            fontWeight: 900,
            fontSize: "clamp(2.6rem, 12vw, 4.8rem)",
            lineHeight: 0.88,
            letterSpacing: "-0.045em",
            whiteSpace: "nowrap",
            color: "#F4F1E8",
            opacity: phase === 9 ? 1 : 0,
            transform:
              phase === 9
                ? "translateY(0) scale(1)"
                : "translateY(20px) scale(.95)",
            filter: phase === 9 ? "blur(0)" : "blur(8px)",
            transition:
              "opacity .35s ease, transform .35s ease, filter .35s ease",
          }}
        >
          THIS IS{" "}
          <strong
            style={{
              color: "#C9A86A",
              marginLeft: "10px",
            }}
          >
            RADHE.
          </strong>
        </div>
      </div>

      {/* BRAND */}
      <div
        className="intro-brand"
        style={{
          position: "absolute",
          bottom: "28px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 70,
          width: "100%",
          textAlign: "center",
          color: "#C9A86A",
          fontSize: "9px",
          fontWeight: 700,
          letterSpacing: ".25em",
        }}
      >
        <strong>RADHE</strong>
        <span style={{ marginLeft: "8px" }}>
          BOX CRICKET
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   CUSTOM CURSOR
========================================================= */

function CustomCursor() {
  useEffect(() => {
    const cursor = document.querySelector(".custom-cursor");
    if (!cursor) return;

    const move = (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    const down = () => cursor.classList.add("cursor-down");
    const up = () => cursor.classList.remove("cursor-down");

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  return (
    <div className="custom-cursor">
      <div className="cursor-ring" />
      <div className="cursor-ball">
        <i />
      </div>
      <span className="cursor-cross horizontal" />
      <span className="cursor-cross vertical" />
    </div>
  );
}

/* =========================================================
   LOGO
========================================================= */

function Logo({ onSecret }) {
  const [tapCount, setTapCount] = useState(0);

  const handleTap = () => {
    const next = tapCount + 1;
    setTapCount(next);

    if (next >= 5) {
      setTapCount(0);
      onSecret();
    }

    setTimeout(() => setTapCount(0), 1800);
  };

  return (
    <button className="logo" onClick={handleTap}>
      <span className="logo-mark">R</span>
      <span>
        <strong>RADHE</strong>
        <small>BOX CRICKET</small>
      </span>
    </button>
  );
}

/* =========================================================
   NAVBAR
========================================================= */

function Navbar({ onSecret }) {
  const [open, setOpen] = useState(false);

  const go = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <nav className="navbar">
      <Logo onSecret={onSecret} />

      <div className={`nav-links ${open ? "open" : ""}`}>
        <button onClick={() => go("home")}>HOME</button>
        <button onClick={() => go("arena")}>ARENA</button>
        <button onClick={() => go("booking")}>BOOK</button>
        <button onClick={() => go("contact")}>CONTACT</button>
      </div>

      <button
        className="nav-book"
        onClick={() => go("booking")}
      >
        BOOK SLOT
        <ArrowRight size={16} />
      </button>

      <button
        className="mobile-menu"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        {open ? <X /> : <Menu />}
      </button>
    </nav>
  );
}

/* =========================================================
   SCROLL BALL
========================================================= */

function ScrollBall() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const max =
        document.documentElement.scrollHeight -
        window.innerHeight;

      setProgress(max > 0 ? window.scrollY / max : 0);
    };

    window.addEventListener("scroll", update, {
      passive: true,
    });

    update();

    return () => window.removeEventListener("scroll", update);
  }, []);

  const style = {
    left: `${88 - progress * 76}%`,
    top: `${18 + progress * 65}%`,
    transform: `translate(-50%, -50%) rotate(${
      progress * 1800
    }deg)`,
  };

  return (
    <div className="scroll-ball" style={style}>
      <span />
    </div>
  );
}

/* =========================================================
   HERO
========================================================= */

function Hero({ onBook }) {
  return (
    <section id="home" className="hero">
      <div className="hero-glow" />

      <div className="hero-content">
        <div className="eyebrow">
          <span />
          AHMEDABAD'S NIGHT CRICKET EXPERIENCE
        </div>

        <h1>
          YOUR GAME.
          <br />
          <em>YOUR NIGHT.</em>
        </h1>

        <p>
          Step onto the pitch. Bring your squad.
          <br />
          Play the game your way.
        </p>

        <div className="hero-actions">
          <button className="gold-btn" onClick={onBook}>
            BOOK YOUR SLOT
            <ArrowRight size={18} />
          </button>

          <button
            className="ghost-btn"
            onClick={() =>
              document
                .getElementById("arena")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            EXPLORE ARENA
          </button>
        </div>

        <div className="hero-meta">
          <span>
            <MapPin size={14} />
            AHMEDABAD
          </span>
          <span>
            <Clock3 size={14} />
            06:00 AM — 12:00 AM
          </span>
        </div>
      </div>

      <div className="hero-side">
        <span>EST.</span>
        <strong>2026</strong>
      </div>

      <div className="scroll-indicator">
        <span>SCROLL TO PLAY</span>
        <div />
      </div>
    </section>
  );
}

/* =========================================================
   STATS
========================================================= */

function Stats() {
  const data = [
    ["01", "Premium", "Box Cricket Arena"],
    ["02", "₹800", "Day Slot / Hour"],
    ["03", "₹1100", "Night Slot / Hour"],
    ["04", "18", "Hours Of Play"],
  ];

  return (
    <section className="stats-section">
      {data.map(([num, value, label]) => (
        <div className="stat" key={num}>
          <small>{num}</small>
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}

/* =========================================================
   ABOUT
========================================================= */

function About() {
  return (
    <section className="about section-pad">
      <div className="section-kicker">
        <span>01</span>
        THE RADHE EXPERIENCE
      </div>

      <div className="about-grid">
        <div>
          <h2>
            NOT JUST A
            <br />
            <span>CRICKET BOX.</span>
          </h2>
        </div>

        <div className="about-copy">
          <p className="large-copy">
            Radhe is built for the nights when your group
            needs more than just another plan.
          </p>

          <p>
            A premium box-cricket experience designed for
            friends, teams, celebrations and competitive
            games — all under one roof.
          </p>

          <div className="about-points">
            <div>
              <ShieldCheck />
              <span>Professional setup</span>
            </div>
            <div>
              <Zap />
              <span>Fast booking</span>
            </div>
            <div>
              <Users />
              <span>Built for squads</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   ARENA
========================================================= */

function Arena() {
  const cards = [
    {
      icon: Trophy,
      number: "01",
      title: "COMPETITIVE PLAY",
      text: "Bring your strongest squad and settle the score.",
    },
    {
      icon: Sparkles,
      number: "02",
      title: "NIGHT VIBES",
      text: "Lights on. Music up. Game face on.",
    },
    {
      icon: Users,
      number: "03",
      title: "SQUAD TIME",
      text: "Perfect for friends, teams and celebrations.",
    },
  ];

  return (
    <section id="arena" className="arena section-pad">
      <div className="section-heading">
        <div className="section-kicker">
          <span>02</span>
          WHY RADHE
        </div>

        <h2>
          BUILT TO
          <br />
          <span>PLAY DIFFERENT.</span>
        </h2>
      </div>

      <div className="arena-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article className="arena-card" key={card.number}>
              <div className="card-top">
                <span>{card.number}</span>
                <Icon size={24} />
              </div>

              <h3>{card.title}</h3>

              <p>{card.text}</p>

              <div className="card-line" />
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* =========================================================
   DATE PICKER
========================================================= */

function DatePicker({ value, onChange }) {
  const dates = useMemo(() => {
    return Array.from({ length: 14 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);

      const iso = new Date(
        date.getTime() -
          date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];

      return {
        iso,
        day: date.toLocaleDateString("en-IN", {
          weekday: "short",
        }),
        number: date.getDate(),
        month: date.toLocaleDateString("en-IN", {
          month: "short",
        }),
      };
    });
  }, []);

  return (
    <div className="date-picker">
      {dates.map((date) => (
        <button
          key={date.iso}
          className={value === date.iso ? "selected" : ""}
          onClick={() => onChange(date.iso)}
        >
          <span>{date.day}</span>
          <strong>{date.number}</strong>
          <small>{date.month}</small>
        </button>
      ))}
    </div>
  );
}

/* =========================================================
   BOOKING
========================================================= */

function Booking() {
  const [date, setDate] = useState(todayString());
  const [duration, setDuration] = useState(1);
  const [selectedHour, setSelectedHour] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [players, setPlayers] = useState(8);

  const [blocked, setBlocked] = useState([]);
  const [booked, setBooked] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSelectedHour(null);
    loadAvailability();
  }, [date]);

  const loadAvailability = async () => {
    setLoadingSlots(true);
    setMessage("");

    if (!supabase) {
      setBlocked([]);
      setBooked([]);
      setLoadingSlots(false);
      return;
    }

    const [blockedRes, bookedRes] = await Promise.all([
      supabase
        .from("blocked_slots")
        .select("start_time,end_time")
        .eq("date", date),

      supabase
        .from("bookings")
        .select(
          "slot,start_time,end_time,status,duration_hours"
        )
        .eq("date", date)
        .in("status", ["Pending", "Approved"]),
    ]);

    setBlocked(
      blockedRes.data?.map((x) => x.start_time) || []
    );

    setBooked(
      bookedRes.data?.map((x) => {
        if (x.start_time) {
          return Number(x.start_time.slice(0, 2));
        }

        return Number(
          String(x.slot || "").match(/\d+/)?.[0]
        );
      }) || []
    );

    setLoadingSlots(false);
  };

  const available = (hour) => {
    if (duration === 2 && hour > 22) return false;

    if (blocked.includes(
      `${String(hour).padStart(2, "0")}:00`
    )) {
      return false;
    }

    if (booked.includes(hour)) return false;

    if (duration === 2) {
      if (blocked.includes(
        `${String(hour + 1).padStart(2, "0")}:00`
      )) {
        return false;
      }

      if (booked.includes(hour + 1)) return false;
    }

    return true;
  };

  const totalPrice =
    selectedHour === null
      ? 0
      : duration === 2
      ? priceForHour(selectedHour) +
        priceForHour(selectedHour + 1)
      : priceForHour(selectedHour);

  const submitBooking = async (e) => {
    e.preventDefault();

    setMessage("");

    if (selectedHour === null) {
      setMessage("Please select a slot.");
      return;
    }

    if (!name.trim() || phone.trim().length < 10) {
      setMessage("Please enter a valid name and phone number.");
      return;
    }

    if (!supabase) {
      setMessage(
        "Supabase is not connected. Add your environment variables first."
      );
      return;
    }

    setSubmitting(true);

    try {
      const startTime = `${String(selectedHour).padStart(
        2,
        "0"
      )}:00`;

      const { data, error } = await supabase.rpc(
        "create_radhe_booking",
        {
          p_name: name.trim(),
          p_phone: phone.trim(),
          p_date: date,
          p_start_time: startTime,
          p_players: Number(players),
          p_duration_hours: duration,
        }
      );

      if (error) throw error;

      const booking = Array.isArray(data) ? data[0] : data;

      const endHour = selectedHour + duration;

      const whatsappText = [
        "🏏 RADHE BOX CRICKET BOOKING",
        "",
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Date: ${date}`,
        `Slot: ${hourLabel(selectedHour)} - ${safeHourLabel(
          endHour
        )}`,
        `Duration: ${duration} hour${
          duration > 1 ? "s" : ""
        }`,
        `Players: ${players}`,
        `Amount: ₹${totalPrice}`,
        "",
        "Booking status: Pending approval",
        booking?.id ? `Booking ID: ${booking.id}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          whatsappText
        )}`,
        "_blank"
      );

      setMessage(
        "Booking request sent! WhatsApp confirmation opened."
      );

      setSelectedHour(null);
      await loadAvailability();
    } catch (error) {
      console.error(error);

      setMessage(
        error?.message ||
          "Booking failed. Please try another slot."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="booking" className="booking section-pad">
      <div className="section-kicker">
        <span>03</span>
        BOOK YOUR GAME
      </div>

      <div className="booking-layout">
        <div className="booking-info">
          <h2>
            YOUR SLOT.
            <br />
            <span>YOUR CALL.</span>
          </h2>

          <p>
            Pick your date, choose your game duration and
            lock in your pitch.
          </p>

          <div className="price-box">
            <div>
              <span>DAY</span>
              <strong>₹800</strong>
              <small>06:00 AM — 05:00 PM</small>
            </div>

            <div>
              <span>NIGHT</span>
              <strong>₹1100</strong>
              <small>05:00 PM — 12:00 AM</small>
            </div>
          </div>
        </div>

        <form
          className="booking-panel"
          onSubmit={submitBooking}
        >
          <div className="form-section">
            <label>
              <CalendarDays size={16} />
              SELECT DATE
            </label>

            <DatePicker
              value={date}
              onChange={setDate}
            />
          </div>

          <div className="form-section">
            <label>
              <Clock3 size={16} />
              GAME DURATION
            </label>

            <div className="duration-switch">
              <button
                type="button"
                className={duration === 1 ? "active" : ""}
                onClick={() => {
                  setDuration(1);
                  setSelectedHour(null);
                }}
              >
                1 HOUR
              </button>

              <button
                type="button"
                className={duration === 2 ? "active" : ""}
                onClick={() => {
                  setDuration(2);
                  setSelectedHour(null);
                }}
              >
                2 HOURS
              </button>
            </div>
          </div>

          <div className="form-section">
            <label>
              <Zap size={16} />
              AVAILABLE SLOTS
            </label>

            {loadingSlots ? (
              <div className="slot-loading">
                CHECKING LIVE AVAILABILITY...
              </div>
            ) : (
              <div className="slot-grid">
                {slots
                  .filter(
                    (hour) =>
                      duration === 1 || hour <= 22
                  )
                  .map((hour) => {
                    const isAvailable = available(hour);
                    const selected =
                      selectedHour === hour;

                    const endHour = hour + duration;

                    const price =
                      duration === 2
                        ? priceForHour(hour) +
                          priceForHour(hour + 1)
                        : priceForHour(hour);

                    return (
                      <button
                        type="button"
                        key={hour}
                        disabled={!isAvailable}
                        className={[
                          "slot",
                          selected ? "selected" : "",
                          !isAvailable ? "disabled" : "",
                        ].join(" ")}
                        onClick={() =>
                          setSelectedHour(hour)
                        }
                      >
                        <strong>
                          {hourLabel(hour)}
                        </strong>

                        <span>
                          {hourLabel(hour)} →{" "}
                          {safeHourLabel(endHour)}
                        </span>

                        <small>
                          {!isAvailable
                            ? "UNAVAILABLE"
                            : duration === 2
                            ? `2 HOURS • ₹${price}`
                            : `₹${price}`}
                        </small>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="form-fields">
            <div>
              <label>YOUR NAME</label>
              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter name"
              />
            </div>

            <div>
              <label>PHONE NUMBER</label>
              <input
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                maxLength={10}
                placeholder="10 digit number"
              />
            </div>

            <div>
              <label>PLAYERS</label>
              <select
                value={players}
                onChange={(e) =>
                  setPlayers(e.target.value)
                }
              >
                {Array.from(
                  { length: 30 },
                  (_, i) => i + 1
                ).map((n) => (
                  <option key={n} value={n}>
                    {n} players
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedHour !== null && (
            <div className="booking-summary">
              <div>
                <span>SELECTED</span>
                <strong>
                  {hourLabel(selectedHour)} —{" "}
                  {safeHourLabel(
                    selectedHour + duration
                  )}
                </strong>
              </div>

              <div>
                <span>TOTAL</span>
                <strong>₹{totalPrice}</strong>
              </div>
            </div>
          )}

          {message && (
            <div className="booking-message">
              {message}
            </div>
          )}

          <button
            className="submit-booking"
            disabled={submitting}
          >
            {submitting
              ? "PROCESSING..."
              : "REQUEST BOOKING"}
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </section>
  );
}

/* =========================================================
   CONTACT
========================================================= */

function Contact() {
  return (
    <section id="contact" className="contact section-pad">
      <div className="contact-inner">
        <div className="section-kicker">
          <span>04</span>
          FIND RADHE
        </div>

        <h2>
          READY TO
          <br />
          <span>PLAY?</span>
        </h2>

        <p>
          Gather the squad. Pick a slot.
          <br />
          We'll handle the rest.
        </p>

        <div className="contact-actions">
          <a
            href="https://www.instagram.com/radhe_box_cricket/"
            target="_blank"
            rel="noreferrer"
          >
            <Instagram size={18} />
            @RADHE_BOX_CRICKET
          </a>

          <a href="tel:+917046706848">
            <Phone size={18} />
            CALL RADHE
          </a>
        </div>

        <div className="contact-location">
          <MapPin size={18} />
          <span>
            Ahmedabad, Gujarat
            <small>Exact location shared after booking</small>
          </span>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SECRET CRICKET MODE
========================================================= */

function SecretCricket({ open, onClose }) {
  const [score, setScore] = useState(0);
  const [balls, setBalls] = useState(0);

  if (!open) return null;

  const hit = () => {
    if (balls >= 6) return;

    const runs = [1, 2, 4, 6][
      Math.floor(Math.random() * 4)
    ];

    setScore((x) => x + runs);
    setBalls((x) => x + 1);
  };

  const reset = () => {
    setScore(0);
    setBalls(0);
  };

  return (
    <div className="secret-overlay">
      <button className="secret-close" onClick={onClose}>
        <X />
      </button>

      <div className="secret-game">
        <span className="secret-kicker">
          SECRET CRICKET MODE
        </span>

        <h2>
          HIT THE
          <br />
          <span>BOUNDARY.</span>
        </h2>

        <div className="scoreboard">
          <div>
            <small>SCORE</small>
            <strong>{score}</strong>
          </div>

          <div>
            <small>BALLS</small>
            <strong>{balls}/6</strong>
          </div>
        </div>

        <button
          className="cricket-hit"
          onClick={hit}
          disabled={balls >= 6}
        >
          {balls >= 6 ? "INNINGS OVER" : "HIT THE BALL"}
        </button>

        <button className="reset-game" onClick={reset}>
          RESET
        </button>
      </div>
    </div>
  );
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
