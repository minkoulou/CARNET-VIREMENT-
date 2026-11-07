import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'

const fmt = n => new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'
const fmtDate = d => new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
const fmtTime = t => new Date(t).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const today = () => new Date().toISOString().slice(0, 10)
const initials = n => String(n).split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
const MODES = ['Espèces', 'Orange Money', 'MTN MoMo', 'Virement bancaire', 'Autre']

const spring = { type: 'spring', stiffness: 380, damping: 32 }
const card = 'bg-card border border-line rounded-2xl shadow-soft'
const field = 'w-full rounded-xl border border-line bg-surface px-3 py-2.5 font-medium transition focus:border-brand focus:ring-4 focus:ring-brandsoft focus:outline-none aria-invalid:border-bad'
const label = 'flex flex-col gap-1.5 text-[13px] font-semibold'
const TONES = { '': 'bg-brandsoft text-brand', g: 'bg-goodsoft text-good', r: 'bg-badsoft text-bad', a: 'bg-warnsoft text-warn' }
const BADGE = { bl: 'bg-brandsoft text-brand', rd: 'bg-badsoft text-bad', ok: 'bg-goodsoft text-good', wa: 'bg-warnsoft text-warn' }
const ALERT = { wa: 'bg-warnsoft text-warn border-warn/25', ok: 'bg-goodsoft text-good border-good/25', in: 'bg-brandsoft text-brand border-brand/25', er: 'bg-badsoft text-bad border-bad/25' }
const TOAST = { ok: ['bg-goodsoft text-good', 'bg-good'], err: ['bg-badsoft text-bad', 'bg-bad'], info: ['bg-brandsoft text-brand', 'bg-brand'] }
const BTN = {
  primary: 'text-white bg-linear-to-br from-[#1d4ed8] to-[#3b6cf5] shadow-[0_6px_16px_rgba(29,78,216,.28)]',
  soft: 'bg-brandsoft text-brand',
  red: 'text-white bg-linear-to-br from-[#c62828] to-[#e04b4b] shadow-[0_6px_16px_rgba(198,40,40,.28)]',
}

