import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Instagram,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import "./styles.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const ANKIT_PHONE = "7046706848";
const BOOKING_WHATSAPP_NUMBER = "918160885601";

const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

const DAY_RATE = 800;
const NIGHT_RATE = 1100;

const OPEN_HOUR = 6;
const CLOSE_HOUR = 24;

const slots = Array.from(
  { length: CLOSE_HOUR - OPEN_HOUR },
  (_, i) => i + OPEN_HOUR
);

const hourLabel = (hour) => {
  const h = hour % 12 || 12;
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${h}:00 ${suffix}`;
};

const todayString = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();

  return new Date(d.getTime() - offset * 60000)
    .toISOString()
    .split("T")[0];
};

const priceForHour = (hour) =>
  hour >= 17 ? NIGHT_RATE : DAY_RATE;

const formatDate = (date) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });


/* =========================================================
   CINEMATIC INTRO
========================================================= */

function CinematicIntro({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(() => onDone(), 5600);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="cinematic-intro" aria-label="Radhe Box Cricket intro">
      <div className="intro-noise" />
      <div className="intro-ball-wrap">
        <div className="intro-ball">
          <span className="intro-ball-seam" />
        </div>
      </div>

      <div className="intro-copy">
        <div className="intro-line line-1">YOUR GAME.</div>
        <div className="intro-line line-2">YOUR NIGHT.</div>
        <div className="intro-line line-3">WORK HARD.</div>
        <div className="intro-line line-4">PLAY HARDER.</div>
        <div className="intro-line line-5">ONE PITCH.</div>
        <div className="intro-line line-6">ENDLESS GAMES.</div>
        <div className="intro-line line-7">NO EXCUSES.</div>
        <div className="intro-line line-8">JUST PLAY.</div>
        <div className="intro-final">THIS IS RADHE.</div>
      </div>

      <div className="intro-flash" />
      <div className="intro-brand">
        <span className="brand-mark">R</span>
        <span>RADHE BOX CRICKET</span>
      </div>
    </div>
  );
}

function PremiumCursor() {
  const [point, setPoint] = useState({ x: -100, y: -100 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const move = (e) => setPoint({ x: e.clientX, y: e.clientY });
    const down = () => setActive(true);
    const up = () => setActive(false);
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
    <div
      className={`premium-cursor ${active ? "is-active" : ""}`}
      style={{ left: point.x, top: point.y }}
      aria-hidden="true"
    >
      <span className="cursor-crosshair" />
      <span className="cursor-ball"><i /></span>
    </div>
  );
}

function App() {
  const [introDone, setIntroDone] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateScrollBall = () => {
      const hero = document.getElementById("home");
      if (!hero) return;

      const rect = hero.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const progress = Math.min(
        1,
        Math.max(0, (viewport - rect.top) / (viewport + rect.height))
      );

      hero.style.setProperty("--scroll-progress", progress.toFixed(4));
    };

    updateScrollBall();
    window.addEventListener("scroll", updateScrollBall, { passive: true });
    window.addEventListener("resize", updateScrollBall);

    return () => {
      window.removeEventListener("scroll", updateScrollBall);
      window.removeEventListener("resize", updateScrollBall);
    };
  }, []);

  const [selectedDate, setSelectedDate] =
    useState(todayString());

  const [duration, setDuration] = useState(1);

  const [selectedHour, setSelectedHour] =
    useState(null);

  const [players, setPlayers] = useState(10);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [blocked, setBlocked] = useState([]);
  const [booked, setBooked] = useState([]);

  const [loadingSlots, setLoadingSlots] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState(null);

  const [adminOpen, setAdminOpen] =
    useState(false);

  const dates = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();

      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() + i);

      return d.toISOString().split("T")[0];
    });
  }, []);

  useEffect(() => {
    loadAvailability();
  }, [selectedDate]);

  useEffect(() => {
    setSelectedHour(null);
  }, [duration]);

  async function loadAvailability() {
    if (!supabase) {
      setBlocked([]);
      setBooked([]);
      return;
    }

    setLoadingSlots(true);

    const [blockedResult, bookedResult] =
      await Promise.all([
        supabase
          .from("blocked_slots")
          .select("start_time,end_time")
          .eq("date", selectedDate),

        supabase
          .from("bookings")
          .select(
            "start_time,end_time,status,slot,duration_hours"
          )
          .eq("date", selectedDate)
          .in("status", [
            "Pending",
            "Approved",
          ]),
      ]);

    if (!blockedResult.error) {
      setBlocked(
        blockedResult.data || []
      );
    }

    if (!bookedResult.error) {
      setBooked(
        bookedResult.data || []
      );
    }

    setLoadingSlots(false);
  }

  function isHourUnavailable(hour) {
    const start =
      `${String(hour).padStart(2, "0")}:00:00`;

    const end =
      `${String(hour + 1).padStart(2, "0")}:00:00`;

    const blockedMatch = blocked.some(
      (item) =>
        item.start_time <= start &&
        item.end_time >= end
    );

    const bookedMatch = booked.some(
      (item) => {
        const startTime =
          item.start_time || "";

        const endTime =
          item.end_time || "";

        return (
          startTime < end &&
          endTime > start
        );
      }
    );

    return (
      blockedMatch ||
      bookedMatch
    );
  }

  function canSelect(hour) {
    for (
      let i = 0;
      i < duration;
      i++
    ) {
      if (
        hour + i >= CLOSE_HOUR ||
        isHourUnavailable(hour + i)
      ) {
        return false;
      }
    }

    return true;
  }

  function getTotal() {
    if (
      selectedHour === null
    ) {
      return 0;
    }

    return Array.from(
      { length: duration },
      (_, i) =>
        priceForHour(
          selectedHour + i
        )
    ).reduce(
      (a, b) => a + b,
      0
    );
  }

  function scrollTo(id) {
    setMenuOpen(false);

    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }

  async function submitBooking(e) {
    e.preventDefault();

    setMessage(null);

    if (
      selectedHour === null
    ) {
      setMessage({
        type: "error",
        text:
          "Please select a slot first.",
      });

      return;
    }

    if (
      !name.trim() ||
      phone.trim().length < 10
    ) {
      setMessage({
        type: "error",
        text:
          "Enter your name and valid 10-digit phone number.",
      });

      return;
    }

    if (!supabase) {
      setMessage({
        type: "error",
        text:
          "Supabase is not connected. Add your environment variables.",
      });

      return;
    }

    setSubmitting(true);

    const startTime =
      `${String(selectedHour).padStart(
        2,
        "0"
      )}:00:00`;

    const { data, error } =
      await supabase.rpc(
        "create_radhe_booking",
        {
          p_name: name.trim(),
          p_phone: phone.trim(),
          p_date: selectedDate,
          p_start_time: startTime,
          p_players: Number(players),
          p_duration_hours: duration,
        }
      );

    setSubmitting(false);

    if (error) {
      setMessage({
        type: "error",
        text:
          error.message ||
          "Booking failed. Try another slot.",
      });

      await loadAvailability();

      return;
    }

    const booking =
      Array.isArray(data)
        ? data[0]
        : data;

    const whatsappText = [
      "🏏 RADHE BOX CRICKET",
      "",
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      `Date: ${formatDate(selectedDate)}`,
      `Time: ${hourLabel(
        selectedHour
      )} - ${hourLabel(
        selectedHour + duration
      )}`,
      `Duration: ${duration} hour${
        duration > 1 ? "s" : ""
      }`,
      `Players: ${players}`,
      `Total: ₹${getTotal().toLocaleString(
        "en-IN"
      )}`,
      booking?.id
        ? `Booking ID: ${booking.id}`
        : "",
      "",
      "Please confirm my booking.",
    ]
      .filter(Boolean)
      .join("\n");

    setMessage({
      type: "success",
      text:
        "Booking request sent. Opening WhatsApp...",
    });

    window.open(
      `https://wa.me/${BOOKING_WHATSAPP_NUMBER}?text=${encodeURIComponent(
        whatsappText
      )}`,
      "_blank",
      "noopener,noreferrer"
    );

    setName("");
    setPhone("");
    setSelectedHour(null);

    await loadAvailability();
  }

  return (
    <>
      {!introDone && <CinematicIntro onDone={() => setIntroDone(true)} />}
      <div className="site premium-site">

      <PremiumCursor />

      {/* NAVBAR */}

      <header className="navbar">

        <button
          className="brand"
          onClick={() =>
            scrollTo("home")
          }
        >
          <span className="brand-mark">
            R
          </span>

          <span>
            <strong>
              RADHE
            </strong>

            <small>
              BOX CRICKET
            </small>
          </span>
        </button>

        <nav
          className={`nav-links ${
            menuOpen
              ? "open"
              : ""
          }`}
        >
          <button
            onClick={() =>
              scrollTo("home")
            }
          >
            Home
          </button>

          <button
            onClick={() =>
              scrollTo("arena")
            }
          >
            Arena
          </button>

          <button
            onClick={() =>
              scrollTo("booking")
            }
          >
            Booking
          </button>

          <button
            onClick={() =>
              scrollTo("contact")
            }
          >
            Contact
          </button>

          <button
            className="nav-book"
            onClick={() =>
              scrollTo("booking")
            }
          >
            Book Slot
          </button>
        </nav>

        <button
          className="menu-button"
          onClick={() =>
            setMenuOpen(
              (value) => !value
            )
          }
        >
          {menuOpen ? (
            <X size={23} />
          ) : (
            <Menu size={23} />
          )}
        </button>

      </header>


      {/* MAIN */}

      <main>

        {/* PREMIUM HOME */}

        <section className="premium-hero" id="home">
          <div className="premium-hero-grid" />
          <div className="premium-hero-glow glow-a" />
          <div className="premium-hero-glow glow-b" />

          <div className="premium-hero-content">
            <div className="premium-live-row">
              <span className="live-dot" />
              <span>RADHE ARENA</span>
              <b>AHMEDABAD</b>
              <span className="live-line" />
              <small>06:00 — 00:00</small>
            </div>

            <div className="premium-kicker">
              BOX CRICKET / MATCHDAY 24·7
            </div>

            <h1>
              YOUR GAME.<br />
              <span>YOUR NIGHT.</span>
            </h1>

            <p className="premium-hero-copy">
              A sharper pitch. A louder night. A better game.
              Book your slot and bring the squad.
            </p>

            <div className="premium-hero-actions">
              <button className="premium-main-cta" onClick={() => scrollTo("booking")}>
                BOOK YOUR GAME <ArrowRight size={18} />
              </button>
              <button className="premium-secondary-cta" onClick={() => scrollTo("arena")}>
                EXPLORE THE ARENA
              </button>
            </div>

            <div className="premium-hero-meta">
              <span><Check size={14} /> DAY + NIGHT</span>
              <span><Check size={14} /> LIVE AVAILABILITY</span>
              <span><Check size={14} /> WHATSAPP CONFIRMATION</span>
            </div>
          </div>

          <div className="premium-hero-stage" aria-hidden="true">
            <div className="stage-ring ring-one" />
            <div className="stage-ring ring-two" />
            <div className="stage-pitch" />
            <div className="stage-lines" />
            <div className="premium-ball"><span /></div>
            <div className="stage-shadow" />
            <div className="stage-label">
              <small>01 / 01</small>
              <strong>ONE PITCH</strong>
              <span>ENDLESS GAMES</span>
            </div>
          </div>

          <div className="premium-scroll-cue">
            <span>SCROLL TO PLAY</span>
            <i>↓</i>
          </div>
        </section>

        <section className="premium-marquee" aria-label="Radhe highlights">
          <div>
            <span>RADHE BOX CRICKET</span><b>✦</b>
            <span>YOUR GAME. YOUR NIGHT.</span><b>✦</b>
            <span>BOOK. PLAY. REPEAT.</span><b>✦</b>
            <span>AHMEDABAD</span><b>✦</b>
          </div>
        </section>

        <section className="premium-stats">
          <div className="premium-stat-main">
            <small>DAY RATE</small><strong>₹800</strong><span>/ HOUR · 06:00–17:00</span>
          </div>
          <div>
            <small>NIGHT RATE</small><strong>₹1100</strong><span>/ HOUR · 17:00–00:00</span>
          </div>
          <div>
            <small>OPEN</small><strong>18 HRS</strong><span>EVERY PLAYING DAY</span>
          </div>
          <div>
            <small>FORMAT</small><strong>1 / 2 HR</strong><span>SINGLE OR DOUBLE SLOT</span>
          </div>
        </section>

        <section className="premium-arena-section section" id="arena">
          <div className="premium-section-head">
            <div>
              <span className="premium-kicker">THE RADHE STANDARD</span>
              <h2>Built for the<br /><em>big moments.</em></h2>
            </div>
            <p>
              Not another generic turf page. Radhe is designed around the actual match —
              quick booking, clear slots and a night worth remembering.
            </p>
          </div>

          <div className="premium-feature-grid">
            <article className="premium-feature feature-large">
              <span className="feature-index">01</span>
              <Zap />
              <h3>FAST<br /><em>BOOKING</em></h3>
              <p>Pick a date, choose your duration, grab an available hour and send the request.</p>
              <button onClick={() => scrollTo("booking")}>BOOK A SLOT <ArrowRight size={15} /></button>
            </article>

            <article className="premium-feature">
              <span className="feature-index">02</span>
              <Clock3 />
              <h3>DAY<br /><em>TO NIGHT</em></h3>
              <p>Morning sessions to late-night battles. The pitch stays ready until midnight.</p>
            </article>

            <article className="premium-feature">
              <span className="feature-index">03</span>
              <Users />
              <h3>BRING<br /><em>THE SQUAD</em></h3>
              <p>Friends, classmates, office teams or the weekend crew — choose your game.</p>
            </article>

            <article className="premium-feature feature-wide">
              <span className="feature-index">04</span>
              <Trophy />
              <div>
                <h3>MAKE IT A<br /><em>GAME NIGHT.</em></h3>
                <p>One pitch. One squad. Zero excuses. This is where the ordinary evening gets competitive.</p>
              </div>
              <div className="feature-stamp">R<br /><small>RADHE</small></div>
            </article>
          </div>
        </section>

        <section className="premium-about section">
          <div className="about-number">02</div>
          <div className="premium-about-copy">
            <span className="premium-kicker">WHY RADHE</span>
            <h2>Work hard.<br /><em>Play harder.</em></h2>
            <p>
              You don't need another complicated booking process. You need a pitch, your people and a time that works.
              That's it.
            </p>
            <div className="about-checks">
              <span><Check /> Simple slot selection</span>
              <span><Check /> Single or double-hour games</span>
              <span><Check /> WhatsApp confirmation</span>
            </div>
          </div>
          <div className="premium-about-card">
            <div className="about-card-top"><span>RADHE / 2026</span><span>AHMEDABAD</span></div>
            <div className="about-card-word">RADHE</div>
            <div className="about-card-bottom"><span>ONE PITCH.</span><strong>ENDLESS GAMES.</strong></div>
          </div>
        </section>


        {/* BOOKING */}

        <section
          className="section booking-section"
          id="booking"
        >

          <div className="premium-booking-heading section-heading booking-heading">
            <span className="premium-kicker">LIVE BOOKING</span>
            <h2>Pick your <em>game time.</em></h2>
            <p>No account. No waiting around. Choose your slot and send the request directly to Radhe.</p>
            <div className="booking-heading-badge"><span /> LIVE AVAILABILITY</div>
          </div>


          <div className="booking-layout">

            {/* PRICES */}

            <div className="booking-side">

              <div className="price-card">

                <span>
                  DAY RATE
                </span>

                <strong>
                  ₹800{" "}
                  <small>
                    / hour
                  </small>
                </strong>

                <p>
                  06:00 AM — 05:00 PM
                </p>

              </div>

              <div className="price-card night">

                <span>
                  NIGHT RATE
                </span>

                <strong>
                  ₹1100{" "}
                  <small>
                    / hour
                  </small>
                </strong>

                <p>
                  05:00 PM — 12:00 AM
                </p>

              </div>

              <div className="trust-card">

                <ShieldCheck
                  size={20}
                />

                <div>

                  <strong>
                    Live availability
                  </strong>

                  <p>
                    Booked and blocked
                    slots automatically
                    appear unavailable.
                  </p>

                </div>

              </div>

            </div>


            {/* FORM */}

            <form
              className="booking-card"
              onSubmit={submitBooking}
            >

              {/* DATE */}

              <div className="form-step">

                <Step
                  number="01"
                  title="Choose date"
                  subtitle="Select a day"
                />

                <div className="date-picker">

                  {dates.map(
                    (date) => {

                      const d =
                        new Date(
                          `${date}T12:00:00`
                        );

                      return (
                        <button
                          type="button"
                          key={date}
                          className={
                            selectedDate ===
                            date
                              ? "date active"
                              : "date"
                          }
                          onClick={() =>
                            setSelectedDate(
                              date
                            )
                          }
                        >

                          <small>
                            {d.toLocaleDateString(
                              "en-IN",
                              {
                                weekday:
                                  "short",
                              }
                            )}
                          </small>

                          <strong>
                            {d.getDate()}
                          </strong>

                          <span>
                            {d.toLocaleDateString(
                              "en-IN",
                              {
                                month:
                                  "short",
                              }
                            )}
                          </span>

                        </button>
                      );
                    }
                  )}

                </div>

              </div>


              {/* DURATION */}

              <div className="form-step">

                <Step
                  number="02"
                  title="Choose duration"
                  subtitle="How long are you playing?"
                />

                <div className="duration-switch">

                  <button
                    type="button"
                    className={
                      duration === 1
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setDuration(1)
                    }
                  >
                    <strong>
                      1 HOUR
                    </strong>

                    <small>
                      Single slot
                    </small>
                  </button>

                  <button
                    type="button"
                    className={
                      duration === 2
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setDuration(2)
                    }
                  >
                    <strong>
                      2 HOURS
                    </strong>

                    <small>
                      Double slot
                    </small>
                  </button>

                </div>

              </div>


              {/* SLOTS */}

              <div className="form-step">

                <Step
                  number="03"
                  title="Choose slot"
                  subtitle={
                    loadingSlots
                      ? "Checking availability..."
                      : "Available times"
                  }
                />

                <div className="slot-grid">

                  {slots.map(
                    (hour) => {

                      const available =
                        canSelect(hour);

                      const total =
                        duration === 2
                          ? priceForHour(
                              hour
                            ) +
                            priceForHour(
                              hour + 1
                            )
                          : priceForHour(
                              hour
                            );

                      return (
                        <button
                          type="button"
                          key={hour}
                          disabled={
                            !available
                          }
                          className={[
                            "slot-button",
                            selectedHour ===
                            hour
                              ? "active"
                              : "",
                            !available
                              ? "disabled"
                              : "",
                          ].join(" ")}
                          onClick={() =>
                            setSelectedHour(
                              hour
                            )
                          }
                        >

                          <span>
                            {hourLabel(
                              hour
                            )}
                          </span>

                          <small>
                            {available
                              ? `₹${total}`
                              : "Unavailable"}
                          </small>

                        </button>
                      );
                    }
                  )}

                </div>

              </div>


              {/* DETAILS */}

              <div className="form-step">

                <Step
                  number="04"
                  title="Your details"
                  subtitle="For confirmation"
                />

                <div className="form-grid">

                  <label>
                    Name

                    <input
                      value={name}
                      onChange={(e) =>
                        setName(
                          e.target.value
                        )
                      }
                      placeholder="Your name"
                    />
                  </label>

                  <label>
                    Phone

                    <input
                      value={phone}
                      onChange={(e) =>
                        setPhone(
                          e.target.value
                            .replace(
                              /\D/g,
                              ""
                            )
                            .slice(
                              0,
                              10
                            )
                        )
                      }
                      inputMode="numeric"
                      placeholder="10-digit number"
                    />
                  </label>

                  <label>
                    Players

                    <select
                      value={players}
                      onChange={(e) =>
                        setPlayers(
                          e.target.value
                        )
                      }
                    >
                      {Array.from(
                        {
                          length: 30,
                        },
                        (_, i) =>
                          i + 1
                      ).map(
                        (n) => (
                          <option
                            key={n}
                            value={n}
                          >
                            {n} player
                            {n > 1
                              ? "s"
                              : ""}
                          </option>
                        )
                      )}
                    </select>

                  </label>

                </div>

              </div>


              {/* SUMMARY */}

              <div className="booking-summary">

                <div>

                  <small>
                    YOUR SELECTION
                  </small>

                  <strong>
                    {selectedHour ===
                    null
                      ? "Select a slot"
                      : `${formatDate(
                          selectedDate
                        )} • ${hourLabel(
                          selectedHour
                        )} - ${hourLabel(
                          selectedHour +
                            duration
                        )}`}
                  </strong>

                </div>

                <div className="total">

                  <small>
                    TOTAL
                  </small>

                  <strong>
                    ₹
                    {getTotal().toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

              </div>


              {message && (
                <div
                  className={`form-message ${message.type}`}
                >
                  {message.text}
                </div>
              )}


              <button
                className="submit-button"
                disabled={submitting}
                type="submit"
              >
                {submitting
                  ? "SENDING..."
                  : "REQUEST BOOKING"}

                <ArrowRight
                  size={19}
                />
              </button>

              <p className="booking-note">
                Your booking stays
                pending until Radhe
                confirms it.
              </p>

            </form>

          </div>

        </section>


        {/* CONTACT */}

        <section
          className="section contact-section premium-contact"
          id="contact"
        >

          <div>

            <span className="eyebrow">
              FIND US
            </span>

            <h2>
              Ready to{" "}
              <em>
                play?
              </em>
            </h2>

            <p>
              For directions,
              availability or
              direct enquiries,
              contact Radhe Box
              Cricket.
            </p>

          </div>

          <div className="contact-actions">

            <a
              href={`https://wa.me/${BOOKING_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
            >
              <Phone size={18} />
              WhatsApp Booking
            </a>

            <a
              href={`tel:${ANKIT_PHONE}`}
            >
              <Phone size={18} />
              Ankit: {ANKIT_PHONE}
            </a>

            <a
              href="https://instagram.com/radhe_box_cricket"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={18} />
              Instagram
            </a>

            <a
              href="https://maps.google.com/?q=Radhe+Box+Cricket"
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={18} />
              Directions
            </a>

          </div>

        </section>

      </main>


      {/* FOOTER */}

      <footer className="footer">

        <div className="footer-brand">

          <span className="brand-mark">
            R
          </span>

          <div>
            <strong>
              RADHE BOX CRICKET
            </strong>

            <small>
              ONE PITCH. ENDLESS GAMES.
            </small>
          </div>

        </div>

        <button
          onClick={() =>
            setAdminOpen(true)
          }
        >
          Admin
        </button>

        <span>
          © {new Date().getFullYear()} Radhe Box Cricket
        </span>

      </footer>


      {adminOpen && (
        <AdminModal
          onClose={() =>
            setAdminOpen(false)
          }
        />
      )}

      </div>
    </>
  );
}


