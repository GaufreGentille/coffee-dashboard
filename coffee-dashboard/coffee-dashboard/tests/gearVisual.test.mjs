import test from 'node:test'
import assert from 'node:assert/strict'
import { gearVisual, gearVisualCategory } from '../src/lib/gearVisual.mjs'

const cases = [
  ['Kingrinder P2 Moulin à Café Manuel', 'Un bon moulin pour le café versé et l’espresso', 'manual'],
  ['Moulin Option-O Lagom Casa', 'Un moulin pour espresso et café filtre', 'electric'],
  ['Ninja Luxe Café Premier – Examen Complet', 'Machine automatique proposant 32 boissons', 'auto'],
  ['Moulin MHW-3Bomber F74 Navigator', 'Moulin avec meules de 74 mm pour espresso et filtre', 'electric'],
  ['Jura Z10 Super Automatique', 'Machine à café avec broyeur intégré et 32 boissons', 'auto'],
  ['Breville Barista Touch Impress', 'Machine espresso avec broyeur intégré', 'espresso'],
  ['Machine à Levier Flair Neo Flex (2025)', 'Personnalisation complète et espresso manuel', 'espresso'],
  ['Moulin Manuel Aergrind par Made by Knock', 'Moulin pour AeroPress et café filtre', 'manual'],
  ['Moulin Manuel 1Zpresso X-Ultra', 'Idéal pour les voyages et le filtre', 'manual'],
  ['Moulin 1Zpresso Q-Air', 'Excellent pour l’AeroPress et l’infusion', 'manual'],
  ['Machine espresso Rocket E61', 'Machine prosumer avec groupe E61', 'prosumer'],
  ['Bouilloire à col de cygne', 'Extraction en V60 et café filtre', 'kettle'],
  ['Dripper Origami', 'En céramique pour filtre', 'dripper'],
  ['Tamper pour barista', 'Pour une machine espresso', 'accessories']
]

for (const [title, summary, expected] of cases) {
  test(title, () => {
    const input = { title, summary, category: /moulin/i.test(title) ? 'Moulin' : 'Machine' }
    assert.equal(gearVisualCategory(input), expected)
    assert.match(gearVisual(input), /^\/materiel-.*\.png$/)
  })
}

// La méthode de préparation citée dans un résumé ne doit pas prendre la
// place de l'objet principal qui est présenté dans le titre.
test('article sur un moulin pour AeroPress n affiche jamais une image de dripper', () => {
  assert.equal(gearVisualCategory({
    title: 'Moulin manuel Aergrind',
    summary: 'Conçu pour Aeropress, V60, dripper et café filtre',
    category: 'Moulin'
  }), 'manual')
})

test('article machine automatique avec broyeur intégré reste machine auto', () => {
  assert.equal(gearVisualCategory({
    title: 'Jura Z10',
    summary: 'Broyeur électrique intégré, moulin pour boissons automatiques'
  }), 'auto')
})
