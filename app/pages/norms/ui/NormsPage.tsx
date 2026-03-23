import { useState } from 'react'

/* ══════════════════════════════════════════════════
   ИСТОЧНИКИ ДАННЫХ
   ──────────────────────────────────────────────────
   [science]  — рецензируемые исследования
   [clinical] — консенсус педиатрических консультантов по сну

   Общий сон (ОС), НС: NSF (Hirshkowitz 2015), AASM (Paruthi 2016),
     WHO 2019, Iglowstein 2003, Galland 2012
   Кол-во ДС, переходы: Weissbluth 1995 [science]
   ДС (длительность одного сна): Weissbluth 1995 для 2+ лет [science],
     младше 12м — [clinical]
   ВБ: [clinical] — НЕТ рецензируемых исследований
   СВБ: вычислено (24 − ОС)
   СДС: вычислено (ОС − НС)
   ══════════════════════════════════════════════════ */

interface NormRow {
  key: string
  abbr: string
  label: string
  color: string
  value: string
  sourceTag: 'science' | 'clinical' | 'computed'
  belowShort: string
  aboveShort: string
  belowDetails: { text: string; items: string[]; criticality: string; source: string }
  aboveDetails: { text: string; items: string[]; criticality: string; source: string }
}

interface MonthData {
  age: string
  note?: string
  rows: NormRow[]
}

/* ── Последствия нарушений (общие для всех возрастов) ── */

