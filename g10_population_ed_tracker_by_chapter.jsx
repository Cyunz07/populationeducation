import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, ReferenceLine,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { LayoutDashboard, Users, FileEdit, BookOpen, GraduationCap, Plus, Trash2 } from 'lucide-react';

const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');";

const COLORS = {
  green: '#1F6D3B',
  greenDeep: '#123822',
  greenMid: '#3F8F5C',
  greenDark: '#0F4B29',
  greenSoft: '#D9EAD9',
  red: '#B23B2E',
  redSoft: '#F4D9D4',
  white: '#FFFFFF',
  cream: '#F7F2E7',
  paper: '#FFFFFF',
  ink: '#1C2620',
  inkSoft: '#5B6B60',
};

const TYPES = ['Assignment', 'Notes', 'Reading'];
const TYPE_COLOR = { Assignment: COLORS.green, Notes: COLORS.greenMid, Reading: COLORS.greenDark };

const CHAPTERS = [
  { num: 1, title: 'Population and Population Education' },
  { num: 2, title: 'Population Policies and Programmes in Nepal' },
  { num: 3, title: 'Population Change' },
  { num: 4, title: 'Gender' },
  { num: 5, title: 'Comprehensive Sexuality Education' },
  { num: 6, title: 'Family Life Education' },
  { num: 7, title: 'Sources of Population Data' },
  { num: 8, title: 'Population and Sustainable Development' },
  { num: 9, title: 'Population Analysis' },
];

const TERMS = ['First Term', 'Mid Term', 'Second Term', 'Pre SEE Qualifying', 'SEE Qualifying', 'Boost Up'];
const TERM_SHORT = {
  'First Term': '1st Term',
  'Mid Term': 'Mid Term',
  'Second Term': '2nd Term',
  'Pre SEE Qualifying': 'Pre-SEE',
  'SEE Qualifying': 'SEE Qual.',
  'Boost Up': 'Boost Up',
};
const PASS_MARK = 40; // pass threshold, in percent

const DEFAULT_STUDENTS = [
  "AARON PRADHAN","AAYUSH GURUNG","ADRIN CHAUDHARY","ALEX KHATRI","AMRITA GURUNG",
  "DIPTESH NEUPANE","JENISHA JARGA MAGAR","KHUSHIL BHUSHAL","KRISH KHADKA","KRISHNA RANA",
  "KRISPEAN GHIMIRE","LAKPA TENJI TAMANG","NABINA BASNET","NIKITA TAMANG","NISCHAL GURUNG",
  "PALMU TAMANG","PALSANG GURUNG","PURNIMA NAGARKOTI","RAYMON TAMANG","RITESH K.C",
  "RONIT SHRESTHA","SANJITA DHAKAL","SAUGAT UPRETI","SHUBHAM GURUNG","SIYA PUN",
  "SONIYA PYAKUREL","SPANDAN DHAKAL","SUBASH BASNET","SUBHI SHRESTHA","SUNDAR KHANAL",
  "SURAJ BAYALKOTI","SURAJ GURUNG","TAMANA THAPA",
];

function uid() { return Math.random().toString(36).slice(2, 10); }
function todayISO() { return new Date().toISOString().slice(0, 10); }
function pct(marks, fullMarks) { return fullMarks ? Math.round((marks / fullMarks) * 1000) / 10 : 0; }

async function loadAll() {
  let students = null, entries = [], marks = [];
  try {
    const s = await window.storage.get('g10-students-v2', false);
    if (s?.value) students = JSON.parse(s.value);
  } catch (e) {}
  try {
    const e = await window.storage.get('g10-entries-v2', false);
    if (e?.value) entries = JSON.parse(e.value);
  } catch (e) {}
  try {
    const m = await window.storage.get('g10-marks-v1', false);
    if (m?.value) marks = JSON.parse(m.value);
  } catch (e) {}
  if (!students) {
    students = DEFAULT_STUDENTS.map((name, i) => ({ id: uid(), roll: i + 1, name }));
  }
  return { students, entries, marks };
}
async function saveStudents(students) {
  try { await window.storage.set('g10-students-v2', JSON.stringify(students), false); } catch (e) {}
}
async function saveEntries(entries) {
  try { await window.storage.set('g10-entries-v2', JSON.stringify(entries), false); } catch (e) {}
}
async function saveMarks(marks) {
  try { await window.storage.set('g10-marks-v1', JSON.stringify(marks), false); } catch (e) {}
}