const P = {
  plus: 'M12 5v14M5 12h14', check: 'M5 13l4 4L19 7', x: 'M6 6l12 12M18 6L6 18',
  edit: 'M4 20h4L19 9l-4-4L4 16v4z', trash: 'M4 7h16M9 7V4h6v3m-8 0l1 13h8l1-13',
  arrow: 'M5 12h14m-5-5l5 5-5 5', swap: 'M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zM9 12l2 2 4-4',
  bell: 'M6 16v-5a6 6 0 1112 0v5l2 2H4l2-2zM10 21h4', out: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  alert: 'M12 8v5m0 3h.01M10.3 4l-8 14a2 2 0 001.7 3h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z',
  info: 'M12 11v5m0-8h.01M12 3a9 9 0 100 18 9 9 0 000-18z', clock: 'M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z',
  wallet: 'M3 7h16a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm0 0V6a2 2 0 012-2h11M16 14h2',
  down: 'M12 4v12m-5-5l5 5 5-5M5 20h14', eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z',
  up: 'M12 20V8m-5 5l5-5 5 5M5 4h14', list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
}
function Ico({ n, s = 20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[n]} /></svg>
}
function Logo({ s = 40 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" role="img" aria-label="Carnet de versements" className="flex-none drop-shadow-lg">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0b1f4d" /><stop offset="1" stopColor="#2f66f0" /></linearGradient>
        <clipPath id="lc1"><circle cx="25" cy="32" r="14" /></clipPath>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#lg1)" />
      <circle cx="25" cy="32" r="14" fill="#fff" fillOpacity=".92" />
      <circle cx="39" cy="32" r="14" fill="#fff" fillOpacity=".5" />
      <circle cx="39" cy="32" r="14" fill="#34d399" clipPath="url(#lc1)" />
      <path d="M27.5 32.5l3.3 3.3 6.2-6.8" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
const Spin = ({ dark }) => <span className={'size-[18px] animate-spin rounded-full border-[2.5px] ' + (dark ? 'border-line border-t-brand' : 'border-white/40 border-t-white')} />

function Btn({ kind = 'primary', sm, className = '', disabled, ...p }) {
  return (
    <motion.button whileHover={disabled ? undefined : { y: -1.5 }} whileTap={disabled ? undefined : { scale: 0.96 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      disabled={disabled}
      className={['inline-flex items-center justify-center gap-2 font-semibold disabled:cursor-not-allowed disabled:opacity-60', sm ? 'rounded-[10px] px-3.5 py-2 text-[13px]' : 'rounded-xl px-5 py-2.5', BTN[kind], className].join(' ')} {...p} />
  )
}
function Av({ t, tone = '', big }) {
  const c = { '': 'bg-brandsoft text-brand', b: 'bg-goodsoft text-good', w: 'bg-warnsoft text-warn', l: 'bg-white/20 text-white' }[tone]
  return <i className={'grid flex-none place-items-center rounded-full font-bold not-italic ' + c + (big ? ' size-10 text-[13px]' : ' size-7 text-[11px]')}>{t}</i>
}

function useCount(v) {
  const [n, setN] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const from = prev.current, t0 = performance.now()
    let r
    const tick = t => {
      const k = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - k, 4)
      setN(from + (v - from) * e)
      if (k < 1) r = requestAnimationFrame(tick); else prev.current = v
    }
    r = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(r)
  }, [v])
  return n
}

function Stat({ icon, label: l, value, money = true, tone = '', i }) {
  const n = useCount(value)
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: i * 0.08 }}
      className={card + ' flex items-center gap-3.5 p-4 max-sm:flex-col max-sm:items-start max-sm:gap-2.5'}>
      <span className={'grid size-11 place-items-center rounded-xl ' + TONES[tone]}><Ico n={icon} /></span>
      <div><div className="text-[13px] text-mute">{l}</div><div className="text-[21px] font-bold tracking-tight tabular-nums max-sm:text-[15px]">{money ? fmt(n) : Math.round(n)}</div></div>
    </motion.div>
  )
}

function useToasts() {
  const [list, setList] = useState([])
  const close = useCallback(id => setList(l => l.filter(t => t.id !== id)), [])
  const push = useCallback((type, title, text) => {
    const id = Math.random()
    setList(l => [...l, { id, type, title, text }])
    setTimeout(() => close(id), 4600)
  }, [close])
  return [list, push, close]
}

