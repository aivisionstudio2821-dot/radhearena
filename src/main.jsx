import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createRoot } from "react-dom/client";

import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Instagram,
  Lock,
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

/* =========================================================
   CONFIG
========================================================= */

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "";

const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

const WHATSAPP =
  import.meta.env.VITE_WHATSAPP_NUMBER ||
  "917046706848";

const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

/* =========================================================
   PRICING
========================================================= */

const DAY_RATE = 800;
const NIGHT_RATE = 1100;

/*
  Arena timings:
  06:00 AM → 12:00 AM

  Starts:
  06 → 23
*/

const slots = Array.from(
  { length: 18 },
  (_, index) => index + 6
);

/* =========================================================
   HELPERS
========================================================= */

function hourLabel(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${String(displayHour).padStart(
    2,
    "0"
  )}:00 ${suffix}`;
}

function safeHourLabel(hour) {
  const normalized = hour >= 24 ? hour - 24 : hour;

  return hourLabel(normalized);
}

function slotLabel(hour, duration = 1) {
  return `${hourLabel(hour)} — ${safeHourLabel(
    hour + duration
  )}`;
}

function rateForHour(hour) {
  return hour < 17 ? DAY_RATE : NIGHT_RATE;
}

function priceFor(hour, duration) {
  return Array.from(
    { length: duration },
    (_, index) => rateForHour(hour + index)
  ).reduce((total, rate) => total + rate, 0);
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

/* =========================================================
   CUSTOM CURSOR
========================================================= */

function CustomCursor() {
  const [position, setPosition] = useState({
    x: -100,
    y: -100,
  });

  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    const move = (event) => {
      setPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const interactive =
        event.target.closest(
          "button, a, input, select, textarea, .slot, .dates button, .duration button"
        );

      setHover(Boolean(interactive));
    };

    const pointerDown = () => setDown(true);
    const pointerUp = () => setDown(false);

    window.addEventListener(
      "pointermove",
      move,
      { passive: true }
    );

    window.addEventListener(
      "pointerdown",
      pointerDown
    );

    window.addEventListener(
      "pointerup",
      pointerUp
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        move
      );

      window.removeEventListener(
        "pointerdown",
        pointerDown
      );

      window.removeEventListener(
        "pointerup",
        pointerUp
      );
    };
  }, []);

  return (
    <div
      className={`custom-cursor ${
        hover ? "is-hover" : ""
      } ${down ? "is-down" : ""}`}
      style={{
        left: position.x,
        top: position.y,
      }}
      aria-hidden="true"
    >
      <span className="cursor-ring" />

      <span className="cursor-ball">
        <i />
      </span>
    </div>
  );
}

/* =========================================================
   CINEMATIC INTRO
========================================================= */

function CinematicIntro({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDone();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="intro">
      <div className="intro-grid" />

      <div className="stadium-light light-a" />
      <div className="stadium-light light-b" />

      <div className="intro-noise" />

      <div className="intro-top">
        RADHE / ARENA 01
      </div>

      <div className="intro-ball">
        <i />
      </div>

      <div className="bat">
        <span />
      </div>

      <div className="impact-flash" />

      <div className="intro-center">
        <div className="intro-brand">
          RADHE
        </div>

        <div className="intro-sub">
          BOX CRICKET
        </div>
      </div>

      <div className="impact">
        YOUR GAME. YOUR NIGHT.
      </div>

      <div className="intro-bottom">
        AHMEDABAD • PRIVATE BOX CRICKET
      </div>
    </div>
  );
}

/* =========================================================
   SCROLL BALL
========================================================= */

function ScrollBall() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      if (ticking) return;

      ticking = true;

      requestAnimationFrame(() => {
        const max =
          document.documentElement.scrollHeight -
          window.innerHeight;

        const value =
          max > 0
            ? window.scrollY / max
            : 0;

        setProgress(
          Math.max(0, Math.min(1, value))
        );

        ticking = false;
      });
    };

    window.addEventListener(
      "scroll",
      update,
      { passive: true }
    );

    update();

    return () =>
      window.removeEventListener(
        "scroll",
        update
      );
  }, []);

  const left =
    86 - progress * 70;

  const top =
    17 + progress * 72;

  const rotation =
    progress * 1800;

  return (
    <div
      className="scroll-ball"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <i />
    </div>
  );
}

/* =========================================================
   LOGO / SECRET TRIGGER
========================================================= */

function Logo({ onSecret }) {
  const taps = useRef(0);
  const timer = useRef(null);

  const handleClick = () => {
    taps.current += 1;

    clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      taps.current = 0;
    }, 900);

    if (taps.current >= 5) {
      taps.current = 0;
      onSecret();
    }
  };

  return (
    <button
      className="logo"
      onClick={handleClick}
      aria-label="Radhe Box Cricket"
    >
      <span className="logo-mark">
        R
      </span>

      <span className="logo-name">
        RADHE
        <span>BOX CRICKET</span>
      </span>
    </button>
  );
}

/* =========================================================
   NAVBAR
========================================================= */

function Navbar({
  onBook,
  onSecret,
}) {
  const [open, setOpen] =
    useState(false);

  const go = (id) => {
    setOpen(false);

    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  return (
    <header className="nav">
      <Logo onSecret={onSecret} />

      <nav
        className={
          open
            ? "mobile-open"
            : ""
        }
      >
        {[
          ["home", "Home"],
          ["about", "About"],
          ["arena", "Arena"],
          ["book", "Book"],
          ["contact", "Contact"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => go(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <button
        className="nav-cta"
        onClick={onBook}
      >
        BOOK YOUR SLOT
        <ArrowRight size={16} />
      </button>

      <button
        className="menu"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}

/* =========================================================
   HERO
========================================================= */

function Hero({ onBook }) {
  return (
    <section
      id="home"
      className="hero section"
    >
      <div className="hero-grid" />
      <div className="hero-orb" />

      <div className="hero-copy reveal">
        <p className="eyebrow">
          <span />
          AHMEDABAD • PRIVATE BOX CRICKET
        </p>

        <h1>
          YOUR GAME.
          <br />
          <em>YOUR NIGHT.</em>
        </h1>

        <p className="hero-text">
          A premium box-cricket arena
          built for fast games,
          competitive nights and
          serious fun.
        </p>

        <div className="hero-actions">
          <button
            className="primary"
            onClick={onBook}
          >
            BOOK YOUR SLOT
            <ArrowRight />
          </button>

          <button
            className="ghost hero-explore"
            onClick={() =>
              document
                .getElementById("arena")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            EXPLORE ARENA
          </button>
        </div>

        <div className="hero-meta">
          <span>
            <MapPin />
            Ahmedabad
          </span>

          <span>
            <Zap />
            Day + Night Sessions
          </span>

          <span>
            <ShieldCheck />
            Secure Booking
          </span>
        </div>
      </div>

      <div className="hero-score reveal">
        <span>RADHE</span>

        <strong>01</strong>

        <small>
          BOX CRICKET / ARENA
        </small>
      </div>

      <div className="hero-corner">
        <span>06:00</span>
        <span>—</span>
        <span>00:00</span>
      </div>
    </section>
  );
}

/* =========================================================
   STATS
========================================================= */

function Stats() {
  return (
    <section className="stats">
      <div>
        <strong>18</strong>
        <span>HOURLY SLOTS</span>
      </div>

      <div>
        <strong>2×</strong>
        <span>POWER SESSION</span>
      </div>

      <div>
        <strong>₹800</strong>
        <span>DAY / HOUR</span>
      </div>

      <div>
        <strong>₹1100</strong>
        <span>NIGHT / HOUR</span>
      </div>
    </section>
  );
}

/* =========================================================
   ABOUT
========================================================= */

function About() {
  return (
    <section
      id="about"
      className="section about"
    >
      <div className="section-tag">
        01 / THE EXPERIENCE
      </div>

      <div className="two-col">
        <div>
          <h2>
            NOT JUST A
            <br />
            <em>CRICKET GROUND.</em>
          </h2>
        </div>

        <div>
          <p className="lead">
            A private box-cricket
            experience designed around
            the way Ahmedabad actually
            plays — quick games,
            competitive nights and zero
            booking chaos.
          </p>

          <p className="muted">
            Premium turf, flood lighting,
            clean facilities and a booking
            system that tells you exactly
            when your game starts.
          </p>
        </div>
      </div>

      <div className="about-strip">
        <div>
          <span>01</span>
          <strong>PLAY</strong>
        </div>

        <div>
          <span>02</span>
          <strong>COMPETE</strong>
        </div>

        <div>
          <span>03</span>
          <strong>REPEAT</strong>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   ARENA
========================================================= */

function Arena() {
  const items = [
    [
      "01",
      "PREMIUM TURF",
      "Fast, clean playing surface.",
      Trophy,
    ],
    [
      "02",
      "FLOOD LIGHTS",
      "Built for night sessions.",
      Zap,
    ],
    [
      "03",
      "BOX SETUP",
      "Tight boundaries. Faster games.",
      Sparkles,
    ],
    [
      "04",
      "SEATING",
      "Watch the game between innings.",
      Users,
    ],
    [
      "05",
      "PARKING",
      "Easy arrival, easy exit.",
      MapPin,
    ],
    [
      "06",
      "CLEAN FACILITIES",
      "A comfortable arena experience.",
      ShieldCheck,
    ],
  ];

  return (
    <section
      id="arena"
      className="section arena"
    >
      <div className="section-head">
        <div>
          <div className="section-tag">
            02 / THE ARENA
          </div>

          <h2>
            BUILT FOR
            <br />
            <em>GAME NIGHT.</em>
          </h2>
        </div>

        <p>
          Every detail is designed
          to keep the focus on the game.
        </p>
      </div>

      <div className="feature-grid">
        {items.map(
          ([
            number,
            title,
            description,
            Icon,
          ]) => (
            <article key={number}>
              <span>{number}</span>

              <Icon />

              <h3>{title}</h3>

              <p>{description}</p>
            </article>
          )
        )}
      </div>
    </section>
  );
}

/* =========================================================
   DATE PICKER
========================================================= */

function DatePicker({
  date,
  setDate,
}) {
  const dates = useMemo(
    () =>
      Array.from(
        { length: 10 },
        (_, index) => {
          const current =
            new Date();

          current.setHours(
            0,
            0,
            0,
            0
          );

          current.setDate(
            current.getDate() +
              index
          );

          return current;
        }
      ),
    []
  );

  return (
    <div className="dates">
      {dates.map((dateItem) => {
        const value =
          isoDate(dateItem);

        return (
          <button
            key={value}
            className={
              date === value
                ? "selected"
                : ""
            }
            onClick={() =>
              setDate(value)
            }
          >
            <small>
              {dateItem
                .toLocaleDateString(
                  "en-IN",
                  {
                    weekday: "short",
                  }
                )
                .toUpperCase()}
            </small>

            <strong>
              {dateItem.getDate()}
            </strong>

            <span>
              {dateItem
                .toLocaleDateString(
                  "en-IN",
                  {
                    month: "short",
                  }
                )
                .toUpperCase()}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   BOOKING SYSTEM
========================================================= */

function Booking({ onSuccess }) {
  const [date, setDate] =
    useState(
      isoDate(new Date())
    );

  const [duration, setDuration] =
    useState(1);

  const [start, setStart] =
    useState(null);

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [players, setPlayers] =
    useState(6);

  const [blocked, setBlocked] =
    useState([]);

  const [booked, setBooked] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  /* -------------------------------------------------------
     LOAD AVAILABILITY
  ------------------------------------------------------- */

  const loadAvailability =
    async () => {
      if (!supabase) return;

      const [
        blockedResult,
        bookingResult,
      ] = await Promise.all([
        supabase
          .from("blocked_slots")
          .select("start_time")
          .eq("date", date),

        supabase
          .from("bookings")
          .select(
            "start_time,duration_hours,status"
          )
          .eq("date", date)
          .in("status", [
            "Pending",
            "Approved",
          ]),
      ]);

      const blockedHours =
        (blockedResult.data || [])
          .map((item) =>
            item.start_time?.slice(
              0,
              5
            )
          )
          .filter(Boolean);

      const occupiedHours = [];

      (
        bookingResult.data || []
      ).forEach((booking) => {
        if (!booking.start_time)
          return;

        const hour =
          Number(
            booking.start_time.slice(
              0,
              2
            )
          );

        const durationHours =
          Number(
            booking.duration_hours ||
              1
          );

        for (
          let index = 0;
          index < durationHours;
          index++
        ) {
          occupiedHours.push(
            `${String(
              hour + index
            ).padStart(
              2,
              "0"
            )}:00`
          );
        }
      });

      setBlocked(
        blockedHours
      );

      setBooked(
        occupiedHours
      );
    };

  useEffect(() => {
    loadAvailability();
  }, [date]);

  /* -------------------------------------------------------
     AVAILABILITY CHECK
  ------------------------------------------------------- */

  const available = (hour) => {
    const current =
      `${String(hour).padStart(
        2,
        "0"
      )}:00`;

    /* Current hour */
    if (
      blocked.includes(current) ||
      booked.includes(current)
    ) {
      return false;
    }

    /* Single booking */
    if (duration === 1) {
      return true;
    }

    /* Two-hour booking */

    const nextHour =
      hour + 1;

    if (nextHour >= 24) {
      return false;
    }

    const next =
      `${String(nextHour).padStart(
        2,
        "0"
      )}:00`;

    if (
      blocked.includes(next) ||
      booked.includes(next)
    ) {
      return false;
    }

    return true;
  };

  const total =
    start === null
      ? 0
      : priceFor(
          start,
          duration
        );

  /* -------------------------------------------------------
     BOOK
  ------------------------------------------------------- */

  const submit = async (
    event
  ) => {
    event.preventDefault();

    setMessage("");

    if (
      !name.trim() ||
      !/^[6-9]\d{9}$/.test(
        phone
      ) ||
      start === null
    ) {
      setMessage(
        "Enter your name, valid mobile number and a slot."
      );

      return;
    }

    setLoading(true);

    try {
      if (!supabase) {
        throw new Error(
          "Supabase is not configured. Add your Vercel environment variables."
        );
      }

      const {
        data,
        error,
      } = await supabase.rpc(
        "create_radhe_booking",
        {
          p_name:
            name.trim(),

          p_phone:
            phone,

          p_date:
            date,

          p_start_time:
            `${String(
              start
            ).padStart(
              2,
              "0"
            )}:00`,

          p_duration_hours:
            duration,

          p_players:
            players,

          p_total_price:
            total,

          p_slot_label:
            slotLabel(
              start,
              duration
            ),
        }
      );

      if (error) {
        throw error;
      }

      const whatsappText =
        [
          "🏏 RADHE BOX CRICKET BOOKING",
          "",
          `Name: ${name}`,
          `Date: ${date}`,
          `Time: ${slotLabel(
            start,
            duration
          )}`,
          `Players: ${players}`,
          `Duration: ${duration} hour${
            duration > 1
              ? "s"
              : ""
          }`,
          `Amount: ₹${total}`,
          "Status: Pending",
        ].join("\n");

      window.open(
        `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
          whatsappText
        )}`,
        "_blank"
      );

      onSuccess?.(data);

      setMessage(
        "Booking request sent successfully. WhatsApp confirmation is ready."
      );

      setName("");
      setPhone("");
      setStart(null);

      await loadAvailability();
    } catch (error) {
      setMessage(
        error?.message ||
          "Booking failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  return (
    <section
      id="book"
      className="section booking"
    >
      <div className="section-tag">
        03 / BOOK YOUR GAME
      </div>

      <div className="booking-head">
        <div>
          <h2>
            LOCK IN
            <br />
            <em>GAME TIME.</em>
          </h2>

          <p>
            Pick a date, choose your
            session and let the arena
            handle the rest.
          </p>
        </div>

        <div className="duration">
          <button
            type="button"
            className={
              duration === 1
                ? "on"
                : ""
            }
            onClick={() => {
              setDuration(1);
              setStart(null);
            }}
          >
            1 HOUR
          </button>

          <button
            type="button"
            className={
              duration === 2
                ? "on"
                : ""
            }
            onClick={() => {
              setDuration(2);
              setStart(null);
            }}
          >
            2 HOURS
            <span>
              POWER SESSION
            </span>
          </button>
        </div>
      </div>

      <div className="booking-mode-note">
        <Clock3 size={15} />

        {duration === 1 ? (
          <span>
            Standard 1-hour game
          </span>
        ) : (
          <span>
            <strong>
              2 consecutive hours
            </strong>{" "}
            — both slots must be available
          </span>
        )}
      </div>

      <DatePicker
        date={date}
        setDate={(value) => {
          setDate(value);
          setStart(null);
        }}
      />

      <div className="slot-panel">
        <div className="slot-top">
          <span>
            <Clock3 />
            AVAILABLE SESSIONS
          </span>

          <small>
            DAY ₹800 / HR
            {" • "}
            NIGHT ₹1100 / HR
          </small>
        </div>

        <div className="slot-grid">
          {slots.map((hour) => {
            const isAvailable =
              available(hour);

            const selected =
              start === hour;

            const currentKey =
              `${String(
                hour
              ).padStart(
                2,
                "0"
              )}:00`;

            const isBlocked =
              blocked.includes(
                currentKey
              );

            let statusText =
              `₹${priceFor(
                hour,
                duration
              )}`;

            if (!isAvailable) {
              statusText =
                isBlocked
                  ? "BLOCKED"
                  : "BOOKED";
            }

            return (
              <button
                type="button"
                key={hour}
                disabled={!isAvailable}
                className={`slot ${
                  selected
                    ? "selected"
                    : ""
                } ${
                  !isAvailable
                    ? "off"
                    : ""
                }`}
                onClick={() =>
                  setStart(hour)
                }
              >
                <strong>
                  {hourLabel(hour)}
                </strong>

                <span>
                  {duration === 2
                    ? `2-HOUR • ${hourLabel(
                        hour
                      )} → ${safeHourLabel(
                        hour + 2
                      )}`
                    : `1-HOUR • ${hourLabel(
                        hour
                      )} → ${safeHourLabel(
                        hour + 1
                      )}`}
                </span>

                <small>
                  {statusText}
                </small>
              </button>
            );
          })}
        </div>
      </div>

      <form
        className="booking-form"
        onSubmit={submit}
      >
        <div className="field">
          <label>
            YOUR NAME
          </label>

          <input
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
            placeholder="e.g. Kaustubh"
          />
        </div>

        <div className="field">
          <label>
            MOBILE
          </label>

          <input
            value={phone}
            onChange={(event) =>
              setPhone(
                event.target.value
                  .replace(
                    /\D/g,
                    ""
                  )
                  .slice(0, 10)
              )
            }
            placeholder="10-digit mobile"
            inputMode="numeric"
          />
        </div>

        <div className="field">
          <label>
            PLAYERS
          </label>

          <input
            type="number"
            min="1"
            max="30"
            value={players}
            onChange={(event) =>
              setPlayers(
                Number(
                  event.target.value
                )
              )
            }
          />
        </div>

        <div className="summary">
          <span>
            YOUR GAME TIME
          </span>

          <strong>
            {start !== null
              ? slotLabel(
                  start,
                  duration
                )
              : "Select a slot"}
          </strong>

          <small>
            {start !== null
              ? `₹${total} • ${duration} hour${
                  duration > 1
                    ? "s"
                    : ""
                } • ${players} players`
              : "Choose a session above"}
          </small>
        </div>

        <button
          className="primary submit"
          disabled={loading}
        >
          {loading
            ? "LOCKING..."
            : "CONFIRM BOOKING"}

          <ArrowRight />
        </button>
      </form>

      {message && (
        <div className="notice">
          {message}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   ADMIN
========================================================= */

function Admin({ onClose }) {
  const [session, setSession] =
    useState(null);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [date, setDate] =
    useState(
      isoDate(new Date())
    );

  const [bookings, setBookings] =
    useState([]);

  const [blocked, setBlocked] =
    useState([]);

  const [busy, setBusy] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const refresh = async () => {
    if (!supabase || !session)
      return;

    const [
      bookingResult,
      blockedResult,
    ] = await Promise.all([
      supabase
        .from("bookings")
        .select("*")
        .order("date", {
          ascending: false,
        })
        .order("start_time"),

      supabase
        .from("blocked_slots")
        .select("*")
        .eq("date", date)
        .order("start_time"),
    ]);

    setBookings(
      bookingResult.data || []
    );

    setBlocked(
      blockedResult.data || []
    );
  };

  useEffect(() => {
    if (session) {
      refresh();
    }
  }, [session, date]);

  const login = async (event) => {
    event.preventDefault();

    setMessage("");

    if (!supabase) {
      setMessage(
        "Configure Supabase first."
      );

      return;
    }

    const {
      data,
      error,
    } =
      await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

    if (error) {
      setMessage(
        error.message
      );

      return;
    }

    setSession(
      data.session
    );
  };

  const logout = async () => {
    await supabase?.auth.signOut();
    setSession(null);
  };

  const toggleBlock = async (
    hour
  ) => {
    if (!supabase) return;

    const key =
      `${String(hour).padStart(
        2,
        "0"
      )}:00`;

    const existing =
      blocked.find(
        (item) =>
          item.start_time?.slice(
            0,
            5
          ) === key
      );

    setBusy(true);

    if (existing) {
      await supabase
        .from("blocked_slots")
        .delete()
        .eq("id", existing.id);
    } else {
      await supabase
        .from("blocked_slots")
        .insert({
          date,
          start_time: key,
          end_time:
            `${String(
              hour + 1
            ).padStart(
              2,
              "0"
            )}:00`,
          reason:
            "Blocked by admin",
        });
    }

    setBusy(false);

    await refresh();
  };

  const updateStatus = async (
    id,
    status
  ) => {
    if (!supabase) return;

    await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);

    await refresh();
  };

  if (!session) {
    return (
      <div className="admin-screen">
        <button
          className="close-admin"
          onClick={onClose}
        >
          <X />
        </button>

        <div className="admin-login">
          <div className="section-tag">
            RADHE COMMAND CENTER
          </div>

          <h2>
            CONTROL
            <br />
            <em>THE GAME.</em>
          </h2>

          <form onSubmit={login}>
            <input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
            />

            <button className="primary">
              SIGN IN
              <ArrowRight />
            </button>
          </form>

          {message && (
            <p className="error">
              {message}
            </p>
          )}

          <small>
            Admin access is controlled
            through Supabase Auth.
          </small>
        </div>
      </div>
    );
  }

  const pending =
    bookings.filter(
      (item) =>
        item.status === "Pending"
    ).length;

  const revenue =
    bookings
      .filter(
        (item) =>
          item.status === "Approved"
      )
      .reduce(
        (total, item) =>
          total +
          Number(
            item.total_price || 0
          ),
        0
      );

  return (
    <div className="admin-screen">
      <div className="admin-wrap">
        <div className="admin-bar">
          <div>
            <span className="section-tag">
              RADHE COMMAND CENTER
            </span>

            <h2>
              CONTROL ROOM
            </h2>
          </div>

          <div className="admin-bar-actions">
            <button
              className="ghost"
              onClick={logout}
            >
              LOG OUT
            </button>

            <button
              className="close-admin"
              onClick={onClose}
            >
              <X />
            </button>
          </div>
        </div>

        <div className="admin-stats">
          <div>
            <small>
              ALL BOOKINGS
            </small>

            <strong>
              {bookings.length}
            </strong>
          </div>

          <div>
            <small>
              PENDING
            </small>

            <strong>
              {pending}
            </strong>
          </div>

          <div>
            <small>
              APPROVED REVENUE
            </small>

            <strong>
              ₹{revenue}
            </strong>
          </div>

          <div>
            <small>
              BLOCKED TODAY
            </small>

            <strong>
              {blocked.length}
            </strong>
          </div>
        </div>

        <div className="admin-grid">
          <section className="admin-card">
            <div className="admin-card-head">
              <h3>
                Slot Control
              </h3>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="admin-slots">
              {slots.map((hour) => {
                const blockedItem =
                  blocked.find(
                    (item) =>
                      item.start_time?.slice(
                        0,
                        5
                      ) ===
                      `${String(
                        hour
                      ).padStart(
                        2,
                        "0"
                      )}:00`
                  );

                return (
                  <button
                    disabled={busy}
                    className={
                      blockedItem
                        ? "blocked"
                        : ""
                    }
                    onClick={() =>
                      toggleBlock(
                        hour
                      )
                    }
                    key={hour}
                  >
                    <span>
                      {hourLabel(
                        hour
                      )}
                    </span>

                    <small>
                      {blockedItem
                        ? "BLOCKED"
                        : "AVAILABLE"}
                    </small>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="admin-card">
            <div className="admin-card-head">
              <h3>
                Bookings
              </h3>

              <button
                className="ghost"
                onClick={refresh}
              >
                REFRESH
              </button>
            </div>

            <div className="booking-list">
              {bookings
                .slice(0, 50)
                .map((booking) => (
                  <article
                    key={
                      booking.id
                    }
                  >
                    <div>
                      <strong>
                        {
                          booking.name
                        }
                      </strong>

                      <span>
                        {
                          booking.date
                        }{" "}
                        •{" "}
                        {
                          booking.slot
                        }
                      </span>

                      <small>
                        {
                          booking.players
                        }{" "}
                        players •{" "}
                        {
                          booking.booking_type
                        }{" "}
                        • ₹
                        {
                          booking.total_price
                        }
                      </small>
                    </div>

                    <div className="actions">
                      {booking.status ===
                        "Pending" && (
                        <>
                          <button
                            onClick={() =>
                              updateStatus(
                                booking.id,
                                "Approved"
                              )
                            }
                          >
                            <Check />
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(
                                booking.id,
                                "Rejected"
                              )
                            }
                          >
                            <X />
                          </button>
                        </>
                      )}

                      <b
                        className={
                          booking.status.toLowerCase()
                        }
                      >
                        {
                          booking.status
                        }
                      </b>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SECRET CRICKET
========================================================= */

function SecretCricket({
  close,
}) {
  const [result, setResult] =
    useState("");

  const [score, setScore] =
    useState(0);

  const [ballPosition, setBallPosition] =
    useState(0);

  const swing = () => {
    if (result) return;

    const random =
      30 +
      Math.floor(
        Math.random() * 48
      );

    let runs = 0;

    if (
      random >= 48 &&
      random <= 58
    ) {
      runs = 6;
    } else if (
      random >= 40 &&
      random <= 66
    ) {
      runs = 4;
    } else if (
      random >= 30 &&
      random <= 75
    ) {
      runs = 1;
    }

    setBallPosition(
      random
    );

    setScore(
      (current) =>
        current + runs
    );

    setResult(
      runs === 6
        ? "SIX!"
        : runs === 4
        ? "FOUR!"
        : runs === 1
        ? "SINGLE"
        : "WICKET"
    );
  };

  useEffect(() => {
    const handleKey = (event) => {
      if (
        event.key === " " ||
        event.key === "Enter"
      ) {
        swing();
      }
    };

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      );
  });

  return (
    <div className="game-overlay">
      <button
        className="game-close"
        onClick={close}
      >
        <X />
      </button>

      <div className="game">
        <span className="section-tag">
          SECRET CRICKET MODE
        </span>

        <h2>
          TIME YOUR
          <br />
          <em>SWING.</em>
        </h2>

        <div className="game-score">
          {score}

          <small>
            RUNS
          </small>
        </div>

        <div className="game-pitch">
          <div
            className="game-ball"
            style={{
              left: `${18 +
                ballPosition}%`,
            }}
          />
        </div>

        <p>
          {result ||
            "Press SPACE / ENTER or tap SWING"}
        </p>

        <button
          className="primary"
          onClick={swing}
        >
          SWING
        </button>

        <button
          className="ghost"
          onClick={() => {
            setBallPosition(0);
            setResult("");
            setScore(0);
          }}
        >
          REPLAY
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  const [intro, setIntro] =
    useState(true);

  const [secret, setSecret] =
    useState(false);

  const [admin, setAdmin] =
    useState(false);

  const [toast, setToast] =
    useState("");

  const book = () => {
    document
      .getElementById("book")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const bookingSuccess = () => {
    setToast(
      "Booking request received."
    );

    setTimeout(() => {
      setToast("");
    }, 4000);
  };

  return (
    <>
      {intro && (
        <CinematicIntro
          onDone={() =>
            setIntro(false)
          }
        />
      )}

      <CustomCursor />

      <ScrollBall />

      <Navbar
        onBook={book}
        onSecret={() =>
          setSecret(true)
        }
      />

      <main>
        <Hero onBook={book} />

        <Stats />

        <About />

        <Arena />

        <Booking
          onSuccess={
            bookingSuccess
          }
        />

        <section
          id="contact"
          className="contact section"
        >
          <div>
            <div className="section-tag">
              04 / FIND US
            </div>

            <h2>
              SEE YOU
              <br />
              <em>AT RADHE.</em>
            </h2>
          </div>

          <div className="contact-card">
            <MapPin />

            <strong>
              RADHE BOX CRICKET
            </strong>

            <span>
              Ahmedabad, Gujarat
            </span>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Radhe+Box+Cricket+Ahmedabad"
              target="_blank"
              rel="noreferrer"
            >
              OPEN LOCATION
              <ArrowRight size={16} />
            </a>

            <a
              href="https://instagram.com/radhe_box_cricket"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={16} />
              @radhe_box_cricket
            </a>

            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noreferrer"
            >
              <Phone size={16} />
              WHATSAPP
            </a>
          </div>
        </section>
      </main>

      <footer>
        <span>
          RADHE BOX CRICKET
        </span>

        <span>
          YOUR GAME. YOUR NIGHT.
        </span>

        <button
          onClick={() =>
            setAdmin(true)
          }
        >
          <Lock size={13} />
          ADMIN
        </button>
      </footer>

      {secret && (
        <SecretCricket
          close={() =>
            setSecret(false)
          }
        />
      )}

      {admin && (
        <Admin
          onClose={() =>
            setAdmin(false)
          }
        />
      )}

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </>
  );
}

/* =========================================================
   MOUNT
========================================================= */

createRoot(
  document.getElementById(
    "root"
  )
).render(<App />);
