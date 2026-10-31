// Photos live in src/assets/images/ (see PROMPTS.md there). Name each file after its slot,
// e.g. hero.jpg, chest.webp, yoga.png. Only files that exist are used, so a missing photo
// simply falls back to the original design (no broken images, no 404s).
const files = import.meta.glob('../assets/images/*.{jpg,jpeg,png,webp,avif,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const byName = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop().replace(/\.[^.]+$/, '').toLowerCase(), url])
)

export const imageUrl = (name) => byName[name?.toLowerCase()] ?? null
