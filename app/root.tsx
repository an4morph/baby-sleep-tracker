import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'
import { useEffect, useRef, useState } from 'react'
import styles from './tailwind.css?url'
import { Header } from './widgets/header'
import { Sidebar } from './widgets/sidebar'

export function links() {
  return [{ rel: 'stylesheet', href: styles }]
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarMounted, setSidebarMounted] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
      const initial = saved || 'light'
      setTheme(initial)
      document.documentElement.setAttribute('data-theme', initial)
    } catch (e) {}
  }, [])

  const openSidebar = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setSidebarMounted(true)
    // mount first, then trigger open animation on next frame
    requestAnimationFrame(() => setSidebarOpen(true))
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
    // unmount after transition completes
    closeTimer.current = setTimeout(() => setSidebarMounted(false), 320)
  }

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
          onOpenSidebar={openSidebar}
        />

        {sidebarMounted && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={closeSidebar}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-[150] bg-black/40"
            onClick={closeSidebar}
          />
        )}

        <main className="max-w-[1400px] mx-auto px-6 py-8">
          <Outlet />
        </main>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
