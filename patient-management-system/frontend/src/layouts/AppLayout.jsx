import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, Users, Stethoscope, CalendarDays, ClipboardList, Pill, LogOut, Menu, Bell, Search, HeartPulse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const links = [
  ['/', 'Overview', LayoutDashboard],
  ['/patients', 'Patients', Users],
  ['/doctors', 'Doctors', Stethoscope],
  ['/appointments', 'Appointments', CalendarDays],
  ['/medical-records', 'Medical records', ClipboardList],
  ['/prescriptions', 'Prescriptions', Pill]
];
export default function AppLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const title = links.find(([path]) => path === location.pathname)?.[1] || 'Overview';
  return <div className="app-shell">
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-icon"><HeartPulse size={22}/></span><span>Care<span className="brand-light">Desk</span><small>CLINIC MANAGEMENT</small></span></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{links.map(([path,label,Icon]) => <NavLink key={path} to={path} end={path === '/'} onClick={() => setOpen(false)} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><Activity size={18}/><b>Care with clarity</b><span>Keep your clinic organised and your team connected.</span></div><button className="logout-button" onClick={logout}><LogOut size={17}/> Sign out</button></div>
    </aside>
    {open && <button className="mobile-scrim" onClick={() => setOpen(false)} aria-label="Close menu"/>}
    <main className="main-area">
      <header className="topbar"><button className="icon-button mobile-menu" onClick={() => setOpen(!open)}><Menu size={20}/></button><div><div className="eyebrow">PATIENT MANAGEMENT</div><h1>{title}</h1></div><div className="topbar-right"><div className="top-search"><Search size={16}/><span>Care workspace</span></div><button className="icon-button" title="Notifications"><Bell size={19}/></button><div className="user-chip"><div className="avatar">{(user?.fullName || 'A').slice(0,1).toUpperCase()}</div><div><b>{user?.fullName || 'Administrator'}</b><small>{user?.role || 'Staff'}</small></div></div></div></header>
      <section className="page-content"><Outlet/></section>
      <footer className="footer">CareDesk · Patient Management <span>Use responsibly · Protect patient information</span></footer>
    </main>
  </div>;
}
