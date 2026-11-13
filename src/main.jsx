import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3,
  Instagram, Lock, MapPin, Menu, Phone, ShieldCheck, Sparkles, Trophy,
  Users, X, Zap
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import "./styles.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || "917046706848";
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const DAY_RATE = 800;
const NIGHT_RATE = 1100;
const slots = Array.from({ length: 18 }, (_, i) => i + 6);

function hourLabel(h) {
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:00 ${suffix}`;
}
function slotLabel(h, duration=1) {
  return `${hourLabel(h)} — ${hourLabel(h + duration === 24 ? 0 : h + duration)}`;
}
function rateForHour(h) { return h < 17 ? DAY_RATE : NIGHT_RATE; }
function priceFor(h, duration) {
  return Array.from({length: duration}, (_, i) => rateForHour(h+i)).reduce((a,b)=>a+b,0);
}
function isoDate(d) { return d.toISOString().slice(0,10); }

function CinematicIntro({onDone}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="intro">
      <div className="intro-grid" />
      <div className="stadium-light light-a" />
      <div className="stadium-light light-b" />
      <div className="bat"><span /></div>
      <div className="intro-ball"><i /></div>
      <div className="impact">YOUR GAME. YOUR NIGHT.</div>
      <div className="intro-brand">RADHE BOX CRICKET</div>
    </div>
  );
}

function ScrollBall() {
  const [p,setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      setP(max > 0 ? scrollY / max : 0);
    };
    addEventListener("scroll", on, {passive:true}); on();
    return () => removeEventListener("scroll", on);
  }, []);
  const x = 88 - p*70;
  const y = 18 + p*70;
  return <div className="scroll-ball" style={{left:`${x}%`,top:`${y}%`,transform:`rotate(${p*1440}deg)`}}><i /></div>;
}

function Logo({onSecret}) {
  const taps = useRef(0);
  const timer = useRef();
  const click = () => {
    taps.current += 1;
    clearTimeout(timer.current);
    timer.current = setTimeout(()=>taps.current=0, 900);
    if(taps.current >= 5) { taps.current=0; onSecret(); }
  };
  return <button className="logo" onClick={click} aria-label="Radhe Box Cricket">
    <span className="logo-mark">R</span><span>RADHE<span>BOX CRICKET</span></span>
  </button>;
}

function Navbar({onBook,onSecret}) {
  const [open,setOpen] = useState(false);
  const go = id => { setOpen(false); document.getElementById(id)?.scrollIntoView({behavior:"smooth"}); };
  return <header className="nav">
    <Logo onSecret={onSecret}/>
    <nav className={open?"mobile-open":""}>
      {["home","about","arena","book","contact"].map((id,i)=><button key={id} onClick={()=>go(id)}>{["Home","About","Arena","Book","Contact"][i]}</button>)}
    </nav>
    <button className="nav-cta" onClick={onBook}>BOOK YOUR SLOT <ArrowRight size={16}/></button>
    <button className="menu" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
  </header>;
}

function Hero({onBook}) {
  return <section id="home" className="hero section">
    <div className="hero-orb" />
    <div className="hero-copy reveal">
      <p className="eyebrow"><span /> AHMEDABAD • PRIVATE BOX CRICKET</p>
      <h1>YOUR GAME.<br/><em>YOUR NIGHT.</em></h1>
      <p className="hero-text">A premium box-cricket arena built for fast games, late-night sessions and serious fun.</p>
      <div className="hero-actions"><button className="primary" onClick={onBook}>BOOK YOUR SLOT <ArrowRight/></button><button className="ghost" onClick={()=>document.getElementById("arena")?.scrollIntoView({behavior:"smooth"})}>EXPLORE ARENA</button></div>
      <div className="hero-meta"><span><MapPin/> Ahmedabad</span><span><Zap/> Day + Night Sessions</span></div>
    </div>
    <div className="hero-score reveal"><span>RADHE</span><strong>01</strong><small>BOX CRICKET / ARENA</small></div>
  </section>;
}

function Stats() {
  return <section className="stats"><div><strong>18</strong><span>HOURLY SLOTS</span></div><div><strong>2×</strong><span>POWER SESSION</span></div><div><strong>₹800</strong><span>DAY / HOUR</span></div><div><strong>₹1100</strong><span>NIGHT / HOUR</span></div></section>;
}

function About() {
  return <section id="about" className="section about"><div className="section-tag">01 / THE EXPERIENCE</div><div className="two-col"><div><h2>NOT JUST A<br/><em>CRICKET GROUND.</em></h2></div><div><p className="lead">A private box-cricket experience designed around the way Ahmedabad actually plays — quick games, competitive nights and zero booking chaos.</p><p className="muted">Premium turf, flood lighting, clean facilities and a booking system that tells you exactly when your game starts.</p></div></div></section>;
}

function Arena() {
  const items = [["01","PREMIUM TURF","Fast, clean playing surface."],["02","FLOOD LIGHTS","Built for night sessions."],["03","BOX SETUP","Tight boundaries. Faster games."],["04","SEATING","Watch the game between innings."],["05","PARKING","Easy arrival, easy exit."],["06","CLEAN FACILITIES","A comfortable arena experience."]];
  return <section id="arena" className="section arena"><div className="section-head"><div><div className="section-tag">02 / THE ARENA</div><h2>BUILT FOR<br/><em>GAME NIGHT.</em></h2></div><p>Every detail is designed to keep the focus on the game.</p></div><div className="feature-grid">{items.map(x=><article key={x[0]}><span>{x[0]}</span><Sparkles/><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</div></section>;
}

function DatePicker({date,setDate}) {
  const dates = useMemo(()=>Array.from({length:10},(_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+i);return d;}),[]);
  return <div className="dates">{dates.map(d=><button key={isoDate(d)} className={date===isoDate(d)?"selected":""} onClick={()=>setDate(isoDate(d))}><small>{d.toLocaleDateString("en-IN",{weekday:"short"}).toUpperCase()}</small><strong>{d.getDate()}</strong><span>{d.toLocaleDateString("en-IN",{month:"short"}).toUpperCase()}</span></button>)}</div>;
}

function Booking({onSuccess}) {
  const [date,setDate]=useState(isoDate(new Date()));
  const [duration,setDuration]=useState(1);
  const [start,setStart]=useState(null);
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [players,setPlayers]=useState(6);
  const [blocked,setBlocked]=useState([]);
  const [booked,setBooked]=useState([]);
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState("");

  const load = async () => {
    if(!supabase) return;
    const [b1,b2]=await Promise.all([
      supabase.from("blocked_slots").select("start_time").eq("date",date),
      supabase.from("bookings").select("start_time,duration_hours,status").eq("date",date).in("status",["Pending","Approved"])
    ]);
    setBlocked((b1.data||[]).map(x=>x.start_time?.slice(0,5)));
    const occupied=[];
    (b2.data||[]).forEach(x=>{const h=Number(x.start_time.slice(0,2));for(let i=0;i<x.duration_hours;i++)occupied.push(`${String(h+i).padStart(2,"0")}:00`);});
    setBooked(occupied);
  };
  useEffect(()=>{load()},[date]);

  const available = h => {
    const key=`${String(h).padStart(2,"0")}:00`;
    if(blocked.includes(key)||booked.includes(key)) return false;
    if(duration===2) return h<23 && !blocked.includes(`${String(h+1).padStart(2,"0")}:00`) && !booked.includes(`${String(h+1).padStart(2,"0")}:00`);
    return true;
  };
  const total = start==null?0:priceFor(start,duration);
  const submit = async e => {
    e.preventDefault(); setMessage("");
    if(!name.trim() || !/^[6-9]\d{9}$/.test(phone) || !start) {setMessage("Enter your name, valid mobile number and a slot.");return;}
    setLoading(true);
    try {
      if(!supabase) throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
      const {data,error}=await supabase.rpc("create_radhe_booking",{
        p_name:name.trim(),p_phone:phone,p_date:date,p_start_time:`${String(start).padStart(2,"0")}:00`,
        p_duration_hours:duration,p_players:players,p_total_price:total,p_slot_label:slotLabel(start,duration)
      });
      if(error) throw error;
      const text=`🏏 RADHE BOX CRICKET BOOKING%0A%0AName: ${encodeURIComponent(name)}%0ADate: ${date}%0ATime: ${encodeURIComponent(slotLabel(start,duration))}%0APlayers: ${players}%0ADuration: ${duration} hour${duration>1?"s":""}%0AAmount: ₹${total}%0AStatus: Pending`;
      window.open(`https://wa.me/${WHATSAPP}?text=${text}`,"_blank");
      onSuccess?.(data);
      setMessage("Booking request sent successfully. WhatsApp confirmation is ready.");
      setName("");setPhone("");setStart(null);
      load();
    } catch(err) { setMessage(err.message || "Booking failed."); }
    finally {setLoading(false);}
  };

  return <section id="book" className="section booking"><div className="section-tag">03 / BOOK YOUR GAME</div><div className="booking-head"><div><h2>LOCK IN<br/><em>GAME TIME.</em></h2><p>Pick a date, choose your session and let the arena handle the rest.</p></div><div className="duration"><button className={duration===1?"on":""} onClick={()=>{setDuration(1);setStart(null)}}>1 HOUR</button><button className={duration===2?"on":""} onClick={()=>{setDuration(2);setStart(null)}}>2 HOURS <span>POWER</span></button></div></div>
    <DatePicker date={date} setDate={date=>{setDate(date);setStart(null)}}/>
    <div className="slot-panel"><div className="slot-top"><span><Clock3/> AVAILABLE SESSIONS</span><small>DAY ₹800 / HR • NIGHT ₹1100 / HR</small></div><div className="slot-grid">{slots.map(h=>{const ok=available(h), selected=start===h;return <button key={h} disabled={!ok} className={`slot ${selected?"selected":""} ${!ok?"off":""}`} onClick={()=>setStart(h)}><strong>{hourLabel(h)}</strong><span>{duration===2?`→ ${hourLabel(h+2)}`:`→ ${hourLabel(h+1)}`}</span><small>{!ok?(blocked.includes(`${String(h).padStart(2,"0")}:00`)?"BLOCKED":"BOOKED"):`₹${priceFor(h,duration)}`}</small></button>})}</div></div>
    <form className="booking-form" onSubmit={submit}><div className="field"><label>YOUR NAME</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Kaustubh" /></div><div className="field"><label>MOBILE</label><input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10-digit mobile" /></div><div className="field"><label>PLAYERS</label><input type="number" min="1" max="30" value={players} onChange={e=>setPlayers(Number(e.target.value))}/></div><div className="summary"><span>YOUR GAME TIME</span><strong>{start!=null?slotLabel(start,duration):"Select a slot"}</strong><small>{start!=null?`₹${total} • ${duration} hour${duration>1?"s":""} • ${players} players`:"Choose a session above"}</small></div><button className="primary submit" disabled={loading}>{loading?"LOCKING...":"CONFIRM BOOKING"} <ArrowRight/></button></form>{message&&<div className="notice">{message}</div>}</section>;
}

