// אותו סימן "פרח" של גיאומטריה קדושה כמו בכלי הגאנטים — חמישה עיגולים סביב מרכז,
// מהדהד את חמשת הרבדים של המתודולוגיה.
export default function BriahMark({ size = 32, color = 'currentColor' }: { size?: number; color?: string }) {
  const r = 30
  const petals = [0, 72, 144, 216, 288].map((deg) => {
    const rad = (deg * Math.PI) / 180
    return {
      cx: 50 + r * 0.62 * Math.sin(rad),
      cy: 50 - r * 0.62 * Math.cos(rad),
    }
  })
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="2.5" aria-hidden="true">
      <circle cx="50" cy="50" r={r} />
      {petals.map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={r} />
      ))}
    </svg>
  )
}
