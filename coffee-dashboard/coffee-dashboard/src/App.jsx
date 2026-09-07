import { useState, useEffect, useCallback, useRef, useMemo, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
import HarvestPanel from './components/HarvestPanel';
import InstaVeillePanel from './components/InstaVeillePanel'

// GaufreGentille brand palette
const BRAND = {
  yellow: '#fed238',
  orange: '#da5d16',
  purple: '#a06dd0',
  amber:  '#ea9524',
}

const DARK = {
  bg:      '#160d09',
  surf:    '#1d120d',
  surf2:   '#251711',
  surf3:   '#2d1d16',
  border:  '#3a271e',
  border2: '#4a3328',
  text:    '#fff8f2',
  dim:     '#d8c6ba',
  faint:   '#9c8172',
}

const LIGHT = {
  bg:      '#f4efe7',
  surf:    '#fffaf3',
  surf2:   '#f7f0e7',
  surf3:   '#eee4d8',
  border:  '#e2d5c8',
  border2: '#d4c1b2',
  text:    '#241711',
  dim:     '#715a4c',
  faint:   '#a58c7d',
}

const IMG = [
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80',
  'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=600&q=80',
  'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&q=80',
  'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=600&q=80',
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80',
]
const SCI_IMG = [
  'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=400&q=80',
  'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&q=80',
  'https://images.unsplash.com/photo-1564325724739-bae0bd08762c?w=400&q=80',
  'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&q=80',
  'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=400&q=80',
]

const TOPIC_COLORS = {
  marche: BRAND.amber, culture: BRAND.purple, durabilite: '#7a9e78',
  competition: BRAND.orange, producteur: '#7a9e78', technique: BRAND.purple, materiel: BRAND.yellow,
}
const CAT_COLORS = {
  Torrefacteur: BRAND.amber, Cafe: BRAND.purple, Producteur: '#7a9e78',
  Barista: BRAND.orange, Competition: BRAND.orange, Materiel: BRAND.yellow, Science:'#7a8fb5', Processing:'#c4847a', Importateur:'#9a8fc4', Communaute: BRAND.purple, Culture:'#7a9e78', Media:'#7a8fb5', Education:'#7a8fb5', Boutique: BRAND.amber, Formation:'#7a9e78', Tech:'#9a8fc4', Evenement: BRAND.orange, Association:'#7a9e78', Certification:BRAND.amber, Durabilite:'#7a9e78', Industrie: BRAND.amber, Packaging:'#9a8fc4', Tourisme:'#7a9e78', Guide: BRAND.amber, Politique:'#c4847a', Boisson:'#7a9e78', Restaurant: BRAND.amber,
}
const SUB_COLORS = { 'r/espresso': BRAND.amber, 'r/Coffee': BRAND.orange, 'r/barista': BRAND.purple }


const GEAR_IMG = [
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
  'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=600&q=80',
  'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=600&q=80',
  'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&q=80',
  'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80',
  'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=600&q=80',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80',
]

const PLAYLISTS = [
  {
    name: 'Midnight Cassette',
    url: 'https://suno.com/playlist/6400cd5b-e7a3-4d8a-8c5b-a5c07bb02ecd',
    tracks: 26,
    cover: '/playlist-midnight.jpg',
    vibe: 'City pop · J-pop · Late night drives',
  },
  {
    name: 'Kagemusha',
    url: 'https://suno.com/playlist/a1394680-db07-46e7-b7cd-60f42412989c',
    tracks: 18,
    cover: '/playlist-kagemusha.jpg',
    vibe: 'Tokyo nights · Neon · Electronic',
  },
  {
    name: 'Sakura',
    url: 'https://suno.com/playlist/b6243889-9e57-46cb-90ae-fad1f0adb8a0',
    tracks: '—',
    cover: '/playlist-sakura.jpg',
    vibe: 'Ambient · Cinematic · Japan',
  },
]

const INSTAGRAM = [
  {handle:"hario_asia_official",name:"Hario Asia Official",category:"Materiel",location:"Japon / Asie",bio:"Hario official Asia - V60, Woodneck, Switch, Skerton.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/hario_asia_official",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"hariotaiwan",name:"Hario Taiwan",category:"Materiel",location:"Taiwan",bio:"Hario Taiwan - V60, dripper, carafe et accessoires brew.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/hariotaiwan",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"hario_shanghai",name:"Hario Shanghai",category:"Materiel",location:"Chine",bio:"Hario Shanghai - gamme complete pour le marche chinois.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/hario_shanghai",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"hariokorea",name:"Hario Korea",category:"Materiel",location:"Coree du Sud",bio:"Hario Korea - V60 et equipements de brassage filtre.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/hariokorea",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"hariousa",name:"Hario USA",category:"Materiel",location:"USA",bio:"Hario USA - V60 drippers, kettles, servers.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/hariousa",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"hariouk",name:"Hario UK",category:"Materiel",location:"Londres, UK",bio:"Hario UK - equipements specialite pour le marche britannique.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/hariouk",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"hario_official",name:"Hario Official",category:"Materiel",location:"Japon",bio:"Compte officiel Hario Japan - toute la gamme depuis Tokyo.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/hario_official",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"hario_global",name:"Hario Global",category:"Materiel",location:"Japon",bio:"Hario Global - produits iconiques V60, Cold Brew, Woodneck.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/hario_global",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"fellowproducts",name:"Fellow Products",category:"Materiel",location:"San Francisco",bio:"Design-forward coffee gear - Stagg kettle, Ode grinder, Opus.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/fellowproducts",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"lamarzocco",name:"La Marzocco",category:"Materiel",location:"Florence, IT",bio:"Machines espresso de reference depuis 1927 - Linea, GS3, Leva.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/lamarzocco",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"slayerespresso",name:"Slayer Espresso",category:"Materiel",location:"Seattle, US",bio:"Machines espresso haute gamme avec controle de pression manuel.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/slayerespresso",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"saintanthonyindustries",name:"Saint Anthony Industries",category:"Materiel",location:"Portland, US",bio:"Precision coffee tools - distribution, tamping, accessories.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/saintanthonyindustries",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"mahlkonig",name:"Mahlkonig",category:"Materiel",location:"Hamburg, DE",bio:"Moulins de reference - E65S, EK43, X54.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/mahlkonig",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"mahlkonighome",name:"Mahlkonig Home",category:"Materiel",location:"Hamburg, DE",bio:"Gamme domestique Mahlkonig - X54 Home, Vario Home.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/mahlkonighome",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"timemoreproducts",name:"Timemore",category:"Materiel",location:"Chine",bio:"Moulins manuels et accessories - Fish, Chestnut, Black Mirror scale.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/timemoreproducts",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"timemore_europe",name:"Timemore Europe",category:"Materiel",location:"Europe",bio:"Distribution europeenne Timemore - moulins, balances, accessories.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/timemore_europe",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"1zpresso",name:"1Zpresso",category:"Materiel",location:"Taiwan",bio:"Moulins manuels haut de gamme - JX, Q2, K-Max.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/1zpresso",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"1zpresso_tw",name:"1Zpresso TW",category:"Materiel",location:"Taiwan",bio:"Compte officiel Taiwan 1Zpresso - nouveautes et tips.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/1zpresso_tw",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"wug2grinder",name:"WUG2 Grinder",category:"Materiel",location:"International",bio:"Moulin de specialite WUG2 - flat burr, design premium.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/wug2grinder",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"option_o.brewlab",name:"Option-O Brewlab",category:"Materiel",location:"Asie",bio:"Option-O - moulins Lagom et equipements haut de gamme.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/option_o.brewlab",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"option_o.coffee",name:"Option-O Coffee",category:"Materiel",location:"Asie",bio:"Option-O Coffee - Lagom P64, accessories et culture du moulin plat.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/option_o.coffee",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"kafatek",name:"Kafatek",category:"Materiel",location:"USA",bio:"Kafatek - Monolith Flat, Monolith Conical. Moulins d exception.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/kafatek",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"compakgrinders",name:"Compak Grinders",category:"Materiel",location:"Barcelone, ES",bio:"Compak - moulins professionnels pour cafes et baristas.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/compakgrinders",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"eureka__grinders",name:"Eureka Grinders",category:"Materiel",location:"Florence, IT",bio:"Eureka - Mignon, Atom, Helios. Moulins italiens de precision.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/eureka__grinders",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"normcorewares",name:"Normcore Wares",category:"Materiel",location:"International",bio:"Normcore - accessories espresso minimaliste, tampers, WDT.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/normcorewares",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"bosetamper",name:"Bose Tamper",category:"Materiel",location:"International",bio:"Tampers et accessories espresso de precision.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/bosetamper",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"bosetamperjr",name:"Bose Tamper Jr",category:"Materiel",location:"International",bio:"Bose Tamper Jr - accessories espresso premium.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/bosetamperjr",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"happy_tamper",name:"Happy Tamper",category:"Materiel",location:"France",bio:"Tampers artisanaux francais - personnalises, precis, beaux.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/happy_tamper",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"mhw_3bomber",name:"MHW-3Bomber",category:"Materiel",location:"Chine",bio:"Accessories espresso et cafe filtre - WDT, puck screen, tampers.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/mhw_3bomber",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"puq.coffee",name:"PUQ Coffee",category:"Materiel",location:"International",bio:"PUQ Press - tampers automatiques de precision pour espresso.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/puq.coffee",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"ikawahome",name:"Ikawa Home",category:"Materiel",location:"Londres, UK",bio:"Torrefacteur domestique Ikawa - profils sur app.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/ikawahome",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"aillio",name:"Aillio",category:"Materiel",location:"Danemark",bio:"Bullet R1 - torrefacteur domestique data-driven de reference.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/aillio",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"probatusa",name:"Probat USA",category:"Materiel",location:"USA",bio:"Probat USA - torrefacteurs professionnels.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/probatusa",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"probatgroup",name:"Probat Group",category:"Materiel",location:"Allemagne",bio:"Probat Group - leader torrefacteurs industriels depuis 1868.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/probatgroup",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"giesenroastingsolutions",name:"Giesen Roasters",category:"Materiel",location:"Pays-Bas",bio:"Giesen - torrefacteurs specialite 1kg a 120kg, made in Holland.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/giesenroastingsolutions",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"decentespressomachines",name:"Decent Espresso",category:"Materiel",location:"Hong Kong",bio:"Decent DE1 - machine espresso data-driven, profils programmables.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/decentespressomachines",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"weberworkshops",name:"Weber Workshops",category:"Materiel",location:"USA",bio:"Weber EG-1, Key grinder. Moulins d exception, engineering premium.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/weberworkshops",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"versalab_grinder",name:"Versalab Grinder",category:"Materiel",location:"USA",bio:"Versalab M3 - moulin espresso single dose avance.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/versalab_grinder",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"cafflano.official",name:"Cafflano",category:"Materiel",location:"Coree du Sud",bio:"Cafflano - solutions tout-en-un portables, grinder + brew.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/cafflano.official",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"2waycup",name:"2WayCup",category:"Materiel",location:"International",bio:"Tasses et accessories pour cafe - design reversible.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/2waycup",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"osmo_global",name:"Osmo Global",category:"Materiel",location:"International",bio:"Osmo - solutions filtration et traitement d eau pour cafe.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/osmo_global",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"perfectcoffeewater",name:"Perfect Coffee Water",category:"Materiel",location:"International",bio:"Mineralisation d eau pour l extraction parfaite.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/perfectcoffeewater",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"thirdwavewater",name:"Third Wave Water",category:"Materiel",location:"USA",bio:"Capsules de mineralisation d eau - recette optimale specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/thirdwavewater",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"orea.uk",name:"Orea Brewer",category:"Materiel",location:"UK",bio:"Orea V3 - dripper de specialite ultra-fin.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/orea.uk",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"pourx.lab",name:"Pourx Lab",category:"Materiel",location:"International",bio:"Pourx Oura - bras verseur automatique de precision.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/pourx.lab",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"bellezza_espresso_australia",name:"Bellezza Espresso",category:"Materiel",location:"Australie",bio:"Machines espresso artisanales australiennes.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/bellezza_espresso_australia",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"sanremocoffeemachines",name:"San Remo Coffee",category:"Materiel",location:"Italie",bio:"San Remo - machines espresso professionnelles made in Italy.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/sanremocoffeemachines",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"sanremofrance",name:"San Remo France",category:"Materiel",location:"France",bio:"Distribution francaise San Remo - machines espresso pro.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/sanremofrance",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"nuovasimonellihome",name:"Nuova Simonelli Home",category:"Materiel",location:"Italie",bio:"Nuova Simonelli - Oscar, Musica, Appia.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/nuovasimonellihome",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"nuovasimonelli_fr",name:"Nuova Simonelli FR",category:"Materiel",location:"France",bio:"Distribution France Nuova Simonelli.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/nuovasimonelli_fr",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"nuovasimonelliofficial",name:"Nuova Simonelli Official",category:"Materiel",location:"Italie",bio:"Compte officiel Nuova Simonelli - espresso et moulins.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/nuovasimonelliofficial",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"cimbali_group_france",name:"Cimbali Group France",category:"Materiel",location:"France",bio:"La Cimbali - machines espresso de tradition milanaise.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/cimbali_group_france",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"elektra_coffeemachines",name:"Elektra Coffee Machines",category:"Materiel",location:"Italie",bio:"Elektra - machines espresso artisanales italiennes iconiques.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/elektra_coffeemachines",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"lapavoni1905",name:"La Pavoni 1905",category:"Materiel",location:"Italie",bio:"La Pavoni - levier espresso iconique depuis 1905.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/lapavoni1905",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"victoriaarduino_fr",name:"Victoria Arduino FR",category:"Materiel",location:"France",bio:"Victoria Arduino France - Black Eagle et Eagle One.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/victoriaarduino_fr",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"victoriaarduinoofficial",name:"Victoria Arduino Official",category:"Materiel",location:"Italie",bio:"Victoria Arduino - machines espresso de reference mondiale.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/victoriaarduinoofficial",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"rocketespresso",name:"Rocket Espresso",category:"Materiel",location:"Milan, IT",bio:"Rocket Espresso - machines espresso semi-pro, design milanais.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/rocketespresso",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"lelit_official",name:"Lelit Official",category:"Materiel",location:"Italie",bio:"Lelit - machines espresso et moulins domestiques haut de gamme.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/lelit_official",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"rattleware",name:"Rattleware",category:"Materiel",location:"USA",bio:"Rattleware - accessories barista, pichet, tampers.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/rattleware",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"baratza",name:"Baratza",category:"Materiel",location:"USA",bio:"Baratza - moulins specialite grand public - Encore, Virtuoso, Sette.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/baratza",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"ceado",name:"Ceado",category:"Materiel",location:"Italie",bio:"Ceado - moulins espresso professionnels, made in Italy.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/ceado",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"macapgrinders",name:"Macap Grinders",category:"Materiel",location:"Italie",bio:"Macap - moulins espresso et filter professionnels italiens.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/macapgrinders",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"etzingergrinders",name:"Etzinger Grinders",category:"Materiel",location:"Suisse",bio:"Etzinger - moulins de precision suisses.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/etzingergrinders",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"kinugrinders",name:"Kinu Grinders",category:"Materiel",location:"Allemagne",bio:"Kinu M47 - moulin manuel allemand de precision.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/kinugrinders",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"comandantegrinder",name:"Comandante Grinder",category:"Materiel",location:"Allemagne",bio:"Comandante C40 - moulin manuel de reference, inox.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/comandantegrinder",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"specht_design",name:"Specht Design",category:"Materiel",location:"Allemagne",bio:"Specht Design - accessories espresso minimalistes de precision.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/specht_design",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"perfectwerks",name:"Perfectwerks",category:"Materiel",location:"International",bio:"Perfectwerks - accessories espresso premium, puck screens.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/perfectwerks",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"ssp_grinding",name:"SSP Grinding",category:"Materiel",location:"Coree du Sud",bio:"SSP - meules premium referentes en specialite et competition.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/ssp_grinding",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"knobgrinder",name:"Knob Grinder",category:"Materiel",location:"International",bio:"Knob Grinder - moulins et meules de specialite haute performance.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/knobgrinder",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"nichecreate",name:"Niche Coffee",category:"Materiel",location:"UK",bio:"Niche Zero - moulin espresso single dose britannique.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/nichecreate",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"brewista.co",name:"Brewista",category:"Materiel",location:"USA",bio:"Brewista - bouilloires, balances, accessories filtre de precision.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/brewista.co",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"ikawacoffee",name:"Ikawa Coffee",category:"Materiel",location:"Londres, UK",bio:"Ikawa Pro et Home - torrefacteurs connectes.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/ikawacoffee",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"bellwethercoffee",name:"Bellwether Coffee",category:"Materiel",location:"Berkeley, US",bio:"Bellwether - torrefacteur electrique sans emission.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/bellwethercoffee",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"giacomovannelli_",name:"Giacomo Vannelli",category:"Materiel",location:"Italie",bio:"Barista et consultant espresso - expertise machines.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/giacomovannelli_",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"bookoocoffeetools",name:"Bookoo Coffee Tools",category:"Materiel",location:"International",bio:"Accessories cafe de specialite - WDT, outils precision.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/bookoocoffeetools",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"pbrewster79",name:"P. Brewster",category:"Materiel",location:"International",bio:"Accessories et equipements coffee specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/pbrewster79",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"lotus.coffee.products",name:"Lotus Coffee Products",category:"Materiel",location:"International",bio:"Lotus - accessories espresso design, puck screens.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/lotus.coffee.products",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"precisioncoffeetools",name:"Precision Coffee Tools",category:"Materiel",location:"International",bio:"Outils de precision pour baristas - tampers, WDT.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/precisioncoffeetools",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"pullmanespresso",name:"Pullman Espresso",category:"Materiel",location:"Australie",bio:"Pullman - tampers espresso de precision, made in Australia.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/pullmanespresso",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"variabrewing",name:"Varia Brewing",category:"Materiel",location:"International",bio:"Varia VS3 - moulin flat burr polyvalent espresso et filtre.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/variabrewing",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"belco.equipment",name:"Belco Equipment",category:"Materiel",location:"France",bio:"Belco - distribution equipement specialite en France.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/belco.equipment",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"belco.coffee",name:"Belco Coffee",category:"Materiel",location:"France",bio:"Belco - importateur cafe vert et equipement en France.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/belco.coffee",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"calita_mocca_equipment_france",name:"Calita Mocca FR",category:"Materiel",location:"France",bio:"Distribution equipement cafe et accessories barista FR.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/calita_mocca_equipment_france",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"baristaequipaustralia",name:"Barista Equipment AU",category:"Materiel",location:"Australie",bio:"Equipement barista Australie - machines, moulins.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/baristaequipaustralia",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"stronghold_roasters",name:"Stronghold Roasters",category:"Materiel",location:"Coree du Sud",bio:"Stronghold - Smart Roaster connecte, reference asiatique.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/stronghold_roasters",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"aeropress",name:"Aeropress Official",category:"Materiel",location:"USA",bio:"Aeropress - compte officiel, produits et recettes.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/aeropress",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"aero.press",name:"Aero Press",category:"Materiel",location:"International",bio:"Aero Press - contenu Aeropress, recettes et techniques.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/aero.press",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"origami_coffee.jp",name:"Origami Coffee JP",category:"Materiel",location:"Japon",bio:"Origami Coffee Japan - dripper Origami, design japonais.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/origami_coffee.jp",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"cofil.hasami",name:"Cofil Hasami",category:"Materiel",location:"Japon",bio:"Cofil Hasami - filtres ceramique japonais pour V60.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/cofil.hasami",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"kintojapan",name:"Kinto Japan",category:"Materiel",location:"Japon",bio:"Kinto - verres, carafes et accessories design japonais.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/kintojapan",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"kintoeurope",name:"Kinto Europe",category:"Materiel",location:"Europe",bio:"Kinto Europe - distribution europeenne accessories japonais.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/kintoeurope",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"melodripco",name:"Melodrip Co",category:"Materiel",location:"USA",bio:"Melodrip - limiteur de pression pour V60.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/melodripco",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"cafec_japan",name:"Cafec Japan",category:"Materiel",location:"Japon",bio:"Cafec - filtres papier japonais premium, Abaca filters.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/cafec_japan",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"notneutral",name:"Not Neutral",category:"Materiel",location:"USA",bio:"Not Neutral - verres et accessories cafe design californien.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/notneutral",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"loveramics",name:"Loveramics",category:"Materiel",location:"Hong Kong",bio:"Loveramics - ceramiques design pour cafe, tasses premium.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/loveramics",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"peugeot_saveurs",name:"Peugeot Saveurs",category:"Materiel",location:"France",bio:"Peugeot Saveurs - moulins a cafe tradition francaise premium.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/peugeot_saveurs",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"ims_filtri",name:"IMS Filtri",category:"Materiel",location:"Italie",bio:"IMS - filtres et accessories espresso de precision.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/ims_filtri",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"toddycafe",name:"Toddy Cafe",category:"Materiel",location:"USA",bio:"Toddy - cold brew maker, extraction froide de reference.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/toddycafe",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"goat_story",name:"Goat Story",category:"Materiel",location:"Slovenie",bio:"Goat Story - Gina espresso portable et accessories design.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/goat_story",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"sibaristcoffee",name:"Sibarist Coffee",category:"Materiel",location:"Espagne",bio:"Sibarist - filtres papier premium, Fast Filters.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/sibaristcoffee",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"the_chemex",name:"The Chemex",category:"Materiel",location:"USA",bio:"The Chemex - cafetiere design iconique depuis 1941.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/the_chemex",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"loringroasters",name:"Loring Roasters",category:"Materiel",location:"USA",bio:"Loring Smart Roast - torrefacteurs pro energetiquement efficaces.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/loringroasters",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"cuprima",name:"Cuprima",category:"Materiel",location:"International",bio:"Cuprima - accessories premium espresso, design et precision.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/cuprima",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"ratiocoffee",name:"Ratio Coffee",category:"Materiel",location:"USA",bio:"Ratio - machines a cafe automatiques haut de gamme.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/ratiocoffee",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"oscalla_coffee",name:"Oscalla Coffee",category:"Torrefacteur",location:"Europe",bio:"Specialty roaster - lots traceables, sourcing transparent.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/oscalla_coffee",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"ozonecoffeeuk",name:"Ozone Coffee UK",category:"Torrefacteur",location:"Londres, UK",bio:"Award-winning London roastery - direct trade, seasonal lots.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/ozonecoffeeuk",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"rayanaroast",name:"Rayana Roast",category:"Torrefacteur",location:"Moyen-Orient",bio:"Specialty roaster - lots selectionnes, torrefaction artisanale.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/rayanaroast",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"koppi_roasters",name:"Koppi Roasters",category:"Torrefacteur",location:"Helsingborg, SE",bio:"Swedish specialty roaster, WBC champions.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/koppi_roasters",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"cafeslugat",name:"Cafes Lugat",category:"Torrefacteur",location:"Paris, FR",bio:"Torrefacteur parisien historique reconverti specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/cafeslugat",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"squaremilecoffee",name:"Square Mile Coffee",category:"Torrefacteur",location:"Londres, UK",bio:"Award-winning London roastery - direct trade, exceptional espresso.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/squaremilecoffee",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"thebarnberlin",name:"The Barn Berlin",category:"Torrefacteur",location:"Berlin, DE",bio:"The Barn - pioneer de la 3e vague en Allemagne.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/thebarnberlin",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"fiveelephant",name:"Five Elephant",category:"Torrefacteur",location:"Berlin, DE",bio:"Five Elephant - torrefacteur et cafe berlinois, specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/fiveelephant",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"bonanzacoffee",name:"Bonanza Coffee",category:"Torrefacteur",location:"Berlin, DE",bio:"Bonanza Coffee - roastery berlinoise, sourcing direct.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/bonanzacoffee",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"onacoffee",name:"ONA Coffee",category:"Torrefacteur",location:"Australie",bio:"ONA Coffee by Sasa Sestic - competition et innovation.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/onacoffee",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"heartroasters",name:"Heart Roasters",category:"Torrefacteur",location:"Portland, US",bio:"Heart Coffee Roasters - Portland, sourcing direct.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/heartroasters",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"bluebottle",name:"Blue Bottle Coffee",category:"Torrefacteur",location:"Oakland, US",bio:"Blue Bottle - pionnier specialite americain, fraicheur.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/bluebottle",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"vervecoffee",name:"Verve Coffee",category:"Torrefacteur",location:"Santa Cruz, US",bio:"Verve Coffee Roasters - California specialty, farm partnerships.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/vervecoffee",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"proudmaryusa",name:"Proud Mary USA",category:"Torrefacteur",location:"Portland, US",bio:"Proud Mary - roaster australo-americain, lots exceptionels.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/proudmaryusa",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"proudmarycoffee",name:"Proud Mary Coffee",category:"Torrefacteur",location:"Australie",bio:"Proud Mary Australia - torrefacteur de reference.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/proudmarycoffee",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"kissthehippo",name:"Kiss the Hippo",category:"Torrefacteur",location:"Londres, UK",bio:"Kiss the Hippo - London specialty roaster, B-Corp certifie.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/kissthehippo",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"substancecafe",name:"Substance Cafe",category:"Torrefacteur",location:"Paris, FR",bio:"Substance - micro-torrefaction parisienne, reference specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/substancecafe",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"aprilcoffeecph",name:"April Coffee CPH",category:"Torrefacteur",location:"Copenhague, DK",bio:"April Coffee - torrefacteur danois, lots rares et expressifs.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/aprilcoffeecph",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"morgoncoffeeroasters",name:"Morgon Coffee",category:"Torrefacteur",location:"Goteborg, SE",bio:"Morgon Coffee Roasters - Suede, lots de saison, transparence.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/morgoncoffeeroasters",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"timwendelboe",name:"Tim Wendelboe",category:"Torrefacteur",location:"Oslo, NO",bio:"Tim Wendelboe - WBC 2004, roaster et cafe d Oslo.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/timwendelboe",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"norangecoffee.cph",name:"No Range Coffee CPH",category:"Torrefacteur",location:"Copenhague, DK",bio:"No Range Coffee - lots naturels et fermentes.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/norangecoffee.cph",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"leuchtfeuercoffee",name:"Leuchtfeuer Coffee",category:"Torrefacteur",location:"Hamburg, DE",bio:"Leuchtfeuer Coffee Roasters - Hamburg, single origin.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/leuchtfeuercoffee",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"blackmassroasters",name:"Black Mass Roasters",category:"Torrefacteur",location:"International",bio:"Black Mass - roaster au style sombre et lots de charactere.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/blackmassroasters",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"redemptionroasters",name:"Redemption Roasters",category:"Torrefacteur",location:"Londres, UK",bio:"Redemption Roasters - London roastery with social mission.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/redemptionroasters",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"grumpy_mule",name:"Grumpy Mule",category:"Torrefacteur",location:"Yorkshire, UK",bio:"Grumpy Mule - torrefacteur britannique specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/grumpy_mule",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"montista_torrefaction",name:"Montista Torrefaction",category:"Torrefacteur",location:"France",bio:"Montista - torrefacteur de specialite francais.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/montista_torrefaction",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"adrien.torrefacteur",name:"Adrien Torrefacteur",category:"Torrefacteur",location:"France",bio:"Adrien - torrefacteur independant francais, micro-lots.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/adrien.torrefacteur",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"parcel_torrefaction",name:"Parcel Torrefaction",category:"Torrefacteur",location:"France",bio:"Parcel - torrefaction de specialite, curated lots.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/parcel_torrefaction",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"loutsatorrefacteur",name:"Loutsas Torrefacteur",category:"Torrefacteur",location:"France",bio:"Loutsas - micro-torrefacteur francais, selection rigoureuse.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/loutsatorrefacteur",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"voltcafebrulerie",name:"Volt Cafe Brulerie",category:"Torrefacteur",location:"France",bio:"Volt - brulerie de specialite, lots de saison.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/voltcafebrulerie",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"azeria.torrefaction",name:"Azeria Torrefaction",category:"Torrefacteur",location:"France",bio:"Azeria - torrefaction artisanale francaise, micro-lots.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/azeria.torrefaction",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"brezicoffee",name:"Brezi Coffee",category:"Torrefacteur",location:"International",bio:"Brezi - specialty roaster, lots traceables.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/brezicoffee",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"casaroasters",name:"Casa Roasters",category:"Torrefacteur",location:"International",bio:"Casa Roasters - micro-torrefacteur, ambiance chaleureuse.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/casaroasters",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"capsuleroaster",name:"Capsule Roaster",category:"Torrefacteur",location:"France",bio:"Capsule - micro-torrefacteur, lots rares.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/capsuleroaster",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"roasterkat",name:"Roaster Kat",category:"Torrefacteur",location:"International",bio:"Roaster Kat - specialite, lots selectionnes et torrefaction soignee.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/roasterkat",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"roastertom",name:"Roaster Tom",category:"Torrefacteur",location:"International",bio:"Roaster Tom - micro-torrefacteur, lots de saison.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/roastertom",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"roastroycecoffee",name:"Roast Royce Coffee",category:"Torrefacteur",location:"International",bio:"Roast Royce - torrefacteur premium, lots curated.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/roastroycecoffee",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"ghostbirdcoffee",name:"Ghost Bird Coffee",category:"Torrefacteur",location:"International",bio:"Ghost Bird - lots experimentaux et fermentes.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/ghostbirdcoffee",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"darkartscoffee",name:"Dark Arts Coffee",category:"Torrefacteur",location:"Londres, UK",bio:"Dark Arts - roaster londonien au style iconique.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/darkartscoffee",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"onyxcoffeelab",name:"Onyx Coffee Lab",category:"Torrefacteur",location:"Arkansas, US",bio:"Onyx Coffee Lab - specialty roaster, lots competition-grade.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/onyxcoffeelab",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"klekacoffee",name:"Kleka Coffee",category:"Torrefacteur",location:"International",bio:"Kleka - torrefacteur specialite, lots selectionnes.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/klekacoffee",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"typhoon.roasters",name:"Typhoon Roasters",category:"Torrefacteur",location:"International",bio:"Typhoon - lots de saison et profils expressifs.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/typhoon.roasters",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"fabrica_coffee_roasters",name:"Fabrica Coffee Roasters",category:"Torrefacteur",location:"Lisbonne, PT",bio:"Fabrica - torrefacteur lisboete de reference, sourcing direct.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/fabrica_coffee_roasters",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"artisangreenbean",name:"Artisan Green Bean",category:"Torrefacteur",location:"International",bio:"Artisan Green Bean - cafe vert et formation torrefaction.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/artisangreenbean",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"kbcoffeeroastersparis",name:"KB Coffee Roasters Paris",category:"Torrefacteur",location:"Paris, FR",bio:"KB Coffee Roasters - torrefacteur parisien specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/kbcoffeeroastersparis",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"cafesrichard",name:"Cafes Richard",category:"Torrefacteur",location:"Paris, FR",bio:"Cafes Richard - torrefacteur parisien historique.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/cafesrichard",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"bruleriedesgobelins",name:"Brulerie des Gobelins",category:"Torrefacteur",location:"Paris, FR",bio:"Brulerie des Gobelins - torrefacteur parisien tradition.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/bruleriedesgobelins",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"brulerie_du_cantin_leonidas",name:"Brulerie du Cantin",category:"Torrefacteur",location:"France",bio:"Brulerie du Cantin - torrefacteur regional francais.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/brulerie_du_cantin_leonidas",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"terresdecafe",name:"Terres de Cafe",category:"Torrefacteur",location:"Paris, FR",bio:"Terres de Cafe - origines exceptionnelles a Paris.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/terresdecafe",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"hippolyte_courty_larbre_a_cafe",name:"L Arbre a Cafe",category:"Torrefacteur",location:"Paris, FR",bio:"L Arbre a Cafe by Hippolyte Courty - reference parisienne.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/hippolyte_courty_larbre_a_cafe",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"alba.coffeeroasters.paris",name:"Alba Coffee Roasters",category:"Torrefacteur",location:"Paris, FR",bio:"Alba - micro-torrefacteur parisien, lots de saison.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/alba.coffeeroasters.paris",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"aromescoffee",name:"Aromes Coffee",category:"Torrefacteur",location:"France",bio:"Aromes - torrefacteur de specialite francais.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/aromescoffee",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"cafict",name:"Cafict",category:"Torrefacteur",location:"France",bio:"Cafict - torrefacteur de specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/cafict",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"besca_roasters",name:"Besca Roasters",category:"Torrefacteur",location:"International",bio:"Besca - roaster specialite, lots rares.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/besca_roasters",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"cafevisionnaire",name:"Cafe Visionnaire",category:"Torrefacteur",location:"France",bio:"Cafe Visionnaire - torrefacteur de specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/cafevisionnaire",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"pxlroasters",name:"PXL Roasters",category:"Torrefacteur",location:"France",bio:"PXL - micro-torrefacteur, lots de saison.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/pxlroasters",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"dakcoffeeroasters",name:"DAK Coffee Roasters",category:"Torrefacteur",location:"Pays-Bas",bio:"DAK - roaster neerlandais, excellents lots naturels.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/dakcoffeeroasters",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"trunkcoffeelab",name:"Trunk Coffee Lab",category:"Torrefacteur",location:"Nagoya, JP",bio:"Trunk Coffee Lab - cafe et roastery japonais de reference.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/trunkcoffeelab",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"trunkcoffee",name:"Trunk Coffee",category:"Torrefacteur",location:"Japon",bio:"Trunk Coffee - torrefacteur japonais, esthetique et qualite.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/trunkcoffee",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"aokka_coffee",name:"Aokka Coffee",category:"Torrefacteur",location:"France",bio:"Aokka - torrefacteur francais specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/aokka_coffee",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"cafelomi",name:"Cafe Lomi",category:"Torrefacteur",location:"Paris, FR",bio:"Lomi - micro-torrefacteur parisien de reference.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/cafelomi",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"cafune.ca",name:"Cafune",category:"Torrefacteur",location:"Canada",bio:"Cafune - torrefacteur canadien, lots de saison.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/cafune.ca",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"mame.meansbeans",name:"Mame Means Beans",category:"Torrefacteur",location:"International",bio:"Mame - roastery specialite, grains d exception.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/mame.meansbeans",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"mamespecialtycoffee",name:"Mame Specialty Coffee",category:"Torrefacteur",location:"International",bio:"Mame Specialty Coffee - lots curieux et bien grilles.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/mamespecialtycoffee",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"0566roaster",name:"0566 Roaster",category:"Torrefacteur",location:"Japon",bio:"0566 Roaster - micro-torrefacteur japonais de qualite.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/0566roaster",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"rostoc.co",name:"Rostoc",category:"Torrefacteur",location:"International",bio:"Rostoc - torrefacteur specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/rostoc.co",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"ansaroaster",name:"Ansa Roaster",category:"Torrefacteur",location:"International",bio:"Ansa - roaster specialite, lots de saison.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/ansaroaster",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"lotroasters",name:"Lot Roasters",category:"Torrefacteur",location:"International",bio:"Lot Roasters - micro-torrefacteur, lots remarquables.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/lotroasters",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"slingshot.coffee",name:"Slingshot Coffee",category:"Torrefacteur",location:"USA",bio:"Slingshot Coffee - lots de saison et cold brew.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/slingshot.coffee",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"philocoffea",name:"Philocoffea",category:"Torrefacteur",location:"Japon",bio:"Philocoffea - roastery japonaise, philosophie et qualite.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/philocoffea",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"coffeemakerslille",name:"Coffee Makers Lille",category:"Torrefacteur",location:"Lille, FR",bio:"Coffee Makers Lille - torrefacteur et cafe nordiste.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/coffeemakerslille",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"pacamaracoffee",name:"Pacamara Coffee",category:"Torrefacteur",location:"Asie du Sud-Est",bio:"Pacamara - torrefacteur Asie du Sud-Est, lots varietaux.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/pacamaracoffee",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"5sensescoffee",name:"5 Senses Coffee",category:"Torrefacteur",location:"Australie",bio:"5 Senses Coffee - roaster australien, formation et lots.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/5sensescoffee",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"lohasbeans",name:"Lohas Beans",category:"Torrefacteur",location:"Asie",bio:"Lohas Beans - cafe specialite asiatique.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/lohasbeans",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"boccacoffee",name:"Bocca Coffee",category:"Torrefacteur",location:"Pays-Bas",bio:"Bocca Coffee Roasters - roastery neerlandaise bio.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/boccacoffee",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"green.lion.coffee",name:"Green Lion Coffee",category:"Torrefacteur",location:"International",bio:"Green Lion Coffee - approche environnementale.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/green.lion.coffee",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"forestgreencoffee",name:"Forest Green Coffee",category:"Torrefacteur",location:"International",bio:"Forest Green Coffee - torrefacteur eco-responsable.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/forestgreencoffee",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"bentwoodcoffee",name:"Bentwood Coffee",category:"Torrefacteur",location:"International",bio:"Bentwood Coffee - roastery specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/bentwoodcoffee",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"corvuscoffee",name:"Corvus Coffee",category:"Torrefacteur",location:"Colorado, US",bio:"Corvus Coffee Roasters - Colorado specialty roaster.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/corvuscoffee",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"equatorcoffees",name:"Equator Coffees",category:"Torrefacteur",location:"USA",bio:"Equator Coffees - roastery B-Corp californienne.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/equatorcoffees",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"cafeswindara",name:"Cafes Windara",category:"Torrefacteur",location:"International",bio:"Windara - torrefacteur specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/cafeswindara",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"johjohannsonkaffe",name:"Joh. Johannson Kaffe",category:"Torrefacteur",location:"Norvege",bio:"Joh. Johannson Kaffe - torrefacteur norvegien historique.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/johjohannsonkaffe",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"nordic_coffee",name:"Nordic Coffee",category:"Torrefacteur",location:"Scandinavie",bio:"Nordic Coffee - torrefacteur scandinave, design minimaliste.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/nordic_coffee",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"supremokaffee",name:"Supremo Kaffee",category:"Torrefacteur",location:"Allemagne",bio:"Supremo Kaffee - torrefacteur allemand, lots selectionnes.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/supremokaffee",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"gringonordic",name:"Gringo Nordic",category:"Torrefacteur",location:"Scandinavie",bio:"Gringo Nordic - lots fermentes et anaerobies.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/gringonordic",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"cafuneparis",name:"Cafune Paris",category:"Cafe",location:"Paris, FR",bio:"Cafune Paris - cafe de specialite, ambiance douce.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/cafuneparis",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"koar_cafe",name:"Koar Cafe",category:"Cafe",location:"International",bio:"Koar - cafe specialite, curation de lots.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/koar_cafe",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"mame.geneve",name:"Mame Geneve",category:"Cafe",location:"Geneve, CH",bio:"Mame - cafe specialite a Geneve.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/mame.geneve",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"mameocoffee",name:"Mameo Coffee",category:"Cafe",location:"International",bio:"Mameo - cafe specialite, concept chaleureux.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/mameocoffee",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"mamepolepole",name:"Mame Pole Pole",category:"Cafe",location:"Japon",bio:"Mame Pole Pole - cafe japonais, lenteur et precision.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/mamepolepole",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"kuro_mame_tokyo",name:"Kuro Mame Tokyo",category:"Cafe",location:"Tokyo, JP",bio:"Kuro Mame - cafe specialite tokyo, lots japonais.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/kuro_mame_tokyo",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"polygone.coffeeclub",name:"Polygone Coffee Club",category:"Cafe",location:"France",bio:"Club et cafe de specialite FR - cupping et evenements.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/polygone.coffeeclub",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"pagacoffeebkk",name:"Paga Coffee BKK",category:"Cafe",location:"Bangkok, TH",bio:"Specialty coffee shop Bangkok - third wave, single origins.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/pagacoffeebkk",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"motorscoffeebkk",name:"Motors Coffee BKK",category:"Cafe",location:"Bangkok, TH",bio:"Specialty cafe avec ambiance moto - filtre et espresso.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/motorscoffeebkk",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"motorscoffee",name:"Motors Coffee",category:"Cafe",location:"Bangkok, TH",bio:"Motors Coffee - cafe specialite Bangkok, aesthetic moto.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/motorscoffee",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"hexagonecafe",name:"Hexagone Cafe",category:"Cafe",location:"Paris, FR",bio:"Hexagone - cafe specialite parisien de reference.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/hexagonecafe",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"acousticcoffee",name:"Acoustic Coffee",category:"Cafe",location:"France",bio:"Acoustic Coffee - cafe specialite et concerts.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/acousticcoffee",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"drip_annecy",name:"Drip Annecy",category:"Cafe",location:"Annecy, FR",bio:"Drip - cafe specialite a Annecy, cadre alpin.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/drip_annecy",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"hard_geek_cafe",name:"Hard Geek Cafe",category:"Cafe",location:"France",bio:"Hard Geek Cafe - cafe et culture geek.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/hard_geek_cafe",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"tambour.cafe",name:"Tambour Cafe",category:"Cafe",location:"France",bio:"Tambour - cafe de specialite, ambiance artistique.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/tambour.cafe",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"cold_perk",name:"Cold Perk",category:"Cafe",location:"International",bio:"Cold Perk - cold brew et cafe filtre, specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/cold_perk",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"hona_cafecantine",name:"Hona Cafe Cantine",category:"Cafe",location:"France",bio:"Hona - cafe-cantine de specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/hona_cafecantine",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"hachi.coffee",name:"Hachi Coffee",category:"Cafe",location:"International",bio:"Hachi Coffee - cafe specialite, inspiration japonaise.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/hachi.coffee",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"glitch_coffee",name:"Glitch Coffee",category:"Cafe",location:"Tokyo, JP",bio:"Glitch Coffee Tokyo - reference japonaise, extraction precise.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/glitch_coffee",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"glitch_coffee_osaka",name:"Glitch Coffee Osaka",category:"Cafe",location:"Osaka, JP",bio:"Glitch Coffee Osaka - extension de la reference tokyoite.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/glitch_coffee_osaka",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"pcup.coffee",name:"PCup Coffee",category:"Cafe",location:"International",bio:"PCup - cafe specialite, lots de saison.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/pcup.coffee",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"tanat.coffee",name:"Tanat Coffee",category:"Cafe",location:"International",bio:"Tanat - cafe specialite, sourcing direct.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/tanat.coffee",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"old_lanterns_cafe",name:"Old Lanterns Cafe",category:"Cafe",location:"International",bio:"Old Lanterns - cafe specialite, atmosphere vintage.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/old_lanterns_cafe",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"beberrycoffee",name:"Beberry Coffee",category:"Cafe",location:"International",bio:"Beberry Coffee - lots naturels et anaerobies.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/beberrycoffee",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"mr.cafe_china",name:"Mr. Cafe China",category:"Cafe",location:"Chine",bio:"Mr. Cafe - specialite en Chine, 3e vague chinois.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/mr.cafe_china",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"takaoriginal",name:"Taka Original",category:"Cafe",location:"Japon",bio:"Taka - cafe japonais, originalite et precision.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/takaoriginal",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"raku__tea.coffeebar",name:"Raku Tea Coffee Bar",category:"Cafe",location:"Japon",bio:"Raku - the et cafe japonais, fusion subtile.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/raku__tea.coffeebar",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"cafe1959",name:"Cafe 1959",category:"Cafe",location:"International",bio:"Cafe 1959 - nostalgie et specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/cafe1959",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"manner_coffee",name:"Manner Coffee",category:"Cafe",location:"Shanghai, CN",bio:"Manner Coffee - chaine specialite chinoise en plein essor.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/manner_coffee",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"cafeination",name:"Cafeination",category:"Cafe",location:"International",bio:"Cafeination - cafe specialite, lots bien selectionnes.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/cafeination",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"dose.cafe",name:"Dose Cafe",category:"Cafe",location:"International",bio:"Dose - cafe specialite, lots de saison.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/dose.cafe",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"solobrewinglisboa",name:"Solo Brewing Lisboa",category:"Cafe",location:"Lisbonne, PT",bio:"Solo Brewing - cafe specialite lisboete, filter bar.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/solobrewinglisboa",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"noumincofe",name:"Noumin Cofe",category:"Cafe",location:"Japon",bio:"Noumin Cofe - cafe japonais de specialite, aesthetic campagne.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/noumincofe",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"drinksolocoffee",name:"Solo Coffee",category:"Cafe",location:"International",bio:"Solo Coffee - cafe specialite format solo.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/drinksolocoffee",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"kurasu.kyoto",name:"Kurasu Kyoto",category:"Cafe",location:"Kyoto, JP",bio:"Kurasu - cafe et boutique specialite a Kyoto.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/kurasu.kyoto",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"epeios_jp",name:"Epeios JP",category:"Cafe",location:"Japon",bio:"Epeios - cafe specialite japonais, design et lots soignes.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/epeios_jp",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"feve_coffee",name:"Feve Coffee",category:"Cafe",location:"International",bio:"Feve Coffee - cafe specialite, lots selectionnes.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/feve_coffee",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"bevarabia",name:"Bev Arabia",category:"Cafe",location:"Moyen-Orient",bio:"Bev Arabia - culture cafe et specialite au Moyen-Orient.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/bevarabia",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"arabica.kuwait",name:"Arabica Kuwait",category:"Cafe",location:"Koweit",bio:"Arabica Kuwait - cafe de specialite au Koweit.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/arabica.kuwait",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"nightjar.coffee",name:"Nightjar Coffee",category:"Cafe",location:"International",bio:"Nightjar Coffee - cafe specialite, ambiance nocturne.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/nightjar.coffee",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"apulinlicoffee",name:"Apulinli Coffee",category:"Cafe",location:"International",bio:"Apulinli - cafe specialite, sourcing direct.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/apulinlicoffee",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"booncoffee",name:"Boon Coffee",category:"Cafe",location:"International",bio:"Boon Coffee - cafe specialite, lots de saison.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/booncoffee",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"siquemcoffeeco",name:"Siquem Coffee",category:"Cafe",location:"International",bio:"Siquem Coffee Co - cafe specialite, sourcing ethique.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/siquemcoffeeco",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"daterracoffee",name:"Da Terra Coffee",category:"Cafe",location:"International",bio:"Da Terra Coffee - cafe specialite, terroir et savoir-faire.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/daterracoffee",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"cocolocoffee",name:"Cocolo Coffee",category:"Cafe",location:"Japon",bio:"Cocolo - cafe specialite japonais, ambiance douce.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/cocolocoffee",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"cocinarecoffee",name:"Cocinare Coffee",category:"Cafe",location:"International",bio:"Cocinare Coffee - cafe specialite, gastronomie.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/cocinarecoffee",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"patiobonito.coffee",name:"Patio Bonito Coffee",category:"Cafe",location:"Colombie",bio:"Patio Bonito - cafe specialite colombien.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/patiobonito.coffee",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"ceri.coffee",name:"Ceri Coffee",category:"Cafe",location:"International",bio:"Ceri Coffee - lots cerises et processing soigne.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/ceri.coffee",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"alt_t_coffee",name:"Alt T Coffee",category:"Cafe",location:"International",bio:"Alt T Coffee - cafe specialite alternatif.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/alt_t_coffee",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"anak.kopi",name:"Anak Kopi",category:"Cafe",location:"Indonesie",bio:"Anak Kopi - cafe specialite indonesien, kopi nusantara.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/anak.kopi",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"socialhourcoffee",name:"Social Hour Coffee",category:"Cafe",location:"International",bio:"Social Hour - cafe specialite, convivialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/socialhourcoffee",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"fieldworkcoffee",name:"Fieldwork Coffee",category:"Cafe",location:"International",bio:"Fieldwork Coffee - terrain et sourcing direct.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/fieldworkcoffee",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"maxims_coffee",name:"Maxims Coffee",category:"Cafe",location:"International",bio:"Maxims Coffee - cafe de tradition et raffinement.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/maxims_coffee",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"barburista",name:"Barburista",category:"Cafe",location:"International",bio:"Barburista - cafe et bar specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/barburista",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"coffeemuxu",name:"Coffee Muxu",category:"Cafe",location:"International",bio:"Coffee Muxu - lots experimentaux et ambiance.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/coffeemuxu",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"groundcontrl",name:"Ground Control",category:"Cafe",location:"International",bio:"Ground Control - cafe specialite, precision.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/groundcontrl",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"sip_coffeebar",name:"Sip Coffee Bar",category:"Cafe",location:"International",bio:"Sip Coffee Bar - cafe specialite, service soigne.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/sip_coffeebar",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"geogene.cafe",name:"Geogene Cafe",category:"Cafe",location:"France",bio:"Geogene - cafe specialite, terroir mis en avant.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/geogene.cafe",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"wild_beans_paris",name:"Wild Beans Paris",category:"Cafe",location:"Paris, FR",bio:"Wild Beans - cafe specialite parisien.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/wild_beans_paris",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"kadou_coffee",name:"Kadou Coffee",category:"Cafe",location:"France",bio:"Kadou - cafe specialite francais, ambiance chaleureuse.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/kadou_coffee",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"cafepiha_bordeaux",name:"Cafe Piha Bordeaux",category:"Cafe",location:"Bordeaux, FR",bio:"Cafe Piha - cafe specialite bordelais, vibe surf.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/cafepiha_bordeaux",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"univert_cafe",name:"Univert Cafe",category:"Cafe",location:"France",bio:"Univert Cafe - cafe specialite, univers vert.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/univert_cafe",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"haciendalaesmeralda",name:"Hacienda La Esmeralda",category:"Producteur",location:"Boquete, PA",bio:"La Esmeralda - producteur du Gesha le plus celebre, Panama.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/haciendalaesmeralda",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"ninetypluscoffee",name:"Ninety Plus Coffee",category:"Producteur",location:"International",bio:"Ninety Plus - lots Gesha et experimentaux de Panama et Ethiopie.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/ninetypluscoffee",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"geshavillage",name:"Gesha Village",category:"Producteur",location:"Ethiopie",bio:"Gesha Village - producteur ethiopien de Gesha de reference.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/geshavillage",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"fincalasenda",name:"Finca La Senda",category:"Producteur",location:"Colombie",bio:"Finca La Senda - micro-lots, altitude 1900m+.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/fincalasenda",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"lapalmayeltucan",name:"La Palma y El Tucan",category:"Producteur",location:"Colombie",bio:"La Palma y El Tucan - fermentation et innovation varietale.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/lapalmayeltucan",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"fincadiviso",name:"Finca El Diviso",category:"Producteur",location:"Colombie",bio:"Finca El Diviso - lots anaerobies et experimentaux.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/fincadiviso",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"fincaelparaisocoffee",name:"Finca El Paraiso",category:"Producteur",location:"Colombie",bio:"Finca El Paraiso - Diego Samuel Bermudez, fermentation thermo-shock.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/fincaelparaisocoffee",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"eldiviso_coffeefarm",name:"El Diviso Coffee Farm",category:"Producteur",location:"Colombie",bio:"El Diviso - fermentation extreme et processing innovant.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/eldiviso_coffeefarm",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"fincadonaelsa",name:"Finca Dona Elsa",category:"Producteur",location:"Panama",bio:"Finca Dona Elsa - Gesha et lots premium.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/fincadonaelsa",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"finca_deborah",name:"Finca Deborah",category:"Producteur",location:"Panama",bio:"Finca Deborah - haute altitude Panama, Gesha d exception.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/finca_deborah",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"lamastusfamilyestates",name:"Lamastas Family Estates",category:"Producteur",location:"International",bio:"Lamastas Family Estates - producteurs specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/lamastusfamilyestates",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"vergelestate",name:"Vergel Estate",category:"Producteur",location:"Colombie",bio:"Vergel Estate - lots experimentaux haute altitude.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/vergelestate",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"wandhe_family_estate",name:"Wandhe Family Estate",category:"Producteur",location:"Ethiopie",bio:"Wandhe - estate familial ethiopien, washed et naturels.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/wandhe_family_estate",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"la_divina_coffee_farm",name:"La Divina Coffee Farm",category:"Producteur",location:"Amerique Latine",bio:"La Divina - lots divins et processing soigne.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/la_divina_coffee_farm",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"fincasophia",name:"Finca Sophia",category:"Producteur",location:"Panama",bio:"Finca Sophia - Gesha et varietes rares, Panama.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/fincasophia",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"fincasoledadintag",name:"Finca Soledad Intag",category:"Producteur",location:"Equateur",bio:"Finca Soledad - Equateur, haute altitude.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/fincasoledadintag",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"fincaelpuentecoffee",name:"Finca El Puente",category:"Producteur",location:"Honduras",bio:"Finca El Puente - lots competition-grade.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/fincaelpuentecoffee",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"fincagascon",name:"Finca Gascon",category:"Producteur",location:"Amerique Latine",bio:"Finca Gascon - lots soignes et bien traites.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/fincagascon",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"cafegranjalaesperanza",name:"Cafe Gran La Esperanza",category:"Producteur",location:"Colombie",bio:"Gran La Esperanza - producteur colombien.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/cafegranjalaesperanza",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"inmaculadacoffeefarms",name:"Inmaculada Coffee Farms",category:"Producteur",location:"Colombie",bio:"Inmaculada - varietes rares et lots d exception.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/inmaculadacoffeefarms",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"coopetarrazu",name:"Coopetarrazu",category:"Producteur",location:"Costa Rica",bio:"Coopetarrazu - cooperative costaricienne de reference.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/coopetarrazu",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"guatemalancoffees",name:"Guatemalan Coffees",category:"Producteur",location:"Guatemala",bio:"Guatemalan Coffees - specialite, altitudes variees.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/guatemalancoffees",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"proyectococuyo",name:"Proyecto Cocuyo",category:"Producteur",location:"Venezuela",bio:"Proyecto Cocuyo - terroir unique et revival venezuelien.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/proyectococuyo",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"zaomaxkenya",name:"Zaomax Kenya",category:"Producteur",location:"Kenya",bio:"Zaomax - lots SL28/SL34 de specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/zaomaxkenya",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"ratnagiri_estate",name:"Ratnagiri Estate",category:"Producteur",location:"Inde",bio:"Ratnagiri Estate - plantation indienne de specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/ratnagiri_estate",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"kilimanjaro_specialty_coffees",name:"Kilimanjaro Specialty",category:"Producteur",location:"Tanzanie",bio:"Kilimanjaro Specialty - lots d altitude du Kili.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/kilimanjaro_specialty_coffees",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"kilimanjaro_specialty_home",name:"Kilimanjaro Home",category:"Producteur",location:"Tanzanie",bio:"Kilimanjaro Specialty Home - lots kilimanjariens.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/kilimanjaro_specialty_home",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"scott.origin",name:"Scott Origin",category:"Producteur",location:"International",bio:"Scott Origin - explorateur de terroirs cafes d exception.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/scott.origin",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"jaguaracoffee",name:"Jaguara Coffee",category:"Producteur",location:"Bresil",bio:"Jaguara - naturels d exception, Cerrado bresilien.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/jaguaracoffee",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"brazilspecialtycoffee",name:"Brazil Specialty Coffee",category:"Producteur",location:"Bresil",bio:"Brazil Specialty - promotion du cafe specialite bresilien.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/brazilspecialtycoffee",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"mujeresdelcafe",name:"Mujeres del Cafe",category:"Producteur",location:"Amerique Latine",bio:"Mujeres del Cafe - femmes productrices, empowerment et qualite.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/mujeresdelcafe",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"volcan.azul",name:"Volcan Azul",category:"Producteur",location:"Costa Rica",bio:"Volcan Azul - Gesha et varietes rares d altitude.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/volcan.azul",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"michaeltrung.coffee",name:"Michael Trung Coffee",category:"Barista",location:"Vietnam",bio:"Specialty barista and educator - extraction, competition.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/michaeltrung.coffee",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"sasasestic",name:"Sasa Sestic",category:"Barista",location:"Australie",bio:"WBC 2015 Champion, ONA Coffee founder.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/sasasestic",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"dritanalsela",name:"Dritan Alsela",category:"Barista",location:"Allemagne",bio:"World-renowned barista and educator - latte art, espresso.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/dritanalsela",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"hide_izaki",name:"Hide Izaki",category:"Barista",location:"Japon",bio:"Hide Izaki - WBC 2014 Champion, ambassadeur japonais.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/hide_izaki",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"daiki_hatakeyama_coffee",name:"Daiki Hatakeyama",category:"Barista",location:"Japon",bio:"Daiki Hatakeyama - barista japonais, competition et extraction.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/daiki_hatakeyama_coffee",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"taka_ishitani",name:"Taka Ishitani",category:"Barista",location:"Japon",bio:"Taka Ishitani - barista japonais, WBC competitor.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/taka_ishitani",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"mikitakamasa",name:"Miki Takamasa",category:"Barista",location:"Japon",bio:"Miki Takamasa - barista japonais, champion et consultant.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/mikitakamasa",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"tetsukasuya",name:"Tetsu Kasuya",category:"Barista",location:"Japon",bio:"Tetsu Kasuya - WBrC 2016 Champion, methode 4:6.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/tetsukasuya",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"jimseven",name:"James Hoffmann",category:"Barista",location:"Londres, UK",bio:"James Hoffmann - WBC 2007 champion, auteur, YouTubeur.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/jimseven",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"whereisscottrao",name:"Scott Rao",category:"Barista",location:"USA",bio:"Scott Rao - reference mondiale extraction et torrefaction.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/whereisscottrao",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"samosmrke",name:"Samo Smrke",category:"Barista",location:"International",bio:"Samo Smrke - chercheur cafe, ETH Zurich, science extraction.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/samosmrke",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"lukmasterbrewing",name:"Luk Master Brewing",category:"Barista",location:"International",bio:"Luk - barista et master brewer, techniques avancees.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/lukmasterbrewing",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"zachhammer.co",name:"Zach Hammer",category:"Barista",location:"USA",bio:"Zach Hammer - barista consultant, extraction specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/zachhammer.co",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"tannercolsoncoffee",name:"Tanner Colson Coffee",category:"Barista",location:"USA",bio:"Tanner Colson - barista competition americain.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/tannercolsoncoffee",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"genkappler",name:"Gen Kappler",category:"Barista",location:"International",bio:"Gen Kappler - barista et consultant, espresso et filtre.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/genkappler",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"shoma_coffeetaster",name:"Shoma Coffee Taster",category:"Barista",location:"Japon",bio:"Shoma - coffee taster japonais, Q Grader.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/shoma_coffeetaster",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"ishimax_coffee_japan",name:"Ishimax Coffee Japan",category:"Barista",location:"Japon",bio:"Ishimax - barista japonais, extraction et competition.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/ishimax_coffee_japan",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"platinumbaristaa",name:"Platinum Barista",category:"Barista",location:"International",bio:"Platinum Barista - barista specialite, education cafe.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/platinumbaristaa",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"barista.ft",name:"Barista FT",category:"Barista",location:"France",bio:"Barista FT - barista francais, tips extraction.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/barista.ft",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"dr.barista",name:"Dr. Barista",category:"Barista",location:"International",bio:"Dr. Barista - approche scientifique, extraction et chimie.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/dr.barista",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"natdanai.t",name:"Natdanai T.",category:"Barista",location:"Thailande",bio:"Natdanai - barista thailandais de competition.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/natdanai.t",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"felipe_herrerago",name:"Felipe Herrera",category:"Barista",location:"Colombie",bio:"Felipe Herrera - barista colombien, ambassadeur cafe.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/felipe_herrerago",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"laurids.gallee",name:"Laurids Gallee",category:"Barista",location:"Allemagne",bio:"Laurids Gallee - barista allemand, competition.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/laurids.gallee",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"xenia_espresso",name:"Xenia Espresso",category:"Barista",location:"International",bio:"Xenia - barista et educator, espresso et filtres.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/xenia_espresso",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"hiro.hashiguchi",name:"Hiro Hashiguchi",category:"Barista",location:"Japon",bio:"Hiro Hashiguchi - barista japonais, champion.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/hiro.hashiguchi",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"niko.kaffa",name:"Niko Kaffa",category:"Barista",location:"International",bio:"Niko Kaffa - barista et roaster, double competence.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/niko.kaffa",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"ichi_hatano",name:"Ichi Hatano",category:"Barista",location:"Japon",bio:"Ichi Hatano - barista japonais, extraction filtre et espresso.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/ichi_hatano",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"rodriguesanterre_phoenixfrench",name:"Rodrigue Santerre",category:"Barista",location:"France",bio:"Rodrigue Santerre - barista francais, champion.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/rodriguesanterre_phoenixfrench",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"md.brews",name:"MD Brews",category:"Barista",location:"International",bio:"MD Brews - barista et educator, methodes manuelles.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/md.brews",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"kenxman",name:"Kenxman",category:"Barista",location:"International",bio:"Kenxman - barista et consultant, expertise extraction.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/kenxman",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"diegocampos_27",name:"Diego Campos",category:"Barista",location:"Colombie",bio:"Diego Campos - WBC 2021 Champion, ambassadeur colombien.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/diegocampos_27",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"kyoto_obubu",name:"Kyoto Obubu",category:"The",location:"Kyoto, JP",bio:"The et cafe japonais, culture du the de Kyoto.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/kyoto_obubu",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"obubuteafarms",name:"Obubu Tea Farms",category:"The",location:"Kyoto, JP",bio:"Obubu Tea Farms - plantation de the a Kyoto, matcha et gyokuro.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/obubuteafarms",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"moychay.nl",name:"Moychay NL",category:"The",location:"Pays-Bas",bio:"Moychay - the chinois de specialite, puerh, oolong.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/moychay.nl",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"gorkov.chay",name:"Gorkov Chay",category:"The",location:"International",bio:"Gorkov Chay - the de specialite, sourcing direct.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/gorkov.chay",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"maisontheerie",name:"Maison Theerie",category:"The",location:"France",bio:"Maison Theerie - maison de the francaise, crus d exception.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/maisontheerie",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"moyamatcha",name:"Moya Matcha",category:"The",location:"International",bio:"Moya Matcha - matcha de qualite ceremonielle, sourcing Japon.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/moyamatcha",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"yamashita_shinjuen",name:"Yamashita Shinjuen",category:"The",location:"Japon",bio:"Yamashita Shinjuen - producteur japonais, gyokuro et sencha premium.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/yamashita_shinjuen",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"yoshida_chaen",name:"Yoshida Chaen",category:"The",location:"Japon",bio:"Yoshida Chaen - maison de the japonaise, tradition ancestrale.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/yoshida_chaen",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"furukawaseicha",name:"Furukawa Seicha",category:"The",location:"Japon",bio:"Furukawa Seicha - the vert japonais, sencha et kabusecha.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/furukawaseicha",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"japanese.tea_fr",name:"Japanese Tea FR",category:"The",location:"France",bio:"Japanese Tea France - importateur the japonais.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/japanese.tea_fr",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"nagamine.tea",name:"Nagamine Tea",category:"The",location:"Japon",bio:"Nagamine Tea - the de specialite japonais, lots rares.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/nagamine.tea",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"farmerchinatea",name:"Farmer China Tea",category:"The",location:"Chine",bio:"Farmer China Tea - the chinois direct producteur.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/farmerchinatea",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"jin_yu_tea",name:"Jin Yu Tea",category:"The",location:"Chine",bio:"Jin Yu Tea - the chinois premium, oolong, puerh.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/jin_yu_tea",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"linfamilytea",name:"Lin Family Tea",category:"The",location:"Taiwan",bio:"Lin Family Tea - oolong haute montagne Alishan direct.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/linfamilytea",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"rishitea",name:"Rishi Tea",category:"The",location:"USA",bio:"Rishi Tea - importateur americain the de specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/rishitea",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"teafarmerlin",name:"Tea Farmer Lin",category:"The",location:"Taiwan",bio:"Tea Farmer Lin - producteur taiwanais, oolongs d altitude.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/teafarmerlin",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"hugotea.space",name:"Hugo Tea Space",category:"The",location:"International",bio:"Hugo Tea Space - culture du the de specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/hugotea.space",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"hugoteaco",name:"Hugo Tea Co.",category:"The",location:"International",bio:"Hugo Tea Co - the de specialite, lots soignes.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/hugoteaco",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"yunnan_sourcing",name:"Yunnan Sourcing",category:"The",location:"Yunnan, CN",bio:"Yunnan Sourcing - reference mondiale puerh et oolong.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/yunnan_sourcing",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"nio_japanese_green_tea",name:"Nio Japanese Green Tea",category:"The",location:"Japon",bio:"NIO Tea - the vert japonais, sencha, gyokuro, matcha.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/nio_japanese_green_tea",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"moheitea",name:"Mohei Tea",category:"The",location:"International",bio:"Mohei Tea - the de specialite, sourcing direct.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/moheitea",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"tea_tsy_official",name:"Tea TSY Official",category:"The",location:"International",bio:"Tea TSY - the de specialite, culture contemporaine.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/tea_tsy_official",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"_pressea",name:"Pressea",category:"The",location:"France",bio:"Pressea - presse-the et accessoires design.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/_pressea",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"aubepine_et_bergamote",name:"Aubepine et Bergamote",category:"The",location:"France",bio:"Aubepine et Bergamote - the et plantes artisanaux.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/aubepine_et_bergamote",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"perfectdailygrind",name:"Perfect Daily Grind",category:"Media",location:"International",bio:"Perfect Daily Grind - media de reference du cafe specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/perfectdailygrind",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"sprudge",name:"Sprudge",category:"Media",location:"USA",bio:"Sprudge - media culture cafe specialite, portraits et voyages.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/sprudge",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"baristamagazine",name:"Barista Magazine",category:"Media",location:"USA",bio:"Barista Magazine - magazine de reference du monde barista.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/baristamagazine",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"coffeegeek",name:"Coffee Geek",category:"Media",location:"International",bio:"CoffeeGeek - reviews equipement et culture specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/coffeegeek",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"dailycoffeenews",name:"Daily Coffee News",category:"Media",location:"International",bio:"Daily Coffee News - actualites quotidiennes du secteur.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/dailycoffeenews",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"roastmagazine",name:"Roast Magazine",category:"Media",location:"USA",bio:"Roast Magazine - magazine professionnel torrefaction.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/roastmagazine",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"roasterdaily",name:"Roaster Daily",category:"Media",location:"International",bio:"Roaster Daily - actualites quotidiennes pour torrefacteurs.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/roasterdaily",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"cafemagfr",name:"Cafe Mag FR",category:"Media",location:"France",bio:"Cafe Mag - magazine francais du cafe specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/cafemagfr",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"gourmetcup_mag",name:"Gourmet Cup Mag",category:"Media",location:"France",bio:"Gourmet Cup - magazine gastronomie et cafe de specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/gourmetcup_mag",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"europeancoffeetrip",name:"European Coffee Trip",category:"Media",location:"Europe",bio:"European Coffee Trip - guide cafes de specialite en Europe.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/europeancoffeetrip",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"coffeedeskpl",name:"Coffee Desk PL",category:"Media",location:"Pologne",bio:"Coffee Desk - media et boutique specialite, Pologne.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/coffeedeskpl",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"coffeedeskcom",name:"Coffee Desk Com",category:"Media",location:"International",bio:"Coffee Desk - plateforme media specialite internationale.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/coffeedeskcom",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"baristahustle",name:"Barista Hustle",category:"Education",location:"International",bio:"Barista Hustle - plateforme education barista, extraction.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/baristahustle",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"baristaguild",name:"Barista Guild",category:"Education",location:"USA",bio:"Barista Guild SCA - certification barista specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/baristaguild",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"lecoledessens",name:"L Ecole des Sens",category:"Education",location:"France",bio:"L Ecole des Sens - formation sensorielle the et cafe.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/lecoledessens",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"aero.press.fr",name:"Aeropress FR",category:"Education",location:"France",bio:"Aeropress France - communaute, recettes et tips.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/aero.press.fr",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"aeropress_recipe",name:"Aeropress Recipe",category:"Education",location:"International",bio:"Aeropress Recipe - recettes et techniques.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/aeropress_recipe",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"alwaysdialingin",name:"Always Dialing In",category:"Education",location:"International",bio:"Always Dialing In - extractions et recettes espresso.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/alwaysdialingin",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"manualbrewonly",name:"Manual Brew Only",category:"Education",location:"International",bio:"Manual Brew Only - extraction manuelle, V60, Chemex.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/manualbrewonly",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"brewmethods",name:"Brew Methods",category:"Education",location:"International",bio:"Brew Methods - toutes les methodes d extraction.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/brewmethods",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"lenezducafe_official",name:"Le Nez du Cafe",category:"Education",location:"France",bio:"Le Nez du Cafe - aromes cafe, formation sensorielle.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/lenezducafe_official",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"coffeegearlab",name:"Coffee Gear Lab",category:"Education",location:"International",bio:"Coffee Gear Lab - tests et reviews equipement specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/coffeegearlab",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"cuisinebarista",name:"Cuisine Barista",category:"Education",location:"France",bio:"Cuisine Barista - formation et tips barista.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/cuisinebarista",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"le_coffee_geek",name:"Le Coffee Geek",category:"Education",location:"France",bio:"Le Coffee Geek - media francais specialite, reviews.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/le_coffee_geek",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"espressologie",name:"Espressologie",category:"Education",location:"France",bio:"Espressologie - education espresso et art du cafe.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/espressologie",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"collectif_cafe",name:"Collectif Cafe",category:"Communaute",location:"France",bio:"Collectif - communaute francaise specialite, evenements.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/collectif_cafe",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"iamnotabarista",name:"I Am Not A Barista",category:"Communaute",location:"International",bio:"I Am Not A Barista - storytelling cafes et producteurs.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/iamnotabarista",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"reseaubaristasfrance",name:"Reseau Baristas France",category:"Communaute",location:"France",bio:"Reseau Baristas France - federation des baristas FR.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/reseaubaristasfrance",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"thebaristaleague",name:"The Barista League",category:"Communaute",location:"International",bio:"The Barista League - competition alternative et fun.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/thebaristaleague",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"coffeemates.green",name:"Coffee Mates Green",category:"Communaute",location:"International",bio:"Coffee Mates Green - cafe et durabilite, community.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/coffeemates.green",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"humansofcoffee",name:"Humans of Coffee",category:"Communaute",location:"International",bio:"Humans of Coffee - portraits de producteurs et baristas.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/humansofcoffee",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"thehappycoffeenetwork",name:"Happy Coffee Network",category:"Communaute",location:"International",bio:"Happy Coffee Network - communaute positive specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/thehappycoffeenetwork",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"producerroasterforum",name:"Producer Roaster Forum",category:"Communaute",location:"International",bio:"Producer Roaster Forum - dialogue direct entre acteurs.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/producerroasterforum",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"coffeeshopgoals",name:"Coffee Shop Goals",category:"Communaute",location:"International",bio:"Coffee Shop Goals - inspiration cafes a travers le monde.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/coffeeshopgoals",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"everywhere.aeropress",name:"Everywhere Aeropress",category:"Communaute",location:"International",bio:"Everywhere Aeropress - Aeropress partout dans le monde.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/everywhere.aeropress",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"japan.aero.press.info",name:"Japan Aeropress Info",category:"Communaute",location:"Japon",bio:"Japan Aeropress Info - communaute japonaise Aeropress.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/japan.aero.press.info",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"aeropressonly",name:"Aeropress Only",category:"Communaute",location:"International",bio:"Aeropress Only - dedies 100% a l Aeropress.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/aeropressonly",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"coffee_yapper",name:"Coffee Yapper",category:"Communaute",location:"International",bio:"Coffee Yapper - discussions autour du cafe specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/coffee_yapper",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"wankultcg",name:"Wankult CG",category:"Communaute",location:"International",bio:"Wankult Coffee Geek - communaute equipement et extraction.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/wankultcg",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"cxffeeblack",name:"Cxffee Black",category:"Communaute",location:"International",bio:"Cxffee Black - diversite et inclusion dans le cafe.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/cxffeeblack",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"coffeeclub.ca",name:"Coffee Club Canada",category:"Communaute",location:"Canada",bio:"Coffee Club Canada - communaute specialite canadienne.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/coffeeclub.ca",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"coffeeandtales",name:"Coffee and Tales",category:"Communaute",location:"International",bio:"Coffee and Tales - cafe et litterature.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/coffeeandtales",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"humanwithattitude",name:"Human With Attitude",category:"Communaute",location:"International",bio:"Human With Attitude - communaute cafe positive.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/humanwithattitude",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"roast.cup.repeat",name:"Roast Cup Repeat",category:"Communaute",location:"International",bio:"Roast Cup Repeat - tips torrefaction et extraction.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/roast.cup.repeat",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"roast.brew.repeat",name:"Roast Brew Repeat",category:"Communaute",location:"International",bio:"Roast Brew Repeat - cycle de la tasse parfaite.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/roast.brew.repeat",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"fits_and_coffee",name:"Fits and Coffee",category:"Communaute",location:"International",bio:"Fits and Coffee - mode et cafe specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/fits_and_coffee",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"coffee.sad.sad",name:"Coffee Sad Sad",category:"Communaute",location:"International",bio:"Coffee Sad Sad - communaute cafe emotionnelle.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/coffee.sad.sad",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"haroldandcoffee",name:"Harold and Coffee",category:"Communaute",location:"International",bio:"Harold and Coffee - portfolio de cafes degustes.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/haroldandcoffee",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"piratesofcoffee",name:"Pirates of Coffee",category:"Communaute",location:"International",bio:"Pirates of Coffee - communaute internationale.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/piratesofcoffee",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"bravo.brewer",name:"Bravo Brewer",category:"Communaute",location:"International",bio:"Bravo Brewer - brassage manuel, recettes et tips.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/bravo.brewer",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"broken.gooseneck",name:"Broken Gooseneck",category:"Communaute",location:"International",bio:"Broken Gooseneck - extraction filtre, humour.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/broken.gooseneck",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"pullandpourcoffee",name:"Pull and Pour Coffee",category:"Communaute",location:"International",bio:"Pull and Pour - guides extraction et dialing espresso.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/pullandpourcoffee",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"cafeanywhere_",name:"Cafe Anywhere",category:"Communaute",location:"International",bio:"Cafe Anywhere - bon cafe partout, spots et reviews.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/cafeanywhere_",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"trabocca",name:"Trabocca",category:"Importateur",location:"Pays-Bas",bio:"Trabocca - importateur specialite, lots rares d origines.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/trabocca",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"cafeimports",name:"Cafe Imports",category:"Importateur",location:"Minneapolis, US",bio:"Green coffee importer - direct relationships worldwide.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/cafeimports",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"cafeimportseurope",name:"Cafe Imports Europe",category:"Importateur",location:"Europe",bio:"Cafe Imports Europe - lots verts pour torrefacteurs europeens.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/cafeimportseurope",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"nordicapproach",name:"Nordic Approach",category:"Importateur",location:"Oslo, NO",bio:"Nordic Approach - importateur specialite, lots transparents.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/nordicapproach",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"covoya.coffee",name:"Covoya Coffee",category:"Importateur",location:"France/US",bio:"Covoya - importateur cafe vert specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/covoya.coffee",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"algrano",name:"Algrano",category:"Importateur",location:"Suisse",bio:"Algrano - plateforme directe producteurs-torrefacteurs.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/algrano",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"fairfieldtrading",name:"Fairfield Trading",category:"Importateur",location:"International",bio:"Fairfield - negoce de cafe vert specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/fairfieldtrading",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"inc.greencoffee",name:"Inc Green Coffee",category:"Importateur",location:"International",bio:"Inc Green Coffee - cafe vert, lots de specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/inc.greencoffee",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"berlincoffeefestival",name:"Berlin Coffee Festival",category:"Evenement",location:"Berlin, DE",bio:"Berlin Coffee Festival - evenement majeur specialite europeenne.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/berlincoffeefestival",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"milancoffeefestival",name:"Milan Coffee Festival",category:"Evenement",location:"Milan, IT",bio:"Milan Coffee Festival - rencontre italienne.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/milancoffeefestival",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"londoncoffeefestival",name:"London Coffee Festival",category:"Evenement",location:"Londres, UK",bio:"London Coffee Festival - plus grand evenement cafe d Europe.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/londoncoffeefestival",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"amsterdamcoffeefestival",name:"Amsterdam Coffee Festival",category:"Evenement",location:"Amsterdam, NL",bio:"Amsterdam Coffee Festival - specialite aux Pays-Bas.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/amsterdamcoffeefestival",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"pariscafefestival",name:"Paris Cafe Festival",category:"Evenement",location:"Paris, FR",bio:"Paris Cafe Festival - salon specialite en France.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/pariscafefestival",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"coffeeshowfrance",name:"Coffee Show France",category:"Evenement",location:"France",bio:"Coffee Show France - salon professionnel du cafe.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/coffeeshowfrance",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"polygone.formations",name:"Polygone Formations",category:"Formation",location:"France",bio:"Polygone - formations barista et extraction.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/polygone.formations",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"steam_coffee_consulting",name:"Steam Coffee Consulting",category:"Formation",location:"International",bio:"Steam Coffee Consulting - consulting et formation pro.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/steam_coffee_consulting",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"laclaque.cafeecole",name:"La Claque Cafe Ecole",category:"Formation",location:"France",bio:"La Claque - cafe-ecole de specialite, formation barista.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/laclaque.cafeecole",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"laclaque.cafenomade",name:"La Claque Cafe Nomade",category:"Formation",location:"France",bio:"La Claque Nomade - version itinerante du cafe-ecole.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/laclaque.cafenomade",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"coffeemindacademy",name:"Coffee Mind Academy",category:"Formation",location:"Danemark",bio:"Coffee Mind Academy - formation haut niveau, Copenhague.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/coffeemindacademy",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"wcoffeeresearch",name:"W Coffee Research",category:"Science",location:"International",bio:"W Coffee Research - extraction, chimie et sensoriel.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/wcoffeeresearch",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"curious.about.coffee.science",name:"Curious About Coffee",category:"Science",location:"International",bio:"Curious About Coffee Science - vulgarisation science cafe.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/curious.about.coffee.science",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"coffee.chemistry",name:"Coffee Chemistry",category:"Science",location:"International",bio:"Coffee Chemistry - chimie du cafe, extraction et molecules.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/coffee.chemistry",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"flavonomics",name:"Flavonomics",category:"Science",location:"International",bio:"Flavonomics - science des aromes, fermentation, chimie.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/flavonomics",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"coffeeos.app",name:"CoffeeOS App",category:"Tech",location:"International",bio:"CoffeeOS - app gestion torrefaction, lots et cupping.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/coffeeos.app",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"tastifyapp",name:"Tastify App",category:"Tech",location:"International",bio:"Tastify - app notation et partage de cafes degustes.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/tastifyapp",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"cropster",name:"Cropster",category:"Tech",location:"Autriche",bio:"Cropster - logiciel de gestion de torrefaction.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/cropster",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"syncfo",name:"Syncfo",category:"Tech",location:"International",bio:"Syncfo - plateforme pour torrefacteurs et cafes.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/syncfo",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"cuppy.coffee.app",name:"Cuppy Coffee App",category:"Tech",location:"International",bio:"Cuppy - app notation cafes, reseau baristas.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/cuppy.coffee.app",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"kurasu.store.jp",name:"Kurasu Store JP",category:"Boutique",location:"Japon",bio:"Kurasu Store - boutique accessories cafe japonaise.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/kurasu.store.jp",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"glyphsupplyco",name:"Glyph Supply Co",category:"Boutique",location:"International",bio:"Glyph Supply Co - accessories cafe design.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/glyphsupplyco",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"maxicoffee_uk",name:"Maxicoffee UK",category:"Boutique",location:"UK",bio:"Maxicoffee UK - boutique equipement cafe.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/maxicoffee_uk",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"maxicoffee",name:"Maxicoffee",category:"Boutique",location:"France",bio:"Maxicoffee - boutique reference equipement cafe.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/maxicoffee",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"maxicoffeelateste",name:"Maxicoffee La Teste",category:"Boutique",location:"Arcachon, FR",bio:"Maxicoffee La Teste - boutique locale.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/maxicoffeelateste",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"maxicoffeeplandecampagne",name:"Maxicoffee Plan",category:"Boutique",location:"France",bio:"Maxicoffee - boutique equipement cafe en France.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/maxicoffeeplandecampagne",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"wholelattelove",name:"Whole Latte Love",category:"Boutique",location:"USA",bio:"Whole Latte Love - boutique specialiste espresso US.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/wholelattelove",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"alternativebrewing",name:"Alternative Brewing",category:"Boutique",location:"Australie",bio:"Alternative Brewing - boutique accessories cafe.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/alternativebrewing",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"idrinkcoffeecanada",name:"I Drink Coffee Canada",category:"Boutique",location:"Canada",bio:"I Drink Coffee Canada - boutique specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/idrinkcoffeecanada",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"kaffebox",name:"Kaffebox",category:"Boutique",location:"Scandinavie",bio:"Kaffebox - box abonnement torrefacteurs scandinaves.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/kaffebox",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"thecoffeevine",name:"The Coffee Vine",category:"Boutique",location:"USA",bio:"The Coffee Vine - abonnement cafe specialite americain.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/thecoffeevine",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"hbroastermkt",name:"HB Roaster Market",category:"Boutique",location:"International",bio:"HB Roaster Market - marketplace torrefacteurs specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/hbroastermkt",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"sca_france",name:"SCA France",category:"Association",location:"France",bio:"SCA France - branche francaise Specialty Coffee Association.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/sca_france",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"thecqi",name:"The CQI",category:"Certification",location:"International",bio:"Coffee Quality Institute - organisme Q Grader certification.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/thecqi",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"sustainable_coffee_institute",name:"Sustainable Coffee Institute",category:"Durabilite",location:"International",bio:"SCI - certification durabilite dans le cafe de specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/sustainable_coffee_institute",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"worldcoffeechampionships",name:"World Coffee Champ.",category:"Competition",location:"International",bio:"World Coffee Championships - WBC, WBrC, WCC hub officiel.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/worldcoffeechampionships",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"allianceforcoffeeexcellence",name:"Alliance Coffee Excellence",category:"Competition",location:"International",bio:"ACE - organisateur du Cup of Excellence.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/allianceforcoffeeexcellence",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"cupofexcellence",name:"Cup of Excellence",category:"Competition",location:"International",bio:"Cup of Excellence - competition lots de specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/cupofexcellence",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"specialtyturkishcoffee",name:"Specialty Turkish Coffee",category:"Culture",location:"Turquie",bio:"Specialty Turkish Coffee - revival du cafe turc specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/specialtyturkishcoffee",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"fermentnation.pa",name:"Ferment Nation",category:"Processing",location:"Panama",bio:"Fermentation-forward processing - anaerobic, natural.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/fermentnation.pa",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"nadonado.co",name:"Nado Nado",category:"Processing",location:"International",bio:"Nado Nado - fermentation et processing experimental.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/nadonado.co",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"swisswater",name:"Swiss Water",category:"Industrie",location:"Canada",bio:"Swiss Water Process - decaffeination sans solvant.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/swisswater",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"lavazzafr",name:"Lavazza FR",category:"Industrie",location:"France",bio:"Lavazza France - grand groupe cafe, gamme specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/lavazzafr",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"mtpak_coffee",name:"MTPak Coffee",category:"Packaging",location:"International",bio:"MTPak Coffee - emballages specialite eco.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/mtpak_coffee",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"ypakcoffeepouch",name:"YPak Coffee Pouch",category:"Packaging",location:"International",bio:"YPak - sachets cafe specialite sur mesure.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/ypakcoffeepouch",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]},
  {handle:"noissueco",name:"Noissue Co",category:"Packaging",location:"International",bio:"Noissue - emballages durables pour marques cafe.",followers:"--",avatar:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&q=80",url:"https://instagram.com/noissueco",posts:["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75"]},
  {handle:"sipicoffeetours",name:"Sipi Coffee Tours",category:"Tourisme",location:"Ouganda",bio:"Sipi Coffee Tours - tourisme cafeier en Ouganda.",followers:"--",avatar:"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=80&q=80",url:"https://instagram.com/sipicoffeetours",posts:["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75","https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75"]},
  {handle:"bordeaux_coffee_map",name:"Bordeaux Coffee Map",category:"Guide",location:"Bordeaux, FR",bio:"Bordeaux Coffee Map - guide cafes specialite de Bordeaux.",followers:"--",avatar:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80&q=80",url:"https://instagram.com/bordeaux_coffee_map",posts:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=75","https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75"]},
  {handle:"the.coffee.bill",name:"The Coffee Bill",category:"Politique",location:"International",bio:"The Coffee Bill - politique autour du cafe specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=80&q=80",url:"https://instagram.com/the.coffee.bill",posts:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&q=75","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75"]},
  {handle:"ciaokombucha",name:"Ciao Kombucha",category:"Boisson",location:"International",bio:"Ciao Kombucha - kombucha et fermentation.",followers:"--",avatar:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=80&q=80",url:"https://instagram.com/ciaokombucha",posts:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=75","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75"]},
  {handle:"drinkmorning",name:"Drink Morning",category:"Boisson",location:"International",bio:"Drink Morning - rituel du matin, cafe et boissons.",followers:"--",avatar:"https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=80&q=80",url:"https://instagram.com/drinkmorning",posts:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=75","https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75"]},
  {handle:"mitsuba_bordeaux",name:"Mitsuba Bordeaux",category:"Restaurant",location:"Bordeaux, FR",bio:"Mitsuba - restaurant japonais Bordeaux, the et cafe.",followers:"--",avatar:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=80&q=80",url:"https://instagram.com/mitsuba_bordeaux",posts:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=75","https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75"]},
  {handle:"epoq_restaurant",name:"Epoq Restaurant",category:"Restaurant",location:"France",bio:"Epoq - restaurant avec selection cafe specialite.",followers:"--",avatar:"https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=80&q=80",url:"https://instagram.com/epoq_restaurant",posts:["https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=300&q=75","https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=75","https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&q=75"]}
]

const TABS = [
  { id:'home',      label:'Accueil' },
  { id:'news',      label:'Actualites' },
  { id:'instagram', label:'Instagram'  },
  { id:'reddit',    label:'Communaute' },
  { id:'science',   label:'Science'    },
  { id:'gear',      label:'Ça fait du bruit' },
  { id:'harvest',   label:'Origines' },
]


const GG_ORANGE = '#da5d16';

const GG_PROCESS_STAGES = [
  { key:'cherry',       label:'Cerise',       detail:'La matière première.',                    bg:'#f5f0e9' },
  { key:'depulp',       label:'Dépulpage',    detail:'La peau et la pulpe sont retirées.',      bg:'#eee4d6' },
  { key:'fermentation', label:'Fermentation', detail:'Le mucilage se dégrade progressivement.', bg:'#dfd0bc' },
  { key:'wash',         label:'Lavage',       detail:'Le grain est nettoyé à l’eau.',           bg:'#c9b9a3' },
  { key:'drying',       label:'Séchage',      detail:'Le café sèche jusqu’à être stabilisé.',   bg:'#aa8464' },
  { key:'green',        label:'Café vert',    detail:'Le grain est prêt à être torréfié.',      bg:'#694936' },
  { key:'roast',        label:'Torréfaction', detail:'La chaleur transforme le grain.',         bg:'#271510' },
];

const GG_HOME_CATEGORIES = [
  { id:'news',      label:'Actualités',  icon:'news' },
  { id:'science',   label:'Science',     icon:'science' },
  { id:'harvest',   label:'Origines',    icon:'origins' },
  { id:'gear',      label:'Matériel',    icon:'gear' },
  { id:'instagram', label:'Instagram',   icon:'instagram' },
  { id:'reddit',    label:'Communauté',  icon:'community' },
  { id:'music',     label:'Musique',     icon:'music' },
  { id:'market',    label:'Market pulse',icon:'market' },
];

const ggClamp = (n, min=0, max=1) => Math.min(max, Math.max(min, n));
const ggSmooth = t => t * t * (3 - 2 * t);

function ggHexToRgb(hex) {
  const h = hex.replace('#','');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
function ggRgbToHex([r,g,b]) {
  return `#${[r,g,b].map(v => Math.round(v).toString(16).padStart(2,'0')).join('')}`;
}
function ggMixColor(a,b,t){
  const aa=ggHexToRgb(a), bb=ggHexToRgb(b);
  return ggRgbToHex(aa.map((v,i)=>v+(bb[i]-v)*t));
}
function ggColorAt(progress){
  const pos = progress * (GG_PROCESS_STAGES.length - 1);
  const i = Math.min(GG_PROCESS_STAGES.length - 2, Math.floor(pos));
  const t = ggSmooth(pos - i);
  return ggMixColor(GG_PROCESS_STAGES[i].bg, GG_PROCESS_STAGES[i+1].bg, t);
}
function ggOpacityForStage(pos, index){
  return ggClamp(1 - Math.abs(pos - index));
}

function GGCategoryIcon({ type }) {
  const common = { fill:'none', stroke:'currentColor', strokeWidth:1.7, strokeLinecap:'round', strokeLinejoin:'round' };
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
    {type==='news' && <><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h4M8 16h8M15 12h1"/></>}
    {type==='science' && <><path d="M9 3h6M10 3v5l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 17l-5-9V3"/><path d="M8 14h8"/></>}
    {type==='origins' && <><path d="M19 4C11 4 5 8 5 15c0 3 2 5 5 5 7 0 10-8 9-16Z"/><path d="M6 18c4-5 7-7 11-9"/></>}
    {type==='gear' && <><path d="M7 6h10l-1.3 8.2a4 4 0 0 1-7.4 0L7 6Z"/><path d="M5 6h14M12 14v6M9 20h6"/></>}
    {type==='instagram' && <><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.2"/><circle cx="17.3" cy="6.8" r=".7" fill="currentColor" stroke="none"/></>}
    {type==='community' && <><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2"/><path d="M3.5 20c.7-4 2.8-6 5.5-6s4.8 2 5.5 6M14.5 15c2.9-.6 5.2 1 6 4"/></>}
    {type==='music' && <><path d="M9 18V6l9-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="15.5" cy="16" r="2.5"/></>}
    {type==='market' && <><path d="M5 19V12M10 19V8M15 19V14M20 19V5"/></>}
  </svg>;
}

function GGCursor() {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    let tx = innerWidth/2, ty = innerHeight/2, x=tx, y=ty, raf;
    const move = e => { tx=e.clientX; ty=e.clientY; };
    const over = e => setActive(Boolean(e.target.closest('a,button,[data-cursor="active"]')));
    const tick = () => {
      x += (tx-x)*.16; y += (ty-y)*.16;
      if(cursorRef.current) cursorRef.current.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
      if(dotRef.current) dotRef.current.style.transform=`translate3d(${tx}px,${ty}px,0) translate(-50%,-50%)`;
      raf=requestAnimationFrame(tick);
    };
    addEventListener('pointermove',move,{passive:true});
    addEventListener('pointerover',over,{passive:true});
    tick();
    return ()=>{ removeEventListener('pointermove',move); removeEventListener('pointerover',over); cancelAnimationFrame(raf); };
  },[]);

  return <>
    <div ref={cursorRef} className={`ggc-cursor ${active?'is-active':''}`} />
    <div ref={dotRef} className="ggc-cursor-dot" />
  </>;
}

function ggStageWindow(position, center, radius=1) {
  return ggClamp(1 - Math.abs(position - center) / radius);
}

function GGProcessIllustration2D({ progress }) {
  const p = progress * 6;
  const peel = ggSmooth(ggClamp((p - .38) / 1.02));
  const ferment = ggSmooth(ggClamp((p - 1.45) / .65)) * (1 - ggSmooth(ggClamp((p - 2.42) / .7)));
  const wash = ggSmooth(ggClamp((p - 2.35) / .58)) * (1 - ggSmooth(ggClamp((p - 3.28) / .68)));
  const dry = ggSmooth(ggClamp((p - 3.05) / .92));
  const hull = ggSmooth(ggClamp((p - 4.05) / .82));
  const roast = ggSmooth(ggClamp((p - 5.02) / .98));

  const peelX = peel * 245;
  const peelY = peel * 8;
  const peelR = peel * 17;
  const shellX = hull * 165;
  const shellR = hull * 11;
  const beanGap = 31 + hull * 26;
  const beanScale = 1 + roast * .07;
  const beanFill = ggMixColor('#82906a', '#4a2417', roast);
  const crease = ggMixColor('#526044', '#c57d55', roast);
  const mucilageScale = 1 - dry * .10;
  const pulpTint = ggMixColor('#dfaa55', '#dbc18c', dry);

  return <div className="ggc-2d-stage" aria-hidden="true">
    <svg viewBox="0 0 800 800" className="ggc-process-svg" role="img">
      <defs>
        <radialGradient id="ggCherry" cx="34%" cy="25%" r="78%">
          <stop offset="0" stopColor="#d65a43" />
          <stop offset=".38" stopColor="#aa3027" />
          <stop offset="1" stopColor="#681713" />
        </radialGradient>
        <radialGradient id="ggCherryDark" cx="65%" cy="28%" r="82%">
          <stop offset="0" stopColor="#c04638" />
          <stop offset=".45" stopColor="#8c211c" />
          <stop offset="1" stopColor="#53120f" />
        </radialGradient>
        <radialGradient id="ggPulp" cx="36%" cy="24%" r="76%">
          <stop offset="0" stopColor="#ffd98b" />
          <stop offset=".48" stopColor="#e9b45d" />
          <stop offset="1" stopColor="#bd7833" />
        </radialGradient>
        <linearGradient id="ggParch" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ead9ae" />
          <stop offset=".52" stopColor="#c9aa72" />
          <stop offset="1" stopColor="#9e7b4f" />
        </linearGradient>
        <linearGradient id="ggStem" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6b7f3b" /><stop offset="1" stopColor="#314321" />
        </linearGradient>
        <filter id="ggShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="28" stdDeviation="26" floodColor="#30140b" floodOpacity=".22" />
        </filter>
        <filter id="ggSoft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id="ggGrain" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" result="noise"/>
          <feColorMatrix in="noise" type="saturate" values="0" result="mono"/>
          <feComponentTransfer in="mono" result="alphaNoise"><feFuncA type="table" tableValues="0 .08"/></feComponentTransfer>
          <feBlend in="SourceGraphic" in2="alphaNoise" mode="multiply"/>
        </filter>
        <clipPath id="ggLeftClip"><rect x="112" y="110" width="288" height="570" rx="30" /></clipPath>
        <clipPath id="ggRightClip"><rect x="400" y="110" width="288" height="570" rx="30" /></clipPath>
      </defs>

      <ellipse cx="400" cy="670" rx={185 + peel * 85} ry="29" fill="#3b2016" opacity={.08 + roast * .12} filter="url(#ggSoft)" />

      <g className="ggc-organic-orbit" opacity={wash * .7}>
        <path d="M170 430 C245 292 556 270 646 416 C713 526 560 590 403 580 C240 570 106 536 170 430Z" fill="none" stroke="#fff" strokeOpacity=".36" strokeWidth="2" />
        <path d="M216 388 C320 322 518 326 588 424 C636 493 533 538 408 535 C285 532 157 500 216 388Z" fill="none" stroke="#da5d16" strokeOpacity=".32" strokeWidth="1.5" />
      </g>

      {/* final beans are always behind the outer layers, then revealed physically */}
      <g transform={`translate(400 405) scale(${beanScale})`} filter="url(#ggShadow)">
        <g transform={`translate(${-beanGap} 0) rotate(-7)`}>
          <path d="M-88 -155 C-150 -84 -150 84 -86 154 C-40 204 15 174 42 104 C70 31 69 -65 40 -130 C13 -190 -42 -204 -88 -155Z" fill={beanFill} filter="url(#ggGrain)" />
          <path d="M-14 -130 C-45 -72 -40 -15 -10 12 C18 38 13 93 -18 132" fill="none" stroke={crease} strokeWidth="9" strokeLinecap="round" opacity=".9" />
          <path d="M-82 -91 C-59 -118 -38 -126 -16 -126" fill="none" stroke="#fff" strokeOpacity={roast > .55 ? .055 : .13} strokeWidth="12" strokeLinecap="round" />
        </g>
        <g transform={`translate(${beanGap} 0) rotate(7)`}>
          <path d="M88 -155 C150 -84 150 84 86 154 C40 204 -15 174 -42 104 C-70 31 -69 -65 -40 -130 C-13 -190 42 -204 88 -155Z" fill={beanFill} filter="url(#ggGrain)" />
          <path d="M14 -130 C45 -72 40 -15 10 12 C-18 38 -13 93 18 132" fill="none" stroke={crease} strokeWidth="9" strokeLinecap="round" opacity=".9" />
          <path d="M82 -91 C59 -118 38 -126 16 -126" fill="none" stroke="#fff" strokeOpacity={roast > .55 ? .055 : .13} strokeWidth="12" strokeLinecap="round" />
        </g>
      </g>

      {/* parchment is a pair of shells that opens rather than cross-fading */}
      <g transform={`translate(${-shellX} 0) rotate(${-shellR} 400 400)`} clipPath="url(#ggLeftClip)" filter="url(#ggShadow)">
        <path d="M400 208 C282 206 220 294 220 404 C220 536 301 604 400 600 C436 537 448 283 400 208Z" fill="url(#ggParch)" />
        <path d="M350 242 C296 278 270 340 268 408" fill="none" stroke="#fff" strokeOpacity=".16" strokeWidth="15" strokeLinecap="round" />
      </g>
      <g transform={`translate(${shellX} 0) rotate(${shellR} 400 400)`} clipPath="url(#ggRightClip)" filter="url(#ggShadow)">
        <path d="M400 208 C518 206 580 294 580 404 C580 536 499 604 400 600 C364 537 352 283 400 208Z" fill="url(#ggParch)" />
        <path d="M450 242 C504 278 530 340 532 408" fill="none" stroke="#fff" strokeOpacity=".12" strokeWidth="15" strokeLinecap="round" />
      </g>

      {/* mucilage/pulp body shrinks and dries continuously */}
      <g transform={`translate(400 405) scale(${mucilageScale})`} filter="url(#ggShadow)">
        <path d="M0 -220 C-154 -220 -226 -107 -210 31 C-196 160 -111 225 0 220 C112 226 197 162 211 31 C226 -107 154 -220 0 -220Z" fill={pulpTint} opacity={1 - hull*.98} />
        <path d="M-111 -144 C-78 -181 -39 -192 -8 -191" fill="none" stroke="#fff7de" strokeOpacity=".34" strokeWidth="24" strokeLinecap="round" opacity={1-hull} />
        <path d="M-2 -204 C2 -78 -1 70 1 207" fill="none" stroke="#f7deaa" strokeOpacity=".34" strokeWidth="4" strokeDasharray="10 13" opacity={(1-hull)*.8} />
      </g>

      {/* fermentation bubbles emerge from the material */}
      <g className="ggc-ferment-bubbles" opacity={ferment}>
        {[
          [286,286,13],[521,310,9],[236,411,8],[567,436,12],[321,553,7],[480,560,10],[365,248,6],[441,250,5]
        ].map(([cx,cy,r],i)=><circle key={i} className={`ggc-bubble b${i}`} cx={cx} cy={cy} r={r} fill="#fffaf0" fillOpacity=".28" stroke="#fff" strokeOpacity=".42" strokeWidth="1" />)}
      </g>

      {/* skin halves start as one cherry, then peel off in physical space */}
      <g transform={`translate(${-peelX} ${peelY}) rotate(${-peelR} 400 400)`} clipPath="url(#ggLeftClip)" filter="url(#ggShadow)">
        <path d="M400 176 C263 173 182 278 192 411 C201 549 282 623 400 616 C445 515 455 284 400 176Z" fill="url(#ggCherry)" />
        <path d="M318 225 C270 259 245 312 240 372" fill="none" stroke="#ffd5c7" strokeOpacity=".31" strokeWidth="28" strokeLinecap="round" />
      </g>
      <g transform={`translate(${peelX} ${peelY}) rotate(${peelR} 400 400)`} clipPath="url(#ggRightClip)" filter="url(#ggShadow)">
        <path d="M400 176 C537 173 618 278 608 411 C599 549 518 623 400 616 C355 515 345 284 400 176Z" fill="url(#ggCherryDark)" />
        <path d="M480 221 C532 253 558 308 562 371" fill="none" stroke="#ffd4c8" strokeOpacity=".19" strokeWidth="25" strokeLinecap="round" />
      </g>

      {/* stem stays attached only while the fruit exists, and exits with the left peel */}
      <g transform={`translate(${-peelX*.75} 0) rotate(${-peelR*.4} 400 400)`} opacity={1 - ggClamp((p-1.1)/.55)}>
        <path d="M397 182 C398 130 418 98 449 71" fill="none" stroke="url(#ggStem)" strokeWidth="18" strokeLinecap="round" />
        <path d="M444 72 C475 63 505 71 520 90 C487 103 458 99 437 84Z" fill="#536833" />
      </g>

      {/* wash passes over the object; no scene cut */}
      <g opacity={wash} className="ggc-wash-lines">
        <path d="M126 329 C270 249 514 254 674 331" fill="none" stroke="#fff" strokeOpacity=".34" strokeWidth="11" strokeLinecap="round" />
        <path d="M102 401 C291 327 536 340 699 418" fill="none" stroke="#da5d16" strokeOpacity=".18" strokeWidth="4" strokeLinecap="round" />
        <path d="M144 477 C287 420 519 426 651 491" fill="none" stroke="#fff" strokeOpacity=".23" strokeWidth="7" strokeLinecap="round" />
      </g>

      {/* tiny GG signature only at the end */}
      <g opacity={roast}>
        <circle cx="400" cy="668" r="4" fill="#da5d16" />
        <path d="M414 668 H475" stroke="#da5d16" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  </div>;
}

function HomePage({ setTab, setShowMusic }) {
  const onNavigate = (id) => setTab(id === 'market' ? 'news' : id);
  const onMusic = () => { setShowMusic(true); setTab('news'); };
  const scrollToUniverses = () => document.getElementById('ks-universes')?.scrollIntoView({ behavior:'smooth', block:'start' });

  const tiles = [
    { id:'news',      label:'Actualités', image:'/tiles/actualites.png' },
    { id:'harvest',   label:'Origines',   image:'/tiles/origines.png' },
    { id:'science',   label:'Science',    image:'/tiles/science.png' },
    { id:'gear',      label:'Matériel',   image:'/tiles/materiel.png' },
    { id:'market',    label:'Marché',     image:'/tiles/marche.png' },
    { id:'reddit',    label:'Communauté', image:'/tiles/communaute.png' },
    { id:'instagram', label:'Instagram',  image:'/tiles/instagram.png' },
    { id:'music',     label:'Musique',    image:'/tiles/musique.png' },
    { id:'game',      label:'Jeu',        image:'/tiles/jeu.png', href:'https://kissasoko.netlify.app/hangar-torref-843/' },
  ];

  const openTile = (tile) => {
    if (tile.id === 'music') return onMusic();
    if (tile.href) return;
    onNavigate(tile.id);
  };

  return <div className="ks-home" style={{'--ks-orange':GG_ORANGE}}>
    <GGCursor />

    <header className="ks-home-nav">
      <button className="ks-logo" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} data-cursor="active" aria-label="Kissa Soko, retour en haut de page">
        <img className="ks-logo-img" src="/kissa-soko-logo.png" alt="Kissa Soko" />
      </button>
      <button className="ks-menu-button" onClick={scrollToUniverses} data-cursor="active" aria-label="Voir les univers">
        <span></span><span></span>
      </button>
    </header>

    <main>
      <section className="ks-hero">
        <div className="ks-hero-art" aria-hidden="true">
          <img className="ks-hero-botanical" src="/kissa-hero-botanical.png" alt="" />
        </div>

        <div className="ks-shell ks-hero-shell">
          <div className="ks-hero-copy">
            <p className="ks-eyebrow">LE CAFÉ<br/>SOUS TOUTES SES FORMES</p>
            <h1><span>GOOD</span><span>COFFEE</span><span>GO FURTHER</span></h1>
            <button className="ks-explore" onClick={scrollToUniverses} data-cursor="active">
              <i>→</i><span>EXPLORER</span>
            </button>
          </div>

          <nav className="ks-hero-links" aria-label="Accès rapide">
            <button onClick={()=>onNavigate('news')}>ACTUALITÉS</button>
            <button onClick={()=>onNavigate('science')}>SCIENCE</button>
            <button onClick={()=>onNavigate('harvest')}>ORIGINES</button>
            <button onClick={()=>onNavigate('gear')}>MATÉRIEL</button>
            <button onClick={()=>onNavigate('market')}>MARCHÉ</button>
            <button onClick={()=>onNavigate('reddit')}>COMMUNAUTÉ</button>
          </nav>
        </div>
      </section>

      <section className="ks-universes" id="ks-universes">
        <div className="ks-shell">
          <div className="ks-tile-grid">
            {tiles.map((tile, i) => {
              const content = <>
                <span className="ks-tile-photo" style={{backgroundImage:`url(${tile.image})`, backgroundPosition:tile.position || 'center'}} />
                <span className="ks-tile-shade" />
                <strong>{tile.label}</strong>
                <span className="ks-tile-arrow">→</span>
                <span className="ks-tile-index">{String(i+1).padStart(2,'0')}</span>
              </>;

              return tile.href ? (
                <a key={tile.id} className="ks-tile" href={tile.href} data-cursor="active" aria-label={`Ouvrir ${tile.label}`}>
                  {content}
                </a>
              ) : (
                <button key={tile.id} className="ks-tile" onClick={()=>openTile(tile)} data-cursor="active" aria-label={`Ouvrir ${tile.label}`}>
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ks-closing">
        <div className="ks-closing-art" aria-hidden="true">
          <img className="ks-closing-botanical" src="/kissa-bottom-botanical.png" alt="" />
        </div>
        <div className="ks-shell ks-closing-shell">
          <div className="ks-closing-copy">
            <p className="ks-closing-kicker">PLUS QU’UNE BOISSON</p>
            <h2>Le café comme<br/>terrain de jeu<span>.</span></h2>
            <p>Origines, science, matériel, marché, culture et création. Kissa Soko rassemble tout ce qui fait bouger le café aujourd’hui.</p>
            <button onClick={()=>onNavigate('news')} className="ks-closing-link" data-cursor="active"><i></i><span>EN SAVOIR PLUS</span><b>→</b></button>
          </div>
        </div>
      </section>
    </main>
  </div>;
}

function Tag({ topic, lang, T }) {
  const color = TOPIC_COLORS[topic] || BRAND.amber
  return (
    <div style={{ display:'flex', gap:5, alignItems:'center', flexWrap:'wrap' }}>
      <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color, background:color+'22', border:`1px solid ${color}44`, borderRadius:4, padding:'2px 8px' }}>{topic}</span>
      {lang && <span style={{ fontSize:9, textTransform:'uppercase', color:T.faint, background:T.surf3, border:`1px solid ${T.border}`, borderRadius:3, padding:'2px 6px' }}>{lang === 'fr' ? 'FR' : 'EN'}</span>}
    </div>
  )
}

function Spinner({ label, T }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'32px 0', color:T.dim, fontSize:'0.82rem' }}>
      <div style={{ width:18, height:18, border:`2px solid ${T.border2}`, borderTopColor:BRAND.yellow, borderRadius:'50%', animation:'spin 0.7s linear infinite', flexShrink:0 }} />
      {label}
    </div>
  )
}

function ErrMsg({ msg, T }) {
  return <div style={{ color:'#c07070', fontSize:'0.78rem', padding:'16px 18px', background:T.surf, border:'1px solid #c0707033', borderRadius:8 }}>{msg}</div>
}

function HeroCard({ item, T }) {
  const [h, setH] = useState(false)
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
      <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
        style={{ background:T.surf, border:`1px solid ${h ? BRAND.amber+'88' : T.border2}`, borderRadius:14, overflow:'hidden', marginBottom:12, cursor:'pointer', transition:'border-color 0.2s, box-shadow 0.2s', boxShadow: h ? `0 4px 24px ${BRAND.amber}18` : 'none' }}>
        <div style={{ height:200, backgroundImage:`url(${IMG[0]})`, backgroundSize:'cover', backgroundPosition:'center', position:'relative' }}>
          <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top, ${T.surf}f8 0%, ${T.surf}66 45%, transparent 100%)` }} />
          <div style={{ position:'absolute', top:14, left:16 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)', borderRadius:20, padding:'4px 10px 4px 8px' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:BRAND.yellow }} />
              <span style={{ fontSize:10, fontWeight:700, color:'#fff', letterSpacing:'0.08em' }}>A LA UNE</span>
            </div>
          </div>
          <div style={{ position:'absolute', bottom:14, left:18 }}><Tag topic={item.topic} lang={item.lang} T={T} /></div>
        </div>
        <div style={{ padding:'18px 20px 22px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <span style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:BRAND.amber }}>{item.source}</span>
            <span style={{ fontSize:9, color:T.faint }}>{item.date}</span>
          </div>
          <div style={{ fontFamily:'Georgia,serif', fontSize:'1.55rem', fontWeight:700, color:T.text, lineHeight:1.35, marginBottom:10 }}>{item.title}</div>
          <div style={{ fontSize:'1rem', color:T.dim, lineHeight:1.7 }}>{item.summary}</div>
          <div style={{ marginTop:14, display:'inline-flex', alignItems:'center', gap:6, color:BRAND.purple, fontSize:'0.85rem', fontWeight:700 }}>
            Lire l article <span style={{ fontSize:'1rem' }}>→</span>
          </div>
        </div>
      </div>
    </a>
  )
}

function NewsCard({ item, img, i, T }) {
  const [h, setH] = useState(false)
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
      <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
        style={{ background:T.surf, border:`1px solid ${h ? T.border2 : T.border}`, borderRadius:12, overflow:'hidden', cursor:'pointer', transform:h ? 'translateY(-3px)' : 'translateY(0)', transition:'all 0.2s', boxShadow: h ? `0 8px 24px rgba(0,0,0,0.12)` : 'none', animation:`fadeUp 0.35s ease ${i*70}ms both` }}>
        <div style={{ height:124, backgroundImage:`url(${img})`, backgroundSize:'cover', backgroundPosition:'center', position:'relative' }}>
          <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top, ${T.surf}ee 0%, transparent 55%)` }} />
          <div style={{ position:'absolute', bottom:10, left:12 }}><Tag topic={item.topic} lang={item.lang} T={T} /></div>
        </div>
        <div style={{ padding:'12px 14px 16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:BRAND.amber }}>{item.source}</span>
            <span style={{ fontSize:9, color:T.faint }}>{item.date}</span>
          </div>
          <div style={{ fontSize:'1.05rem', fontWeight:700, color:T.text, lineHeight:1.4, marginBottom:6, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.title}</div>
          <div style={{ fontSize:'0.9rem', color:T.dim, lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.summary}</div>
          <div style={{ marginTop:10, fontSize:'0.8rem', color:BRAND.purple, fontWeight:700 }}>Lire →</div>
        </div>
      </div>
    </a>
  )
}

function SciCard({ item, img, i, T }) {
  const [h, setH] = useState(false)
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
      <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
        style={{ background:T.surf, border:`1px solid ${h ? T.border2 : T.border}`, borderRadius:12, overflow:'hidden', cursor:'pointer', display:'grid', gridTemplateColumns:'90px 1fr', animation:`fadeUp 0.35s ease ${i*80}ms both`, transition:'all 0.2s', minHeight:104, boxShadow: h ? `0 4px 16px rgba(0,0,0,0.1)` : 'none' }}>
        <div style={{ backgroundImage:`url(${img})`, backgroundSize:'cover', backgroundPosition:'center', borderRight:`1px solid ${T.border}`, position:'relative' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.9rem' }}></div>
        </div>
        <div style={{ padding:'13px 15px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#7a9e78' }}>{item.field}</span>
            <span style={{ fontSize:9, color:T.faint }}>{item.date}</span>
          </div>
          <div style={{ fontSize:11, color:T.dim, marginBottom:5, fontStyle:'italic', fontWeight:500 }}>{item.journal}</div>
          <div style={{ fontSize:'1.05rem', fontWeight:700, color:T.text, lineHeight:1.38, marginBottom:6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.title}</div>
          <div style={{ fontSize:'0.92rem', color:T.dim, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.abstract}</div>
          <div style={{ marginTop:8, fontSize:'0.8rem', color:BRAND.purple, fontWeight:700 }}>Voir l article →</div>
        </div>
      </div>
    </a>
  )
}

function InstaCard({ account, i, T }) {
  const [h, setH] = useState(false)
  const catColor = CAT_COLORS[account.category] || BRAND.amber
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ background:T.surf, border:`1px solid ${h ? T.border2 : T.border}`, borderRadius:12, overflow:'hidden', animation:`fadeUp 0.35s ease ${i*60}ms both`, transition:'all 0.2s', boxShadow: h ? `0 6px 20px rgba(0,0,0,0.1)` : 'none' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:2, height:105 }}>
        {account.posts.map((p,pi) => <div key={pi} style={{ backgroundImage:`url(${p})`, backgroundSize:'cover', backgroundPosition:'center' }} />)}
      </div>
      <div style={{ padding:'14px 14px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <div style={{ width:40, height:40, borderRadius:'50%', backgroundImage:`url(${account.avatar})`, backgroundSize:'cover', backgroundPosition:'center', border:`2px solid ${catColor}`, flexShrink:0 }} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:'1rem', fontWeight:700, color:T.text }}>@{account.handle}</div>
            <div style={{ fontSize:9, color:T.faint, marginTop:1 }}>{account.location}</div>
          </div>

        </div>
        <div style={{ fontSize:'0.9rem', color:T.dim, lineHeight:1.6, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{account.bio}</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:catColor, background:catColor+'22', border:`1px solid ${catColor}44`, borderRadius:4, padding:'3px 9px' }}>{account.category}</span>
          <a href={account.url} target="_blank" rel="noopener noreferrer"
            style={{ background:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', color:'#fff', fontSize:'0.68rem', fontWeight:700, padding:'6px 13px', borderRadius:7, textDecoration:'none' }}>
            Voir le profil →
          </a>
        </div>
      </div>
    </div>
  )
}

function RedditCard({ post, i, T }) {
  const [h, setH] = useState(false)

  // Community article (Sprudge) — displayed inline, full text, no link needed
  const isSprudge = post.source === 'The Sprudge Report'

  const card = (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        background:T.surf, border:`1px solid ${h ? BRAND.amber+'66' : T.border}`,
        borderRadius:12, overflow:'hidden',
        cursor: isSprudge ? 'default' : 'pointer',
        transition:'all 0.18s', animation:`fadeUp 0.3s ease ${i*55}ms both`,
        transform: (!isSprudge && h) ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: (!isSprudge && h) ? `0 8px 24px rgba(0,0,0,0.15)` : 'none',
        display:'flex', flexDirection:'column',
      }}>
      {/* Image */}
      {post.img && (
        <div style={{
          height:160, flexShrink:0,
          backgroundImage:`url(${post.img})`,
          backgroundSize:'cover', backgroundPosition:'center',
          position:'relative',
        }}>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)' }} />
        </div>
      )}
      <div style={{ padding:'16px 18px 18px', flex:1, display:'flex', flexDirection:'column', gap:8 }}>
        {/* Date only — no source badge */}
        {post.date && (
          <div style={{ fontSize:10, color:T.faint, letterSpacing:'0.05em' }}>{post.date}</div>
        )}
        {/* Title */}
        <div style={{ fontSize:'0.95rem', fontWeight:700, color:T.text, lineHeight:1.4 }}>
          {post.title}
        </div>
        {/* Full text */}
        {post.summary && (
          <div style={{ fontSize:'0.82rem', color:T.dim, lineHeight:1.7, flex:1 }}>
            {post.summary}
          </div>
        )}
        {/* Lire plus only for non-Sprudge (external links) */}
        {!isSprudge && post.url && (
          <a href={post.url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize:'0.72rem', fontWeight:700, color:BRAND.amber, textDecoration:'none', marginTop:4, alignSelf:'flex-end' }}>
            Lire plus →
          </a>
        )}
      </div>
    </div>
  )

  return isSprudge
    ? card
    : <a href={post.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>{card}</a>
}


function GearHeroCard({ item, T }) {
  const [h, setH] = useState(false)
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
      <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
        style={{ background:T.surf, border:`1px solid ${h?BRAND.amber+'88':T.border2}`, borderRadius:14, overflow:'hidden', marginBottom:12, cursor:'pointer', transition:'all 0.2s', boxShadow:h?`0 4px 24px ${BRAND.amber}18`:'none' }}>
        <div style={{ height:220, backgroundImage:`url(${item.img})`, backgroundSize:'cover', backgroundPosition:'center', position:'relative' }}>
          <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top, ${T.surf}f0 0%, ${T.surf}44 50%, transparent 100%)` }} />
          <div style={{ position:'absolute', top:14, left:16, display:'flex', gap:8, alignItems:'center' }}>
            {item.hot && <span style={{ fontSize:'1.1rem' }}>🔥</span>}
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', background:T.surf+'cc', backdropFilter:'blur(8px)', color:BRAND.amber, border:`1px solid ${BRAND.amber}44`, borderRadius:5, padding:'3px 9px' }}>{item.category}</span>
          </div>
          <div style={{ position:'absolute', bottom:16, left:18, right:18 }}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:BRAND.amber, marginBottom:6 }}>{item.brand}</div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'1.25rem', fontWeight:700, color:'#fff', lineHeight:1.3, textShadow:'0 1px 8px rgba(0,0,0,0.6)' }}>{item.name}</div>
          </div>
        </div>
        <div style={{ padding:'16px 18px 20px' }}>
          <div style={{ fontSize:'0.9rem', color:T.dim, lineHeight:1.7, marginBottom:12, display:'-webkit-box', WebkitLineClamp:5, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.description || item.summary}</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            {item.price && <span style={{ fontSize:'1rem', fontWeight:700, color:BRAND.yellow }}>{item.price}</span>}
            {item.source && <span style={{ fontSize:'0.7rem', color:T.faint }}>{item.source} · {item.date}</span>}
            <span style={{ fontSize:'0.72rem', color:BRAND.purple, fontWeight:600 }}>Voir →</span>
          </div>
        </div>
      </div>
    </a>
  )
}

function GearCard({ item, i, T }) {
  const [h, setH] = useState(false)
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
      <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
        style={{ background:T.surf, border:`1px solid ${h?T.border2:T.border}`, borderRadius:12, overflow:'hidden', cursor:'pointer', transform:h?'translateY(-3px)':'translateY(0)', transition:'all 0.2s', boxShadow:h?`0 8px 24px rgba(0,0,0,0.12)`:'none', animation:`fadeUp 0.35s ease ${i*60}ms both` }}>
        <div style={{ height:160, backgroundImage:`url(${item.img})`, backgroundSize:'cover', backgroundPosition:'center', position:'relative' }}>
          <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top, ${T.surf}ee 0%, transparent 50%)` }} />
          <div style={{ position:'absolute', top:10, left:12, display:'flex', gap:6, alignItems:'center' }}>
            {item.hot && <span style={{ fontSize:'1rem' }}>🔥</span>}
          </div>
          <div style={{ position:'absolute', bottom:10, left:12 }}>
            <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:BRAND.amber, background:T.surf+'dd', borderRadius:4, padding:'2px 7px' }}>{item.category}</span>
          </div>
        </div>
        <div style={{ padding:'13px 15px 16px' }}>
          <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:BRAND.amber, marginBottom:5 }}>{item.brand}</div>
          <div style={{ fontSize:'0.95rem', fontWeight:700, color:T.text, lineHeight:1.35, marginBottom:7, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.name}</div>
          <div style={{ fontSize:'0.78rem', color:T.dim, lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.description || item.summary}</div>
          <div style={{ marginTop:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            {item.price && <span style={{ fontSize:'0.88rem', fontWeight:700, color:BRAND.yellow }}>{item.price}</span>}
            {item.source && !item.price && <span style={{ fontSize:'0.68rem', color:T.faint }}>{item.source}</span>}
            <span style={{ fontSize:'0.7rem', color:BRAND.purple, fontWeight:600 }}>Voir →</span>
          </div>
        </div>
      </div>
    </a>
  )
}

function MiniPlayer({ open, setOpen, trackIdx, setTrackIdx, T }) {
  const track = TRACKS[trackIdx]
  const prev = () => setTrackIdx(i => (i - 1 + TRACKS.length) % TRACKS.length)
  const next = () => setTrackIdx(i => (i + 1) % TRACKS.length)

  return (
    <div style={{
      position:'fixed', bottom:0, left:0, right:0, zIndex:99999,
      background: T.surf,
      borderTop:`2px solid ${BRAND.amber}`,
      display:'flex', alignItems:'center',
      padding:'0 20px',
      height: open ? 56 : 38,
      transition:'height 0.2s',
      boxShadow:'0 -4px 24px rgba(0,0,0,0.5)',
      transform:'translateZ(0)',
    }}>
      {/* Logo Suno + titre */}
      <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
        <div style={{
          width:28, height:28, borderRadius:6, flexShrink:0,
          background:`linear-gradient(135deg, ${BRAND.purple}, ${BRAND.orange})`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'0.8rem', fontWeight:700, color:'#fff',
        }}>♪</div>
        {open && (
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:'0.72rem', color:T.text, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              GaufreGentille · Track {trackIdx + 1}/{TRACKS.length}
            </div>
            <div style={{ fontSize:'0.62rem', color:T.faint }}>Kissa Soko playlist · Suno</div>
          </div>
        )}
        {!open && (
          <span style={{ fontSize:'0.7rem', color:T.dim }}>GaufreGentille · {trackIdx + 1}/{TRACKS.length}</span>
        )}
      </div>

      {/* Controls */}
      {open && (
        <div style={{ display:'flex', alignItems:'center', gap:8, marginRight:16 }}>
          <button onClick={prev} style={{ background:'none', border:'none', color:T.dim, fontSize:'1rem', cursor:'pointer', padding:'4px 6px' }}>⏮</button>
          <a href={track.url} target="_blank" rel="noopener noreferrer"
            style={{ background:BRAND.amber, color:'#000', fontSize:'0.72rem', fontWeight:700, padding:'6px 14px', borderRadius:20, textDecoration:'none', display:'flex', alignItems:'center', gap:5 }}>
            ▶ Ecouter sur Suno
          </a>
          <button onClick={next} style={{ background:'none', border:'none', color:T.dim, fontSize:'1rem', cursor:'pointer', padding:'4px 6px' }}>⏭</button>
        </div>
      )}

      {/* Track dots */}
      {open && (
        <div style={{ display:'flex', gap:4, marginRight:16, flexWrap:'wrap', maxWidth:120 }}>
          {TRACKS.map((_, i) => (
            <div key={i} onClick={() => setTrackIdx(i)} style={{
              width:6, height:6, borderRadius:'50%', cursor:'pointer',
              background: i === trackIdx ? BRAND.amber : T.faint,
              transition:'background 0.15s',
            }} />
          ))}
        </div>
      )}

      {/* Toggle */}
      <button onClick={() => setOpen(o => !o)} style={{
        background:'none', border:`1px solid ${T.border2}`,
        color:T.dim, fontSize:'0.65rem', fontWeight:600,
        padding:'4px 10px', borderRadius:6, cursor:'pointer',
        fontFamily:'inherit', letterSpacing:'0.05em',
        flexShrink:0,
      }}>
        {open ? '▼ Reduire' : '♪ Musique'}
      </button>
    </div>
  )
}

export default function App() {
  const [tab, setTab]         = useState('home')
  const [dark, setDark]       = useState(true)
  const [news, setNews]       = useState([])
  const [sci, setSci]         = useState([])
  const [reddit, setReddit]   = useState([])
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [mktTime, setMktTime] = useState('--')
  const [error, setError]     = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [instaFilter, setInstaFilter] = useState('Tous')
  const [community, setCommunity]     = useState([])
  const [commLoading, setCommLoading] = useState(false)
  const [gearItems, setGearItems]     = useState([])
  const [gearLoading, setGearLoading] = useState(false)
  const [sciItems, setSciItems]         = useState([])
  const [sciLoading, setSciLoading]     = useState(false)
  const [showMusic, setShowMusic]       = useState(false)
  const [gear, setGear]         = useState([])
  const [harvestData, setHarvestData] = useState(null)
  const [harvestLoading, setHarvestLoading] = useState(false)

  const T = dark ? DARK : LIGHT

  const today = new Date()
  const DAYS   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
  const MONTHS = ['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre']
  const dateStr = `${DAYS[today.getDay()]} ${today.getDate()} ${MONTHS[today.getMonth()]} ${today.getFullYear()}`

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [contentRes, mktRes] = await Promise.all([
        fetch('/.netlify/functions/get-news'),
        fetch('/.netlify/functions/get-markets'),
      ])
      const content = await contentRes.json()
      const mkt     = await mktRes.json()
      if (content.news)    setNews(content.news)
      if (content.science) setSci(content.science)
      if (content.community) setReddit(content.community)
      else if (content.reddit)  setReddit(content.reddit)
      if (content.gear)    setGear(content.gear)
      if (mkt.markets)     setMarkets(mkt.markets)
      if (mkt.updatedAt)   setMktTime(mkt.updatedAt)
      setLastRefresh(new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}))
    } catch(e) {
      setError('Erreur de chargement. Verifie ta connexion.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const fetchCommunity = useCallback(async () => {
    setCommLoading(true)
    try {
      const res  = await fetch('/.netlify/functions/get-sprudge')
      const data = await res.json()
      if (data.tiles && data.tiles.length > 0) {
        setCommunity(data.tiles)
      }
    } catch(e) {
      console.error('Community fetch error:', e)
    }
    setCommLoading(false)
  }, [])

  useEffect(() => { fetchCommunity() }, [fetchCommunity])

  const fetchGear = useCallback(async () => {
    setGearLoading(true)
    try {
      const res  = await fetch('/.netlify/functions/get-gear')
      const data = await res.json()
      if (data.gear && data.gear.length > 0) setGearItems(data.gear)
    } catch(e) { console.error('Gear fetch error:', e) }
    setGearLoading(false)
  }, [])
  useEffect(() => { fetchGear() }, [fetchGear])

  const fetchScience = useCallback(async () => {
    setSciLoading(true)
    try {
      const res  = await fetch('/.netlify/functions/get-science')
      const data = await res.json()
      if (data.science && data.science.length > 0) setSciItems(data.science)
    } catch(e) { console.error('Science fetch error:', e) }
    setSciLoading(false)
  }, [])
  useEffect(() => { fetchScience() }, [fetchScience])
  
  const fetchHarvest = useCallback(async () => {
    setHarvestLoading(true)
    try {
      const res  = await fetch('/.netlify/functions/get-harvest')
      const data = await res.json()
      if (data.origins) setHarvestData(data)
    } catch(e) { console.error('Harvest fetch error:', e) }
    setHarvestLoading(false)
  }, [])
  useEffect(() => { fetchHarvest() }, [fetchHarvest])

  return (
    <div style={{ background:T.bg, minHeight:'100vh', color:T.text, fontFamily:"DM Sans,Inter,-apple-system,system-ui,sans-serif", fontWeight:500, fontSize:17, transition:'background 0.3s, color 0.3s', position:'relative', backgroundImage:`radial-gradient(circle at 15% -10%, ${BRAND.orange}0c, transparent 28%), radial-gradient(circle at 95% 8%, ${BRAND.purple}0b, transparent 24%)` }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,700;0,800;1,700;1,800&family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes beanFloat{0%,100%{translate:0 0}50%{translate:0 -13px}}
        @keyframes sceneFloat{0%,100%{transform:translate(-50%,-50%) rotateX(2deg) rotateY(-8deg)}50%{transform:translate(-50%,calc(-50% - 7px)) rotateX(-2deg) rotateY(-5deg)}}
        @keyframes pulseDot{0%,100%{box-shadow:0 0 0 0 ${BRAND.yellow}00}50%{box-shadow:0 0 0 7px ${BRAND.yellow}12}}
        *{box-sizing:border-box;margin:0;padding:0;} html{scroll-behavior:smooth} body{margin:0} button{font:inherit} a{color:inherit;}
        ::selection{background:${BRAND.yellow};color:#16110b} ::-webkit-scrollbar{width:7px;height:7px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:${T.border2};border-radius:99px;}
        .gg-home{max-width:1180px;margin:0 auto;padding:34px 22px 110px;animation:fadeUp .45s ease both}
        .gg-home-hero{min-height:520px;border:1px solid ${T.border};border-radius:32px;display:grid;grid-template-columns:1.06fr .94fr;overflow:hidden;position:relative;background:linear-gradient(135deg,${T.surf} 0%,${T.surf2} 58%,${BRAND.purple}12 100%);box-shadow:0 28px 80px rgba(0,0,0,${dark?'.28':'.08'});isolation:isolate}
        .gg-home-hero:before{content:'';position:absolute;width:420px;height:420px;border-radius:50%;background:${BRAND.yellow}10;filter:blur(70px);left:-170px;bottom:-250px;z-index:-1}
        .gg-home-copy{padding:64px 58px;display:flex;flex-direction:column;justify-content:center;position:relative;z-index:2}
        .gg-kicker{font-size:10px;font-weight:800;letter-spacing:.19em;color:${T.dim};display:flex;align-items:center;gap:9px;margin-bottom:24px}
        .gg-live-dot{width:8px;height:8px;border-radius:50%;background:${BRAND.yellow};box-shadow:0 0 20px ${BRAND.yellow};animation:pulseDot 2s ease-in-out infinite}
        .gg-hello{font-size:14px;color:${BRAND.amber};font-weight:700;margin-bottom:8px}
        .gg-home-copy h1{font-family:Manrope,Inter,sans-serif;font-size:clamp(42px,5.2vw,72px);line-height:.98;letter-spacing:-.06em;font-weight:800;color:${T.text};max-width:650px}
        .gg-home-copy h1 span{color:${T.dim};font-weight:600}
        .gg-home-copy>p{font-size:16px;line-height:1.75;color:${T.dim};max-width:590px;margin-top:24px;font-weight:450}
        .gg-home-actions{display:flex;gap:11px;flex-wrap:wrap;margin-top:30px}
        .gg-primary,.gg-secondary{border-radius:13px;padding:12px 17px;cursor:pointer;transition:.22s ease;border:1px solid transparent;font-weight:750;font-size:13px}
        .gg-primary{background:${BRAND.yellow};color:#17130c;box-shadow:0 9px 28px ${BRAND.yellow}1f}.gg-primary:hover{transform:translateY(-2px);box-shadow:0 14px 36px ${BRAND.yellow}30}.gg-primary b{margin-left:8px}
        .gg-secondary{background:${T.surf3};color:${T.text};border-color:${T.border2}}.gg-secondary:hover{border-color:${BRAND.purple}80;transform:translateY(-2px)}
        .gg-home-meta{display:flex;align-items:center;gap:10px;color:${T.faint};font-size:10px;margin-top:27px;text-transform:uppercase;letter-spacing:.08em}.gg-home-meta i{width:3px;height:3px;border-radius:50%;background:${T.faint}}
        .gg-scene{position:relative;min-height:520px;perspective:1000px;overflow:hidden;background:radial-gradient(circle at 55% 48%,${BRAND.amber}16,transparent 34%),linear-gradient(145deg,transparent 12%,${BRAND.purple}0c)}
        .gg-glow{position:absolute;border-radius:50%;filter:blur(12px)}.gg-glow-a{width:240px;height:240px;right:12%;top:18%;background:${BRAND.yellow}12}.gg-glow-b{width:280px;height:280px;left:8%;bottom:-10%;background:${BRAND.purple}18}
        .gg-orbit{position:absolute;left:50%;top:47%;border:1px solid ${T.border2};border-radius:50%;transform-style:preserve-3d}.gg-orbit-one{width:390px;height:390px;margin:-195px;transform:rotateX(66deg) rotateZ(-24deg)}.gg-orbit-two{width:300px;height:300px;margin:-150px;border-color:${BRAND.yellow}22;transform:rotateX(66deg) rotateZ(42deg)}
        .gg-cup-wrap{position:absolute;left:50%;top:52%;width:260px;height:270px;transform:translate(-50%,-50%) rotateX(2deg) rotateY(-8deg);transform-style:preserve-3d;animation:sceneFloat 5.5s ease-in-out infinite}
        .gg-cup{position:absolute;left:33px;top:48px;width:178px;height:150px;border-radius:18px 18px 76px 76px;background:linear-gradient(100deg,#f4f1eb 0%,#fff 35%,#d8d5d1 78%,#b8b5b2 100%);box-shadow:inset -12px -12px 28px rgba(0,0,0,.12),0 28px 48px rgba(0,0,0,.28);z-index:3}
        .gg-cup-rim{position:absolute;left:-1px;top:-19px;width:180px;height:48px;border-radius:50%;background:linear-gradient(180deg,#fff,#d9d7d3);box-shadow:0 6px 10px rgba(0,0,0,.2);display:grid;place-items:center}.gg-coffee{width:151px;height:33px;border-radius:50%;background:radial-gradient(circle at 48% 35%,#7d4b2c 0%,#4b2617 45%,#1f0f0b 100%);box-shadow:inset 0 4px 10px #a46a3d55;position:relative;overflow:hidden}.gg-coffee i{position:absolute;width:60px;height:8px;border:1px solid #d9c6a055;border-radius:50%;filter:blur(.2px)}.gg-coffee i:nth-child(1){left:26px;top:7px;transform:rotate(7deg)}.gg-coffee i:nth-child(2){right:18px;bottom:7px;transform:rotate(-11deg)}.gg-coffee i:nth-child(3){left:64px;top:16px;width:32px}
        .gg-cup-mark{position:absolute;left:63px;top:65px;color:${BRAND.orange};font-family:Manrope,sans-serif;font-size:28px;font-weight:800;letter-spacing:-.08em;transform:rotate(-2deg)}
        .gg-cup-handle{position:absolute;right:2px;top:83px;width:80px;height:82px;border:19px solid #dedbd6;border-left-width:12px;border-radius:48%;transform:rotate(-8deg);box-shadow:12px 8px 20px rgba(0,0,0,.14);z-index:1}.gg-saucer{position:absolute;left:10px;bottom:22px;width:230px;height:54px;border-radius:50%;background:linear-gradient(180deg,#f9f7f3,#c7c4bf);box-shadow:0 30px 40px rgba(0,0,0,.28);z-index:0}.gg-cup-shadow{position:absolute;left:50%;top:73%;width:250px;height:55px;transform:translateX(-50%);border-radius:50%;background:rgba(0,0,0,.28);filter:blur(18px)}
        .gg-bean{position:absolute;width:64px;height:45px;border-radius:58% 42% 58% 42% / 60% 40% 60% 40%;box-shadow:inset 8px 8px 14px rgba(255,255,255,.09),inset -8px -9px 12px rgba(0,0,0,.24),0 16px 26px rgba(0,0,0,.24);z-index:5;animation:beanFloat 4s ease-in-out infinite}.gg-bean span{position:absolute;left:31px;top:4px;width:5px;height:37px;border-radius:50%;background:#2b160f66;transform:rotate(8deg)}
        .gg-float-card{position:absolute;z-index:6;padding:9px 12px;border-radius:12px;background:${T.surf}cc;border:1px solid ${T.border2};backdrop-filter:blur(14px);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;box-shadow:0 12px 36px rgba(0,0,0,.16)}.gg-float-card-a{right:6%;top:31%;transform:rotate(4deg)}.gg-float-card-b{left:7%;bottom:18%;transform:rotate(-5deg);color:${T.dim}}
        .gg-stat-row{margin:15px 0 34px;display:grid;grid-template-columns:repeat(4,1fr) minmax(220px,1.45fr);gap:10px}.gg-stat,.gg-music-quick{background:${T.surf};border:1px solid ${T.border};border-radius:16px;min-height:78px}.gg-stat{padding:15px 18px;display:flex;flex-direction:column;justify-content:center}.gg-stat strong{font:800 20px/1 Manrope,sans-serif;color:${T.text}}.gg-stat span{font-size:9px;text-transform:uppercase;letter-spacing:.14em;color:${T.faint};margin-top:7px}.gg-music-quick{display:flex;align-items:center;gap:13px;padding:0 18px;color:${T.text};cursor:pointer;text-align:left;transition:.2s}.gg-music-quick:hover{border-color:${BRAND.purple}77;transform:translateY(-2px)}.gg-music-quick>span{width:38px;height:38px;border-radius:11px;background:linear-gradient(145deg,${BRAND.purple},${BRAND.orange});display:grid;place-items:center;color:white;font-size:18px;box-shadow:0 8px 20px ${BRAND.purple}24}.gg-music-quick b{display:block;font-size:12px}.gg-music-quick small{color:${T.faint};font-size:9px;display:block;margin-top:2px}
        .gg-home-grid{display:grid;grid-template-columns:1.45fr .75fr;gap:16px;margin-bottom:52px}.gg-today-card,.gg-market-card{background:${T.surf};border:1px solid ${T.border};border-radius:24px;padding:18px;overflow:hidden}.gg-section-label{display:flex;align-items:center;justify-content:space-between;margin-bottom:15px}.gg-section-label>span{font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:${T.dim};font-weight:800}.gg-section-label button{border:0;background:none;color:${T.faint};font-size:10px;cursor:pointer}.gg-section-label em{font-style:normal;font-size:8px;text-transform:uppercase;color:#7cb87c;background:#7cb87c18;border:1px solid #7cb87c35;border-radius:99px;padding:4px 7px;letter-spacing:.1em}.gg-top-story{text-decoration:none;display:grid;grid-template-columns:1.28fr .72fr;gap:18px;align-items:center}.gg-story-img{height:210px;border-radius:17px;background-size:cover;background-position:center;position:relative;overflow:hidden;transition:.25s}.gg-top-story:hover .gg-story-img{transform:scale(1.008)}.gg-story-img>div{position:absolute;left:18px;right:18px;bottom:17px}.gg-story-img small{display:block;color:${BRAND.yellow};font-size:9px;text-transform:uppercase;letter-spacing:.14em;font-weight:800;margin-bottom:7px}.gg-story-img strong{display:block;color:#fff;font:700 20px/1.16 Manrope,sans-serif;letter-spacing:-.025em}.gg-top-story>p{font-size:12px;line-height:1.7;color:${T.dim};display:-webkit-box;-webkit-line-clamp:7;-webkit-box-orient:vertical;overflow:hidden}.gg-skeleton-home{height:210px;border-radius:17px;background:linear-gradient(90deg,${T.surf2},${T.surf3},${T.surf2});display:grid;place-items:center;color:${T.faint};font-size:12px}.gg-market-list{display:flex;flex-direction:column}.gg-market-line{display:grid;grid-template-columns:1fr auto;gap:3px 8px;padding:15px 2px;border-top:1px solid ${T.border};align-items:center}.gg-market-line:first-child{border-top:0}.gg-market-line>span{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:${T.faint};font-weight:700}.gg-market-line>b{font:750 17px Manrope,sans-serif;color:${T.text}}.gg-market-line b small{font:500 8px DM Sans,sans-serif;color:${T.faint};margin-left:4px}.gg-market-line>em{grid-column:2;font-size:9px;font-style:normal;text-align:right}.gg-market-line>.up{color:#7cb87c}.gg-market-line>.down{color:#c07070}
        .gg-heading-row{display:flex;justify-content:space-between;gap:30px;align-items:end;margin-bottom:20px}.gg-heading-row small{font-size:9px;letter-spacing:.2em;color:${BRAND.orange};font-weight:800}.gg-heading-row h2{font:800 clamp(26px,3vw,38px)/1.05 Manrope,sans-serif;letter-spacing:-.04em;margin-top:6px}.gg-heading-row>p{font-size:11px;line-height:1.65;color:${T.faint};max-width:350px}.gg-module-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:13px}.gg-module{--accent:${BRAND.amber};text-align:left;min-height:225px;padding:19px;border-radius:21px;border:1px solid ${T.border};background:linear-gradient(155deg,${T.surf},${T.surf2});color:${T.text};cursor:pointer;transition:.25s;position:relative;overflow:hidden}.gg-module:after{content:'';position:absolute;width:150px;height:150px;right:-75px;bottom:-85px;border-radius:50%;background:var(--accent);filter:blur(45px);opacity:.09;transition:.25s}.gg-module:hover{transform:translateY(-5px);border-color:var(--accent);box-shadow:0 18px 44px rgba(0,0,0,${dark?'.20':'.08'})}.gg-module:hover:after{opacity:.2}.gg-module-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}.gg-module-top>span{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:${T.surf3};border:1px solid ${T.border2};color:var(--accent);font-size:18px}.gg-module-top i{font-style:normal;color:${T.faint};font-size:9px;letter-spacing:.12em}.gg-module>small{font-size:8px;text-transform:uppercase;letter-spacing:.14em;color:var(--accent);font-weight:800}.gg-module h3{font:800 20px Manrope,sans-serif;letter-spacing:-.03em;margin-top:5px}.gg-module p{font-size:10px;line-height:1.6;color:${T.faint};margin-top:8px;max-width:270px}.gg-module>b{position:absolute;left:19px;bottom:18px;font-size:9px;text-transform:uppercase;letter-spacing:.1em}.gg-module>b span{color:var(--accent);margin-left:4px}
        @media(max-width:900px){.gg-home-hero{grid-template-columns:1fr}.gg-home-copy{padding:46px 34px 20px}.gg-scene{min-height:390px}.gg-home-grid{grid-template-columns:1fr}.gg-stat-row{grid-template-columns:repeat(2,1fr)}.gg-music-quick{grid-column:1/-1}.gg-module-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:620px){.gg-home{padding:18px 12px 90px}.gg-home-hero{border-radius:24px}.gg-home-copy{padding:35px 23px 5px}.gg-home-copy h1{font-size:43px}.gg-home-copy>p{font-size:14px}.gg-scene{min-height:340px}.gg-cup-wrap{animation:none;transform:translate(-50%,-50%) scale(.78)}.gg-orbit-one{width:320px;height:320px;margin:-160px}.gg-orbit-two{width:240px;height:240px;margin:-120px}.gg-stat-row{margin-top:10px}.gg-stat{min-height:68px;padding:12px}.gg-top-story{grid-template-columns:1fr}.gg-top-story>p{display:none}.gg-heading-row{display:block}.gg-heading-row>p{margin-top:10px}.gg-module-grid{grid-template-columns:1fr}.gg-module{min-height:205px}.gg-float-card{display:none}}


.ggc-page{min-height:100vh;font-family:'DM Sans',system-ui,sans-serif;transition:background-color .12s linear,color .28s ease;overflow:clip;position:relative;cursor:none}
.ggc-page *{box-sizing:border-box}
.ggc-page button,.ggc-page a{font:inherit;color:inherit}
.ggc-nav{position:fixed;z-index:80;left:0;right:0;top:0;height:78px;padding:0 clamp(22px,4vw,64px);display:flex;align-items:center;justify-content:space-between;mix-blend-mode:normal;transition:color .25s}
.ggc-logo{border:0;background:transparent;color:var(--ggc-orange);font-family:Manrope,sans-serif;font-size:26px;line-height:1;font-weight:800;letter-spacing:-.08em;cursor:none;padding:8px 0}
.ggc-nav nav{display:flex;align-items:center;gap:clamp(12px,2.1vw,32px)}
.ggc-nav nav button{border:0;background:transparent;font-size:11px;font-weight:700;cursor:none;opacity:.68;transition:opacity .2s,color .2s;letter-spacing:.01em}
.ggc-nav nav button:hover{opacity:1;color:var(--ggc-orange)}

.ggc-cursor{position:fixed;z-index:9999;left:0;top:0;width:38px;height:38px;border-radius:50%;pointer-events:none;background:rgba(218,93,22,.15);border:1px solid rgba(218,93,22,.42);backdrop-filter:blur(2px);transition:width .22s,height .22s,background .22s,border-color .22s;will-change:transform}
.ggc-cursor.is-active{width:64px;height:64px;background:rgba(218,93,22,.12);border-color:rgba(218,93,22,.72)}
.ggc-cursor-dot{position:fixed;z-index:10000;left:0;top:0;width:4px;height:4px;border-radius:50%;background:var(--ggc-orange);pointer-events:none;will-change:transform}

.ggc-journey{height:720vh;position:relative}
.ggc-sticky{position:sticky;top:0;height:100vh;min-height:620px;display:grid;place-items:center;overflow:hidden;isolation:isolate}
.ggc-ambient{position:absolute;border-radius:50%;filter:blur(60px);pointer-events:none;opacity:.42;transition:opacity .35s}
.ggc-ambient-a{width:46vw;height:46vw;max-width:720px;max-height:720px;left:-18vw;top:13vh;background:rgba(218,93,22,.17)}
.ggc-ambient-b{width:34vw;height:34vw;max-width:540px;max-height:540px;right:-10vw;bottom:1vh;background:rgba(160,109,208,.08)}
.ggc-page.is-dark .ggc-ambient-a{opacity:.22}.ggc-page.is-dark .ggc-ambient-b{opacity:.15}

.ggc-object{width:min(62vw,700px);aspect-ratio:1;position:relative;z-index:4;will-change:transform;transition:transform .08s linear}
.ggc-object svg{width:100%;height:100%;overflow:visible;display:block}
.ggc-bubble{animation:ggcBubble 2.6s ease-in-out infinite;transform-origin:center}
.ggc-water{animation:ggcWater 2.4s ease-in-out infinite alternate}.ggc-water-2{animation-delay:-1.1s}
@keyframes ggcBubble{0%,100%{transform:translateY(0);opacity:.35}50%{transform:translateY(-16px);opacity:.8}}
@keyframes ggcWater{from{transform:translateX(-12px)}to{transform:translateX(12px)}}

.ggc-stage-copy{position:absolute;z-index:8;left:clamp(24px,6vw,92px);top:50%;transform:translateY(-50%);width:min(28vw,360px);pointer-events:none}
.ggc-step{font-size:9px;letter-spacing:.21em;font-weight:800;color:var(--ggc-orange);margin-bottom:18px}
.ggc-stage-copy h1{font-family:Manrope,sans-serif;font-weight:700;letter-spacing:-.06em;font-size:clamp(42px,6vw,92px);line-height:.88;margin:0}
.ggc-stage-copy p{font-size:13px;line-height:1.55;color:var(--ggc-soft);max-width:270px;margin:20px 0 0}

.ggc-progress{position:absolute;z-index:8;right:clamp(24px,5vw,76px);top:50%;transform:translateY(-50%);display:grid;grid-template-columns:2px auto;gap:0 16px;align-items:start;pointer-events:none}
.ggc-progress-track{grid-row:1 / span 7;width:2px;height:184px;background:currentColor;opacity:.16;border-radius:999px;position:relative;margin-top:4px}
.ggc-progress-track i{position:absolute;left:0;top:0;width:100%;background:var(--ggc-orange);border-radius:999px;transition:height .08s linear}
.ggc-progress>span{display:block;font-size:8px;letter-spacing:.15em;text-transform:uppercase;color:var(--ggc-soft);height:26px;transition:.2s;white-space:nowrap}
.ggc-progress>span.active{color:currentColor;font-weight:800;transform:translateX(4px)}
.ggc-scroll-hint{position:absolute;z-index:8;bottom:31px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:10px;font-size:9px;text-transform:uppercase;letter-spacing:.18em;color:var(--ggc-soft);transition:opacity .3s,transform .3s}.ggc-scroll-hint span{color:var(--ggc-orange);font-size:15px}.ggc-scroll-hint.hide{opacity:0;transform:translate(-50%,8px)}
.ggc-stage-number{position:absolute;right:2.5vw;bottom:-2vw;font-family:Manrope,sans-serif;font-size:clamp(110px,20vw,330px);font-weight:800;letter-spacing:-.1em;color:currentColor;opacity:.025;line-height:.75;pointer-events:none}

.ggc-universes{position:relative;z-index:10;min-height:100vh;background:#180d0a;color:#f5ece5;padding:clamp(100px,12vw,180px) clamp(22px,5vw,78px) 58px;border-top:1px solid rgba(255,255,255,.08)}
.ggc-universe-head{display:flex;align-items:end;justify-content:space-between;gap:30px;margin-bottom:72px}.ggc-universe-head>span{color:var(--ggc-orange);font:800 18px Manrope,sans-serif;letter-spacing:-.06em}.ggc-universe-head h2{font:600 clamp(38px,6vw,86px)/.95 Manrope,sans-serif;letter-spacing:-.055em;margin:0;text-align:right}
.ggc-category-grid{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid rgba(255,255,255,.12);border-left:1px solid rgba(255,255,255,.12)}
.ggc-category{position:relative;min-height:190px;padding:24px;border:0;border-right:1px solid rgba(255,255,255,.12);border-bottom:1px solid rgba(255,255,255,.12);background:transparent;color:#f5ece5;text-align:left;cursor:none;transition:background .25s,color .25s;overflow:hidden}
.ggc-category:before{content:'';position:absolute;inset:auto -30% -80% 30%;height:150%;background:radial-gradient(circle,rgba(218,93,22,.24),transparent 64%);opacity:0;transition:opacity .25s}
.ggc-category:hover{background:rgba(255,255,255,.035)}.ggc-category:hover:before{opacity:1}
.ggc-category-icon{width:38px;height:38px;display:grid;place-items:center;color:var(--ggc-orange)}.ggc-category-icon svg{width:25px;height:25px}
.ggc-category strong{position:absolute;left:24px;bottom:24px;font:600 17px Manrope,sans-serif;letter-spacing:-.025em}.ggc-arrow{position:absolute;right:22px;top:22px;color:rgba(255,255,255,.4);transition:transform .25s,color .25s}.ggc-category:hover .ggc-arrow{transform:translate(3px,-3px);color:var(--ggc-orange)}
.ggc-footer-line{display:flex;align-items:center;gap:16px;margin-top:72px;font-size:9px;text-transform:uppercase;letter-spacing:.18em;color:rgba(255,255,255,.4)}.ggc-footer-line i{height:1px;background:rgba(255,255,255,.13);flex:1}

@media(max-width:900px){
  .ggc-nav nav{display:none}.ggc-object{width:min(86vw,650px)}
  .ggc-stage-copy{left:24px;top:auto;bottom:88px;transform:none;width:min(70vw,330px)}
  .ggc-stage-copy h1{font-size:clamp(38px,10vw,70px)}
  .ggc-stage-copy p{font-size:12px;margin-top:10px}.ggc-step{margin-bottom:10px}
  .ggc-progress{right:18px}.ggc-progress>span{display:none}.ggc-progress-track{height:150px}
  .ggc-category-grid{grid-template-columns:repeat(2,1fr)}.ggc-universe-head{align-items:start;flex-direction:column}.ggc-universe-head h2{text-align:left}
}
@media(max-width:560px){
  .ggc-page{cursor:auto}.ggc-cursor,.ggc-cursor-dot{display:none}.ggc-nav{height:64px;padding:0 18px}
  .ggc-journey{height:650vh}.ggc-sticky{min-height:520px}.ggc-object{width:88vw;transform-origin:center}
  .ggc-stage-copy{bottom:58px}.ggc-stage-copy p{max-width:230px}.ggc-scroll-hint{bottom:18px}
  .ggc-category-grid{grid-template-columns:1fr}.ggc-category{min-height:136px}.ggc-universes{padding-left:18px;padding-right:18px}.ggc-universe-head{margin-bottom:44px}
}


/* GG V3 — minimal scroll story + procedural 3D */
.ggc-cursor{width:14px;height:14px;background:rgba(218,93,22,.12);border-color:rgba(218,93,22,.48);backdrop-filter:blur(1.5px)}
.ggc-cursor.is-active{width:24px;height:24px;background:rgba(218,93,22,.1);border-color:rgba(218,93,22,.72)}
.ggc-cursor-dot{width:2px;height:2px}
.ggc-nav-minimal{height:72px;justify-content:flex-start;pointer-events:none}
.ggc-brand-home{display:flex;align-items:center;gap:16px;border:0;background:transparent;padding:8px 0;cursor:none;pointer-events:auto;text-align:left}
.ggc-brand-home strong{font:800 27px/1 Manrope,sans-serif;letter-spacing:-.08em;color:var(--ggc-orange)}
.ggc-brand-home span{font-size:9px;line-height:1;text-transform:uppercase;letter-spacing:.16em;font-weight:750;color:currentColor;opacity:.54;transition:opacity .2s}
.ggc-brand-home:hover span{opacity:.82}
.ggc-journey{height:700vh}
.ggc-2d-stage{width:min(48vw,650px);aspect-ratio:1;position:relative;z-index:4;pointer-events:none;display:grid;place-items:center;transform:translateY(1.5vh)}
.ggc-process-svg{display:block;width:100%;height:auto;overflow:visible;filter:saturate(.98) contrast(1.015)}
.ggc-organic-orbit{transform-origin:400px 420px;animation:ggcOrbit 9s linear infinite}
.ggc-wash-lines{transform-origin:center;animation:ggcWash 2.8s ease-in-out infinite alternate}
.ggc-ferment-bubbles .ggc-bubble{transform-box:fill-box;transform-origin:center;animation:ggcBubble2 2.5s ease-in-out infinite}
.ggc-ferment-bubbles .b1,.ggc-ferment-bubbles .b5{animation-delay:-.7s}.ggc-ferment-bubbles .b2,.ggc-ferment-bubbles .b6{animation-delay:-1.3s}.ggc-ferment-bubbles .b3,.ggc-ferment-bubbles .b7{animation-delay:-1.9s}
@keyframes ggcOrbit{to{transform:rotate(360deg)}}
@keyframes ggcWash{from{transform:translateX(-8px)}to{transform:translateX(8px)}}
@keyframes ggcBubble2{0%,100%{transform:translateY(6px) scale(.86)}50%{transform:translateY(-13px) scale(1.08)}}
.ggc-progress-min{position:absolute;z-index:12;right:clamp(18px,3vw,44px);top:50%;transform:translateY(-50%);width:1px;height:min(22vh,178px);background:currentColor;opacity:.2;border-radius:999px;overflow:hidden}
.ggc-progress-min i{position:absolute;left:0;top:0;width:100%;background:var(--ggc-orange);border-radius:999px;opacity:1}
.ggc-scroll-arrow{position:absolute;z-index:12;left:50%;bottom:25px;transform:translateX(-50%);font-size:17px;color:var(--ggc-orange);opacity:.72;transition:opacity .3s,transform .3s;animation:ggcArrow 1.7s ease-in-out infinite}
.ggc-scroll-arrow.hide{opacity:0;transform:translate(-50%,8px)}
@keyframes ggcArrow{0%,100%{translate:0 0}50%{translate:0 5px}}
.ggc-universes-minimal{padding-top:clamp(120px,14vw,210px)}
.ggc-universes-minimal .ggc-category-grid{max-width:1400px;margin:0 auto}

@media(max-width:900px){
  .ggc-2d-stage{width:min(66vw,620px)}
  .ggc-brand-home{gap:11px}.ggc-brand-home span{font-size:8px;letter-spacing:.12em}
  .ggc-progress-min{right:14px;height:132px}
}
@media(max-width:560px){
  .ggc-nav-minimal{height:62px}.ggc-brand-home strong{font-size:24px}.ggc-brand-home span{max-width:155px;line-height:1.35}
  .ggc-journey{height:620vh}.ggc-2d-stage{width:min(88vw,520px)}
  .ggc-scroll-arrow{bottom:16px}
}



/* KISSA SOKO — editorial homepage */
.ks-home{--ks-paper:#f4ede3;--ks-paper-2:#f7f1e8;--ks-ink:#07172b;--ks-soft:#6f716d;min-height:100vh;background:linear-gradient(180deg,var(--ks-paper-2) 0%,var(--ks-paper) 100%);color:var(--ks-ink);position:relative;overflow:hidden;cursor:none}
.ks-home button,.ks-home a{font-family:'DM Sans',Inter,sans-serif}
.ks-shell{max-width:1440px;margin:0 auto;padding-left:clamp(24px,4.5vw,68px);padding-right:clamp(24px,4.5vw,68px)}
.ks-home-nav{height:102px;max-width:1440px;margin:0 auto;padding:24px clamp(24px,4.5vw,68px);display:flex;align-items:flex-start;justify-content:space-between;position:absolute;inset:0 0 auto;z-index:30;pointer-events:none}
.ks-logo{border:0;background:transparent;padding:0;display:block;cursor:none;pointer-events:auto}
.ks-logo-img{display:block;width:clamp(118px,11vw,170px);height:auto;object-fit:contain}
.ks-menu-button{width:47px;height:47px;border-radius:50%;border:0;background:var(--ks-ink);display:grid;place-content:center;gap:6px;cursor:none;pointer-events:auto;box-shadow:0 11px 24px rgba(7,23,43,.12);transition:transform .25s ease,background .25s ease}
.ks-menu-button span{display:block;width:17px;height:1.5px;border-radius:2px;background:#fff}.ks-menu-button:hover{transform:scale(1.06);background:#132942}

.ks-hero{min-height:min(790px,92vh);position:relative;padding:clamp(120px,12vh,170px) 0 62px;display:flex;align-items:center;isolation:isolate;overflow:hidden}
.ks-hero:after{content:'';position:absolute;left:clamp(24px,4.5vw,68px);right:clamp(24px,4.5vw,68px);bottom:0;height:1px;background:linear-gradient(90deg,rgba(7,23,43,.12),rgba(7,23,43,.02) 70%,transparent)}
.ks-hero-shell{position:relative;z-index:5;width:100%;display:flex;align-items:flex-start;justify-content:space-between}
.ks-hero-copy{position:relative;z-index:5;width:min(69%,900px);padding-bottom:30px}
.ks-eyebrow{font:600 11px/1.65 'DM Sans',sans-serif;letter-spacing:.28em;color:#6d747a;margin:0 0 23px;text-transform:uppercase}
.ks-hero h1{font-family:'Bodoni Moda',Georgia,serif;font-style:italic;font-weight:800;font-size:clamp(68px,9.2vw,148px);line-height:.76;letter-spacing:-.075em;margin:0;color:var(--ks-ink);text-wrap:balance}
.ks-hero h1 span{display:block;white-space:nowrap}
.ks-explore{margin-top:42px;border:0;background:transparent;color:var(--ks-ink);padding:0;display:flex;align-items:center;gap:18px;cursor:none;font-size:10px;font-weight:700;letter-spacing:.24em}
.ks-explore i{font-style:normal;width:43px;height:43px;border-radius:50%;display:grid;place-items:center;background:var(--ks-orange);color:#fff;font-size:19px;letter-spacing:0;box-shadow:0 9px 22px rgba(218,93,22,.2);transition:transform .25s ease}
.ks-explore:hover i{transform:translateX(4px)}
.ks-hero-art{position:absolute;inset:0 0 0 auto;width:min(54vw,820px);pointer-events:none;display:flex;justify-content:flex-end;align-items:flex-start;z-index:1}
.ks-hero-art:before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,var(--ks-paper-2) 0%,rgba(244,237,227,.92) 16%,rgba(244,237,227,.44) 28%,rgba(244,237,227,0) 42%);z-index:2;pointer-events:none}
.ks-hero-botanical{position:absolute;right:-2px;top:0;width:100%;height:100%;object-fit:contain;object-position:top right;pointer-events:none;filter:saturate(.92) contrast(.98)}
.ks-hero-links{position:relative;z-index:6;display:flex;flex-direction:column;gap:9px;align-items:flex-start;padding-left:18px;border-left:1px solid rgba(7,23,43,.28);margin-top:6px;margin-right:12px}
.ks-hero-links button{border:0;background:transparent;color:var(--ks-ink);font-size:9px;font-weight:600;letter-spacing:.23em;cursor:none;opacity:.63;padding:0;transition:opacity .2s,color .2s,transform .2s}.ks-hero-links button:hover{opacity:1;color:var(--ks-orange);transform:translateX(3px)}

.ks-universes{position:relative;z-index:10;padding:28px 0 76px}
.ks-tile-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.ks-tile{height:clamp(220px,23vw,320px);position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.56);border-radius:12px;background:#20170f;color:#fff;text-decoration:none;text-align:left;cursor:none;padding:0;display:block;box-shadow:0 8px 24px rgba(44,28,18,.055);transition:transform .32s cubic-bezier(.2,.8,.2,1),box-shadow .32s ease}
.ks-tile-photo,.ks-tile-shade{position:absolute;inset:0}.ks-tile-photo{background-size:cover;background-position:center;transform:scale(1.015);filter:saturate(.82) contrast(1.04);transition:transform .65s cubic-bezier(.2,.8,.2,1),filter .35s ease}
.ks-tile-shade{background:linear-gradient(180deg,rgba(7,12,16,.02) 15%,rgba(10,9,8,.12) 45%,rgba(10,8,7,.78) 100%)}
.ks-tile strong{position:absolute;z-index:3;left:24px;bottom:25px;color:#fff;font:700 clamp(18px,1.6vw,25px)/1 'DM Sans',sans-serif;letter-spacing:-.025em;text-shadow:0 2px 16px rgba(0,0,0,.32)}
.ks-tile-arrow{position:absolute;z-index:3;left:23px;top:23px;width:35px;height:35px;border:1px solid rgba(255,255,255,.78);border-radius:50%;display:grid;place-items:center;font-size:15px;transition:background .25s,color .25s,transform .25s}
.ks-tile-index{position:absolute;z-index:3;right:20px;top:20px;font-size:8px;letter-spacing:.2em;font-weight:700;opacity:.56}
.ks-tile:hover{transform:translateY(-4px);box-shadow:0 18px 40px rgba(44,28,18,.13)}.ks-tile:hover .ks-tile-photo{transform:scale(1.065);filter:saturate(.95) contrast(1.04)}.ks-tile:hover .ks-tile-arrow{background:var(--ks-orange);border-color:var(--ks-orange);transform:translateX(3px)}

.ks-closing{min-height:520px;position:relative;padding:88px 0 95px;display:flex;align-items:center;overflow:hidden;border-top:1px solid rgba(7,23,43,.08)}
.ks-closing:before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(247,241,232,0) 40%,rgba(247,241,232,.28) 62%,rgba(247,241,232,.78) 80%,var(--ks-paper-2) 100%);pointer-events:none;z-index:1}
.ks-closing-shell{position:relative;z-index:4;width:100%}
.ks-closing-copy{position:relative;z-index:4;width:min(48%,600px)}
.ks-closing-kicker{font-size:9px;font-weight:600;letter-spacing:.28em;color:#7c7b76;margin-bottom:19px}
.ks-closing h2{font-family:'Bodoni Moda',Georgia,serif;font-weight:800;font-size:clamp(51px,6.5vw,92px);line-height:.87;letter-spacing:-.055em;margin:0;color:var(--ks-ink)}
.ks-closing h2 span{color:var(--ks-orange)}
.ks-closing-copy>p:not(.ks-closing-kicker){max-width:480px;margin-top:25px;color:#34404b;font:500 16px/1.65 'DM Sans',sans-serif}
.ks-closing-link{margin-top:30px;border:0;background:transparent;padding:0;display:flex;align-items:center;gap:15px;color:var(--ks-ink);cursor:none;font-size:9px;font-weight:700;letter-spacing:.23em}.ks-closing-link i{display:block;width:64px;height:1px;background:rgba(7,23,43,.42)}.ks-closing-link b{font-size:16px;color:var(--ks-orange);font-weight:400;letter-spacing:0;transition:transform .2s}.ks-closing-link:hover b{transform:translateX(4px)}
.ks-closing-art{position:absolute;inset:0 0 0 auto;width:min(56vw,860px);pointer-events:none;display:flex;justify-content:flex-end;align-items:flex-end;z-index:0}
.ks-closing-art:before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,var(--ks-paper-2) 0%,rgba(244,237,227,.86) 20%,rgba(244,237,227,.34) 34%,rgba(244,237,227,0) 48%);z-index:2;pointer-events:none}
.ks-closing-botanical{position:absolute;right:-2px;bottom:0;width:100%;height:100%;object-fit:contain;object-position:bottom right;pointer-events:none;filter:saturate(.9) contrast(.98)}

@media(max-width:980px){
  .ks-home-nav{max-width:none}
  .ks-hero{min-height:720px;align-items:flex-end;padding-bottom:74px}.ks-hero-copy{width:76%}.ks-hero h1{font-size:clamp(62px,11vw,108px)}.ks-hero-art{width:67vw}.ks-hero-botanical{opacity:.96}.ks-hero-links{display:none}
  .ks-tile-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ks-tile{height:300px}.ks-closing-copy{width:58%}.ks-closing-art{width:72vw}
}
@media(max-width:640px){
  .ks-home{cursor:auto}.ks-home .ggc-cursor,.ks-home .ggc-cursor-dot{display:none}.ks-home-nav{height:78px;padding:18px}.ks-menu-button{width:42px;height:42px}.ks-logo-img{width:118px}
  .ks-shell{padding-left:18px;padding-right:18px}
  .ks-hero{min-height:650px;padding:112px 0 54px;align-items:flex-end}.ks-hero-copy{width:100%;padding-bottom:0}.ks-eyebrow{font-size:9px;margin-bottom:17px}.ks-hero h1{font-size:clamp(52px,17.5vw,80px);line-height:.79;letter-spacing:-.065em}.ks-hero-art{width:95vw}.ks-hero-botanical{right:-18vw;top:-10px;opacity:.72}.ks-explore{margin-top:28px}.ks-hero:after{left:18px;right:18px}
  .ks-universes{padding:16px 0 54px}.ks-tile-grid{grid-template-columns:1fr;gap:9px}.ks-tile{height:235px;border-radius:10px}.ks-tile strong{font-size:21px}.ks-closing{min-height:500px;padding:66px 0 76px;align-items:flex-start}.ks-closing-copy{width:87%}.ks-closing h2{font-size:clamp(48px,14vw,68px)}.ks-closing-copy>p:not(.ks-closing-kicker){font-size:14px;max-width:88%}.ks-closing-art{width:105vw}.ks-closing-botanical{right:-42vw;bottom:-10px;opacity:.7}
}

@media(prefers-reduced-motion:reduce){.ggc-page *{scroll-behavior:auto!important;animation:none!important;transition-duration:.01ms!important}.ggc-cursor,.ggc-cursor-dot{display:none}}
`}</style>

      {tab !== 'home' && <>
      {/* TOPBAR */}
      <div style={{ background:`${T.bg}e8`, borderBottom:`1px solid ${T.border}`, padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, backdropFilter:'blur(20px) saturate(140%)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {/* Logo */}
          <button onClick={()=>setTab('home')} style={{display:'flex',alignItems:'center',gap:13,border:0,background:'transparent',padding:0,cursor:'pointer',color:T.text,textAlign:'left'}}>
            <strong style={{fontFamily:'Manrope, sans-serif',fontSize:25,lineHeight:1,fontWeight:800,letterSpacing:'-0.08em',color:BRAND.orange}}>GG</strong>
            <span style={{fontSize:9,color:T.faint,letterSpacing:'0.13em',textTransform:'uppercase',fontWeight:700}}>veille · science · culture café</span>
          </button>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:'0.63rem', color:T.faint }}>{dateStr}</span>
          {lastRefresh && <span style={{ fontSize:'0.62rem', color:T.faint, display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#7a9e78', display:'inline-block' }} />{lastRefresh}
          </span>}
          <button onClick={fetchAll} style={{ background:T.surf2, border:`1px solid ${T.border2}`, color:T.dim, fontSize:'0.72rem', padding:'5px 11px', borderRadius:7, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}>
            ↺
          </button>
          {/* Dark/Light toggle */}
          <button onClick={()=>setDark(!dark)} style={{ background: dark ? BRAND.yellow+'22' : BRAND.purple+'22', border:`1px solid ${dark ? BRAND.yellow+'44' : BRAND.purple+'44'}`, color: dark ? BRAND.yellow : BRAND.purple, fontSize:'0.72rem', padding:'5px 11px', borderRadius:7, cursor:'pointer', fontFamily:'inherit', fontWeight:600, transition:'all 0.2s' }}>
            {dark ? '☀ Clair' : '☾ Sombre'}
          </button>
        </div>
      </div>

      {/* MARKETS STRIP */}
      <div style={{ background:`${T.surf}d9`, borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', padding:'0 24px', minHeight:66, backdropFilter:'blur(18px)' }}>
        {/* Market data */}
        <div style={{ display:'flex', flex:1, overflowX:'auto' }}>
          {(markets.length ? markets : [
            {label:'Arabica ICE',val:'--',unit:'c/lb',chg:'',up:true},
            {label:'Robusta ICE',val:'--',unit:'$/t', chg:'',up:false},
            {label:'EUR/USD',    val:'--',unit:'',    chg:'',up:true},
            {label:'BRL/USD',   val:'--',unit:'',    chg:'',up:true},
          ]).map((m,i) => (
            <div key={i} style={{ padding:'9px 24px 9px 20px', minWidth:140, borderRight:`1px solid ${T.border}`, flexShrink:0 }}>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:T.dim, marginBottom:5, fontWeight:600 }}>{m.label}</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:7 }}>
                <span style={{ fontSize:'1.25rem', fontWeight:700, color:T.text }}>
                  {m.val}{m.unit && <span style={{ fontSize:9, color:T.faint, marginLeft:3 }}>{m.unit}</span>}
                </span>
                {m.chg && <span style={{ fontSize:'0.85rem', color:m.up ? '#7cb87c' : '#c07070', fontWeight:700 }}>{m.up ? '▲' : '▼'}{m.chg}</span>}
              </div>
              {m.note && <div style={{ fontSize:8, color:T.faint, marginTop:2 }}>{m.note}</div>}
            </div>
          ))}
          <div style={{ padding:'9px 0 9px 20px', minWidth:80, flexShrink:0 }}>
            <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:T.dim, marginBottom:5, fontWeight:600 }}>Mis a jour</div>
            <div style={{ fontSize:'1.1rem', color:T.text, fontWeight:700 }}>{mktTime}</div>
          </div>
        </div>
        {/* Right buttons — Music + Vitality */}
        <div style={{ display:'flex', alignItems:'center', gap:12, paddingLeft:24, borderLeft:`1px solid ${T.border}`, flexShrink:0 }}>
          {/* Music button */}
          <button onClick={() => setShowMusic(v => !v)} style={{
            background:'none', border:'none', cursor:'pointer', padding:4, borderRadius:8,
            opacity: showMusic ? 1 : 0.65, transition:'all 0.2s',
            transform: showMusic ? 'scale(1.05)' : 'scale(1)',
          }} title="Musique — GaufreGentille">
            <img src="/gg-logo.png" alt="GaufreGentille Musique" style={{ width:62, height:62, borderRadius:8, objectFit:'cover', display:'block' }} />
          </button>
          {/* Vitality button */}
          <a href="https://bo3.gg/teams/vitality/matches" target="_blank" rel="noopener noreferrer"
            style={{ display:'block', padding:4, borderRadius:8, opacity:0.65, transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity='1'}
            onMouseLeave={e => e.currentTarget.style.opacity='0.65'}
            title="Team Vitality CS2 — bo3.gg">
            <img src="/vitality-logo.webp" alt="Team Vitality" style={{ width:62, height:62, borderRadius:8, objectFit:'cover', display:'block' }} />
          </a>
          {/* Cupping button — lien externe vers l'outil de dégustation */}
          <a href="https://cupping-secure.netlify.app" target="_blank" rel="noopener noreferrer"
            style={{ display:'block', padding:4, borderRadius:8, opacity:0.65, transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity='1'}
            onMouseLeave={e => e.currentTarget.style.opacity='0.65'}
            title="Cupping — Fiches de dégustation">
            <img src="/cupping-logo.png" alt="Cupping" style={{ width:62, height:62, borderRadius:8, objectFit:'cover', display:'block' }} />
          </a>
        </div>
      </div>


            {/* MUSIC PANEL */}
      {showMusic && (
        <div style={{ background:T.surf, borderBottom:`1px solid ${BRAND.purple}44`, padding:'20px', animation:'fadeUp 0.2s ease both' }}>
          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.15em', color:T.dim, fontWeight:600, marginBottom:20, paddingBottom:12, borderBottom:`1px solid ${T.border}` }}>
            Musique · GaufreGentille · {PLAYLISTS.length} playlists sur Suno
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
            {PLAYLISTS.map((pl, i) => (
              <a key={i} href={pl.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
                <div style={{
                  background:T.surf2, border:`1px solid ${T.border}`,
                  borderRadius:14, overflow:'hidden', cursor:'pointer', transition:'all 0.22s',
                }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=BRAND.amber+'88'; e.currentTarget.style.transform='translateY(-3px)' }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.transform='translateY(0)' }}
                >
                  <div style={{ height:180, backgroundImage:`url(${pl.cover})`, backgroundSize:'cover', backgroundPosition:'center', position:'relative' }}>
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
                    <div style={{ position:'absolute', top:10, right:10, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', borderRadius:20, padding:'2px 9px', fontSize:10, color:'#fff', fontWeight:600 }}>{pl.tracks} tracks</div>
                    <div style={{ position:'absolute', bottom:12, left:14 }}>
                      <div style={{ fontSize:'0.6rem', color:BRAND.amber, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>GaufreGentille</div>
                      <div style={{ fontFamily:'Georgia,serif', fontSize:'1.1rem', fontWeight:700, color:'#fff', textShadow:'0 2px 8px rgba(0,0,0,0.8)' }}>{pl.name}</div>
                    </div>
                  </div>
                  <div style={{ padding:'12px 14px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ fontSize:'0.75rem', color:T.dim, fontStyle:'italic' }}>{pl.vibe}</div>
                    <div style={{ background:BRAND.amber, color:'#000', fontSize:'0.68rem', fontWeight:700, padding:'4px 12px', borderRadius:20 }}>▶ Suno</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* TAB BAR */}
      <div style={{ background:`${T.bg}e6`, borderBottom:`1px solid ${T.border}`, display:'flex', gap:5, padding:'8px max(20px, calc((100vw - 1180px)/2))', overflowX:'auto', position:'sticky', top:64, zIndex:90, backdropFilter:'blur(18px) saturate(140%)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            background: tab===t.id ? T.surf3 : 'transparent', border:`1px solid ${tab===t.id ? T.border2 : 'transparent'}`,
            borderRadius:11,
            color: tab===t.id ? T.text : T.dim,
            fontWeight: tab===t.id ? 700 : 500,
            fontSize:'0.78rem', padding:'8px 13px', letterSpacing:'0.015em',
            cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.18s', fontFamily:'inherit',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      </>}

      {/* CONTENT */}
      <div style={{ maxWidth: tab==='home' ? 'none' : 1040, margin:'0 auto', padding: tab==='home' ? 0 : '28px 18px 110px' }}>
        {error && <ErrMsg msg={error} T={T} />}

        {/* HOME */}
        {tab==='home' && (
          <HomePage setTab={setTab} setShowMusic={setShowMusic} />
        )}

        {/* NEWS */}
        {tab==='news' && (
          loading ? <Spinner label="Generation des actualites du jour..." T={T} /> :
          news.length ? (
            <div>
              <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.18em', color:T.faint, marginBottom:16, paddingBottom:10, borderBottom:`1px solid ${T.border}` }}>
                Actualites du secteur - {news.length} articles · {dateStr}
              </div>
              <HeroCard item={news[0]} T={T} />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
                {news.slice(1).map((item,i) => <NewsCard key={i} item={item} img={IMG[(i+1)%IMG.length]} i={i} T={T} />)}
              </div>
            </div>
          ) : <ErrMsg msg="Impossible de charger les actualites." T={T} />
        )}

        {/* INSTAGRAM */}
        {tab==='instagram' && (
          <InstaVeillePanel />
        )}

        {/* REDDIT */}
        {tab==='reddit' && (
          commLoading ? <Spinner label="Chargement de la communaute..." T={T} /> :
          community.length ? (
            <div>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.15em', color:T.dim, fontWeight:600, marginBottom:16, paddingBottom:12, borderBottom:`1px solid ${T.border}` }}>
                Communaute · The Sprudge Report · {community.length} articles · {dateStr}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
                {community.map((post,i) => <RedditCard key={i} post={post} i={i} T={T} />)}
              </div>
            </div>
          ) : <ErrMsg msg="Impossible de charger le contenu Sprudge." T={T} />
        )}

        {/* SCIENCE */}
        {tab==='science' && (
          sciLoading ? <Spinner label="Recherche d articles scientifiques..." T={T} /> :
          (sciItems.length > 0 ? sciItems : sci).length ? (
            <div>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.15em', color:T.dim, fontWeight:600, marginBottom:16, paddingBottom:12, borderBottom:`1px solid ${T.border}` }}>
                Articles scientifiques · {(sciItems.length > 0 ? sciItems : sci).length} articles · vrais papiers via PubMed NCBI
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {(sciItems.length > 0 ? sciItems : sci).map((item,i) => <SciCard key={i} item={item} img={SCI_IMG[i%SCI_IMG.length]} i={i} T={T} />)}
              </div>
            </div>
          ) : <ErrMsg msg="Impossible de charger les articles scientifiques." T={T} />
        )}


        {/* TEAM VITALITY */}


        {/* MUSIQUE */}

        {tab==='gear' && (() => {
          const items = gearItems.length > 0 ? gearItems : gear
          return gearLoading ? <Spinner label="Chargement des nouveautés matériel..." T={T} /> :
          items.length ? (
            <div>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.15em', color:T.dim, fontWeight:600, marginBottom:16, paddingBottom:12, borderBottom:`1px solid ${T.border}` }}>
                Ça fait du bruit · {items.length} nouveautés · moulins, machines, tasses, drippers...
              </div>
              <GearHeroCard item={items[0]} T={T} />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
                {items.slice(1).map((item,i) => <GearCard key={i} item={item} i={i} T={T} />)}
              </div>
            </div>
          ) : <ErrMsg msg="Impossible de charger les nouveautés." T={T} />
        })()}
        
        {/* HARVEST */}
        {tab==='harvest' && (
          harvestLoading ? <Spinner label="Chargement du calendrier des origines..." T={T} /> :
          harvestData ? (
            <HarvestPanel data={harvestData} />
          ) : (
            <ErrMsg msg="Impossible de charger le calendrier des origines." T={T} />
          )
        )}
      </div>
    </div>
  )
}