const C = {
  ww: {
    below: {
      text: 'Недостаточное давление сна (Process S) к моменту укладывания. Ребёнок физически не готов спать.',
      items: [
        'Split-ночи — пробуждение на 1–2 ч среди ночи',
        'Ранние подъёмы в 4–5 утра',
        'Засыпание дольше 30 мин',
        'Сопротивление укладыванию',
      ],
      criticality: 'Разовое: практически без последствий — сон сдвигается. Систематически (5+ дней): формируется привычка поздних укладываний и split-ночей.',
      source: 'Jenni & LeBourgeois 2006 (PMID: 16612214) [science — модель]; клинич. практика',
    },
    above: {
      text: 'Давление сна превышает порог → стресс-ответ оси HPA → кортизол и адреналин для поддержания бодрости.',
      items: [
        '«Второе дыхание» — ложная бодрость из-за кортизола',
        'Трудности с засыпанием несмотря на усталость',
        'Фрагментированный ночной сон',
        'Ночной кортизол повышен на 51%',
      ],
      criticality: 'Разовое: ребёнок может заснуть позже, но компенсирует на следующий день. 3+ дня подряд: кортизоловый цикл закрепляется, восстановление занимает 3–7 дней нормального режима.',
      source: 'Jenni & LeBourgeois 2006 (PMID: 16612214) [science]; Wailoo et al. 2003 (PMID: 14616905) [science]',
    },
  },
  svb: {
    below: {
      text: 'Мало бодрствования = много сна. Давление сна к ночи недостаточно.',
      items: [
        'Поверхностный и прерывистый ночной сон',
        'Поздний отбой — смещение циркадного ритма',
        'Избыточный дневной сон за счёт ночного',
      ],
      criticality: 'Разовое: без последствий. Систематически (1+ неделя): циркадный ритм смещается, отбой всё позже.',
      source: 'Nakagawa et al. 2016 (PMID: 27277329) [science]; Jenni & LeBourgeois 2006 [science]',
    },
    above: {
      text: 'Много бодрствования = мало сна. Нарастает кумулятивный дефицит.',
      items: [
        'Нарастающий «долг сна»',
        'Раздражительность и плаксивость',
        'Снижение внимания и обучаемости',
      ],
      criticality: 'Уже 3 ночи недосыпа на 1 ч дают измеримое ухудшение когнитивных функций (Sadeh 2003). Хронический недосып (недели) — влияет на развитие.',
      source: 'Sadeh et al. 2003 (PMID: 12705565) [science]; Touchette 2007 (PMID: 17910393) [science]',
    },
  },
  ds: {
    below: {
      text: 'Короткий сон (30–40 мин, один цикл) — ребёнок не добирает восстановительную фазу медленного сна.',
      items: [
        'Капризность после пробуждения — не отдохнул',
        'ВБ после сна будет короче (быстрее устанет)',
        'Компенсация — может попросить ещё один сон или раньше лечь на ночь',
      ],
      criticality: 'Разовое: нормально, ~30% снов у младенцев — короткие. Систематически (все сны короткие): накапливается дефицит дневного сна, нарастает перевозбуждение к вечеру.',
      source: 'Weissbluth 1995 (PMID: 7792496) [science]; клинич. практика',
    },
    above: {
      text: 'Длинный одиночный сон «съедает» давление сна. Особенно критично если сон поздний (после 16:00).',
      items: [
        'Позднее засыпание на ночь',
        'Сокращение ночного сна',
        'Если сон после 16:00 — эффект сильнее',
      ],
      criticality: 'Разовое: ничего страшного — ночь сдвинется на 30–60 мин. Систематически: формируется поздний режим, НС хронически укорачивается.',
      source: 'Nakagawa et al. 2016 (PMID: 27277329) [science]',
    },
  },
  naps: {
    below: {
      text: 'Меньше снов = длиннее ВБ. Если ребёнок не готов к переходу, ВБ превышает возрастную норму.',
      items: [
        'ВБ слишком длинное → кортизол',
        'Капризность к вечеру',
        'Поверхностный ночной сон',
      ],
      criticality: 'Разовое (один день без сна): измеримые эффекты — снижение позитивных эмоций на 34%, рост негативных на 31% (LeBourgeois 2012). Но эффект временный — проходит после нормального сна. Систематически: хроническое перевозбуждение, поведенческие проблемы.',
      source: 'LeBourgeois et al. 2012 (PMID: 21988087) [science]; Miller & LeBourgeois 2015 (PMID: 25394169) [science]',
    },
    above: {
      text: 'Больше снов = короче каждый сон и короче ВБ. Давления сна не хватает для длинных снов и ночи.',
      items: [
        'Все сны короткие (30–40 мин)',
        'Долгое засыпание вечером',
        'Может быть знаком: пора переходить на меньшее число снов',
      ],
      criticality: 'Не критично как таковое — ребёнок просто спит чаще и короче. Но если это мешает ночному сну систематически — стоит попробовать убрать один сон.',
      source: 'Weissbluth 1995 (PMID: 7792496) [science]; клинич. практика',
    },
  },
  ns: {
    below: {
      text: 'Дефицит ночного сна влияет на развитие мозга. Порог «короткого сна» в исследованиях: <10 ч/ночь до 6 лет.',
      items: [
        'Гиперактивность и импульсивность (p = 0,001)',
        'Снижение словарного запаса (p = 0,002)',
        'Снижение пространственных способностей (p = 0,004)',
        'Повышенный риск ожирения — OR 2,62',
        'Эффекты сохраняются до школьного возраста',
      ],
      criticality: '1–2 плохие ночи: ребёнок восстановится за 1–2 нормальных ночи. 3 ночи подряд (−1 ч): уже измеримое ухудшение нейрофункций (Sadeh 2003). Хронически (<10 ч до 6 лет): связано с когнитивными и поведенческими проблемами. <11 ч до 3,5 лет: повышенный риск ожирения и гиперактивности к 6 годам.',
      source: 'Touchette 2007 (PMID: 17910393) [science]; Touchette 2009 (PMID: 19185519) [science]; Taveras 2014 (PMID: 24843068) [science]; Sadeh 2003 (PMID: 12705565) [science]',
    },
    above: {
      text: 'Длинный НС обычно не проблема. Но значительное превышение + вялость днём — повод для врача.',
      items: [
        'Чаще всего — вариант нормы',
        'Проверить: не фрагментирован ли сон (частые пробуждения)',
        'Исключить апноэ при храпе',
        'При дневной вялости — консультация педиатра',
      ],
      criticality: 'Не является проблемой само по себе. Обратить внимание если: сон >13 ч + вялость, или началось внезапно (может быть признак болезни).',
      source: 'Hirshkowitz et al. 2015 (PMID: 29073412) [science]; Galland 2012 (PMID: 21784676) [science]',
    },
  },
  sds: {
    below: {
      text: 'Мало дневного сна суммарно — накапливается дефицит к вечеру.',
      items: [
        'Перевозбуждение к ночи (кортизол)',
        'Капризность во второй половине дня',
        'Ухудшение ночного сна (парадокс)',
      ],
      criticality: '1 день: эффект мягкий, компенсируется ранним отбоем. 3–5 дней: нарастающее перевозбуждение, ночной сон начинает страдать. Недели: порочный круг недосыпа.',
      source: 'Jenni & LeBourgeois 2006 (PMID: 16612214) [science]; Weissbluth 1995 [science]',
    },
    above: {
      text: 'Много дневного сна суммарно «забирает» часы у ночного.',
      items: [
        'Позднее засыпание вечером',
        'Короткий ночной сон',
        'Поздние дневные сны (после 16:00) усиливают эффект',
      ],
      criticality: 'Разовое: отбой сдвинется на 30–60 мин. Систематически: хронический сдвиг циркадного ритма, НС укорачивается.',
      source: 'Nakagawa et al. 2016 (PMID: 27277329) [science]',
    },
  },
  os: {
    below: {
      text: 'Хронический общий недосып в раннем возрасте связан с нарушениями развития.',
      items: [
        'Когнитивные нарушения (словарный запас, пространственное мышление)',
        'Поведенческие проблемы (гиперактивность, импульсивность)',
        'Повышенный риск ожирения',
        'Ослабление иммунной системы',
      ],
      criticality: 'Пороги из исследований: <12 ч/сутки в младенчестве → риск ожирения к 3 годам (OR 2,04, Taveras 2008). <11 ч/ночь до 3,5 лет → гиперактивность и ожирение к 6 годам (Touchette 2009). Это хронические паттерны (месяцы), не разовые события.',
      source: 'Taveras 2008 (PMID: 18391138) [science]; Touchette 2009 (PMID: 19185519) [science]; Schlieber & Han 2021 (PMID: 33825621) [science]',
    },
    above: {
      text: 'Значительное превышение нормы — может указывать на проблемы со здоровьем.',
      items: [
        'Инфекция или воспалительный процесс',
        'Анемия, нарушения щитовидной железы',
        'Низкое качество сна (частые микропробуждения)',
        'Обструктивное апноэ → невосстановительный сон',
      ],
      criticality: 'Не критично если ребёнок бодр и активен в периоды бодрствования. Повод для врача: внезапное увеличение сна на 2+ ч, или сон больше нормы + вялость + плохой аппетит.',
      source: 'Hirshkowitz et al. 2015 (PMID: 29073412) [science]',
    },
  },
}

