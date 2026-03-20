import { Links, Meta, Outlet, Scripts, ScrollRestoration, NavLink } from '@remix-run/react'
import { useEffect, useState } from 'react'
import type { LinksFunction } from '@remix-run/node'
import stylesheet from '~/tailwind.css?url'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
]

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    const initial = saved || 'light'
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{
          __html: `document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'light')`
        }} />
        <Meta />
        <Links />
      </head>
      <body className="bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen transition-colors duration-200">
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between h-[60px] px-6 bg-[var(--color-header-bg)] backdrop-blur-md border-b border-[var(--color-border)] transition-colors duration-200">
          <div className="text-[#6c5ce7] dark:text-[#a29bfe] font-bold text-xl whitespace-nowrap">
            Sleep Tracker
          </div>
          <nav className="hidden md:flex gap-2">
            {[
              { to: '/', label: 'Трекер' },
              { to: '/statistics', label: 'Статистика' },
              { to: '/norms', label: 'Нормы' },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
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
          <button
            onClick={toggleTheme}
            className="hidden md:flex items-center p-1.5 rounded-lg hover:bg-[var(--color-border)] transition-colors"
            aria-label="Переключить тему"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden flex flex-col justify-center gap-[5px] p-1.5 rounded-lg hover:bg-[var(--color-border)] transition-colors"
            aria-label="Открыть меню"
          >
            <span className="block w-[22px] h-[2px] bg-[var(--color-text)] rounded" />
            <span className="block w-[22px] h-[2px] bg-[var(--color-text)] rounded" />
            <span className="block w-[22px] h-[2px] bg-[var(--color-text)] rounded" />
          </button>
        </header>

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-screen w-[280px] z-[200] flex flex-col bg-[var(--color-sidebar-bg)] border-r border-[var(--color-border)] transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
            <span className="font-semibold text-lg">Меню</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-2xl hover:bg-[var(--color-border)] px-2 py-0.5 rounded transition-colors"
            >
              ×
            </button>
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
                onClick={() => setSidebarOpen(false)}
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
          <button
            onClick={toggleTheme}
            className="mx-3 mb-3 flex items-center justify-center gap-2 p-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-border)] transition-colors text-sm"
          >
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>Сменить тему</span>
          </button>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-[150] bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="max-w-3xl mx-auto px-6 py-8">
          <Outlet />
        </main>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
