interface Props {
  value: string | null
  onChange: (v: string | null) => void
}

export function BirthDateInput({ value, onChange }: Props) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <label className="text-sm text-[var(--color-text-secondary)]">Дата рождения:</label>
      <input
        type="date"
        value={value ?? ''}
        onChange={(e) => {
          const val = e.target.value || null
          onChange(val)
          try {
            if (val) localStorage.setItem('birthDate', val)
            else localStorage.removeItem('birthDate')
          } catch (e) {}
        }}
        className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/50"
      />
      {value && (
        <span className="text-xs text-[var(--color-text-secondary)]">
          Стрелки показывают отклонения от норм
        </span>
      )}
    </div>
  )
}