function makeRows(d: {
  ww: string; svb: string; ds: string; naps: string; sds: string; ns: string; os: string
}): NormRow[] {
  return [
    {
      key: 'ww', abbr: 'ВБ', label: 'Время бодрствования (одно окно)', color: '#f5c842',
      value: d.ww, sourceTag: 'clinical',
      belowShort: 'Split-ночи, ранние подъёмы',
      aboveShort: 'Кортизол, перевозбуждение',
      belowDetails: C.ww.below, aboveDetails: C.ww.above,
    },
    {
      key: 'svb', abbr: 'СВБ', label: 'Суммарное бодрствование за сутки', color: '#f5c842',
      value: d.svb, sourceTag: 'computed',
      belowShort: 'Мало устаёт → плохой НС',
      aboveShort: 'Дефицит сна нарастает',
      belowDetails: C.svb.below, aboveDetails: C.svb.above,
    },
    {
      key: 'ds', abbr: 'ДС', label: 'Один дневной сон (длительность)', color: '#54c8c8',
      value: d.ds, sourceTag: 'clinical',
      belowShort: 'Не отдохнул, быстро устанет',
      aboveShort: 'Поздний отбой, короткий НС',
      belowDetails: C.ds.below, aboveDetails: C.ds.above,
    },
    {
      key: 'naps', abbr: 'Кол-во ДС', label: 'Количество дневных снов', color: '#54c8c8',
      value: d.naps, sourceTag: 'science',
      belowShort: 'Длинное ВБ → перевозбуждение',
      aboveShort: 'Короткие сны, плохой НС',
      belowDetails: C.naps.below, aboveDetails: C.naps.above,
    },
    {
      key: 'sds', abbr: 'СДС', label: 'Сумма дневных снов', color: '#54c8c8',
      value: d.sds, sourceTag: 'computed',
      belowShort: 'Перевозбуждение к вечеру',
      aboveShort: 'Забирает часы у НС',
      belowDetails: C.sds.below, aboveDetails: C.sds.above,
    },
    {
      key: 'ns', abbr: 'НС', label: 'Ночной сон', color: '#7c83fd',
      value: d.ns, sourceTag: 'science',
      belowShort: 'Когнитивные и поведенческие проблемы',
      aboveShort: 'Обычно норма',
      belowDetails: C.ns.below, aboveDetails: C.ns.above,
    },
    {
      key: 'os', abbr: 'ОС', label: 'Общий сон за сутки (СДС + НС)', color: '#7c83fd',
      value: d.os, sourceTag: 'science',
      belowShort: 'Влияет на развитие и здоровье',
      aboveShort: 'Возможны медицинские причины',
      belowDetails: C.os.below, aboveDetails: C.os.above,
    },
  ]
}

