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
      <div className="site">

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

        {/* HERO */}

        <section
          className="hero"
          id="home"
        >

          <div className="hero-grid" />

          <div className="hero-content">

            <div className="eyebrow">
              <span />
              AHMEDABAD • BOX CRICKET
            </div>

            <h1>
              YOUR GAME.
              <br />
              <em>
                YOUR NIGHT.
              </em>
            </h1>

            <p>
              Premium box cricket
              for friends, teams
              and serious game
              nights.
            </p>

            <div className="hero-actions">

              <button
                className="gold-button"
                onClick={() =>
                  scrollTo("booking")
                }
              >
                Book Your Slot
                <ArrowRight size={18} />
              </button>

              <button
                className="outline-button"
                onClick={() =>
                  scrollTo("arena")
                }
              >
                Explore Arena
              </button>

            </div>

            <div className="hero-points">

              <span>
                <Check size={15} />
                Day & night slots
              </span>

              <span>
                <Check size={15} />
                Easy booking
              </span>

              <span>
                <Check size={15} />
                Team-ready arena
              </span>

            </div>

          </div>

          <div
            className="hero-ball"
            aria-hidden="true"
          >
            <div className="ball-seam" />
          </div>

          <div className="hero-bottom">
            <span>
              06:00 AM — 12:00 AM
            </span>

            <span>
              ONE PITCH • ENDLESS GAMES
            </span>
          </div>

        </section>


        {/* STATS */}

        <section className="stats section">

          <div>
            <strong>
              ₹800
            </strong>

            <span>
              DAY / HOUR
            </span>
          </div>

          <div>
            <strong>
              ₹1100
            </strong>

            <span>
              NIGHT / HOUR
            </span>
          </div>

          <div>
            <strong>
              06 AM
            </strong>

            <span>
              OPENING
            </span>
          </div>

          <div>
            <strong>
              12 AM
            </strong>

            <span>
              CLOSING
            </span>
          </div>

        </section>


        {/* ARENA */}

        <section
          className="section"
          id="arena"
        >

          <div className="section-heading">

            <span className="eyebrow">
              THE ARENA
            </span>

            <h2>
              Built for{" "}
              <em>
                your game.
              </em>
            </h2>

            <p>
              Everything you need
              for a proper cricket
              session — without
              the hassle.
            </p>

          </div>

          <div className="feature-grid">

            <Feature
              icon={<Zap />}
              title="Fast Booking"
              text="Choose your date, duration and exact playing slot in seconds."
            />

            <Feature
              icon={<Clock3 />}
              title="Day + Night"
              text="Early morning games or late-night battles — slots run till midnight."
            />

            <Feature
              icon={<Users />}
              title="Squad Ready"
              text="Bring your friends, classmates, office team or weekend squad."
            />

            <Feature
              icon={<Trophy />}
              title="Game Night"
              text="Turn a normal evening into a proper competitive cricket session."
            />

          </div>

        </section>


        {/* ABOUT */}

        <section className="section about-section">

          <div className="about-copy">

            <span className="eyebrow">
              RADHE BOX CRICKET
            </span>

            <h2>
              Work hard.
              <br />
              <em>
                Play harder.
              </em>
            </h2>

            <p>
              Radhe is made for
              the nights when
              your group just
              wants to play.
              No complicated
              process.
            </p>

            <div className="about-list">

              <span>
                <Check />
                Simple slot selection
              </span>

              <span>
                <Check />
                Single or double-hour booking
              </span>

              <span>
                <Check />
                WhatsApp confirmation
              </span>

            </div>

          </div>

          <div className="about-panel">

            <span>
              01
            </span>

            <strong>
              ONE PITCH
            </strong>

            <b>
              ENDLESS GAMES
            </b>

            <small>
              RADHE BOX CRICKET
            </small>

          </div>

        </section>


        {/* BOOKING */}

        <section
          className="section booking-section"
          id="booking"
        >

          <div className="section-heading booking-heading">

            <span className="eyebrow">
              BOOK A SLOT
            </span>

            <h2>
              Pick your{" "}
              <em>
                game time.
              </em>
            </h2>

            <p>
              No account required.
              Select a slot and
              send your request.
            </p>

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
          className="section contact-section"
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

function AdminModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [date, setDate] = useState(todayString());
  const [startHour, setStartHour] = useState(18);
  const [blockDuration, setBlockDuration] = useState(1);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
        loadAdminData();
      }
    });
  }, []);

  async function login(e) {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setError("");
    setBusy(true);

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    setBusy(false);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    setSession(data.session);
    await loadAdminData();
  }

  async function loadAdminData() {
    if (!supabase) return;

    setError("");

    const [bookingsResult, blockedResult] = await Promise.all([
      supabase
        .from("bookings")
        .select("*")
        .order("date", { ascending: true })
        .order("start_time", { ascending: true })
        .limit(100),
      supabase
        .from("blocked_slots")
        .select("*")
        .order("date", { ascending: true })
        .order("start_time", { ascending: true })
        .limit(100),
    ]);

    if (bookingsResult.error) {
      setError(bookingsResult.error.message);
    } else if (blockedResult.error) {
      setError(blockedResult.error.message);
    }

    setBookings(bookingsResult.data || []);
    setBlocked(blockedResult.data || []);
  }

  async function updateBooking(id, status) {
    if (!supabase) return;

    setBusy(true);
    setError("");

    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);

    setBusy(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadAdminData();
  }

  async function blockSlot(e) {
    e.preventDefault();
    if (!supabase) return;

    setError("");

    if (startHour + blockDuration > 24) {
      setError("A 2-hour block cannot start at 11:00 PM.");
      return;
    }

    const start = `${String(startHour).padStart(2, "0")}:00:00`;
    const endHour = startHour + blockDuration;
    const end =
      endHour === 24
        ? "23:59:59"
        : `${String(endHour).padStart(2, "0")}:00:00`;

    setBusy(true);

    const { error: blockError } = await supabase
      .from("blocked_slots")
      .insert({
        date,
        start_time: start,
        end_time: end,
        reason: reason.trim() || "Blocked by admin",
      });

    setBusy(false);

    if (blockError) {
      setError(blockError.message);
      return;
    }

    setReason("");
    await loadAdminData();
  }

  async function unblock(id) {
    if (!supabase) return;

    setBusy(true);
    setError("");

    const { error: deleteError } = await supabase
      .from("blocked_slots")
      .delete()
      .eq("id", id);

    setBusy(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadAdminData();
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
  }

  const today = todayString();
  const todayBookings = bookings.filter((b) => b.date === today);
  const pendingCount = bookings.filter((b) => b.status === "Pending").length;
  const approvedCount = bookings.filter((b) => b.status === "Approved").length;
  const rejectedCount = bookings.filter((b) => b.status === "Rejected").length;
  const revenue = bookings
    .filter((b) => b.status === "Approved")
    .reduce((sum, b) => sum + Number(b.total_price || 0), 0);

  const statusClass = (status) =>
    String(status || "").toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="modal-backdrop">
      <div className="admin-modal admin-command-center">
        <div className="command-header">
          <div className="command-title">
            <div className="command-kicker">RADHE COMMAND CENTER</div>
            <h2>ARENA CONTROL</h2>
            <p>Manage bookings, availability & arena operations.</p>
          </div>

          <div className="command-header-actions">
            {session && (
              <div className="admin-online">
                <span /> ONLINE
              </div>
            )}
            <button className="admin-close" onClick={onClose} aria-label="Close admin">
              <X size={22} />
            </button>
          </div>
        </div>

        {!session ? (
          <form className="admin-login premium-login" onSubmit={login}>
            <div className="login-mark"><span>R</span></div>

            <div>
              <div className="command-kicker">SECURE ACCESS</div>
              <h3>Welcome back.</h3>
              <p>Sign in to manage Radhe Box Cricket.</p>
            </div>

            <label>
              EMAIL
              <input
                type="email"
                value={email}
                placeholder="admin@radhearena.in"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              PASSWORD
              <input
                type="password"
                value={password}
                placeholder="••••••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error && <div className="admin-error">{error}</div>}

            <button className="admin-primary-button" disabled={busy}>
              {busy ? "AUTHENTICATING..." : "ENTER COMMAND CENTER"}
              <ShieldCheck size={18} />
            </button>
          </form>
        ) : (
          <div className="admin-dashboard">
            <div className="dashboard-bar">
              <div>
                <span className="dashboard-label">ARENA OPERATIONS</span>
                <strong>
                  {todayBookings.length} booking{todayBookings.length !== 1 ? "s" : ""} today
                </strong>
              </div>

              <div className="dashboard-actions">
                <button className="admin-refresh" onClick={loadAdminData} disabled={busy}>
                  ↻ Refresh
                </button>
                <button className="admin-logout" onClick={logout}>Logout</button>
              </div>
            </div>

            {error && <div className="admin-error" style={{ marginBottom: 14 }}>{error}</div>}

            <div className="command-stats">
              <div className="command-stat">
                <span>TODAY</span>
                <strong>{todayBookings.length}</strong>
                <small>Bookings</small>
              </div>
              <div className="command-stat">
                <span>PENDING</span>
                <strong>{pendingCount}</strong>
                <small>Need action</small>
              </div>
              <div className="command-stat">
                <span>APPROVED</span>
                <strong>{approvedCount}</strong>
                <small>Confirmed</small>
              </div>
              <div className="command-stat command-stat-revenue">
                <span>REVENUE</span>
                <strong>₹{revenue.toLocaleString("en-IN")}</strong>
                <small>Approved bookings</small>
              </div>
            </div>

            <div className="command-grid">
              <section className="command-panel bookings-panel">
                <div className="panel-heading">
                  <div>
                    <span>BOOKING QUEUE</span>
                    <h3>Recent bookings</h3>
                  </div>
                  <div className="panel-count">{bookings.length}</div>
                </div>

                {bookings.length === 0 ? (
                  <div className="empty-command">
                    <span>NO BOOKINGS</span>
                    <p>New booking requests will appear here.</p>
                  </div>
                ) : (
                  <div className="booking-command-list">
                    {bookings.map((booking) => (
                      <div className="booking-command-card" key={booking.id}>
                        <div className="booking-card-main">
                          <div className="booking-card-time">
                            <strong>{booking.start_time?.slice(0, 5) || "—"}</strong>
                            <span>{booking.duration_hours || 1}h</span>
                          </div>

                          <div className="booking-card-info">
                            <strong>{booking.name}</strong>
                            <span>
                              {formatDate(booking.date)} · {booking.players || 0} players
                            </span>
                            <small>{booking.phone}</small>
                          </div>
                        </div>

                        <div className="booking-card-side">
                          <div className="booking-price">
                            ₹{Number(booking.total_price || 0).toLocaleString("en-IN")}
                          </div>

                          <span className={`command-status ${statusClass(booking.status)}`}>
                            {booking.status}
                          </span>

                          <div className="booking-actions">
                            {booking.status !== "Approved" && (
                              <button
                                className="approve-button"
                                onClick={() => updateBooking(booking.id, "Approved")}
                                disabled={busy}
                              >
                                <Check size={14} /> APPROVE
                              </button>
                            )}
                            {booking.status !== "Rejected" && (
                              <button
                                className="reject-button"
                                onClick={() => updateBooking(booking.id, "Rejected")}
                                disabled={busy}
                              >
                                REJECT
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="command-panel block-panel">
                <div className="panel-heading">
                  <div>
                    <span>AVAILABILITY CONTROL</span>
                    <h3>Block a slot</h3>
                  </div>
                  <div className="block-icon">×</div>
                </div>

                <p className="panel-description">
                  Temporarily remove a time slot from public booking.
                </p>

                <form className="command-block-form" onSubmit={blockSlot}>
                  <label>
                    DATE
                    <input
                      type="date"
                      value={date}
                      min={today}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </label>

                  <label>
                    START TIME
                    <select
                      value={startHour}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setStartHour(next);
                        if (next >= 23) setBlockDuration(1);
                      }}
                    >
                      {slots.map((h) => (
                        <option key={h} value={h}>{hourLabel(h)}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    DURATION
                    <select
                      value={blockDuration}
                      onChange={(e) => setBlockDuration(Number(e.target.value))}
                    >
                      <option value={1}>1 HOUR</option>
                      {startHour < 23 && <option value={2}>2 HOURS</option>}
                    </select>
                  </label>

                  <label>
                    REASON
                    <input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Maintenance, private event..."
                    />
                  </label>

                  <button className="admin-primary-button block-submit" disabled={busy}>
                    {busy ? "BLOCKING..." : "BLOCK SLOT"}
                  </button>
                </form>
              </section>
            </div>

            <section className="command-panel blocked-panel">
              <div className="panel-heading">
                <div>
                  <span>AVAILABILITY CONTROL</span>
                  <h3>Blocked slots</h3>
                </div>
                <div className="panel-count">{blocked.length}</div>
              </div>

              {blocked.length === 0 ? (
                <div className="empty-command compact">
                  <span>ALL CLEAR</span>
                  <p>No manually blocked slots.</p>
                </div>
              ) : (
                <div className="blocked-command-list">
                  {blocked.map((item) => (
                    <div className="blocked-command-card" key={item.id}>
                      <div className="blocked-date">
                        <strong>{formatDate(item.date)}</strong>
                        <span>
                          {item.start_time?.slice(0, 5)} — {item.end_time?.slice(0, 5)}
                        </span>
                      </div>

                      <div className="blocked-reason">
                        <span>REASON</span>
                        <strong>{item.reason || "Blocked by admin"}</strong>
                      </div>

                      <button
                        className="unblock-button"
                        onClick={() => unblock(item.id)}
                        disabled={busy}
                      >
                        UNBLOCK
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="command-footer">
              <span>RADHE BOX CRICKET</span>
              <span>
                {approvedCount} approved · {pendingCount} pending · {rejectedCount} rejected
              </span>
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
