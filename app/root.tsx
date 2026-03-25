import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'
import { useEffect, useState } from 'react'
import styles from './tailwind.css?url'
import { Header } from './widgets/header'

export function links() {
  return [{ rel: 'stylesheet', href: styles }]
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
      const initial = saved || 'light'
      setTheme(initial)
      document.documentElement.setAttribute('data-theme', initial)
    } catch (e) {}
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try { localStorage.setItem('theme', next) } catch (e) {}
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{
          __html: `try{document.documentElement.setAttribute('data-theme',localStorage.getItem('theme')||'light')}catch(e){}`
        }} />
        <Meta />
        <Links />
      </head>
      <body className="bg-[var(--color-bg)] text-[var(--color-text)] min-h-[100svh] transition-colors duration-200">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="max-w-[1400px] mx-auto px-6 py-8">
          <Outlet />
        </main>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