function SmallCaps({ children, style }) {
  return <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11, color: COLORS.inkSoft, fontFamily: 'Inter, sans-serif', fontWeight: 600, ...style }}>{children}</span>;
}

function RegisterCard({ label, value, accent }) {
  return (
    <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.greenSoft}`, borderLeft: `4px solid ${accent}`, borderRadius: 4, padding: '16px 18px', minWidth: 140, flex: 1 }}>
      <SmallCaps>{label}</SmallCaps>
      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 26, color: COLORS.ink, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
      padding: '10px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
      background: active ? COLORS.green : 'transparent',
      color: active ? COLORS.white : COLORS.ink,
      fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500,
      marginBottom: 4, transition: 'background 0.15s',
    }}>
      <Icon size={16} color={active ? COLORS.white : COLORS.inkSoft} />
      {label}
    </button>
  );
}

const inputStyle = { padding: '8px 10px', border: `1px solid ${COLORS.greenSoft}`, borderRadius: 4, fontFamily: 'Inter, sans-serif', fontSize: 13, background: COLORS.paper };

function Badge({ pass }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em',
      color: pass ? COLORS.green : COLORS.red,
      background: pass ? COLORS.greenSoft : COLORS.redSoft,
    }}>{pass ? 'Pass' : 'Fail'}</span>
  );
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [entries, setEntries] = useState([]);
  const [marks, setMarks] = useState([]);
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll().then(({ students, entries, marks }) => {
      setStudents(students); setEntries(entries); setMarks(marks); setLoading(false);
    });
  }, []);

  const addStudent = async (student) => {
    const next = [...students, { ...student, id: uid() }];
    setStudents(next); await saveStudents(next);
  };
  const removeStudent = async (id) => {
    const next = students.filter(s => s.id !== id);
    setStudents(next); await saveStudents(next);
  };
  const addEntries = async (list) => {
    const next = [...entries, ...list.map(e => ({ ...e, id: uid() }))];
    setEntries(next); await saveEntries(next);
  };
  const addMarks = async (list) => {
    const next = [...marks, ...list.map(m => ({ ...m, id: uid() }))];
    setMarks(next); await saveMarks(next);
  };

  if (loading) {
    return (
      <div style={{ padding: 40, fontFamily: 'Inter, sans-serif', color: COLORS.inkSoft }}>
        <style>{FONT_IMPORT}</style>
        Opening the register…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: 640, background: COLORS.cream, fontFamily: 'Inter, sans-serif', borderRadius: 8, overflow: 'hidden', border: `1px solid ${COLORS.greenSoft}` }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ width: 210, background: COLORS.greenDeep, padding: '22px 14px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 26, paddingLeft: 4 }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 19, color: COLORS.cream, lineHeight: 1.15 }}>Grade 10<br/>Population Ed.</div>
          <SmallCaps style={{ color: COLORS.cream, opacity: 0.7 }}>Aarambha Academy</SmallCaps>
        </div>
        <NavItem icon={Users} label="Students" active={tab === 'students'} onClick={() => setTab('students')} />
        <NavItem icon={FileEdit} label="Assignment / Notes / Reading" active={tab === 'entry'} onClick={() => setTab('entry')} />
        <NavItem icon={GraduationCap} label="Term Marks" active={tab === 'marks'} onClick={() => setTab('marks')} />
        <NavItem icon={LayoutDashboard} label="Dashboard" active={tab === 'dashboard'} onClick={() => setTab('dashboard')} />
        <NavItem icon={BookOpen} label="Student Records" active={tab === 'records'} onClick={() => setTab('records')} />
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid rgba(247,242,231,0.2)` }}>
          <SmallCaps style={{ color: COLORS.cream, opacity: 0.55 }}>{students.length} students · 9 chapters · 6 terms</SmallCaps>
        </div>
      </div>
      <div style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
        {tab === 'students' && <Students students={students} onAdd={addStudent} onRemove={removeStudent} />}
        {tab === 'entry' && <QuickEntry students={students} onSaveBatch={addEntries} />}
        {tab === 'marks' && <MarksEntry students={students} onSaveMarks={addMarks} />}
        {tab === 'dashboard' && <Dashboard students={students} entries={entries} marks={marks} />}
        {tab === 'records' && <Records students={students} entries={entries} marks={marks} />}
      </div>
    </div>
  );
}

