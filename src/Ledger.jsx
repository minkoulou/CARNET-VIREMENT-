import { useState, useEffect, useMemo, useRef, useCallback } from 'react'

const fmt = n => new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'
const fmtDate = d => new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
const fmtTime = t => new Date(t).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const today = () => new Date().toISOString().slice(0, 10)
const initials = n => String(n).split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
const MODES = ['Espèces', 'Orange Money', 'MTN MoMo', 'Virement bancaire', 'Autre']

const P = {
  plus: 'M12 5v14M5 12h14', check: 'M5 13l4 4L19 7', x: 'M6 6l12 12M18 6L6 18',
  edit: 'M4 20h4L19 9l-4-4L4 16v4z', trash: 'M4 7h16M9 7V4h6v3m-8 0l1 13h8l1-13',
  arrow: 'M5 12h14m-5-5l5 5-5 5', swap: 'M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zM9 12l2 2 4-4',
  bell: 'M6 16v-5a6 6 0 1112 0v5l2 2H4l2-2zM10 21h4', out: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  alert: 'M12 8v5m0 3h.01M10.3 4l-8 14a2 2 0 001.7 3h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z',
  info: 'M12 11v5m0-8h.01M12 3a9 9 0 100 18 9 9 0 000-18z', clock: 'M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z',
  wallet: 'M3 7h16a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm0 0V6a2 2 0 012-2h11M16 14h2',
  down: 'M12 4v12m-5-5l5 5 5-5M5 20h14', eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z', up: 'M12 20V8m-5 5l5-5 5 5M5 4h14', list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
}
function Ico({ n, s = 20 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[n]} /></svg>
}

function useCount(v) {
  const [n, setN] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const from = prev.current, t0 = performance.now()
    let r
    const tick = t => {
      const k = Math.min(1, (t - t0) / 800), e = 1 - Math.pow(1 - k, 3)
      setN(from + (v - from) * e)
      if (k < 1) r = requestAnimationFrame(tick); else prev.current = v
    }
    r = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(r)
  }, [v])
  return n
}