function Toasts({ list, close }) {
  return (
    <div className="fixed right-4 top-[calc(76px+env(safe-area-inset-top,0px))] z-[60] grid w-[min(380px,calc(100vw-2rem))] gap-2.5 max-sm:left-4 max-sm:w-auto" role="status" aria-live="polite">
      <AnimatePresence initial={false}>
        {list.map(t => (
          <motion.div key={t.id} layout initial={{ opacity: 0, x: 60, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.2 } }} transition={spring}
            className={card + ' relative flex items-start gap-3 overflow-hidden p-3.5 shadow-2xl'}>
            <span className={'grid size-[34px] flex-none place-items-center rounded-[10px] ' + TOAST[t.type][0]}><Ico n={t.type === 'ok' ? 'check' : t.type === 'err' ? 'alert' : 'info'} /></span>
            <div className="min-w-0 flex-1"><b>{t.title}</b>{t.text && <p className="text-[13px] text-mute">{t.text}</p>}</div>
            <button className="grid size-8 place-items-center rounded-lg text-mute transition hover:bg-surface" onClick={() => close(t.id)} aria-label="Fermer"><Ico n="x" s={16} /></button>
            <i className={'absolute bottom-0 left-0 h-[3px] w-full origin-left animate-drain motion-reduce:animate-none ' + TOAST[t.type][1]} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const k = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [onClose])
  
  return (

    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 grid place-items-center bg-[#080e1e]/55 p-4 backdrop-blur-sm max-sm:items-end max-sm:p-0"
      onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <motion.div role="dialog" aria-modal="true" aria-label={title}
        initial={{ opacity: 0, y: 48, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 32, scale: 0.97, transition: { duration: 0.18 } }} transition={spring}
        className="max-h-full w-full max-w-lg overflow-auto rounded-3xl bg-card p-5 shadow-2xl max-sm:max-w-none max-sm:rounded-b-none max-sm:pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
        <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold">{title}</h3>
          <button className="grid size-8 place-items-center rounded-lg text-mute transition hover:bg-surface" onClick={onClose} aria-label="Fermer"><Ico n="x" /></button></div>
        {children}
      </motion.div>
    </motion.div>
  )
}

const Err = ({ children }) => <motion.em initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[13px] font-medium not-italic text-bad">{children}</motion.em>

function OpForm({ people, me, item, onSubmit, onCancel }) {
  const keeper = people.find(p => p.keeper) || people[0]
  const giver = people.find(p => p.email !== keeper.email)
  const [f, setF] = useState(item
    ? { type: item.type || 'versement', sender: item.senderEmail || giver.email, receiver: item.receiverEmail, amount: String(item.amount), date: item.date, mode: item.mode, note: item.note || '' }
    : { type: 'versement', sender: giver.email, receiver: keeper.email, amount: '', date: today(), mode: MODES[0], note: '' })
  const [err, setErr] = useState({})
  const [busy, setBusy] = useState(false)
  const R = f.type === 'retrait'
  const set = (k, v) => setF(o => ({ ...o, [k]: v }))
  const setType = t => setF(o => ({ ...o, type: t, sender: giver.email, receiver: keeper.email }))
  const side = (k, v) => setF(o => ({ ...o, [k]: v, [k === 'sender' ? 'receiver' : 'sender']: people.find(p => p.email !== v).email }))
  const swap = () => setF(o => ({ ...o, sender: o.receiver, receiver: o.sender }))
  const submit = async e => {
    e.preventDefault()
    const a = Math.round(Number(f.amount)), er = {}
    if (!(a > 0)) er.amount = 'Saisissez un montant supérieur à 0.'
    if (!f.date) er.date = 'La date est obligatoire.'
    if (R && !f.note.trim()) er.note = 'Indiquez le motif du retrait.'
    setErr(er)
    if (Object.keys(er).length) return
    setBusy(true)
    try { await onSubmit({ ...f, amount: a, note: f.note.trim() }) } finally { setBusy(false) }
  }
  const opts = people.map(p => <option key={p.email} value={p.email}>{p.name}{p.email === me.email ? ' (moi)' : ''}</option>)
  return (
    <form className="grid gap-3.5" onSubmit={submit} noValidate>
      <div className="relative flex rounded-xl border border-line bg-surface p-1" role="group" aria-label="Type d’opération">
        {[['versement', 'Versement'], ['retrait', 'Retrait']].map(([k, l]) => (
          <button type="button" key={k} disabled={!!item} onClick={() => setType(k)}
            className={'relative flex-1 rounded-lg py-2 font-semibold transition-colors ' + (f.type === k ? 'text-white' : 'text-mute')}>
            {f.type === k && <motion.span layoutId="seg" transition={spring} className="absolute inset-0 rounded-lg bg-[#1d4ed8]" />}
            <span className="relative">{l}</span>
          </button>))}
      </div>
      <motion.div key={R ? 'r' : 'v'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {R ? (
          <label className={label}>Retiré par<small className="font-normal text-mute">La personne qui prend l’argent gardé</small>
            <select className={field} value={f.receiver} onChange={e => set('receiver', e.target.value)}>{opts}</select></label>
        ) : (
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2.5 max-sm:grid-cols-1">
            <label className={label}>Expéditeur<small className="font-normal text-mute">Celui qui envoie</small>
              <select className={field} value={f.sender} onChange={e => side('sender', e.target.value)}>{opts}</select></label>
            <motion.button type="button" whileHover={{ rotate: 180 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.3 }} onClick={swap} aria-label="Inverser expéditeur et récepteur"
              className="grid h-11 w-10 place-items-center rounded-xl border border-line bg-card text-brand max-sm:h-9 max-sm:w-full"><Ico n="swap" /></motion.button>
            <label className={label}>Récepteur<small className="font-normal text-mute">Celui qui reçoit</small>
              <select className={field} value={f.receiver} onChange={e => side('receiver', e.target.value)}>{opts}</select></label>
          </div>
        )}
      </motion.div>
      <div className="grid grid-cols-2 gap-3 max-[380px]:grid-cols-1">
        <label className={label}>Montant (FCFA)
          <input className={field} type="number" inputMode="numeric" min="1" step="1" placeholder="Ex. 50000" value={f.amount} aria-invalid={!!err.amount} onChange={e => set('amount', e.target.value)} autoFocus />
          {err.amount && <Err>{err.amount}</Err>}</label>
        <label className={label}>Date
          <input className={field} type="date" value={f.date} aria-invalid={!!err.date} onChange={e => set('date', e.target.value)} />
          {err.date && <Err>{err.date}</Err>}</label>
      </div>
      <label className={label}>Mode de paiement
        <select className={field} value={f.mode} onChange={e => set('mode', e.target.value)}>{MODES.map(m => <option key={m}>{m}</option>)}</select></label>
      <label className={label}>{R ? 'Motif du retrait' : <>Référence ou note <small className="font-normal text-mute">(facultatif)</small></>}
        <textarea className={field} rows="2" maxLength="200" aria-invalid={!!err.note} placeholder={R ? 'À quoi sert cet argent ?' : 'N° de transaction, remarque…'} value={f.note} onChange={e => set('note', e.target.value)} />
        {err.note && <Err>{err.note}</Err>}</label>
      <div className="mt-1 flex justify-end gap-2.5">
        <Btn type="button" kind="soft" onClick={onCancel}>Annuler</Btn>
        <Btn disabled={busy} className="min-w-32">{busy ? <Spin /> : item ? 'Mettre à jour' : 'Enregistrer'}</Btn>
      </div>
    </form>
  )
}

function Pill({ active, id, className, children, ...p }) {
  return (
    <button {...p} className={'relative ' + className}>
      {active && <motion.span layoutId={id} transition={spring} className="absolute inset-0 rounded-[inherit] bg-[#1d4ed8]" />}
      <span className="relative">{children}</span>
    </button>
  )
}

export function Ledger({ me, people, items, log, ready, actions, onLogout, demo }) {
  const [tab, setTab] = useState('ops')
  const [flt, setFlt] = useState('all')
  const [form, setForm] = useState(null)
  const [del, setDel] = useState(null)
  const [busy, setBusy] = useState(false)
  const [gone, setGone] = useState(false)
  const [toasts, push, close] = useToasts()
  const key = 'seen:' + me.email
  const seen = useRef(Number((() => { try { return localStorage.getItem(key) } catch (e) { return 0 } })() || 0))
  const nm = e => (people.find(p => p.email === e) || {}).name || e
  const other = people.find(p => p.email !== me.email)
  const sum = a => a.reduce((s, x) => s + x.amount, 0)
  const plural = n => (n > 1 ? 's' : '')
  const isR = x => x.type === 'retrait'

  const st = useMemo(() => {
    const dep = sum(items.filter(x => !isR(x) && x.status === 'confirmed')), ret = sum(items.filter(isR))
    return { bal: dep - ret, dep, ret, pend: items.filter(x => x.status === 'pending').length }
  }, [items])
  const toConfirm = items.filter(x => !isR(x) && x.status === 'pending' && x.receiverEmail === me.email && x.createdBy !== me.email)
  const waiting = items.filter(x => !isR(x) && x.status === 'pending' && x.createdBy === me.email)
  const fresh = items.filter(x => x.createdBy !== me.email && x.createdAt > seen.current)
  const markSeen = () => { try { localStorage.setItem(key, String(Date.now())) } catch (e) {} setGone(true) }

  const alerts = []
  if (toConfirm.length) alerts.push({ k: 'c', t: 'wa', i: 'bell', h: `${toConfirm.length} versement${plural(toConfirm.length)} à confirmer`, p: `${fmt(sum(toConfirm))} saisi${plural(toConfirm.length)} par ${other.name} : confirmez la réception quand vous l’avez reçu.`, b: 'Voir', go: () => { setTab('ops'); setFlt('pending') } })
  if (fresh.length && !gone) alerts.push({ k: 'n', t: 'in', i: 'info', h: `${other.name} a saisi ${fresh.length} opération${plural(fresh.length)}`, p: `Depuis votre dernière visite : ${fmt(sum(fresh.filter(x => !isR(x))))} versés et ${fmt(sum(fresh.filter(isR)))} retirés.`, b: 'Compris', go: markSeen })
  if (waiting.length) alerts.push({ k: 'w', t: 'in', i: 'clock', h: `En attente de ${other.name}`, p: `${other.name} doit confirmer la réception de ${fmt(sum(waiting))}.` })
  if (!alerts.length) alerts.push({ k: 'o', t: 'ok', i: 'shield', h: 'Tout est à jour', p: 'Aucune opération en attente ni nouvelle activité.' })

  const list = useMemo(() => items.filter(x => flt === 'all' || (flt === 'pending' ? x.status === 'pending' : flt === 'retrait' ? isR(x) : !isR(x)))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt), [items, flt])

  const guard = async fn => {
    setBusy(true)
    try { await fn() } catch (e) { push('err', 'Action impossible', 'Vérifiez votre connexion ou vos droits d’accès.') } finally { setBusy(false) }
  }
  const submit = d => guard(async () => {
    const t = d.type === 'retrait' ? `un retrait de ${fmt(d.amount)} par ${nm(d.receiver)} (${d.note})` : `un versement de ${fmt(d.amount)} de ${nm(d.sender)} à ${nm(d.receiver)}`
    if (form.item) { await actions.update(form.item.id, d, `a modifié ${t}`); push('ok', 'Opération modifiée', fmt(d.amount)) }
    else { await actions.add(d, `a enregistré ${t}`); push('ok', d.type === 'retrait' ? 'Retrait enregistré' : 'Versement enregistré', fmt(d.amount)) }
    setForm(null)
  })
  const confirm = x => guard(async () => { await actions.confirm(x.id, `a confirmé la réception de ${fmt(x.amount)} de ${nm(x.senderEmail)}`); push('ok', 'Réception confirmée', fmt(x.amount)) })
  const remove = () => guard(async () => { const x = del; await actions.remove(x.id, `a supprimé ${isR(x) ? 'le retrait' : 'le versement'} de ${fmt(x.amount)} du ${fmtDate(x.date)}`); setDel(null); push('info', 'Opération supprimée') })

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen">
        <motion.header initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={spring}
          className="sticky top-0 z-20 bg-linear-to-br from-[#0b1f4d] to-[#1d4ed8] px-4 pb-3 pt-[calc(12px+env(safe-area-inset-top,0px))] text-white shadow-[0_6px_24px_rgba(11,31,77,.28)]">
          <div className="mx-auto flex max-w-[1040px] items-center justify-between gap-3">
            <div className="flex items-center gap-3"><Logo s={42} /><div><b>Carnet de versements</b><small className="block text-xs opacity-75">Espace privé · {people.map(p => p.name).join(' & ')}</small></div></div>
            <div className="flex items-center gap-3"><Av t={initials(me.name)} tone="l" big /><div className="max-sm:hidden"><b>{me.name}</b><small className="block text-xs opacity-75">Connecté</small></div>
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="grid size-[38px] place-items-center rounded-[10px] bg-white/15 transition-colors hover:bg-white/30" onClick={onLogout} aria-label="Se déconnecter" title="Se déconnecter"><Ico n="out" s={18} /></motion.button></div>
          </div>
        </motion.header>
        {demo && <div className="bg-warnsoft px-3 py-1.5 text-center text-[13px] font-medium text-warn">Mode démonstration : les données ne sont pas enregistrées durablement.</div>}
        <Toasts list={toasts} close={close} />

        <main className="mx-auto max-w-[1040px] px-4 pb-[calc(96px+env(safe-area-inset-bottom,0px))] pt-5">
          <section className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(215px,1fr))]">
            <Stat i={0} icon="wallet" label="Solde gardé" value={st.bal} />
            <Stat i={1} icon="down" label="Total versé" value={st.dep} tone="g" />
            <Stat i={2} icon="up" label="Total retiré" value={st.ret} tone="r" />
            <Stat i={3} icon="clock" label="En attente" value={st.pend} money={false} tone="a" />
          </section>

          <div className="mb-5 grid gap-2.5">
            <AnimatePresence mode="popLayout" initial>
              {alerts.map(A => (
                <motion.section layout key={A.k} initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={spring}
                  className={'relative flex items-center gap-3.5 overflow-hidden rounded-2xl border p-4 pl-5 ' + ALERT[A.t]}>
                  <span className="absolute inset-y-0 left-0 w-1.5 bg-current" />
                  <span className="relative grid size-11 flex-none place-items-center rounded-full bg-card">
                    {A.t === 'wa' && <span className="absolute inset-0 animate-ring rounded-full border-2 border-current motion-reduce:animate-none" />}
                    <Ico n={A.i} s={22} /></span>
                  <div className="min-w-0 flex-1"><b className="block">{A.h}</b><p className="text-sm text-ink">{A.p}</p></div>
                  {A.go && <Btn sm onClick={A.go}>{A.b}</Btn>}
                </motion.section>))}
            </AnimatePresence>
          </div>

          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-xl border border-line bg-card p-1 max-sm:flex-1" role="tablist">
              {[['ops', 'Opérations'], ['log', 'Historique']].map(([k, l]) => (
                <Pill key={k} id="tab" active={tab === k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                  className={'rounded-lg px-5 py-2 font-semibold transition-colors max-sm:flex-1 ' + (tab === k ? 'text-white' : 'text-mute hover:text-ink')}>{l}</Pill>))}
            </div>
            <Btn onClick={() => setForm({})} className="max-sm:fixed max-sm:bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] max-sm:right-4 max-sm:z-30 max-sm:rounded-full max-sm:py-3.5"><Ico n="plus" s={18} /><span>Nouvelle opération</span></Btn>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8, transition: { duration: 0.12 } }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
              {tab === 'ops' ? <>
                <div className="mb-3.5 flex gap-2 overflow-x-auto pb-0.5">
                  {[['all', 'Toutes'], ['versement', 'Versements'], ['retrait', 'Retraits'], ['pending', 'À confirmer']].map(([k, l]) => (
                    <button key={k} onClick={() => setFlt(k)} className={'relative whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ' + (flt === k ? 'border-brand text-brand' : 'border-line bg-card text-mute hover:text-ink')}>
                      {flt === k && <motion.span layoutId="chip" transition={spring} className="absolute inset-0 rounded-full bg-brandsoft" />}
                      <span className="relative">{l}</span></button>))}
                </div>
                {!ready ? <div className="grid gap-3.5 grid-cols-[repeat(auto-fill,minmax(min(100%,310px),1fr))]">{[0, 1, 2].map(i => <div key={i} className="h-48 animate-shimmer rounded-2xl bg-linear-to-r from-card via-line to-card bg-[length:200%_100%] motion-reduce:animate-none" />)}</div>
                  : !list.length ? <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="px-4 py-12 text-center text-mute">
                    <span className="mb-3 inline-grid size-16 place-items-center rounded-full bg-brandsoft text-brand"><Ico n="list" s={28} /></span>
                    <b className="block text-ink">Aucune opération</b><p>Les opérations enregistrées apparaîtront ici.</p></motion.div>
                    : <div className="grid gap-3.5 grid-cols-[repeat(auto-fill,minmax(min(100%,310px),1fr))]">
                      <AnimatePresence mode="popLayout" initial>
                        {list.map((x, i) => (
                          <motion.article layout key={x.id} whileHover={{ y: -3 }}
                            initial={{ opacity: 0, y: 24, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 26, delay: Math.min(i, 8) * 0.045 } }}
                            exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
                            transition={{ layout: { type: 'spring', stiffness: 350, damping: 32 } }}
                            className={card + ' p-4'}>
                            <div className="flex items-center justify-between gap-2">
                              <div className={'text-[22px] font-bold tracking-tight ' + (isR(x) ? 'text-bad' : '')}>{isR(x) ? '− ' : '+ '}{fmt(x.amount)}</div>
                              <div className="flex flex-wrap justify-end gap-1.5">
                                <span className={'rounded-full px-2.5 py-0.5 text-xs font-semibold ' + BADGE[isR(x) ? 'rd' : 'bl']}>{isR(x) ? 'Retrait' : 'Versement'}</span>
                                {!isR(x) && <span className={'rounded-full px-2.5 py-0.5 text-xs font-semibold ' + BADGE[x.status === 'confirmed' ? 'ok' : 'wa']}>{x.status === 'confirmed' ? 'Confirmé' : 'En attente'}</span>}
                              </div>
                            </div>
                            <div className="my-3.5 flex items-center gap-2.5 rounded-xl bg-surface p-3 text-mute">
                              <div className="min-w-0 flex-1">
                                <small className="mb-1 block text-[11px] uppercase tracking-wider">{isR(x) ? 'Provenance' : 'Expéditeur'}</small>
                                <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                                  {isR(x) ? <><Av t="$" tone="w" />Argent gardé</> : <><Av t={initials(nm(x.senderEmail))} />{nm(x.senderEmail)}</>}</span></div>
                              <Ico n="arrow" s={18} />
                              <div className="min-w-0 flex-1">
                                <small className="mb-1 block text-[11px] uppercase tracking-wider">{isR(x) ? 'Retiré par' : 'Récepteur'}</small>
                                <span className="flex items-center gap-2 text-sm font-semibold text-ink"><Av t={initials(nm(x.receiverEmail))} tone="b" />{nm(x.receiverEmail)}</span></div>
                            </div>
                            <div className="flex flex-wrap gap-x-3.5 text-[13px] text-mute"><span>{fmtDate(x.date)}</span><span>{x.mode}</span><span>Saisi par {nm(x.createdBy)}</span></div>
                            {x.note && <p className="mt-2 border-l-[3px] border-line px-2.5 py-1.5 text-[13px] text-mute">{isR(x) ? 'Motif : ' : ''}{x.note}</p>}
                            <div className="mt-3.5 flex flex-wrap items-center justify-end gap-2">
                              {!isR(x) && x.status === 'pending' && x.receiverEmail === me.email && x.createdBy !== me.email &&
                                <Btn sm className="mr-auto" disabled={busy} onClick={() => confirm(x)}><Ico n="check" s={16} />Confirmer la réception</Btn>}
                              {x.createdBy === me.email && <>
                                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => setForm({ item: x })} aria-label="Modifier" className="grid size-9 place-items-center rounded-[10px] border border-line bg-card text-mute transition-colors hover:border-brand hover:text-brand"><Ico n="edit" s={17} /></motion.button>
                                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => setDel(x)} aria-label="Supprimer" className="grid size-9 place-items-center rounded-[10px] border border-line bg-card text-mute transition-colors hover:border-bad hover:text-bad"><Ico n="trash" s={17} /></motion.button></>}
                            </div>
                          </motion.article>))}
                      </AnimatePresence>
                    </div>}
              </> : (
                <div className={card + ' px-5 py-2'}>
                  {!log.length && <div className="px-4 py-12 text-center text-mute"><b className="text-ink">Aucune activité</b></div>}
                  {log.map((l, i) => (
                    <motion.div key={l.id} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 12) * 0.04, duration: 0.3 }}
                      className="flex gap-3.5 border-b border-line py-3.5 last:border-b-0">
                      <i className="mt-2 size-2.5 flex-none rounded-full bg-brand ring-4 ring-brandsoft" />
                      <div><p><b>{l.who}</b> {l.what}</p><small className="text-mute">{fmtTime(l.at)}</small></div>
                    </motion.div>))}
                </div>)}
            </motion.div>
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {form && <Modal key="form" title={form.item ? 'Modifier l’opération' : 'Nouvelle opération'} onClose={() => setForm(null)}>
            <OpForm people={people} me={me} item={form.item} onSubmit={submit} onCancel={() => setForm(null)} /></Modal>}
          {del && <Modal key="del" title="Supprimer cette opération ?" onClose={() => setDel(null)}>
            <p className="text-mute">L’opération de <b className="text-ink">{fmt(del.amount)}</b> du {fmtDate(del.date)} sera supprimée. Cette action sera inscrite dans l’historique.</p>
            <div className="mt-5 flex justify-end gap-2.5"><Btn kind="soft" onClick={() => setDel(null)}>Annuler</Btn><Btn kind="red" disabled={busy} onClick={remove}>Supprimer</Btn></div></Modal>}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}