function Admin({onClose}) {
  const [session,setSession]=useState(null);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [date,setDate]=useState(isoDate(new Date()));
  const [bookings,setBookings]=useState([]);
  const [blocked,setBlocked]=useState([]);
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState("");

  const refresh=async()=>{
    if(!supabase||!session)return;
    const [b,s]=await Promise.all([
      supabase.from("bookings").select("*").order("date",{ascending:false}).order("start_time"),
      supabase.from("blocked_slots").select("*").eq("date",date).order("start_time")
    ]);
    setBookings(b.data||[]);setBlocked(s.data||[]);
  };
  useEffect(()=>{if(session)refresh()},[session,date]);

  const login=async e=>{
    e.preventDefault();setMsg("");
    if(!supabase){setMsg("Configure Supabase first.");return;}
    const {data,error}=await supabase.auth.signInWithPassword({email,password});
    if(error) setMsg(error.message); else setSession(data.session);
  };
  const logout=async()=>{await supabase?.auth.signOut();setSession(null)};

  const toggleBlock=async h=>{
    const key=`${String(h).padStart(2,"0")}:00`;
    const found=blocked.find(x=>x.start_time?.slice(0,5)===key);
    setBusy(true);
    if(found) await supabase.from("blocked_slots").delete().eq("id",found.id);
    else await supabase.from("blocked_slots").insert({date,start_time:key,end_time:`${String(h+1).padStart(2,"0")}:00`,reason:"Blocked by admin"});
    setBusy(false);refresh();
  };
  const updateStatus=async(id,status)=>{await supabase.from("bookings").update({status}).eq("id",id);refresh()};

  if(!session) return <div className="admin-screen"><button className="close-admin" onClick={onClose}><X/></button><div className="admin-login"><div className="section-tag">RADHE COMMAND CENTER</div><h2>CONTROL<br/><em>THE GAME.</em></h2><form onSubmit={login}><input type="email" placeholder="Admin email" value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/><button className="primary">SIGN IN <ArrowRight/></button></form>{msg&&<p className="error">{msg}</p>}<small>Admin users must be created in Supabase Auth and added to public.admin_users.</small></div></div>;

  const pending=bookings.filter(x=>x.status==="Pending").length;
  const revenue=bookings.filter(x=>x.status==="Approved").reduce((a,x)=>a+(x.total_price||0),0);

  return <div className="admin-screen"><div className="admin-wrap"><div className="admin-bar"><div><span className="section-tag">RADHE COMMAND CENTER</span><h2>CONTROL ROOM</h2></div><div><button className="ghost" onClick={logout}>LOG OUT</button><button className="close-admin" onClick={onClose}><X/></button></div></div>
    <div className="admin-stats"><div><small>ALL BOOKINGS</small><strong>{bookings.length}</strong></div><div><small>PENDING</small><strong>{pending}</strong></div><div><small>APPROVED REVENUE</small><strong>₹{revenue}</strong></div><div><small>BLOCKED TODAY</small><strong>{blocked.length}</strong></div></div>
    <div className="admin-grid"><section className="admin-card"><div className="admin-card-head"><h3>Slot Control</h3><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></div><div className="admin-slots">{slots.map(h=>{const b=blocked.find(x=>x.start_time?.slice(0,5)===`${String(h).padStart(2,"0")}:00`);return <button disabled={busy} className={b?"blocked":""} onClick={()=>toggleBlock(h)} key={h}><span>{hourLabel(h)}</span><small>{b?"BLOCKED":"AVAILABLE"}</small></button>})}</div></section>
    <section className="admin-card"><div className="admin-card-head"><h3>Bookings</h3><button className="ghost" onClick={refresh}>REFRESH</button></div><div className="booking-list">{bookings.slice(0,30).map(b=><article key={b.id}><div><strong>{b.name}</strong><span>{b.date} • {b.slot}</span><small>{b.players} players • {b.booking_type} • ₹{b.total_price}</small></div><div className="actions">{b.status==="Pending"&&<><button onClick={()=>updateStatus(b.id,"Approved")}><Check/></button><button onClick={()=>updateStatus(b.id,"Rejected")}><X/></button></> }<b className={b.status.toLowerCase()}>{b.status}</b></div></article>)}</div></section></div>
  </div></div>;
}

