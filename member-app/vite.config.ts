import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// בפיתוח מקומי מוגש תחת /member-app/; בבנייה ל-production (GitHub Pages, ראו
// .github/workflows/deploy-pages.yml) מוגש תחת /briah/member-app/ כי כלי הגאנטים
// כבר תופס את /briah/ בשורש אותו אתר Pages.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/briah/member-app/' : '/member-app/',
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
}))