export function Login({ people, onLogin, busy, error, hint }) {
  const [who, setWho] = useState(people[0].email)
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const go = e => { e.preventDefault(); if (pw) onLogin(who, pw) }
  const points = [['shield', 'Chacun se connecte avec son mot de passe'], ['eye', 'Les deux voient toutes les opérations'], ['check', 'Chacun ne modifie que ses propres saisies']]
  return (
    <MotionConfig reducedMotion="user">
      <div className="grid min-h-screen grid-cols-[1.1fr_1fr] max-md:grid-cols-1">
        <div className="flex flex-col justify-center gap-4 bg-linear-to-br from-[#0b1f4d] to-[#1d4ed8] p-14 text-white max-md:px-6 max-md:py-8">
          <motion.div initial={{ opacity: 0, scale: 0.7, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }}><Logo s={68} /></motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[34px] font-bold tracking-tight max-md:text-[26px]">Carnet de versements</motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="max-w-md opacity-85">Un espace privé pour suivre les versements et les retraits, en toute transparence.</motion.p>
          <ul className="mt-2 grid gap-3">{points.map(([ic, t], i) => (
            <motion.li key={t} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28 + i * 0.1 }} className="flex items-center gap-2.5"><Ico n={ic} s={18} />{t}</motion.li>))}</ul>
        </div>
        <div className="grid place-items-center p-6">
          <motion.form onSubmit={go} initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ ...spring, delay: 0.1 }} className={card + ' w-full max-w-sm p-7'}>
            <h2 className="mb-1 text-xl font-bold">Connexion</h2>
            <p className="text-mute">Qui êtes-vous ?</p>
            <div className="my-3.5 grid grid-cols-2 gap-2.5">{people.map(p => (
              <motion.button type="button" key={p.email} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} onClick={() => { setWho(p.email); setPw('') }}
                className={'flex flex-col items-center gap-2 rounded-2xl border-2 p-3.5 font-semibold transition-colors ' + (who === p.email ? 'border-brand bg-brandsoft text-brand' : 'border-line bg-card')}>
                <Av t={initials(p.name)} big />{p.name}</motion.button>))}</div>
            <label className={label}>Mot de passe
              <div className="flex gap-2"><input className={field} type={show ? 'text' : 'password'} value={pw} autoComplete="current-password" onChange={e => setPw(e.target.value)} />
                <button type="button" onClick={() => setShow(s => !s)} className="rounded-xl border border-line bg-card px-3 text-[13px] font-semibold text-brand">{show ? 'Masquer' : 'Afficher'}</button></div></label>
            <AnimatePresence>{error && <motion.p key={error + busy} initial={{ opacity: 0, x: 0 }} animate={{ opacity: 1, x: [0, -8, 8, -6, 6, 0] }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="mt-2.5 text-[13px] text-bad" role="alert">{error}</motion.p>}</AnimatePresence>
            <Btn className="mt-3 w-full" disabled={busy || !pw}>{busy ? <Spin /> : 'Se connecter'}</Btn>
            {hint && <p className="mt-3.5 rounded-[10px] bg-surface p-2.5 text-xs text-mute">{hint}</p>}
          </motion.form>
        </div>
      </div>
    </MotionConfig>
  )
}