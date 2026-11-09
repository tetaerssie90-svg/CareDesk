import { useState } from 'react';
import { HeartPulse, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useAuth as auth } from '../context/AuthContext';
import { errorMessage } from '../services/api';
export default function Login(){
 const {user,login}=useAuth(); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
 if(user) return <Navigate to="/" replace/>;
 async function submit(e){e.preventDefault();setBusy(true);setError('');try{await login(email,password);}catch(err){setError(errorMessage(err));}finally{setBusy(false);}}
 return <div className="login-page"><div className="login-card"><div className="login-brand"><span className="brand-icon"><HeartPulse size={24}/></span><span>Care<span className="brand-light">Desk</span></span></div><div className="login-copy"><div className="eyebrow">WELCOME BACK</div><h1>Sign in to your workspace</h1><p>Manage your clinic with clarity and care.</p></div><form onSubmit={submit} className="login-form"><label>Email address<div className="input-icon"><Mail size={17}/><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@clinic.com"/></div></label><label>Password<div className="input-icon"><LockKeyhole size={17}/><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/></div></label>{error&&<div className="error-banner">{error}</div>}<button className="primary-button login-submit" disabled={busy}>{busy?'Signing in…':'Sign in'}</button></form><div className="login-foot">Secure clinic workspace · Authorised users only</div></div></div>;
}