/* ── Данные по месяцам ──
   Математическая сверка:
   • ОС = НС + СДС (всегда)
   • СВБ = 24 − ОС (всегда)
   • СДС ≈ ДС × Кол-во ДС (приблизительно, сны разной длины)
   • ВБ_средн × (Кол-во ДС + 1) ≈ дневное бодрствование

   Пример 5 мес: НС 10–11, СДС 3–4.5, ОС 13–15.5, СВБ 8.5–11
   3 сна × 1–1.5ч ≈ 3–4.5ч (СДС ✓)
   4 ВБ × средн 2.25ч = 9ч (попадает в СВБ ✓)
*/

const MONTHS: MonthData[] = [
  {
    age: '0–1 мес',
    note: 'Циркадный ритм не сформирован. Сон полифазный, нет чёткого разделения дня и ночи. Данные НС условны — сон фрагментарный.',
    rows: makeRows({ ww: '30–60 мин', svb: '7–10 ч', ds: '15 мин – 3 ч', naps: '4–8', sds: '6–9 ч', ns: '8–9 ч', os: '14–17 ч' }),
  },
  {
    age: '2 мес',
    note: 'Суточная ритмика начинает проявляться. Ночные пробуждения до 3–4 раз.',
    rows: makeRows({ ww: '45 мин – 1,5 ч', svb: '7–10 ч', ds: '30 мин – 2 ч', naps: '4–5', sds: '5–7 ч', ns: '8,5–10 ч', os: '14–17 ч' }),
  },
  {
    age: '3 мес',
    note: 'Циркадный ритм формируется к 10–12 неделям (Jenni & LeBourgeois 2006).',
    rows: makeRows({ ww: '1–1,75 ч', svb: '8–10 ч', ds: '30 мин – 2 ч', naps: '3–4', sds: '4,5–5,5 ч', ns: '9–10,5 ч', os: '14–16 ч' }),
  },
  {
    age: '4 мес',
    note: '«Регресс 4 мес» — сон перестраивается на взрослую архитектуру циклов.',
    rows: makeRows({ ww: '1,25–2,25 ч', svb: '8,5–10 ч', ds: '30 мин – 2 ч', naps: '3–4', sds: '3,5–5 ч', ns: '10–11,5 ч', os: '14–15,5 ч' }),
  },
  {
    age: '5 мес',
    note: 'Консолидация НС. Многие дети спят отрезками по 5–6 ч.',
    rows: makeRows({ ww: '1,75–2,75 ч', svb: '8,5–11 ч', ds: '40 мин – 1,5 ч', naps: '3', sds: '3–4,5 ч', ns: '10–11 ч', os: '13–15,5 ч' }),
  },
  {
    age: '6 мес',
    note: '≥90% детей спят всю ночь. Средний ОС — 14,2 ч (Iglowstein 2003). Начинается переход с 3 на 2 сна.',
    rows: makeRows({ ww: '2–3 ч', svb: '9,5–11 ч', ds: '40 мин – 1,5 ч', naps: '2–3', sds: '2,5–3,5 ч', ns: '10–11,5 ч', os: '13–14,5 ч' }),
  },
  {
    age: '7 мес',
    note: 'Третий сон укорачивается. Если третий сон <30 мин и мешает отбою — пора убирать.',
    rows: makeRows({ ww: '2–3,25 ч', svb: '9,5–11 ч', ds: '40 мин – 1,5 ч', naps: '2–3', sds: '2,5–3,5 ч', ns: '10–11,5 ч', os: '13–14,5 ч' }),
  },
  {
    age: '8 мес',
    note: 'Переход на 2 сна. Тревога разлуки может вызвать временные ночные пробуждения.',
    rows: makeRows({ ww: '2,25–3,5 ч', svb: '10–11 ч', ds: '1–1,5 ч', naps: '2', sds: '2,5–3 ч', ns: '10,5–11,5 ч', os: '13–14 ч' }),
  },
  {
    age: '9 мес',
    note: 'Два сна устанавливаются (Weissbluth 1995). 20–30% детей продолжают просыпаться ночью.',
    rows: makeRows({ ww: '2,5–3,75 ч', svb: '10–11,5 ч', ds: '1–1,5 ч', naps: '2', sds: '2–3 ч', ns: '10,5–11,5 ч', os: '12,5–14 ч' }),
  },
  {
    age: '10 мес',
    rows: makeRows({ ww: '2,75–4 ч', svb: '10–11,5 ч', ds: '1–1,5 ч', naps: '2', sds: '2–3 ч', ns: '10,5–11,5 ч', os: '12,5–14 ч' }),
  },
  {
    age: '11 мес',
    rows: makeRows({ ww: '3–4,25 ч', svb: '10,5–11,5 ч', ds: '1–1,25 ч', naps: '2', sds: '2–2,5 ч', ns: '10,5–11,5 ч', os: '12,5–13,5 ч' }),
  },
  {
    age: '12 мес',
    note: 'НС в среднем 11,7 ч (Iglowstein 2003). Средний ОС — 12,8 ч (Galland 2012).',
    rows: makeRows({ ww: '3–4,5 ч', svb: '10,5–12 ч', ds: '1–1,25 ч', naps: '2', sds: '2–2,5 ч', ns: '10,5–11,5 ч', os: '12–13,5 ч' }),
  },
  {
    age: '13 мес',
    note: 'Некоторые дети начинают переход на 1 сон.',
    rows: makeRows({ ww: '3–5 ч', svb: '10,5–12 ч', ds: '1–2,5 ч', naps: '1–2', sds: '2–2,5 ч', ns: '10,5–11,5 ч', os: '12–13,5 ч' }),
  },
  {
    age: '14 мес',
    rows: makeRows({ ww: '3,25–5 ч', svb: '10,5–12 ч', ds: '1–2,5 ч', naps: '1–2', sds: '2–2,5 ч', ns: '10,5–11,5 ч', os: '12–13,5 ч' }),
  },
  {
    age: '15 мес',
    note: 'Переход на 1 сон: 15–18 мес (Weissbluth 1995). При 1 сне — он длиннее (1,5–2,5 ч).',
    rows: makeRows({ ww: '3,5–5,5 ч', svb: '10,5–12,5 ч', ds: '1–2,5 ч', naps: '1–2', sds: '1,5–2,5 ч', ns: '10–11,5 ч', os: '11,5–13,5 ч' }),
  },
  {
    age: '16 мес',
    rows: makeRows({ ww: '4,5–6 ч', svb: '10,5–12,5 ч', ds: '1,5–2,5 ч', naps: '1', sds: '1,5–2,5 ч', ns: '10–11,5 ч', os: '11,5–13,5 ч' }),
  },
  {
    age: '17 мес',
    rows: makeRows({ ww: '4,5–6,5 ч', svb: '11–12,5 ч', ds: '1,5–2 ч', naps: '1', sds: '1,5–2 ч', ns: '10–11,5 ч', os: '11,5–13 ч' }),
  },
  {
    age: '18 мес',
    note: 'Один послеобеденный сон закрепляется. Модальная длительность ~2 ч (Weissbluth 1995). 96,4% детей ещё спят днём.',
    rows: makeRows({ ww: '4,5–7 ч', svb: '11–12,5 ч', ds: '1,5–2 ч', naps: '1', sds: '1,5–2 ч', ns: '10–11,5 ч', os: '11,5–13 ч' }),
  },
  {
    age: '19 мес',
    rows: makeRows({ ww: '5–7 ч', svb: '11–12,5 ч', ds: '1,5–2 ч', naps: '1', sds: '1,5–2 ч', ns: '10–11 ч', os: '11,5–13 ч' }),
  },
  {
    age: '20 мес',
    rows: makeRows({ ww: '5–7 ч', svb: '11–12,5 ч', ds: '1,5–2 ч', naps: '1', sds: '1,5–2 ч', ns: '10–11 ч', os: '11,5–13 ч' }),
  },
  {
    age: '21 мес',
    rows: makeRows({ ww: '5–7 ч', svb: '11–12,5 ч', ds: '1,5–2 ч', naps: '1', sds: '1,5–2 ч', ns: '10–11 ч', os: '11,5–13 ч' }),
  },
  {
    age: '22 мес',
    rows: makeRows({ ww: '5–7 ч', svb: '11–13 ч', ds: '1–2 ч', naps: '1', sds: '1–2 ч', ns: '10–11 ч', os: '11–13 ч' }),
  },
  {
    age: '23 мес',
    rows: makeRows({ ww: '5–7 ч', svb: '11–13 ч', ds: '1–2 ч', naps: '1', sds: '1–2 ч', ns: '10–11 ч', os: '11–13 ч' }),
  },
  {
    age: '24 мес',
    note: 'Ночные пробуждения 0–2,5 за ночь (Galland 2012). AASM: 11–14 ч общего сна.',
    rows: makeRows({ ww: '5–7 ч', svb: '11–13 ч', ds: '1–2 ч', naps: '1', sds: '1–2 ч', ns: '10–11 ч', os: '11–13 ч' }),
  },
]

