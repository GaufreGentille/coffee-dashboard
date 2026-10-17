import { useEffect, useRef } from 'react'

// Préférence purement locale, sans cookie ni suivi du visiteur.
// Elle est propre à chaque navigateur/profil et non synchronisée entre appareils.
export const AI_DISCLOSURE_KEY = 'kissasoko.ai-disclosure.v1'

export function hasSeenAIDisclosure() {
  try {
    return window.localStorage.getItem(AI_DISCLOSURE_KEY) === 'seen'
  } catch {
    return false
  }
}

export function rememberAIDisclosure() {
  try {
    window.localStorage.setItem(AI_DISCLOSURE_KEY, 'seen')
  } catch {
    // En navigation privée stricte, la note se refermera pour cette visite.
  }
}

export default function AIDisclosure({ onDismiss }) {
  const buttonRef = useRef(null)

  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    buttonRef.current?.focus()

    // Un seul contrôle dans la fenêtre : garder le clavier dans le dialogue.
    const onKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onDismiss()
      } else if (event.key === 'Tab') {
        event.preventDefault()
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus()
      }
    }
  }, [onDismiss])

  return (
    <div className="ks-ai-overlay">
      <section
        className="ks-ai-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ks-ai-title"
        aria-describedby="ks-ai-description"
      >
        <div className="ks-ai-topline">
          <span>TRANSPARENCE / KISSA SOKO</span>
          <span aria-hidden="true">01 / 01</span>
        </div>

        <div className="ks-ai-content">
          <p className="ks-ai-eyebrow">UN MOT AVANT D'ENTRER</p>
          <h2 id="ks-ai-title">Le café est réel.<br /><em>L'IA est partout.</em></h2>
          <div id="ks-ai-description" className="ks-ai-copy">
            <p>Autant jouer cartes sur table : j'utilise <strong>énormément l'intelligence artificielle</strong> pour imaginer, développer et faire vivre Kissa Soko. Elle intervient aussi dans la création ou la mise en forme de certains textes, visuels et outils.</p>
            <p>Les idées, les choix et la responsabilité de ce que je publie restent les miens. Mais l'IA peut se tromper, et moi aussi. Sur les sujets techniques en particulier, gardez votre esprit critique.</p>
          </div>
          <div className="ks-ai-bottom">
            <button ref={buttonRef} type="button" className="ks-ai-accept" onClick={onDismiss}>
              Compris, je découvre le site <span aria-hidden="true">→</span>
            </button>
            <p>Une seule apparition sur ce navigateur. Retrouvez cette note via « Transparence IA » en bas de page.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
