interface Props {
  theme: 'light' | 'dark'
  onToggle: () => void
  className?: string
  label?: string
}

export function ThemeToggle({ theme, onToggle, className, label }: Props) {
  return (
    <button
      onClick={onToggle}
      className={className}
      aria-label="Переключить тему"
    >
      <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
      {label && <span>{label}</span>}
    </button>
  )
}
