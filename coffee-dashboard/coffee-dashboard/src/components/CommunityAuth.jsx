import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { communityConfigured, communityDb } from '../lib/communityClient'

const AuthContext = createContext(null)
export const useCommunityAuth = () => useContext(AuthContext)
export const memberName = user =>
  user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Membre'

export function CommunityAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(communityConfigured)
  const [authOpen, setAuthOpen] = useState(false)
  const [recovering, setRecovering] = useState(false)

  useEffect(() => {
    if (!communityDb) return
    let active = true
    communityDb.auth.getUser().then(({ data }) => {
      if (active) { setUser(data.user || null); setLoading(false) }
    }).catch(() => { if (active) setLoading(false) })
    const { data: { subscription } } = communityDb.auth.onAuthStateChange((event, session) => {
      if (!active) return
      setUser(session?.user || null)
      setLoading(false)
      if (event === 'PASSWORD_RECOVERY') { setRecovering(true); setAuthOpen(true) }
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [])

  const requireAuth = useCallback(() => {
    if (user) return true
    setAuthOpen(true)
    return false
  }, [user])

  const signOut = async () => {
    if (!communityDb) return
    await communityDb.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user, loading, requireAuth, openAuth: () => setAuthOpen(true), signOut
    }}>
      {children}
      {authOpen && (
        <AuthModal
          recovering={recovering}
          onClose={() => { setAuthOpen(false); setRecovering(false) }}
        />
      )}
    </AuthContext.Provider>
  )
}

export function MemberBar({ introduction = '' }) {
  const auth = useCommunityAuth()
  return (
    <div className="ks-memberbar">
      <span>{introduction || 'La lecture est libre. Participe avec ton compte Kissa Soko.'}</span>
      {auth?.user ? (
        <div>
          <strong>{memberName(auth.user)}</strong>
          <button type="button" onClick={auth.signOut}>Déconnexion</button>
        </div>
      ) : (
        <button type="button" onClick={auth?.openAuth} disabled={auth?.loading}>
          {auth?.loading ? 'Vérification…' : 'Se connecter / S’inscrire →'}
        </button>
      )}
    </div>
  )
}

function AuthModal({ onClose, recovering }) {
  const [mode, setMode] = useState(recovering ? 'newpassword' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const key = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [onClose])

  const submit = async e => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!communityDb) { setError('La configuration des comptes est en cours.'); return }
    setBusy(true)
    try {
      let result
      if (mode === 'signup') {
        if (pseudo.trim().length < 2 || pseudo.trim().length > 32) throw new Error('Pseudo : 2 à 32 caractères.')
        result = await communityDb.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: pseudo.trim() }, emailRedirectTo: window.location.origin }
        })
        if (!result.error) setMessage('Inscription reçue. Vérifie tes emails pour confirmer ton compte si nécessaire.')
      } else if (mode === 'reset') {
        result = await communityDb.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin
        })
        if (!result.error) setMessage('Si cette adresse possède un compte, un email de réinitialisation a été envoyé.')
      } else if (mode === 'newpassword') {
        result = await communityDb.auth.updateUser({ password })
        if (!result.error) { setMessage('Mot de passe modifié.'); setMode('login') }
      } else {
        result = await communityDb.auth.signInWithPassword({ email: email.trim(), password })
        if (!result.error) { onClose(); return }
      }
      if (result?.error) throw result.error
    } catch (e) {
      setError(e?.message || 'Impossible de terminer cette opération.')
    } finally { setBusy(false) }
  }

  return (
    <div className="ks-auth-scrim" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <section className="ks-auth-modal" role="dialog" aria-modal="true" aria-labelledby="ks-auth-title">
        <button className="ks-auth-close" type="button" onClick={onClose} aria-label="Fermer">×</button>
        <p className="ks-overline">KISSA SOKO · LES MEMBRES</p>
        <h2 id="ks-auth-title">
          {mode === 'signup' ? 'Rejoins le comptoir.' :
           mode === 'reset' ? 'Retrouve ton accès.' :
           mode === 'newpassword' ? 'Nouveau mot de passe.' : 'Bienvenue au comptoir.'}
        </h2>
        <p className="ks-auth-subtitle">Tout le monde peut lire. Un compte gratuit permet de publier, répondre et voter.</p>
        <form onSubmit={submit}>
          {mode === 'signup' && (
            <label>Pseudo public
              <input autoFocus value={pseudo} onChange={e=>setPseudo(e.target.value)}
                minLength={2} maxLength={32} required autoComplete="nickname" placeholder="Ton pseudo" />
            </label>
          )}
          {mode !== 'newpassword' && (
            <label>Email
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                required autoComplete="email" placeholder="toi@exemple.fr" />
            </label>
          )}
          {mode !== 'reset' && (
            <label>Mot de passe
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                minLength={8} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="8 caractères minimum" />
            </label>
          )}
          {error && <p className="ks-form-error" role="alert">{error}</p>}
          {message && <p className="ks-form-notice" role="status">{message}</p>}
          <button className="ks-primary-action" type="submit" disabled={busy || !communityConfigured}>
            {busy ? 'Un instant…' : mode === 'signup' ? 'Créer mon compte' :
             mode === 'reset' ? 'Envoyer un lien' :
             mode === 'newpassword' ? 'Changer mon mot de passe' : 'Se connecter'}
          </button>
        </form>
        {!communityConfigured && <p className="ks-form-notice">Les comptes seront actifs une fois Supabase configuré.</p>}
        {mode !== 'newpassword' && <div className="ks-auth-switch">
          <button type="button" onClick={()=>{setMode(mode === 'signup' ? 'login' : 'signup');setError('');setMessage('')}}>
            {mode === 'signup' ? 'Déjà membre ? Connexion' : 'Pas encore de compte ? Inscription'}
          </button>
          {mode === 'login' && <button type="button" onClick={()=>{setMode('reset');setError('');setMessage('')}}>
            Mot de passe oublié ?
          </button>}
        </div>}
      </section>
    </div>
  )
}