const SOURCES = [
  'Hirshkowitz M, et al. (2015). NSF sleep time duration recommendations. Sleep Health, 1(4):233-243. PMID: 29073398',
  'Paruthi S, et al. (2016). AASM consensus on recommended sleep. JCSM, 12(6):785-786. PMID: 27250809',
  'Galland BC, et al. (2012). Normal sleep patterns in infants and children. Sleep Med Rev, 16(3):213-222. PMID: 21784676',
  'Iglowstein I, et al. (2003). Sleep duration from infancy to adolescence. Pediatrics, 111(2):302-307. PMID: 12563055',
  'Mindell JA, et al. (2010). Cross-cultural differences in infant/toddler sleep. Sleep Med, 11(3):274-280. PMID: 20138578',
  'WHO (2019). Guidelines on physical activity, sedentary behaviour and sleep for children under 5. WHO/NMH/PND/19.2',
  'Weissbluth M (1995). Naps in children: 6 months–7 years. Sleep, 18(2):82-87. PMID: 7792496',
  'Jenni OG, LeBourgeois MK (2006). Understanding sleep–wake behavior in children. Curr Opin Psychiatry, 19(3):282-287. PMID: 16612214',
  'Touchette E, et al. (2007). Sleep duration and behavioral/cognitive functioning. Sleep, 30(9):1213-1219. PMID: 17910393',
  'Touchette E, et al. (2009). Risk factors and consequences of early childhood dyssomnias. Sleep Med Rev, 13(5):355-361. PMID: 19185519',
  'Nakagawa M, et al. (2016). Daytime nap controls toddlers\' nighttime sleep. Sci Rep, 6:27246. PMID: 27277329',
  'Taveras EM, et al. (2008). Short sleep duration in infancy and risk of childhood overweight. Arch Pediatr Adolesc Med, 162(4):305-311. PMID: 18391138',
  'Taveras EM, et al. (2014). Chronic sleep curtailment and adiposity. Pediatrics, 133(6):1013-1022. PMID: 24843068',
  'Sadeh A, et al. (2003). The effects of sleep restriction and extension on school-age children. Child Dev, 74(2):444-455. PMID: 12705565',
  'LeBourgeois MK, et al. (2012). The relationship between reported sleep quality and sleep hygiene in Italian children. Pediatrics, 130(2):e382-e389. PMID: 21988087',
  'Miller AL, LeBourgeois MK (2015). Sleep deprivation and emotion regulation in toddlers. J Sleep Res, 24(5):524-531. PMID: 25394169',
  'Wailoo MP, et al. (2003). Disturbed nights and cortisol excretion in infants. Arch Dis Child, 88:A14. PMID: 14616905',
  'Schlieber M, Han J (2021). Role of sleep in young children\'s development. J Genet Psychol, 182(4):205-217. PMID: 33825621',
]

