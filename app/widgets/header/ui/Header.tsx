import { NavLink } from '@remix-run/react'
import { ThemeToggle } from '../../../features/toggle-theme'

interface Props {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onOpenSidebar: () => void
}

export function Header({ theme, onToggleTheme, onOpenSidebar }: Props) {
  return (
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
      <ThemeToggle
        theme={theme}
        onToggle={onToggleTheme}
        className="hidden md:flex items-center p-1.5 rounded-lg hover:bg-[var(--color-border)] transition-colors"
      />
      <button
        onClick={onOpenSidebar}
        className="md:hidden flex flex-col justify-center gap-[5px] p-1.5 rounded-lg hover:bg-[var(--color-border)] transition-colors"
        aria-label="Открыть меню"
      >
        <span className="block w-[22px] h-[2px] bg-[var(--color-text)] rounded" />
        <span className="block w-[22px] h-[2px] bg-[var(--color-text)] rounded" />
        <span className="block w-[22px] h-[2px] bg-[var(--color-text)] rounded" />
      </button>
    </header>
  )
}