function Students({ students, onAdd, onRemove }) {
  const [name, setName] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const nextRoll = students.length ? Math.max(...students.map(s => s.roll || 0)) + 1 : 1;
    onAdd({ name: name.trim(), roll: nextRoll });
    setName('');
  };
  const sorted = [...students].sort((a, b) => (a.roll || 0) - (b.roll || 0));

  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, color: COLORS.ink, margin: '0 0 18px' }}>Students</h1>
      <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input style={{ ...inputStyle, width: 260 }} value={name} onChange={e => setName(e.target.value)} placeholder="Student name" />
        <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 6, background: COLORS.green, color: COLORS.white, border: 'none', borderRadius: 4, padding: '9px 16px', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> Add
        </button>
      </form>
      <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.greenSoft}`, borderRadius: 4, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: COLORS.greenDeep }}>
              {['Roll', 'Name', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: COLORS.cream, fontFamily: 'Inter', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => (
              <tr key={s.id} style={{ borderTop: `1px solid ${COLORS.greenSoft}`, background: i % 2 ? 'rgba(31,109,59,0.05)' : 'transparent' }}>
                <td style={{ padding: '9px 14px', fontFamily: 'IBM Plex Mono', color: COLORS.inkSoft }}>{s.roll}</td>
                <td style={{ padding: '9px 14px', color: COLORS.ink, fontWeight: 500 }}>{s.name}</td>
                <td style={{ padding: '9px 14px' }}>
                  <button onClick={() => onRemove(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.red }}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuickEntry({ students, onSaveBatch }) {
  const [date, setDate] = useState(todayISO());
  const [chapter, setChapter] = useState(1);
  const [rows, setRows] = useState({});
  const [saved, setSaved] = useState(false);

  const setRow = (id, field, value) => setRows(r => ({ ...r, [id]: { ...r[id], [field]: value } }));

  const save = async () => {
    const list = [];
    students.forEach(s => {
      const r = rows[s.id];
      if (!r) return;
      TYPES.forEach(t => {
        const key = t.toLowerCase();
        if (r[key]) list.push({ studentId: s.id, type: t, chapter, date, status: r[key] });
      });
    });
    if (list.length) await onSaveBatch(list);
    setSaved(true); setRows({});
    setTimeout(() => setSaved(false), 2200);
  };

  const sorted = [...students].sort((a, b) => (a.roll || 0) - (b.roll || 0));
  const chapterInfo = CHAPTERS.find(c => c.num === Number(chapter));

  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, color: COLORS.ink, margin: '0 0 4px' }}>Assignment / Notes / Reading</h1>
      <SmallCaps>Log by chapter and date, for the whole class</SmallCaps>

      <div style={{ display: 'flex', gap: 14, margin: '16px 0', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SmallCaps>Chapter</SmallCaps>
          <select value={chapter} onChange={e => setChapter(Number(e.target.value))} style={{ ...inputStyle, width: 340 }}>
            {CHAPTERS.map(c => <option key={c.num} value={c.num}>Ch {c.num}: {c.title}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SmallCaps>Date</SmallCaps>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle, fontFamily: 'IBM Plex Mono' }} />
        </div>
      </div>

      <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.greenSoft}`, borderRadius: 4, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: COLORS.greenDeep }}>
              {['Roll', 'Name', 'Assignment', 'Notes', 'Reading'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: COLORS.cream, fontFamily: 'Inter', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => (
              <tr key={s.id} style={{ borderTop: `1px solid ${COLORS.greenSoft}`, background: i % 2 ? 'rgba(31,109,59,0.05)' : 'transparent' }}>
                <td style={{ padding: '9px 14px', fontFamily: 'IBM Plex Mono', color: COLORS.inkSoft }}>{s.roll}</td>
                <td style={{ padding: '9px 14px', fontWeight: 500 }}>{s.name}</td>
                {['assignment', 'notes', 'reading'].map(key => (
                  <td key={key} style={{ padding: '9px 14px' }}>
                    <select value={rows[s.id]?.[key] || ''} onChange={e => setRow(s.id, key, e.target.value)} style={{ padding: '5px 8px', border: `1px solid ${COLORS.greenSoft}`, borderRadius: 4, fontSize: 12 }}>
                      <option value="">—</option>
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={save} style={{ marginTop: 16, background: COLORS.green, color: COLORS.white, border: 'none', borderRadius: 4, padding: '10px 20px', fontFamily: 'Inter', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
        Save for Ch {chapter}{chapterInfo ? `: ${chapterInfo.title}` : ''}
      </button>
      {saved && <span style={{ marginLeft: 12, color: COLORS.green, fontSize: 13 }}>Saved to the register.</span>}
    </div>
  );
}

function MarksEntry({ students, onSaveMarks }) {
  const [term, setTerm] = useState(TERMS[0]);
  const [fullMarks, setFullMarks] = useState(75);
  const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState({});
  const [saved, setSaved] = useState(false);

  const setRow = (id, value) => setRows(r => ({ ...r, [id]: value }));

  const save = async () => {
    const fm = Number(fullMarks) || 100;
    const list = [];
    students.forEach(s => {
      const v = rows[s.id];
      if (v === undefined || v === '') return;
      const num = Number(v);
      if (Number.isNaN(num)) return;
      list.push({ studentId: s.id, term, marks: num, fullMarks: fm, date });
    });
    if (list.length) await onSaveMarks(list);
    setSaved(true); setRows({});
    setTimeout(() => setSaved(false), 2200);
  };

  const sorted = [...students].sort((a, b) => (a.roll || 0) - (b.roll || 0));

  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, color: COLORS.ink, margin: '0 0 4px' }}>Term Marks</h1>
      <SmallCaps>Log marks by term, for the whole class</SmallCaps>

      <div style={{ display: 'flex', gap: 14, margin: '16px 0', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SmallCaps>Term</SmallCaps>
          <select value={term} onChange={e => setTerm(e.target.value)} style={{ ...inputStyle, width: 220 }}>
            {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SmallCaps>Full Marks</SmallCaps>
          <input type="number" min="1" value={fullMarks} onChange={e => setFullMarks(e.target.value)} style={{ ...inputStyle, width: 100, fontFamily: 'IBM Plex Mono' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SmallCaps>Date</SmallCaps>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle, fontFamily: 'IBM Plex Mono' }} />
        </div>
      </div>

      <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.greenSoft}`, borderRadius: 4, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: COLORS.greenDeep }}>
              {['Roll', 'Name', `Marks (out of ${Number(fullMarks) || 100})`].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: COLORS.cream, fontFamily: 'Inter', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => (
              <tr key={s.id} style={{ borderTop: `1px solid ${COLORS.greenSoft}`, background: i % 2 ? 'rgba(31,109,59,0.05)' : 'transparent' }}>
                <td style={{ padding: '9px 14px', fontFamily: 'IBM Plex Mono', color: COLORS.inkSoft }}>{s.roll}</td>
                <td style={{ padding: '9px 14px', fontWeight: 500 }}>{s.name}</td>
                <td style={{ padding: '9px 14px' }}>
                  <input type="number" min="0" max={fullMarks || 100} value={rows[s.id] ?? ''} onChange={e => setRow(s.id, e.target.value)} style={{ padding: '5px 8px', border: `1px solid ${COLORS.greenSoft}`, borderRadius: 4, fontSize: 12, width: 80, fontFamily: 'IBM Plex Mono' }} placeholder="—" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={save} style={{ marginTop: 16, background: COLORS.green, color: COLORS.white, border: 'none', borderRadius: 4, padding: '10px 20px', fontFamily: 'Inter', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
        Save {term} marks
      </button>
      {saved && <span style={{ marginLeft: 12, color: COLORS.green, fontSize: 13 }}>Saved to the register.</span>}
    </div>
  );
}

function Dashboard({ students, entries, marks }) {
  const [chapterFilter, setChapterFilter] = useState('all');

  const latest = useMemo(() => {
    const map = {};
    entries.forEach(e => {
      const key = e.studentId + '|' + e.chapter + '|' + e.type;
      if (!map[key] || e.date > map[key].date) map[key] = e;
    });
    return Object.values(map);
  }, [entries]);

  const filtered = chapterFilter === 'all' ? latest : latest.filter(e => e.chapter === Number(chapterFilter));

  const overallCounts = useMemo(() => {
    const c = {}; TYPES.forEach(t => { c[t] = { Completed: 0, Pending: 0 }; });
    filtered.forEach(e => { if (c[e.type] && e.status) c[e.type][e.status]++; });
    return c;
  }, [filtered]);

  const barData = TYPES.map(t => ({ name: t, Completed: overallCounts[t]?.Completed || 0, Pending: overallCounts[t]?.Pending || 0 }));

  const perChapterTable = CHAPTERS.map(ch => {
    const chEntries = latest.filter(e => e.chapter === ch.num);
    const row = { chapter: ch };
    TYPES.forEach(t => {
      const total = chEntries.filter(e => e.type === t);
      const done = total.filter(e => e.status === 'Completed').length;
      row[t] = students.length ? Math.round((done / students.length) * 100) : 0;
    });
    return row;
  });

  const latestMarks = useMemo(() => {
    const map = {};
    marks.forEach(m => {
      const key = m.studentId + '|' + m.term;
      if (!map[key] || m.date > map[key].date) map[key] = m;
    });
    return map;
  }, [marks]);

  const termTrend = TERMS.map(term => {
    const rows = students.map(s => latestMarks[s.id + '|' + term]).filter(Boolean);
    const avg = rows.length ? rows.reduce((sum, m) => sum + pct(m.marks, m.fullMarks), 0) / rows.length : null;
    return { term: TERM_SHORT[term], average: avg === null ? null : Math.round(avg * 10) / 10 };
  });

  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, color: COLORS.ink, margin: '0 0 4px' }}>Dashboard</h1>
      <SmallCaps>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</SmallCaps>

      <SmallCaps style={{ display: 'block', marginTop: 22, marginBottom: 6, fontSize: 12 }}>Coursework Progress</SmallCaps>
      <div style={{ margin: '10px 0' }}>
        <SmallCaps>Filter by chapter: </SmallCaps>
        <select value={chapterFilter} onChange={e => setChapterFilter(e.target.value)} style={{ ...inputStyle, marginLeft: 8 }}>
          <option value="all">All chapters</option>
          {CHAPTERS.map(c => <option key={c.num} value={c.num}>Ch {c.num}: {c.title}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 14, margin: '16px 0 26px', flexWrap: 'wrap' }}>
        <RegisterCard label="Total Students" value={students.length} accent={COLORS.green} />
        {TYPES.map(t => (
          <RegisterCard key={t} label={`${t} Pending`} value={overallCounts[t]?.Pending || 0} accent={COLORS.red} />
        ))}
      </div>

      <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.greenSoft}`, borderRadius: 4, padding: '18px 20px', height: 280, marginBottom: 24 }}>
        <SmallCaps>Completed vs. Pending {chapterFilter === 'all' ? '— all chapters' : `— Ch ${chapterFilter}`}</SmallCaps>
        <ResponsiveContainer width="100%" height="86%">
          <BarChart data={barData} margin={{ top: 16, left: 0, right: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.greenSoft} />
            <XAxis dataKey="name" tick={{ fontFamily: 'Inter', fontSize: 12, fill: COLORS.inkSoft }} />
            <YAxis tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: COLORS.inkSoft }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontFamily: 'Inter', fontSize: 12, borderRadius: 4, border: `1px solid ${COLORS.greenSoft}` }} />
            <Bar dataKey="Completed" fill={COLORS.green} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Pending" fill={COLORS.red} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <SmallCaps>% of class completed, by chapter</SmallCaps>
      <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.greenSoft}`, borderRadius: 4, overflow: 'hidden', marginTop: 8, marginBottom: 34 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: COLORS.greenDeep }}>
              {['Chapter', 'Assignment', 'Notes', 'Reading'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '9px 14px', color: COLORS.cream, fontFamily: 'Inter', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {perChapterTable.map((row, i) => (
              <tr key={row.chapter.num} style={{ borderTop: `1px solid ${COLORS.greenSoft}`, background: i % 2 ? 'rgba(31,109,59,0.05)' : 'transparent' }}>
                <td style={{ padding: '9px 14px' }}>Ch {row.chapter.num}: {row.chapter.title}</td>
                {TYPES.map(t => (
                  <td key={t} style={{ padding: '9px 14px', fontFamily: 'IBM Plex Mono', color: row[t] === 100 ? COLORS.green : COLORS.inkSoft }}>{row[t]}%</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SmallCaps style={{ display: 'block', marginBottom: 6, fontSize: 12 }}>Term Marks</SmallCaps>

      <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.greenSoft}`, borderRadius: 4, padding: '18px 20px', height: 280, marginBottom: 24 }}>
        <SmallCaps>Class average % by term</SmallCaps>
        <ResponsiveContainer width="100%" height="86%">
          <LineChart data={termTrend} margin={{ top: 16, left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.greenSoft} />
            <XAxis dataKey="term" tick={{ fontFamily: 'Inter', fontSize: 11, fill: COLORS.inkSoft }} />
            <YAxis domain={[0, 100]} tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: COLORS.inkSoft }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontFamily: 'Inter', fontSize: 12, borderRadius: 4, border: `1px solid ${COLORS.greenSoft}` }} />
            <ReferenceLine y={PASS_MARK} stroke={COLORS.red} strokeDasharray="4 4" label={{ value: 'Pass', position: 'insideTopLeft', fill: COLORS.red, fontSize: 11, fontFamily: 'Inter' }} />
            <Line type="monotone" dataKey="average" stroke={COLORS.green} strokeWidth={2.5} dot={{ r: 4, fill: COLORS.green }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <SmallCaps>Marks by student and term (%)</SmallCaps>
      <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.greenSoft}`, borderRadius: 4, overflow: 'hidden', marginTop: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: COLORS.greenDeep }}>
              <th style={{ textAlign: 'left', padding: '9px 14px', color: COLORS.cream, fontFamily: 'Inter', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Student</th>
              {TERMS.map(t => (
                <th key={t} style={{ textAlign: 'center', padding: '9px 10px', color: COLORS.cream, fontFamily: 'Inter', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{TERM_SHORT[t]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...students].sort((a, b) => (a.roll || 0) - (b.roll || 0)).map((s, i) => (
              <tr key={s.id} style={{ borderTop: `1px solid ${COLORS.greenSoft}`, background: i % 2 ? 'rgba(31,109,59,0.05)' : 'transparent' }}>
                <td style={{ padding: '8px 14px', fontWeight: 500 }}>{s.roll}. {s.name}</td>
                {TERMS.map(t => {
                  const m = latestMarks[s.id + '|' + t];
                  const p = m ? pct(m.marks, m.fullMarks) : null;
                  const pass = p !== null && p >= PASS_MARK;
                  return (
                    <td key={t} style={{ padding: '6px 8px', textAlign: 'center' }}>
                      {p === null ? (
                        <span style={{ color: COLORS.inkSoft }}>—</span>
                      ) : (
                        <span style={{
                          display: 'inline-block', minWidth: 40, padding: '3px 6px', borderRadius: 4,
                          fontFamily: 'IBM Plex Mono', fontSize: 11.5,
                          color: pass ? COLORS.green : COLORS.red,
                          background: pass ? COLORS.greenSoft : COLORS.redSoft,
                        }}>{p}%</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Records({ students, entries, marks }) {
  const [selected, setSelected] = useState(students[0]?.id || '');
  const [chapterFilter, setChapterFilter] = useState('all');
  useEffect(() => { if (!selected && students.length) setSelected(students[0].id); }, [students]);

  const history = entries
    .filter(e => e.studentId === selected)
    .filter(e => chapterFilter === 'all' || e.chapter === Number(chapterFilter))
    .sort((a, b) => b.date.localeCompare(a.date) || a.chapter - b.chapter);

  const student = students.find(s => s.id === selected);

  const latestMarks = useMemo(() => {
    const map = {};
    marks.forEach(m => {
      const key = m.studentId + '|' + m.term;
      if (!map[key] || m.date > map[key].date) map[key] = m;
    });
    return map;
  }, [marks]);

  const radarData = TERMS.map(t => {
    const m = latestMarks[selected + '|' + t];
    return { term: TERM_SHORT[t], value: m ? pct(m.marks, m.fullMarks) : 0 };
  });

  const marksHistory = marks
    .filter(m => m.studentId === selected)
    .sort((a, b) => b.date.localeCompare(a.date) || TERMS.indexOf(b.term) - TERMS.indexOf(a.term));

  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, color: COLORS.ink, margin: '0 0 18px' }}>Student Records</h1>

      <div style={{ display: 'flex', gap: 14, marginBottom: 18, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SmallCaps>Student</SmallCaps>
          <select value={selected} onChange={e => setSelected(e.target.value)} style={{ ...inputStyle, minWidth: 240 }}>
            {students.length === 0 && <option value="">No students yet</option>}
            {[...students].sort((a, b) => (a.roll || 0) - (b.roll || 0)).map(s => (
              <option key={s.id} value={s.id}>{s.roll}. {s.name}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SmallCaps>Chapter</SmallCaps>
          <select value={chapterFilter} onChange={e => setChapterFilter(e.target.value)} style={{ ...inputStyle, minWidth: 240 }}>
            <option value="all">All chapters</option>
            {CHAPTERS.map(c => <option key={c.num} value={c.num}>Ch {c.num}: {c.title}</option>)}
          </select>
        </div>
      </div>

      {student && (
        <>
          <SmallCaps style={{ display: 'block', marginBottom: 8 }}>Coursework History</SmallCaps>
          <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.greenSoft}`, borderRadius: 4, overflow: 'hidden', marginBottom: 30 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: COLORS.greenDeep }}>
                  {['Date', 'Chapter', 'Type', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: COLORS.cream, fontFamily: 'Inter', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center', color: COLORS.inkSoft }}>No entries logged yet for this student.</td></tr>
                )}
                {history.map((h, i) => (
                  <tr key={h.id} style={{ borderTop: `1px solid ${COLORS.greenSoft}`, background: i % 2 ? 'rgba(31,109,59,0.05)' : 'transparent' }}>
                    <td style={{ padding: '9px 14px', fontFamily: 'IBM Plex Mono', color: COLORS.inkSoft }}>{h.date}</td>
                    <td style={{ padding: '9px 14px' }}>Ch {h.chapter}</td>
                    <td style={{ padding: '9px 14px', color: TYPE_COLOR[h.type], fontWeight: 600 }}>{h.type}</td>
                    <td style={{ padding: '9px 14px' }}>{h.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SmallCaps style={{ display: 'block', marginBottom: 8 }}>Term Marks Profile</SmallCaps>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
            <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.greenSoft}`, borderRadius: 4, padding: '16px 18px', height: 280, flex: '1 1 320px' }}>
              <SmallCaps>Performance across terms</SmallCaps>
              <ResponsiveContainer width="100%" height="86%">
                <RadarChart data={radarData} outerRadius={85}>
                  <PolarGrid stroke={COLORS.greenSoft} />
                  <PolarAngleAxis dataKey="term" tick={{ fontFamily: 'Inter', fontSize: 10.5, fill: COLORS.inkSoft }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fill: COLORS.inkSoft }} />
                  <Radar dataKey="value" stroke={COLORS.green} fill={COLORS.green} fillOpacity={0.28} />
                  <Tooltip contentStyle={{ fontFamily: 'Inter', fontSize: 12, borderRadius: 4, border: `1px solid ${COLORS.greenSoft}` }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.greenSoft}`, borderRadius: 4, overflow: 'hidden', flex: '1 1 320px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: COLORS.greenDeep }}>
                    {['Term', 'Marks', '%', 'Result'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '9px 12px', color: COLORS.cream, fontFamily: 'Inter', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {marksHistory.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center', color: COLORS.inkSoft }}>No marks logged yet.</td></tr>
                  )}
                  {marksHistory.map((m, i) => {
                    const p = pct(m.marks, m.fullMarks);
                    const pass = p >= PASS_MARK;
                    return (
                      <tr key={m.id} style={{ borderTop: `1px solid ${COLORS.greenSoft}`, background: i % 2 ? 'rgba(31,109,59,0.05)' : 'transparent' }}>
                        <td style={{ padding: '8px 12px' }}>{m.term}</td>
                        <td style={{ padding: '8px 12px', fontFamily: 'IBM Plex Mono', color: COLORS.inkSoft }}>{m.marks}/{m.fullMarks}</td>
                        <td style={{ padding: '8px 12px', fontFamily: 'IBM Plex Mono' }}>{p}%</td>
                        <td style={{ padding: '8px 12px' }}><Badge pass={pass} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
