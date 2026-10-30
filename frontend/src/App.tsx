import { useEffect, useState, useCallback } from 'react';
import { api } from './api';

type Exp = { id: number; amount: number; note: string; date: string };
type Cat = { id: number; name: string; budget: number; spent: number; remaining: number; expenses: Exp[] };
type Summary = { income: number; categories: Cat[]; totalBudget: number; totalSpent: number; unallocated: number; balance: number };

const fmt = (n: number) => n.toLocaleString('ar-EG', { maximumFractionDigits: 2 });
const prevMonth = (m: string) => { const [y, mo] = m.split('-').map(Number); const d = new Date(y, mo - 2, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };

function Login({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [err, setErr] = useState('');
  const submit = async () => {
    try { const r = await api('/auth/' + mode, 'POST', { email, password }); localStorage.setItem('token', r.token); onDone(); }
    catch (e: any) { setErr(e.message); }
  };
  return (
    <div className="wrap"><div className="card" style={{ maxWidth: 360, margin: '60px auto' }}>
      <h2>{mode === 'login' ? 'تسجيل الدخول' : 'حساب جديد'}</h2>
      <div className="row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <input placeholder="الإيميل" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="كلمة السر (6+ حروف)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <span className="bad">{err}</span>}
        <button onClick={submit}>{mode === 'login' ? 'دخول' : 'تسجيل'}</button>
        <button className="g" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'معنديش حساب' : 'عندي حساب'}</button>
      </div></div></div>
  );
}

function CategoryCard({ c, reload }: { c: Cat; reload: () => void }) {
  const [amount, setAmount] = useState(''); const [note, setNote] = useState('');
  const pct = c.budget ? Math.min(100, (c.spent / c.budget) * 100) : c.spent ? 100 : 0;
  const color = c.remaining < 0 ? 'var(--bad)' : pct >= 80 ? 'var(--warn)' : 'var(--ok)';
  const add = async () => { if (!amount) return; await api('/expenses', 'POST', { categoryId: c.id, amount: +amount, note }); setAmount(''); setNote(''); reload(); };
  const editBudget = async () => { const v = prompt('الميزانية الجديدة', String(c.budget)); if (v !== null && v !== '') { await api('/categories/' + c.id, 'PATCH', { budget: +v }); reload(); } };
  const rename = async () => { const v = prompt('الاسم الجديد', c.name); if (v) { await api('/categories/' + c.id, 'PATCH', { name: v }); reload(); } };
  const del = async () => { if (confirm('حذف ' + c.name + ' وكل مصروفاتها؟')) { await api('/categories/' + c.id, 'DELETE'); reload(); } };
  return (
    <div className="card">
      <div className="row sp"><b>{c.name}</b><span><button className="g" onClick={rename}>اسم</button><button className="g" onClick={editBudget}>ميزانية</button><button className="g" onClick={del}>حذف</button></span></div>
      <div className="bar"><i style={{ width: pct + '%', background: color }} /></div>
      <div className="row sp"><span className="mut">صرفت {fmt(c.spent)} من {fmt(c.budget)}</span>
        <b className={c.remaining < 0 ? 'bad' : 'ok'}>{c.remaining < 0 ? 'عدّيت بـ ' + fmt(-c.remaining) : 'متبقي ' + fmt(c.remaining)}</b></div>
      <div className="row" style={{ marginTop: 8 }}>
        <input style={{ width: 90 }} type="number" placeholder="المبلغ" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <input style={{ flex: 1 }} placeholder="ملاحظة (اختياري)" value={note} onChange={(e) => setNote(e.target.value)} />
        <button onClick={add}>أضف</button>
      </div>
      {c.expenses.slice(0, 5).map((e) => (
        <div key={e.id} className="row sp mut"><span>{e.date} {e.note && '· ' + e.note}</span>
          <span>{fmt(e.amount)} <button className="g" onClick={async () => { await api('/expenses/' + e.id, 'DELETE'); reload(); }}>✕</button></span></div>
      ))}
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [s, setS] = useState<Summary | null>(null);
  const [income, setIncome] = useState(''); const [name, setName] = useState(''); const [budget, setBudget] = useState('');
  const load = useCallback(async () => { const d = await api<Summary>(`/months/${month}/summary`); setS(d); setIncome(String(d.income || '')); }, [month]);
  useEffect(() => { load(); }, [load]);
  const saveIncome = async () => { await api(`/months/${month}/income`, 'PUT', { income: +income }); load(); };
  const addCat = async () => { if (!name) return; await api('/categories', 'POST', { month, name, budget: +budget || 0 }); setName(''); setBudget(''); load(); };
  const copy = async () => { const r = await api(`/months/${month}/copy-from/${prevMonth(month)}`, 'POST'); alert(`اتنسخ ${r.copied} بند`); load(); };
  return (
    <div className="wrap">
      <div className="row sp"><h2>مصروفاتي</h2><span className="row"><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /><button className="g" onClick={onLogout}>خروج</button></span></div>
      <div className="card row">
        <input type="number" placeholder="مرتب الشهر" value={income} onChange={(e) => setIncome(e.target.value)} />
        <button onClick={saveIncome}>حفظ المرتب</button>
        <button className="g" onClick={copy}>انسخ ميزانية الشهر اللي فات</button>
      </div>
      {s && <>
        <div className="card stats">
          <div><span className="mut">المرتب</span><b>{fmt(s.income)}</b></div>
          <div><span className="mut">إجمالي الميزانيات</span><b>{fmt(s.totalBudget)}</b></div>
          <div><span className="mut">اتصرف</span><b>{fmt(s.totalSpent)}</b></div>
          <div><span className="mut">الباقي معاك</span><b className={s.balance < 0 ? 'bad' : 'ok'}>{fmt(s.balance)}</b></div>
          <div><span className="mut">غير موزّع</span><b className={s.unallocated < 0 ? 'bad' : ''}>{fmt(s.unallocated)}</b></div>
        </div>
        {s.unallocated < 0 && <div className="card bad">وزّعت ميزانيات أكتر من مرتبك بـ {fmt(-s.unallocated)}</div>}
        {s.categories.map((c) => <CategoryCard key={c.id} c={c} reload={load} />)}
        <div className="card row">
          <input placeholder="بند جديد (مثلاً هدوم)" value={name} onChange={(e) => setName(e.target.value)} />
          <input style={{ width: 100 }} type="number" placeholder="الميزانية" value={budget} onChange={(e) => setBudget(e.target.value)} />
          <button onClick={addCat}>إضافة بند</button>
        </div>
      </>}
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'));
  return authed ? <Dashboard onLogout={() => { localStorage.removeItem('token'); setAuthed(false); }} /> : <Login onDone={() => setAuthed(true)} />;
}
