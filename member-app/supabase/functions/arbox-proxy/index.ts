// Supabase Edge Function (Deno) — היחיד שמחזיק בפועל את ARBOX_API_KEY.
//
// סטטוס: שלד שנכתב לפי docs/briah-app/arbox-integration.md, טרם נבדק מול נתונים אמיתיים —
// הסביבה שבה זה נכתב חסומה מגישת רשת ל-arboxserver.arboxapp.com. לפני production:
//   1. להריץ `supabase functions deploy arbox-proxy` בפרויקט אמיתי.
//   2. להגדיר secret: `supabase secrets set ARBOX_API_KEY=...` (המפתח עצמו לא נכנס לקוד/git, אף פעם).
//   3. לוודא מול https://arboxserver.arboxapp.com/docs/api את שם ה-header המדויק לאימות
//      (בתיעוד כתוב "Security: API Key" בלי לפרט את שם ה-header — TODO לאמת) ואת הנתיבים/השדות
//      המדויקים תחת Membership Types / Users / Schedule / Reports (רק Leads תועד לעומק עד כה).
//   4. להחליף את בדיקת האימות הבסיסית למטה באימות JWT אמיתי של Supabase Auth.

const ARBOX_BASE_URL = 'https://arboxserver.arboxapp.com/api/public/v3'

function arboxHeaders(): HeadersInit {
  const apiKey = Deno.env.get('ARBOX_API_KEY')
  if (!apiKey) throw new Error('ARBOX_API_KEY secret is not set on this Edge Function')
  // TODO: לאמת מול התיעוד אם זה header בשם "Authorization: Bearer <key>" או "apiKey: <key>" וכו'.
  return { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
}

function requireCallerAuth(req: Request): void {
  // הגנה בסיסית בלבד: דורש כותרת Authorization כלשהי מהקורא (אמור להיות ה-Supabase anon/user JWT).
  // TODO: להחליף באימות אמיתי (supabase-js createClient(...).auth.getUser(jwt)) לפני production.
  if (!req.headers.get('authorization')) {
    throw new Error('missing Authorization header')
  }
}

Deno.serve(async (req: Request) => {
  try {
    requireCallerAuth(req)
    const url = new URL(req.url)
    const path = url.pathname.replace(/^\/arbox-proxy/, '')

    if (path.startsWith('/membership-status/')) {
      const arboxCustomerId = path.split('/').pop()
      // TODO: לאמת את הנתיב האמיתי — כרגע ניחוש לפי arbox-integration.md (Membership Types + Users).
      const res = await fetch(`${ARBOX_BASE_URL}/users/${arboxCustomerId}`, { headers: arboxHeaders() })
      if (!res.ok) return new Response(await res.text(), { status: res.status })
      const raw = await res.json()
      // TODO: למפות את הצורה האמיתית של raw לצורה שה-frontend מצפה לה (ArboxMembershipStatus).
      return Response.json(raw)
    }

    if (path === '/schedule') {
      const locationId = url.searchParams.get('locationId')
      const res = await fetch(`${ARBOX_BASE_URL}/schedule?location_id=${locationId}`, { headers: arboxHeaders() })
      if (!res.ok) return new Response(await res.text(), { status: res.status })
      return Response.json(await res.json())
    }

    if (path === '/leads' && req.method === 'POST') {
      const body = await req.json()
      const res = await fetch(`${ARBOX_BASE_URL}/leads`, {
        method: 'POST',
        headers: arboxHeaders(),
        body: JSON.stringify(body),
      })
      if (!res.ok) return new Response(await res.text(), { status: res.status })
      return Response.json(await res.json())
    }

    return new Response('not found', { status: 404 })
  } catch (err) {
    return new Response(String(err), { status: 500 })
  }
})