function Stat({ icon, label, value, money = true, tone = '', i }) {
  const n = useCount(value)
  return (
    <div className={'stat ' + tone} style={{ '--i': i }}>
      <span className="tile"><Ico n={icon} /></span>
      <div><div className="lbl">{label}</div><div className="val">{money ? fmt(n) : Math.round(n)}</div></div>
    </div>
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
    <div className="toasts" role="status" aria-live="polite">
      {list.map(t => (
        <div key={t.id} className={'toast ' + t.type}>
          <span className="ti"><Ico n={t.type === 'ok' ? 'check' : t.type === 'err' ? 'alert' : 'info'} /></span>
          <div className="tt"><b>{t.title}</b>{t.text && <p>{t.text}</p>}</div>
          <button className="x" onClick={() => close(t.id)} aria-label="Fermer"><Ico n="x" s={16} /></button>
          <i className="tbar" />
        </div>
      ))}
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
    <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sh"><h3>{title}</h3><button className="x" onClick={onClose} aria-label="Fermer"><Ico n="x" /></button></div>
        {children}
      </div>
    </div>
  )
}

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
    <form className="form" onSubmit={submit} noValidate>
      <div className="seg" role="group" aria-label="Type d’opération">
        {[['versement', 'Versement'], ['retrait', 'Retrait']].map(([k, l]) =>
          <button type="button" key={k} disabled={!!item} className={f.type === k ? 'on' : ''} onClick={() => setType(k)}>{l}</button>)}
      </div>
      {R ? (
        <label>Retiré par<small>La personne qui prend l’argent gardé</small>
          <select value={f.receiver} onChange={e => set('receiver', e.target.value)}>{opts}</select></label>
      ) : (
        <div className="pair">
          <label>Expéditeur<small>Celui qui envoie</small>
            <select value={f.sender} onChange={e => side('sender', e.target.value)}>{opts}</select></label>
          <button type="button" className="swap" onClick={swap} aria-label="Inverser expéditeur et récepteur"><Ico n="swap" /></button>
          <label>Récepteur<small>Celui qui reçoit</small>
            <select value={f.receiver} onChange={e => side('receiver', e.target.value)}>{opts}</select></label>
        </div>
      )}
      <div className="row2">
        <label>Montant (FCFA)
          <input type="number" inputMode="numeric" min="1" step="1" placeholder="Ex. 50000" value={f.amount} className={err.amount ? 'bad' : ''} onChange={e => set('amount', e.target.value)} autoFocus />
          {err.amount && <em>{err.amount}</em>}</label>
        <label>Date
          <input type="date" value={f.date} className={err.date ? 'bad' : ''} onChange={e => set('date', e.target.value)} />
          {err.date && <em>{err.date}</em>}</label>
      </div>
      <label>Mode de paiement
        <select value={f.mode} onChange={e => set('mode', e.target.value)}>{MODES.map(m => <option key={m}>{m}</option>)}</select></label>
      <label>{R ? 'Motif du retrait' : <>Référence ou note <small>(facultatif)</small></>}
        <textarea rows="2" maxLength="200" className={err.note ? 'bad' : ''} placeholder={R ? 'À quoi sert cet argent ?' : 'N° de transaction, remarque…'} value={f.note} onChange={e => set('note', e.target.value)} />
        {err.note && <em>{err.note}</em>}</label>
      <div className="fa">
        <button type="button" className="btn soft" onClick={onCancel}>Annuler</button>
        <button className="btn" disabled={busy}>{busy ? <span className="spin" /> : item ? 'Mettre à jour' : 'Enregistrer'}</button>
      </div>
    </form>
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
    <div className="app">
      <header className="top"><div className="in">
        <div className="brand"><span className="logo"><Ico n="wallet" s={22} /></span><div><b>Carnet de versements</b><small>Espace privé · {people.map(p => p.name).join(' & ')}</small></div></div>
        <div className="who"><span className="av lg">{initials(me.name)}</span><div className="wn"><b>{me.name}</b><small>Connecté</small></div>
          <button className="ghost" onClick={onLogout} aria-label="Se déconnecter" title="Se déconnecter"><Ico n="out" s={18} /></button></div>
      </div></header>
      {demo && <div className="demo">Mode démonstration : les données ne sont pas enregistrées durablement.</div>}
      <Toasts list={toasts} close={close} />
      <main className="wrap">
        <section className="stats">
          <Stat i={0} icon="wallet" label="Solde gardé" value={st.bal} />
          <Stat i={1} icon="down" label="Total versé" value={st.dep} tone="g" />
          <Stat i={2} icon="up" label="Total retiré" value={st.ret} tone="r" />
          <Stat i={3} icon="clock" label="En attente" value={st.pend} money={false} tone="a" />
        </section>

        <div className="alerts">{alerts.map(A => (
          <section key={A.k + A.h} className={'alert ' + A.t}>
            <span className="ai"><Ico n={A.i} s={22} /></span>
            <div className="at"><b>{A.h}</b><p>{A.p}</p></div>
            {A.go && <button className="btn sm" onClick={A.go}>{A.b}</button>}
          </section>))}</div>

        <div className="toolbar">
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={tab === 'ops'} className={tab === 'ops' ? 'on' : ''} onClick={() => setTab('ops')}>Opérations</button>
            <button role="tab" aria-selected={tab === 'log'} className={tab === 'log' ? 'on' : ''} onClick={() => setTab('log')}>Historique</button>
          </div>
          <button className="btn new" onClick={() => setForm({})}><Ico n="plus" s={18} /><span>Nouvelle opération</span></button>
        </div>

        {tab === 'ops' && <>
          <div className="chips">
            {[['all', 'Toutes'], ['versement', 'Versements'], ['retrait', 'Retraits'], ['pending', 'À confirmer']].map(([k, l]) =>
              <button key={k} className={flt === k ? 'on' : ''} onClick={() => setFlt(k)}>{l}</button>)}
          </div>
          {!ready ? <div className="grid">{[0, 1, 2].map(i => <div key={i} className="sk" />)}</div>
            : !list.length ? <div className="empty"><span><Ico n="list" s={28} /></span><b>Aucune opération</b><p>Les opérations enregistrées apparaîtront ici.</p></div>
              : <div className="grid">{list.map((x, i) => (
                <article className="op" key={x.id} style={{ '--i': Math.min(i, 9) }}>
                  <div className="top2"><div className={'amt' + (isR(x) ? ' neg' : '')}>{isR(x) ? '− ' : '+ '}{fmt(x.amount)}</div>
                    <div className="bs"><span className={'badge ' + (isR(x) ? 'rd' : 'bl')}>{isR(x) ? 'Retrait' : 'Versement'}</span>
                      {!isR(x) && <span className={'badge ' + (x.status === 'confirmed' ? 'ok' : 'wa')}>{x.status === 'confirmed' ? 'Confirmé' : 'En attente'}</span>}</div></div>
                  <div className="flow">
                    {isR(x)
                      ? <div><small>Provenance</small><span><i className="av w">$</i>Argent gardé</span></div>
                      : <div><small>Expéditeur</small><span><i className="av">{initials(nm(x.senderEmail))}</i>{nm(x.senderEmail)}</span></div>}
                    <Ico n="arrow" s={18} />
                    <div><small>{isR(x) ? 'Retiré par' : 'Récepteur'}</small><span><i className="av b">{initials(nm(x.receiverEmail))}</i>{nm(x.receiverEmail)}</span></div>
                  </div>
                  <div className="meta"><span>{fmtDate(x.date)}</span><span>{x.mode}</span><span>Saisi par {nm(x.createdBy)}</span></div>
                  {x.note && <p className="note">{isR(x) ? 'Motif : ' : ''}{x.note}</p>}
                  <div className="acts">
                    {!isR(x) && x.status === 'pending' && x.receiverEmail === me.email && x.createdBy !== me.email && <button className="btn sm" disabled={busy} onClick={() => confirm(x)}><Ico n="check" s={16} />Confirmer la réception</button>}
                    {x.createdBy === me.email && <>
                      <button className="ib" onClick={() => setForm({ item: x })} aria-label="Modifier"><Ico n="edit" s={17} /></button>
                      <button className="ib dng" onClick={() => setDel(x)} aria-label="Supprimer"><Ico n="trash" s={17} /></button></>}
                  </div>
                </article>))}</div>}
        </>}

        {tab === 'log' && (
          <div className="card tl">
            {!log.length && <div className="empty"><b>Aucune activité</b></div>}
            {log.map((l, i) => (
              <div className="ev" key={l.id} style={{ '--i': Math.min(i, 12) }}><i /><div><p><b>{l.who}</b> {l.what}</p><small>{fmtTime(l.at)}</small></div></div>
            ))}
          </div>
        )}
      </main>

      {form && <Modal title={form.item ? 'Modifier l’opération' : 'Nouvelle opération'} onClose={() => setForm(null)}>
        <OpForm people={people} me={me} item={form.item} onSubmit={submit} onCancel={() => setForm(null)} /></Modal>}
      {del && <Modal title="Supprimer cette opération ?" onClose={() => setDel(null)}>
        <p className="mut">L’opération de <b>{fmt(del.amount)}</b> du {fmtDate(del.date)} sera supprimée. Cette action sera inscrite dans l’historique.</p>
        <div className="fa"><button className="btn soft" onClick={() => setDel(null)}>Annuler</button>
          <button className="btn red" disabled={busy} onClick={remove}>Supprimer</button></div></Modal>}
    </div>
  )
}

