// Script de la page de connexion, sorti du HTML pour la Content-Security-Policy.
const champ = document.getElementById('mdp')
const bouton = document.getElementById('valider')
const message = document.getElementById('message')

function dire(texte, classe) {
  message.textContent = texte
  message.className = 'message ' + (classe || '')
}

async function etat() {
  try {
    const r = await fetch('/.netlify/functions/login')
    const d = await r.json()
    if (d.connecte) dire('Déjà connecté sur cet appareil.', 'ok')
  } catch {}
}

async function connecter() {
  const motdepasse = champ.value
  if (!motdepasse) return dire('Saisis le mot de passe.', 'ko')
  bouton.disabled = true
  dire('Vérification...')
  try {
    const r = await fetch('/.netlify/functions/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ motdepasse }),
    })
    const d = await r.json()
    if (r.ok && d.ok) {
      dire('Connecté. Ce navigateur reste autorisé 30 jours.', 'ok')
      champ.value = ''
    } else {
      dire(d.erreur || 'Refusé.', 'ko')
    }
  } catch (e) {
    dire('Erreur réseau : ' + e.message, 'ko')
  } finally {
    bouton.disabled = false
  }
}

bouton.addEventListener('click', connecter)
champ.addEventListener('keydown', (e) => { if (e.key === 'Enter') connecter() })
etat()
