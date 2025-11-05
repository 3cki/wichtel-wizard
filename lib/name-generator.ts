// Lustige weihnachtliche anonyme Namengenerator für Wichteln
const adjectives = [
  'Fröhlicher', 'Festlicher', 'Verschneiter', 'Funkelnder', 'Frostiger', 'Gemütlicher', 'Glitzernder',
  'Magischer', 'Winterlicher', 'Strahlender', 'Verzauberter', 'Wunderlicher', 'Freudiger', 'Heller',
  'Tanzender', 'Singender', 'Hüpfender', 'Prunkvoller', 'Verschlafener', 'Hungriger', 'Tollpatschiger',
  'Schwindeliger', 'Kichernder', 'Heimlicher', 'Munterer', 'Beschwingter', 'Lebhafter', 'Quirliger',
  'Flauschiger', 'Schnurriger'
]

const nouns = [
  'Rentier', 'Schneeflocke', 'Lebkuchen', 'Wichtel', 'Engel', 'Schneemann', 'Stern',
  'Plätzchen', 'Christbaumkugel', 'Kerze', 'Glocke', 'Fäustling', 'Schal', 'Schlitten', 'Geschenk',
  'Strumpf', 'Nussknacker', 'Pinguin', 'Igel', 'Eule', 'Fuchs', 'Bär', 'Eichhörnchen',
  'Einhörn', 'Drache', 'Phönix', 'Greif', 'Tannenbaum', 'Lametta', 'Zipfelmütze'
]

export function generateAnonymousName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${adjective} ${noun}`
}

export function generateUniqueGroupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing characters
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
