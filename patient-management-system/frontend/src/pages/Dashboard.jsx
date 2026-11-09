import { useEffect, useState } from 'react';
import { Users, Stethoscope, CalendarDays, Clock3, ArrowUpRight, Plus, Activity, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../services/api';

function StatCard({label,value,detail,Icon,tone}) {
 return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={20}/></div><div className="stat-label">{label}</div><div className="stat-value">{value ?? '—'}</div><div className="stat-detail">{detail}</div></div>;
}
export default function Dashboard(){
 const [stats,setStats]=useState(null),[error,setError]=useState('');
 useEffect(()=>{api.get('/dashboard').then(r=>setStats(r.data.data)).catch(e=>setError(errorMessage(e)));},[]);
 return <div className="stack-lg">
  <div className="welcome-banner"><div><span className="welcome-kicker">YOUR CLINIC AT A GLANCE</span><h2>Good day. Let's care better.</h2><p>Here is what is happening across your clinic today.</p></div><div className="welcome-art"><HeartPulse size={72}/></div></div>
  {error && <div className="error-banner">{error}</div>}
  <div className="stats-grid">
   <StatCard label="Total patients" value={stats?.totalPatients} detail="Registered in the system" Icon={Users} tone="blue"/>
   <StatCard label="Medical team" value={stats?.totalDoctors} detail="Doctor profiles" Icon={Stethoscope} tone="purple"/>
   <StatCard label="Appointments today" value={stats?.appointmentsToday} detail="Scheduled for today" Icon={CalendarDays} tone="green"/>
   <StatCard label="Upcoming visits" value={stats?.upcomingAppointments} detail="Scheduled or confirmed" Icon={Clock3} tone="orange"/>
  </div>
  <div className="dashboard-grid">
   <div className="panel recent-panel"><div className="panel-heading"><div><h3>Recently registered patients</h3><p>The latest additions to your patient directory.</p></div><Link to="/patients" className="text-link">View all <ArrowUpRight size={15}/></Link></div>
    {!stats ? <div className="empty-cell">Loading patient activity…</div> : stats.recentPatients.length===0 ? <div className="empty-state"><Users size={28}/><b>No patients yet</b><span>New registrations will appear here.</span><Link className="primary-button" to="/patients"><Plus size={16}/> Add patient</Link></div> : <div className="recent-list">{stats.recentPatients.map(p=><div className="recent-row" key={p.id}><div className="patient-avatar">{p.first_name?.[0]}{p.last_name?.[0]}</div><div className="recent-person"><b>{p.first_name} {p.last_name}</b><small>{p.patient_number}</small></div><span className={`status-pill ${p.status}`}>{p.status}</span><small className="recent-date">{new Date(p.created_at).toLocaleDateString()}</small></div>)}</div>}
   </div>
   <div className="panel quick-panel"><div className="panel-heading"><div><h3>Quick actions</h3><p>Jump into common tasks.</p></div></div>
    <Link to="/patients" className="quick-link"><span className="quick-icon blue"><Users size={18}/></span><span><b>Register a patient</b><small>Add a new patient profile</small></span><ArrowUpRight size={16}/></Link>
    <Link to="/appointments" className="quick-link"><span className="quick-icon green"><CalendarDays size={18}/></span><span><b>Schedule appointment</b><small>Arrange a patient visit</small></span><ArrowUpRight size={16}/></Link>
    <Link to="/medical-records" className="quick-link"><span className="quick-icon purple"><Activity size={18}/></span><span><b>Write medical record</b><small>Document a consultation</small></span><ArrowUpRight size={16}/></Link>
   </div>
  </div>
  <div className="privacy-note"><Activity size={17}/><span><b>Privacy reminder</b> — Only access patient information required for your role. Use synthetic data while developing and testing this application.</span></div>
 </div>;
}