export function Login({ people, onLogin, busy, error, hint }) {
  const [who, setWho] = useState(people[0].email)
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const go = e => { e.preventDefault(); if (pw) onLogin(who, pw) }
  return (
    <div className="login">
      <div className="lp">
        <span className="logo big"><Ico n="wallet" s={30} /></span>
        <h1>Carnet de versements</h1>
        <p>Un espace privé pour suivre les versements et les retraits, en toute transparence.</p>
        <ul>
          <li><Ico n="shield" s={18} />Chacun se connecte avec son mot de passe</li>
          <li><Ico n="eye" s={18} />Les deux voient toutes les opérations</li>
          <li><Ico n="check" s={18} />Chacun ne modifie que ses propres saisies</li>
        </ul>
      </div>
      <div className="lc">
        <form className="card lcard" onSubmit={go}>
          <h2>Connexion</h2>
          <p className="mut">Qui êtes-vous ?</p>
          <div className="pick">{people.map(p => (
            <button type="button" key={p.email} className={who === p.email ? 'on' : ''} onClick={() => { setWho(p.email); setPw('') }}>
              <i className="av">{initials(p.name)}</i>{p.name}</button>))}</div>
          <label>Mot de passe
            <div className="pw"><input type={show ? 'text' : 'password'} value={pw} autoComplete="current-password" onChange={e => setPw(e.target.value)} />
              <button type="button" onClick={() => setShow(s => !s)}>{show ? 'Masquer' : 'Afficher'}</button></div></label>
          {error && <p className="err" role="alert" key={error + busy}>{error}</p>}
          <button className="btn full" disabled={busy || !pw}>{busy ? <span className="spin" /> : 'Se connecter'}</button>
          {hint && <p className="hint">{hint}</p>}
        </form>
      </div>
    </div>
  )
}
