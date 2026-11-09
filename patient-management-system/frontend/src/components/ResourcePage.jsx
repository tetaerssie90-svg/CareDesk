import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, RefreshCw, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api, { errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

function toLocalDateTime(value) {
  const date = new Date(value);
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function ResourcePage({ config }) {
  const [rows,setRows] = useState([]), [search,setSearch] = useState(''), [page,setPage] = useState(1);
  const [pagination,setPagination] = useState({pages:1,total:0}), [loading,setLoading] = useState(true);
  const [modal,setModal] = useState(false), [editing,setEditing] = useState(null), [form,setForm] = useState({});
  const [error,setError] = useState(''), [notice,setNotice] = useState('');
  const [lookups,setLookups] = useState({});
  const { user } = useAuth();
  const canDelete = user?.role === 'admin';
  const blank = useMemo(() => Object.fromEntries(config.fields.map(f => [f.name, f.defaultValue ?? ''])),[config]);
  async function load() {
    setLoading(true); setError('');
    try {
      const {data} = await api.get(`/${config.endpoint}`,{params:{page,limit:10,search}});
      setRows(data.data); setPagination(data.pagination);
    } catch(e) { setError(errorMessage(e)); } finally { setLoading(false); }
  }
  useEffect(() => { const timer = setTimeout(load,250); return () => clearTimeout(timer); },[page,search,config.endpoint]);
  useEffect(() => {
    const endpoints = [...new Set(config.fields.map(f => f.optionsEndpoint).filter(Boolean))];
    if (!endpoints.length) return;
    Promise.all(endpoints.map(async endpoint => {
      const response = await api.get(`/${endpoint}`, { params: { page: 1, limit: 100 } });
      return [endpoint, response.data.data || []];
    })).then(entries => setLookups(Object.fromEntries(entries))).catch(e => setError(errorMessage(e)));
  },[config]);
  function openCreate(){setEditing(null);setForm(blank);setError('');setModal(true);}
  function openEdit(row){setEditing(row);setForm(Object.fromEntries(config.fields.map(f=>[f.name, f.type === 'datetime-local' && row[f.name] ? toLocalDateTime(row[f.name]) : (row[f.name] ?? '')])));setError('');setModal(true);}
  async function save(e){
    e.preventDefault(); setError('');
    const payload = {...form};
    config.fields.forEach(f => {
      if (f.type === 'number' && payload[f.name] !== '') payload[f.name] = Number(payload[f.name]);
      if (f.type === 'datetime-local' && payload[f.name]) payload[f.name] = new Date(payload[f.name]).toISOString();
      if (payload[f.name] === '') payload[f.name] = null;
    });
    try {
      if(editing) await api.patch(`/${config.endpoint}/${editing.id}`,payload);
      else await api.post(`/${config.endpoint}`,payload);
      setModal(false); setNotice(editing ? 'Record updated.' : 'Record created.'); load();
    } catch(e){setError(errorMessage(e));}
  }
  async function remove(row){
    if(!window.confirm(`Delete this ${config.singular.toLowerCase()}? This cannot be undone.`)) return;
    try { await api.delete(`/${config.endpoint}/${row.id}`); setNotice('Record deleted.'); load(); }
    catch(e){setError(errorMessage(e));}
  }
  return <div className="stack-lg">
    <div className="page-heading"><div><h2>{config.heading}</h2><p>{config.description}</p></div><button className="primary-button" onClick={openCreate}><Plus size={17}/> Add {config.singular}</button></div>
    {notice && <div className="notice" role="status">{notice}<button onClick={()=>setNotice('')}><X size={15}/></button></div>}
    {error && !modal && <div className="error-banner">{error}</div>}
    <div className="panel">
      <div className="table-toolbar"><div className="search-field"><Search size={17}/><input value={search} onChange={e=>{setPage(1);setSearch(e.target.value);}} placeholder={`Search ${config.heading.toLowerCase()}...`}/></div><button className="outline-button" onClick={load}><RefreshCw size={15}/> Refresh</button><span className="result-count">{pagination.total} records</span></div>
      <div className="table-wrap"><table><thead><tr>{config.columns.map(c=><th key={c.key}>{c.label}</th>)}<th className="actions-head">ACTIONS</th></tr></thead>
      <tbody>{loading ? <tr><td colSpan={config.columns.length+1} className="empty-cell">Loading records…</td></tr> : rows.length===0 ? <tr><td colSpan={config.columns.length+1} className="empty-cell">No records found. Add your first {config.singular.toLowerCase()} to get started.</td></tr> : rows.map(row=><tr key={row.id}>{config.columns.map(c=><td key={c.key}>{c.render ? c.render(row) : (row[c.key] ?? '—')}</td>)}<td><div className="row-actions"><button className="small-icon" title="Edit" onClick={()=>openEdit(row)}><Pencil size={15}/></button>{canDelete && <button className="small-icon danger-icon" title="Delete" onClick={()=>remove(row)}><Trash2 size={15}/></button>}</div></td></tr>)}</tbody></table></div>
      <div className="table-pagination"><span>Page {page} of {Math.max(1,pagination.pages)}</span><div><button className="small-icon" disabled={page<=1} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={17}/></button><button className="small-icon" disabled={page>=pagination.pages} onClick={()=>setPage(p=>p+1)}><ChevronRight size={17}/></button></div></div>
    </div>
    {modal && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false);}}><form className="modal" onSubmit={save}>
      <div className="modal-header"><div><h3>{editing ? `Edit ${config.singular}` : `Add ${config.singular}`}</h3><p>Enter the details below.</p></div><button type="button" className="small-icon" onClick={()=>setModal(false)}><X size={19}/></button></div>
      <div className="form-grid">{config.fields.map(f=><label className={f.full ? 'form-full' : ''} key={f.name}>{f.label}{f.required && <i> *</i>}{f.type==='select' ? <select required={f.required} value={form[f.name] ?? ''} onChange={e=>setForm({...form,[f.name]:e.target.value})}><option value="">Select…</option>{(f.options || (lookups[f.optionsEndpoint] || []).map(row=>({value:row.id,label:f.optionLabel(row)}))).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select> : f.type==='textarea' ? <textarea required={f.required} rows="3" value={form[f.name] ?? ''} onChange={e=>setForm({...form,[f.name]:e.target.value})}/> : <input required={f.required} type={f.type || 'text'} value={form[f.name] ?? ''} onChange={e=>setForm({...form,[f.name]:e.target.value})}/>}</label>)}</div>
      {error && <div className="error-banner">{error}</div>}<div className="modal-actions"><button type="button" className="outline-button" onClick={()=>setModal(false)}>Cancel</button><button className="primary-button" type="submit">{editing?'Save changes':`Create ${config.singular}`}</button></div>
    </form></div>}
  </div>;
}