function SecretCricket({close}) {
  const [ball,setBall]=useState(0),[result,setResult]=useState(""),[score,setScore]=useState(0);
  const swing=()=>{if(result)return;const n=30+Math.floor(Math.random()*48);let r=n>=48&&n<=58?6:n>=40&&n<=66?4:n>=30&&n<=75?1:0;setBall(n);setScore(s=>s+r);setResult(r===6?"SIX!":r===4?"FOUR!":r===1?"SINGLE":"WICKET");};
  useEffect(()=>{const f=e=>{if([" ","Enter"].includes(e.key))swing()};addEventListener("keydown",f);return()=>removeEventListener("keydown",f)});
  return <div className="game-overlay"><button className="game-close" onClick={close}><X/></button><div className="game"><span className="section-tag">SECRET CRICKET MODE</span><h2>TIME YOUR<br/><em>SWING.</em></h2><div className="game-score">{score}<small>RUNS</small></div><div className="game-pitch"><div className="game-ball" style={{left:`${18+ball}%`}}/></div><p>{result||"Press SPACE / ENTER or tap SWING"}</p><button className="primary" onClick={swing}>SWING</button><button className="ghost" onClick={()=>{setBall(0);setResult("");setScore(0)}}>REPLAY</button></div></div>;
}

function App(){
  const [intro,setIntro]=useState(true),[secret,setSecret]=useState(false),[admin,setAdmin]=useState(false),[toast,setToast]=useState("");
  const book=()=>document.getElementById("book")?.scrollIntoView({behavior:"smooth"});
  return <>{intro&&<CinematicIntro onDone={()=>setIntro(false)}/>}<ScrollBall/>
    <Navbar onBook={book} onSecret={()=>setSecret(true)}/>
    <main><Hero onBook={book}/><Stats/><About/><Arena/><Booking onSuccess={()=>{setToast("Booking request received.");setTimeout(()=>setToast(""),4000)}}/><section id="contact" className="contact section"><div><div className="section-tag">04 / FIND US</div><h2>SEE YOU<br/><em>AT RADHE.</em></h2></div><div className="contact-card"><MapPin/><strong>RADHE BOX CRICKET</strong><span>Ahmedabad, Gujarat</span><a href="https://www.google.com/maps/search/?api=1&query=Radhe+Box+Cricket+Ahmedabad" target="_blank">OPEN LOCATION <ArrowRight size={16}/></a><a href="https://instagram.com/radhe_box_cricket" target="_blank"><Instagram size={16}/> @radhe_box_cricket</a></div></section></main>
    <footer><span>RADHE BOX CRICKET</span><span>YOUR GAME. YOUR NIGHT.</span><button onClick={()=>setAdmin(true)}><Lock size={13}/> ADMIN</button></footer>
    {secret&&<SecretCricket close={()=>setSecret(false)}/>}
    {admin&&<Admin onClose={()=>setAdmin(false)}/>}
    {toast&&<div className="toast">{toast}</div>}
  </>;
}

createRoot(document.getElementById("root")).render(<App/>);
