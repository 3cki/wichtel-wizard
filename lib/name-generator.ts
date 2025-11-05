// Funny Christmas-themed anonymous name generator for Wichteln
const adjectives = [
  'Jolly', 'Merry', 'Festive', 'Snowy', 'Sparkly', 'Frosty', 'Cozy', 'Twinkling',
  'Cheerful', 'Glittering', 'Magical', 'Wintry', 'Gleaming', 'Dazzling', 'Shimmering',
  'Radiant', 'Enchanted', 'Whimsical', 'Joyful', 'Bright', 'Dancing', 'Singing',
  'Bouncing', 'Prancing', 'Sleepy', 'Hungry', 'Clumsy', 'Dizzy', 'Giggly', 'Sneaky'
]

const nouns = [
  'Reindeer', 'Snowflake', 'Gingerbread', 'Elf', 'Angel', 'Snowman', 'Star',
  'Cookie', 'Ornament', 'Candle', 'Bell', 'Mittens', 'Scarf', 'Sleigh', 'Present',
  'Stocking', 'Nutcracker', 'Penguin', 'Cardinal', 'Penguin', 'Hedgehog', 'Owl',
  'Fox', 'Bear', 'Squirrel', 'Unicorn', 'Dragon', 'Phoenix', 'Griffin', 'Chimera'
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
