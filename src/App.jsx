import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { addDoc, collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { PEOPLE } from './config'
import { Ledger, Login } from './Ledger'

export default function App() {
  const [user, setUser] = useState(undefined)
  const [items, setItems] = useState([])
  const [log, setLog] = useState([])
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const me = PEOPLE.find(p => p.email === user?.email?.toLowerCase())

  useEffect(() => onAuthStateChanged(auth, setUser), [])
  useEffect(() => {
    if (user && !me) { setErr('Ce compte n’est pas autorisé : son adresse doit être identique à celle du fichier .env.'); signOut(auth) }
  }, [user, me])
  useEffect(() => {
    if (!me) return
    const a = onSnapshot(query(collection(db, 'transfers'), orderBy('createdAt', 'desc')),
      s => { setItems(s.docs.map(d => ({ id: d.id, ...d.data() }))); setReady(true) })
    const b = onSnapshot(query(collection(db, 'journal'), orderBy('at', 'desc'), limit(100)),
      s => setLog(s.docs.map(d => ({ id: d.id, ...d.data() }))))
    return () => { a(); b() }
  }, [me?.email])

  const login = async (email, pw) => {
    setBusy(true); setErr('')
    try { await signInWithEmailAndPassword(auth, email, pw) }
    catch (e) {
      console.error(e)
      const m = {
        'auth/invalid-credential': 'Mot de passe incorrect, ou compte inexistant dans Firebase.',
        'auth/wrong-password': 'Mot de passe incorrect.',
        'auth/user-not-found': 'Ce compte n’existe pas dans Firebase (Authentication → Utilisateurs).',
        'auth/invalid-email': 'Adresse invalide : vérifiez le fichier .env.',
        'auth/operation-not-allowed': 'La connexion E-mail/Mot de passe n’est pas activée dans Firebase.',
        'auth/invalid-api-key': 'Clé Firebase invalide : vérifiez le fichier .env.',
        'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Clé Firebase invalide : vérifiez le fichier .env.',
        'auth/network-request-failed': 'Pas de connexion internet.',
        'auth/too-many-requests': 'Trop de tentatives. Réessayez dans quelques minutes.',
      }
      setErr(m[e.code] || 'Erreur de connexion : ' + (e.code || e.message))
    }
    finally { setBusy(false) }
  }

  const env = import.meta.env
  if (!env.VITE_FIREBASE_API_KEY || !env.VITE_FIREBASE_PROJECT_ID || !env.VITE_USER1_EMAIL || !env.VITE_USER2_EMAIL)
    return <div className="grid min-h-screen place-items-center"><p style={{ maxWidth: 420, textAlign: 'center', padding: 24 }}><b>Configuration manquante.</b><br />Le fichier <code>.env</code> est absent ou incomplet (ou les variables <code>VITE_*</code> ne sont pas définies sur l’hébergeur). Remplissez-le puis relancez / redéployez.</p></div>
  if (user === undefined) return <div className="grid min-h-screen place-items-center"><span className="size-9 animate-spin rounded-full border-[3px] border-line border-t-brand" /></div>
  if (!me) return <Login people={PEOPLE} onLogin={login} busy={busy} error={err} />

  const journal = what => addDoc(collection(db, 'journal'), { who: me.name, what, at: Date.now() })
  const fields = d => ({
    type: d.type, senderEmail: d.type === 'retrait' ? '' : d.sender, receiverEmail: d.receiver,
    amount: d.amount, date: d.date, mode: d.mode, note: d.note,
    status: d.type === 'retrait' || d.receiver === me.email ? 'confirmed' : 'pending',
  })
  const actions = {
    add: async (d, w) => { await addDoc(collection(db, 'transfers'), { ...fields(d), createdBy: me.email, createdAt: Date.now() }); await journal(w) },
    update: async (id, d, w) => { await updateDoc(doc(db, 'transfers', id), { ...fields(d), updatedAt: Date.now() }); await journal(w) },
    confirm: async (id, w) => { await updateDoc(doc(db, 'transfers', id), { status: 'confirmed', confirmedAt: Date.now() }); await journal(w) },
    remove: async (id, w) => { await deleteDoc(doc(db, 'transfers', id)); await journal(w) },
  }
  return <Ledger me={me} people={PEOPLE} items={items} log={log} ready={ready} actions={actions} onLogout={() => signOut(auth)} />
}