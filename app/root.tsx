import { Links, Meta, NavLink, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'
import { useEffect, useState } from 'react'
import styles from './tailwind.css?url'
import { Header } from './widgets/header'
import { ThemeToggle } from './features/toggle-theme'

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

  const closeSidebar = () => {
    const el = document.getElementById('nav-toggle') as HTMLInputElement | null
    if (el) el.checked = false
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

        {/* CSS-only sidebar toggle — must be before all peer-checked targets */}
        <input id="nav-toggle" type="checkbox" className="sr-only peer" />

        <Header theme={theme} onToggleTheme={toggleTheme} />

        {/* Sidebar */}
        <aside className="fixed top-0 left-0 h-[100svh] w-[280px] z-[200] flex flex-col bg-[var(--color-sidebar-bg)] border-r border-[var(--color-border)] transition-transform duration-300 -translate-x-full pointer-events-none peer-checked:translate-x-0 peer-checked:pointer-events-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
            <span className="font-semibold text-lg">Меню</span>
            <label htmlFor="nav-toggle" className="text-2xl cursor-pointer hover:bg-[var(--color-border)] px-2 py-0.5 rounded transition-colors">×</label>
          </div>
          <nav className="flex flex-col gap-1 p-3 flex-1">
            {[
              { to: '/', label: 'Трекер' },
              { to: '/statistics', label: 'Статистика' },
              { to: '/norms', label: 'Нормы' },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-[#6c5ce7] text-white'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle
            theme={theme}
            onToggle={toggleTheme}
            className="mx-3 mb-3 flex items-center justify-center p-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-border)] transition-colors"
          />
        </aside>

        {/* Overlay */}
        <label
          htmlFor="nav-toggle"
          className="fixed inset-0 z-[150] bg-black/40 opacity-0 pointer-events-none transition-opacity duration-300 peer-checked:opacity-100 peer-checked:pointer-events-auto"
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