const SOURCE_TAG_LABELS: Record<string, { text: string; color: string }> = {
  science: { text: 'исслед.', color: '#27ae60' },
  clinical: { text: 'практика', color: '#e67e22' },
  computed: { text: 'расчёт', color: '#8e44ad' },
}

/* ══════════════════════════════════════════════════
   КОМПОНЕНТ
   ══════════════════════════════════════════════════ */

interface ModalData {
  title: string
  direction: 'below' | 'above'
  details: { text: string; items: string[]; criticality: string; source: string }
}

export default function NormsPage() {
  const [selectedMonth, setSelectedMonth] = useState(0)
  const [modal, setModal] = useState<ModalData | null>(null)

  const data = MONTHS[selectedMonth]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Нормы сна</h1>
      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
        Общий сон, НС, кол-во снов — из рецензируемых исследований (NSF, AASM, WHO).
        ВБ, длительность одного ДС — из клинической практики консультантов по сну.
        Индивидуальная вариация ±1–2,5 ч.
      </p>

      {/* Selector */}
      <div className="relative">
        <label htmlFor="month-select" className="block text-sm font-medium mb-1.5 text-[var(--color-text-secondary)]">
          Возраст ребёнка
        </label>
        <select
          id="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-base font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/50 transition-colors"
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i}>{m.age}</option>
          ))}
        </select>
        <div className="absolute right-4 top-[42px] pointer-events-none text-[var(--color-text-secondary)]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-2xl overflow-hidden shadow-md">
        <div className="bg-[#6c63d5] px-5 py-4">
          <div className="text-white font-bold text-lg">{data.age}</div>
          <div className="text-white/70 text-sm mt-0.5">Нормы сна</div>
        </div>

        {/* Desktop header */}
        <div className="hidden sm:grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_minmax(0,1.5fr)_minmax(0,1.5fr)] bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-2.5 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
          <span>Показатель</span>
          <span className="text-center">Норма</span>
          <span className="text-center">&#8595; Ниже</span>
          <span className="text-center">&#8593; Выше</span>
        </div>

        {/* Rows */}
        <div className="bg-[var(--color-surface)] divide-y divide-[var(--color-border)]/30">
          {data.rows.map((row) => {
            const tag = SOURCE_TAG_LABELS[row.sourceTag]
            return (
              <div key={row.key}>
                {/* Desktop */}
                <div className="hidden sm:grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_minmax(0,1.5fr)_minmax(0,1.5fr)] items-center px-4 py-3 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm">{row.abbr}</span>
                        <span
                          className="text-[9px] px-1 py-0.5 rounded font-medium leading-none"
                          style={{ backgroundColor: tag.color + '20', color: tag.color }}
                        >{tag.text}</span>
                      </div>
                      <div className="text-[11px] text-[var(--color-text-secondary)] truncate">{row.label}</div>
                    </div>
                  </div>
                  <div className="text-center font-bold text-sm">{row.value}</div>
                  <button
                    onClick={() => setModal({ title: `${row.abbr} ниже нормы`, direction: 'below', details: row.belowDetails })}
                    className="text-center text-xs text-[var(--color-text-secondary)] hover:text-[#e17055] transition-colors cursor-pointer group px-1 py-1 rounded-lg hover:bg-[#e17055]/10"
                  >
                    <span className="group-hover:underline">{row.belowShort}</span>
                    <span className="ml-1 opacity-40 group-hover:opacity-100 text-[10px]">&#9432;</span>
                  </button>
                  <button
                    onClick={() => setModal({ title: `${row.abbr} выше нормы`, direction: 'above', details: row.aboveDetails })}
                    className="text-center text-xs text-[var(--color-text-secondary)] hover:text-[#e17055] transition-colors cursor-pointer group px-1 py-1 rounded-lg hover:bg-[#e17055]/10"
                  >
                    <span className="group-hover:underline">{row.aboveShort}</span>
                    <span className="ml-1 opacity-40 group-hover:opacity-100 text-[10px]">&#9432;</span>
                  </button>
                </div>

                {/* Mobile */}
                <div className="sm:hidden px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                      <span className="font-bold text-sm">{row.abbr}</span>
                      <span
                        className="text-[9px] px-1 py-0.5 rounded font-medium leading-none shrink-0"
                        style={{ backgroundColor: tag.color + '20', color: tag.color }}
                      >{tag.text}</span>
                    </div>
                    <span className="font-bold text-sm shrink-0 ml-2">{row.value}</span>
                  </div>
                  <div className="text-[11px] text-[var(--color-text-secondary)] pl-[18px]">{row.label}</div>
                  <div className="flex gap-2 pl-[18px]">
                    <button
                      onClick={() => setModal({ title: `${row.abbr} ниже нормы`, direction: 'below', details: row.belowDetails })}
                      className="flex-1 text-[11px] text-[var(--color-text-secondary)] bg-[var(--color-bg)] rounded-lg px-2 py-1.5 text-left hover:text-[#e17055] transition-colors"
                    >
                      <span className="text-[#e17055]/70 font-medium">&#8595;</span> {row.belowShort}
                    </button>
                    <button
                      onClick={() => setModal({ title: `${row.abbr} выше нормы`, direction: 'above', details: row.aboveDetails })}
                      className="flex-1 text-[11px] text-[var(--color-text-secondary)] bg-[var(--color-bg)] rounded-lg px-2 py-1.5 text-left hover:text-[#e17055] transition-colors"
                    >
                      <span className="text-[#e17055]/70 font-medium">&#8593;</span> {row.aboveShort}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {data.note && (
          <div className="bg-[var(--color-surface)] border-t border-[var(--color-border)]/30 px-5 py-3">
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              <span className="font-medium text-[var(--color-text)]">Примечание:</span> {data.note}
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[11px] text-[var(--color-text-secondary)]">
        {Object.entries(SOURCE_TAG_LABELS).map(([key, { text, color }]) => (
          <span key={key} className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            {text === 'исслед.' && 'Рецензируемые исследования'}
            {text === 'практика' && 'Клиническая практика'}
            {text === 'расчёт' && 'Вычислено из других показателей'}
          </span>
        ))}
      </div>

      {/* Sources */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors list-none flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-open:rotate-90">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Научные источники ({SOURCES.length})
        </summary>
        <ol className="mt-3 space-y-2 pl-4">
          {SOURCES.map((s, i) => (
            <li key={i} className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {i + 1}. {s}
            </li>
          ))}
        </ol>
      </details>

      <div className="h-4" />

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-[var(--color-surface)] w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`px-5 py-4 border-b border-[var(--color-border)]/30 flex items-start justify-between gap-3 ${
              modal.direction === 'below' ? 'bg-[#e17055]/10' : 'bg-[#fdcb6e]/10'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{modal.direction === 'below' ? '↓' : '↑'}</span>
                <h2 className="font-bold text-base">{modal.title}</h2>
              </div>
              <button
                onClick={() => setModal(null)}
                className="text-xl shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-border)] transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {modal.details.text}
              </p>
              <div className="space-y-2">
                {modal.details.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm">
                    <span className="text-[var(--color-text-secondary)] mt-0.5 shrink-0">&#x2022;</span>
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>

              {/* Criticality block */}
              <div className="rounded-xl bg-[var(--color-bg)] px-4 py-3">
                <div className="text-xs font-semibold text-[var(--color-text)] mb-1">Насколько это критично?</div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {modal.details.criticality}
                </p>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[var(--color-border)]/30">
              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                {modal.details.source}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
