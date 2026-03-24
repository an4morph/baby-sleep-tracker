import { NavLink } from '@remix-run/react'
import { ThemeToggle } from '../../../features/toggle-theme'

interface Props {
  isOpen: boolean
  onClose: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function Sidebar({ isOpen, onClose, theme, onToggleTheme }: Props) {
  return (
    <aside
      className={`fixed top-0 left-0 h-[100svh] w-[280px] flex flex-col bg-[var(--color-sidebar-bg)] border-r border-[var(--color-border)] transition-transform duration-300 ${
        isOpen ? 'translate-x-0 z-[200] pointer-events-auto' : '-translate-x-full pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
        <span className="font-semibold text-lg">Меню</span>
        <button
          onClick={onClose}
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
            onClick={onClose}
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
        onToggle={onToggleTheme}
        className="mx-3 mb-3 flex items-center justify-center p-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-border)] transition-colors"
      />
    </aside>
  )
}
