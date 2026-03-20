// === Tracker ===

const DAYS_RU = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
const MONTHS_RU = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];

function fmt(dt) {
  return dt.toTimeString().slice(0, 5);
}

function durMin(a, b) {
  return Math.round((b - a) / 60000);
}

function fmtDur(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}ч ${m}м`;
  if (h > 0) return `${h}ч 0м`;
  return `${m}м`;
}

function buildTimeline(day) {
  // Build alternating ВБ/ДС segments for the timeline bar
  // Day spans from wake_up to bedtime
  const dayStart = new Date(`${day.date}T${day.wake_up}:00`);
  const dayEnd = new Date(`${day.date}T${day.bedtime}:00`);
  const totalMin = durMin(dayStart, dayEnd);

  const segments = [];

  // Collect all intervals sorted
  const events = [];
  day.naps.forEach(n => {
    events.push({ type: 'nap', start: new Date(n.start), end: new Date(n.end) });
  });
  day.wake_periods.forEach(w => {
    events.push({ type: 'wake', start: new Date(w.start), end: new Date(w.end) });
  });
  events.sort((a, b) => a.start - b.start);

  // Build segments relative to dayStart
  events.forEach(ev => {
    const s = Math.max(0, durMin(dayStart, ev.start));
    const e = Math.min(totalMin, durMin(dayStart, ev.end));
    if (e > s) {
      segments.push({ type: ev.type, pct: ((s / totalMin) * 100).toFixed(2), width: (((e - s) / totalMin) * 100).toFixed(2) });
    }
  });

  return segments;
}

function buildRows(day) {
  const rows = [];
  const naps = day.naps.map(n => ({ start: new Date(n.start), end: new Date(n.end) }));
  const wakes = day.wake_periods.map(w => ({ start: new Date(w.start), end: new Date(w.end) }));

  // Merge and sort all intervals
  const all = [
    ...naps.map((n, i) => ({ type: 'nap', idx: i + 1, ...n })),
    ...wakes.map((w, i) => ({ type: 'wake', idx: i + 1, ...w }))
  ].sort((a, b) => a.start - b.start);

  all.forEach(item => {
    const mins = durMin(item.start, item.end);
    rows.push({
      type: item.type,
      idx: item.idx,
      start: fmt(item.start),
      end: fmt(item.end),
      dur: fmtDur(mins)
    });
  });

  return rows;
}

function renderCard(day) {
  const date = new Date(day.date + 'T12:00:00');
  const dayName = DAYS_RU[date.getDay()];
  const dayNum = date.getDate();
  const month = MONTHS_RU[date.getMonth()];
  const year = date.getFullYear();

  // Totals
  const totalWake = day.wake_periods.reduce((s, w) => s + durMin(new Date(w.start), new Date(w.end)), 0);
  const totalNap = day.naps.reduce((s, n) => s + durMin(new Date(n.start), new Date(n.end)), 0);

  const segments = buildTimeline(day);
  const rows = buildRows(day);

  const segHTML = segments.map(seg =>
    `<div class="tl-seg tl-seg--${seg.type}" style="left:${seg.pct}%;width:${seg.width}%"></div>`
  ).join('');

  const rowsHTML = rows.map(r => {
    if (r.type === 'nap') {
      return `<div class="day-row day-row--nap">
        <span class="day-row__label"><span class="zz">z<sup>z</sup></span> ДС ${r.idx}</span>
        <span class="day-row__time">${r.start}–${r.end}</span>
        <span class="day-row__dur">${r.dur}</span>
      </div>`;
    } else {
      return `<div class="day-row day-row--wake">
        <span class="day-row__label">ВБ${r.idx}</span>
        <span class="day-row__time">${r.start}–${r.end}</span>
        <span class="day-row__dur">${r.dur}</span>
      </div>`;
    }
  }).join('');

  return `
  <div class="day-card">
    <div class="day-card__header">
      <div class="day-card__date-block">
        <div class="day-card__date"><span class="day-card__num">${dayNum} ${month}</span> <span class="day-card__year">${year}</span></div>
        <div class="day-card__weekday">${dayName}</div>
        <div class="day-card__updown">
          <span>↑ Подъем ${day.wake_up}</span>
          <span>↓ Отбой ${day.bedtime}</span>
        </div>
      </div>
      <div class="day-card__totals">
        <div class="day-card__total"><span class="day-card__total-label">СВБ</span><span class="day-card__total-val">${fmtDur(totalWake)}</span></div>
        <div class="day-card__total"><span class="day-card__total-label">СДС</span><span class="day-card__total-val">${fmtDur(totalNap)}</span></div>
      </div>
    </div>
    <div class="timeline">${segHTML}</div>
    <div class="day-rows">${rowsHTML}</div>
  </div>`;
}

async function initTracker() {
  const container = document.getElementById('tracker-cards');
  if (!container) return;

  try {
    const base = location.pathname.includes('/pages/') ? '../' : '';
    const res = await fetch(`${base}data/sleep_data.json`);
    const data = await res.json();

    // newest first
    const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
    container.innerHTML = sorted.map(renderCard).join('');
  } catch (e) {
    container.innerHTML = '<p class="tracker-error">Не удалось загрузить данные.</p>';
    console.error(e);
  }
}

document.addEventListener('DOMContentLoaded', initTracker);
