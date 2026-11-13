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
const WHATSAPP_NUMBER =
  import.meta.env.VITE_WHATSAPP_NUMBER || "917046706848";

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

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

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
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
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
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
            >
              <Phone size={18} />
              WhatsApp
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

    const end =
      `${String(startHour + 1).padStart(
        2,
        "0"
      )}:00:00`;

    await supabase
      .from("blocked_slots")
      .insert({
        date,
        start_time: start,
        end_time: end,
        reason:
          reason ||
          "Blocked by admin",
      });

    setReason("");

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