/* COMPONENTS */

function Feature({
  icon,
  title,
  text,
}) {
  return (
    <article className="feature-card">

      <div className="icon-box">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </article>
  );
}


function Step({
  number,
  title,
  subtitle,
}) {
  return (
    <div className="step-title">

      <span>
        {number}
      </span>

      <div>

        <strong>
          {title}
        </strong>

        <small>
          {subtitle}
        </small>

      </div>

    </div>
  );
}


/* ADMIN */

function AdminModal({
  onClose,
}) {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [session, setSession] =
    useState(null);

  const [bookings, setBookings] =
    useState([]);

  const [blocked, setBlocked] =
    useState([]);

  const [date, setDate] =
    useState(todayString());

  const [startHour, setStartHour] =
    useState(18);

  const [blockDuration, setBlockDuration] =
    useState(1);

  const [reason, setReason] =
    useState("");

  const [error, setError] =
    useState("");

  const [busy, setBusy] =
    useState(false);

  useEffect(() => {

    if (!supabase) return;

    supabase.auth
      .getSession()
      .then(
        ({
          data,
        }) => {

          if (data.session) {

            setSession(
              data.session
            );

            loadAdminData();
          }

        }
      );

  }, []);

  async function login(e) {

    e.preventDefault();

    setError("");
    setBusy(true);

    const {
      data,
      error,
    } =
      await supabase.auth
        .signInWithPassword({
          email,
          password,
        });

    setBusy(false);

    if (error) {

      setError(
        error.message
      );

      return;
    }

    setSession(
      data.session
    );

    loadAdminData();
  }

  async function loadAdminData() {

    const [
      bookingsResult,
      blockedResult,
    ] =
      await Promise.all([

        supabase
          .from("bookings")
          .select("*")
          .order("date", {
            ascending: true,
          })
          .order("start_time", {
            ascending: true,
          })
          .limit(100),

        supabase
          .from("blocked_slots")
          .select("*")
          .order("date", {
            ascending: true,
          })
          .limit(100),

      ]);

    setBookings(
      bookingsResult.data || []
    );

    setBlocked(
      blockedResult.data || []
    );
  }

  async function updateBooking(
    id,
    status
  ) {

    await supabase
      .from("bookings")
      .update({
        status,
      })
      .eq("id", id);

    await loadAdminData();
  }

  async function blockSlot(e) {

    e.preventDefault();

    const start =
      `${String(startHour).padStart(
        2,
        "0"
      )}:00:00`;

    const endHour = startHour + blockDuration;

    const end =
      `${String(endHour).padStart(
        2,
        "0"
      )}:00:00`;

    if (startHour + blockDuration > 24) {
      setError("Block duration cannot go beyond midnight.");
      return;
    }

    const { error: blockError } = await supabase
      .from("blocked_slots")
      .insert({
        date,
        start_time: start,
        end_time: end,
        reason:
          reason ||
          "Blocked by admin",
      });

    if (blockError) {
      setError(blockError.message);
      return;
    }

    setReason("");
    setError("");

    await loadAdminData();
  }

  async function unblock(id) {

    await supabase
      .from("blocked_slots")
      .delete()
      .eq("id", id);

    await loadAdminData();
  }

  async function logout() {

    await supabase.auth
      .signOut();

    setSession(null);
  }

  return (
    <div className="modal-backdrop">

      <div className="admin-modal">

        <div className="modal-head">

          <div>

            <span className="eyebrow">
              RADHE COMMAND CENTER
            </span>

            <h2>
              Admin
            </h2>

          </div>

          <button
            onClick={onClose}
          >
            <X />
          </button>

        </div>


        {!session ? (

          <form
            className="admin-login"
            onSubmit={login}
          >

            <label>
              Email

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                required
              />

            </label>

            <label>
              Password

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
              />

            </label>

            {error && (
              <div className="form-message error">
                {error}
              </div>
            )}

            <button
              className="submit-button"
              disabled={busy}
            >
              {busy
                ? "LOGGING IN..."
                : "LOGIN"}

              <ShieldCheck
                size={18}
              />
            </button>

          </form>

        ) : (

          <div className="admin-content">

            <div className="admin-top">

              <strong>
                Bookings
              </strong>

              <button
                onClick={logout}
              >
                Logout
              </button>

            </div>


            <div className="admin-block">

              <h3>
                Block a slot
              </h3>

              <form
                onSubmit={blockSlot}
                className="block-form"
              >

                <input
                  type="date"
                  value={date}
                  min={todayString()}
                  onChange={(e) =>
                    setDate(
                      e.target.value
                    )
                  }
                />

                <select
                  value={startHour}
                  onChange={(e) =>
                    setStartHour(
                      Number(
                        e.target.value
                      )
                    )
                  }
                >
                  {slots.map(
                    (h) => (
                      <option
                        key={h}
                        value={h}
                      >
                        {hourLabel(h)}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={blockDuration}
                  onChange={(e) =>
                    setBlockDuration(Number(e.target.value))
                  }
                >
                  <option value={1}>1 hour</option>
                  <option value={2}>2 hours</option>
                </select>

                <input
                  value={reason}
                  onChange={(e) =>
                    setReason(
                      e.target.value
                    )
                  }
                  placeholder="Reason"
                />

                <button className="gold-button">
                  Block
                </button>

              </form>

            </div>


            <div className="admin-list">

              {bookings.map(
                (booking) => (

                  <div
                    className="admin-row"
                    key={booking.id}
                  >

                    <div>

                      <strong>
                        {booking.name}
                      </strong>

                      <span>
                        {booking.date}
                        {" • "}
                        {booking.start_time?.slice(
                          0,
                          5
                        )}
                        {" • "}
                        {booking.duration_hours ||
                          1}
                        h
                        {" • "}
                        {booking.players}
                        {" players"}
                      </span>

                      <small>
                        {booking.phone}
                        {" • ₹"}
                        {Number(
                          booking.total_price ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </small>

                    </div>


                    <div className="admin-status">

                      <span
                        className={`status ${String(
                          booking.status
                        ).toLowerCase()}`}
                      >
                        {booking.status}
                      </span>

                      {booking.status !==
                        "Approved" && (
                        <button
                          onClick={() =>
                            updateBooking(
                              booking.id,
                              "Approved"
                            )
                          }
                        >
                          <Check
                            size={15}
                          />
                        </button>
                      )}

                      {booking.status !==
                        "Rejected" && (
                        <button
                          onClick={() =>
                            updateBooking(
                              booking.id,
                              "Rejected"
                            )
                          }
                        >
                          <X
                            size={15}
                          />
                        </button>
                      )}

                    </div>

                  </div>

                )
              )}

            </div>


            <div className="admin-list">

              <h3>
                Blocked slots
              </h3>

              {blocked.map(
                (item) => (

                  <div
                    className="admin-row"
                    key={item.id}
                  >

                    <div>

                      <strong>
                        {item.date}
                      </strong>

                      <span>
                        {item.start_time?.slice(
                          0,
                          5
                        )}
                        {" — "}
                        {item.end_time?.slice(
                          0,
                          5
                        )}
                      </span>

                      <small>
                        {item.reason}
                      </small>

                    </div>

                    <button
                      onClick={() =>
                        unblock(
                          item.id
                        )
                      }
                    >
                      Unblock
                    </button>

                  </div>

                )
              )}

            </div>

          </div>

        )}

      </div>

    </div>
  );
}


createRoot(
  document.getElementById(
    "root"
  )
).render(
  <App />
);
