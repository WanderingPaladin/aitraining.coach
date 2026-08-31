'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import type { TimeSlot } from '../../lib/api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type MonthView = {
  year: number;
  month: number;
};

type CalendarCell = {
  key: string;
  day: number;
  inMonth: boolean;
  available: boolean;
  past: boolean;
};

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function parseDateKey(key: string): MonthView & { day: number } {
  const [year, month, day] = key.split('-').map(Number);
  return { year, month, day };
}

function monthIndex(view: MonthView): number {
  return view.year * 12 + view.month;
}

function shiftMonth(view: MonthView, delta: number): MonthView {
  const date = new Date(view.year, view.month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

function formatDateKeyInZone(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

export function slotDateKey(slot: TimeSlot): string {
  if (slot.local.startsAt) {
    return slot.local.startsAt.slice(0, 10);
  }
  return formatDateKeyInZone(new Date(slot.startsAt), slot.local.timezone);
}

function formatMonthTitle(view: MonthView): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(view.year, view.month - 1, 1));
}

function formatLongDate(key: string): string {
  const { year, month, day } = parseDateKey(key);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

function formatShortDate(key: string): string {
  const { year, month, day } = parseDateKey(key);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(year, month - 1, day));
}

function formatClock(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeStyle: 'short',
    timeZone: timezone,
  }).format(new Date(iso));
}

function buildMonthGrid(view: MonthView, availableDates: Set<string>, today: string): CalendarCell[] {
  const firstWeekday = new Date(view.year, view.month - 1, 1).getDay();
  const daysInMonth = new Date(view.year, view.month, 0).getDate();
  const prevMonthDays = new Date(view.year, view.month - 1, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    const day = prevMonthDays - firstWeekday + index + 1;
    const previous = shiftMonth(view, -1);
    const key = dateKey(previous.year, previous.month, day);
    cells.push({
      key,
      day,
      inMonth: false,
      available: availableDates.has(key),
      past: key < today,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = dateKey(view.year, view.month, day);
    cells.push({
      key,
      day,
      inMonth: true,
      available: availableDates.has(key),
      past: key < today,
    });
  }

  const trailing = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= trailing; day += 1) {
    const next = shiftMonth(view, 1);
    const key = dateKey(next.year, next.month, day);
    cells.push({
      key,
      day,
      inMonth: false,
      available: availableDates.has(key),
      past: key < today,
    });
  }

  return cells;
}

type BookingSchedulerProps = {
  slots: TimeSlot[];
  timezone: string;
  selectedSlot: string;
  onSelectSlot: (startsAt: string) => void;
};

export default function BookingScheduler({
  slots,
  timezone,
  selectedSlot,
  onSelectSlot,
}: BookingSchedulerProps) {
  const today = formatDateKeyInZone(new Date(), timezone);
  const slotsByDate = useMemo(() => {
    const groups = new Map<string, TimeSlot[]>();
    for (const slot of slots) {
      const key = slotDateKey(slot);
      const list = groups.get(key) ?? [];
      list.push(slot);
      groups.set(key, list);
    }
    for (const list of groups.values()) {
      list.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    }
    return groups;
  }, [slots]);

  const availableDates = useMemo(() => new Set(slotsByDate.keys()), [slotsByDate]);
  const sortedDates = useMemo(() => [...availableDates].sort(), [availableDates]);
  const minView = sortedDates[0] ? parseDateKey(sortedDates[0]) : null;
  const maxView = sortedDates[sortedDates.length - 1]
    ? parseDateKey(sortedDates[sortedDates.length - 1])
    : null;

  const [selectedDate, setSelectedDate] = useState('');
  const [view, setView] = useState<MonthView>(() => {
    const first = sortedDates[0];
    if (first) {
      const parsed = parseDateKey(first);
      return { year: parsed.year, month: parsed.month };
    }
    const now = parseDateKey(today);
    return { year: now.year, month: now.month };
  });

  useEffect(() => {
    if (sortedDates.length === 0) {
      if (selectedDate) {
        setSelectedDate('');
      }
      return;
    }
    if (selectedDate && availableDates.has(selectedDate)) {
      return;
    }
    const match = selectedSlot ? slots.find((slot) => slot.startsAt === selectedSlot) : undefined;
    const next = match ? slotDateKey(match) : sortedDates[0];
    setSelectedDate(next);
    const parsed = parseDateKey(next);
    setView({ year: parsed.year, month: parsed.month });
  }, [availableDates, selectedDate, selectedSlot, slots, sortedDates]);

  const cells = useMemo(
    () => buildMonthGrid(view, availableDates, today),
    [availableDates, today, view],
  );
  const daySlots = selectedDate ? (slotsByDate.get(selectedDate) ?? []) : [];
  const chosenSlot = daySlots.find((slot) => slot.startsAt === selectedSlot) ?? null;
  const canGoPrev = Boolean(minView && monthIndex(view) > monthIndex(minView));
  const canGoNext = Boolean(maxView && monthIndex(view) < monthIndex(maxView));

  function selectDate(cell: CalendarCell) {
    if (cell.past || !cell.available) {
      return;
    }
    setSelectedDate(cell.key);
    const parsed = parseDateKey(cell.key);
    setView({ year: parsed.year, month: parsed.month });
    if (selectedSlot) {
      const stillOnDay = (slotsByDate.get(cell.key) ?? []).some((slot) => slot.startsAt === selectedSlot);
      if (!stillOnDay) {
        onSelectSlot('');
      }
    }
  }

  return (
    <div className="book-scheduler">
      <section className="book-cal" aria-label="Select a date">
        <div className="book-section-label">1. Select a Date</div>
        <div className="book-cal-head">
          <button
            type="button"
            className="book-cal-nav"
            aria-label="Previous month"
            disabled={!canGoPrev}
            onClick={() => setView((current) => shiftMonth(current, -1))}
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <h4 className="book-cal-title">{formatMonthTitle(view)}</h4>
          <button
            type="button"
            className="book-cal-nav"
            aria-label="Next month"
            disabled={!canGoNext}
            onClick={() => setView((current) => shiftMonth(current, 1))}
          >
            <ChevronRight size={18} strokeWidth={2} />
          </button>
        </div>
        <div className="book-cal-weekdays" aria-hidden="true">
          {WEEKDAYS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="book-cal-grid" role="grid" aria-label={formatMonthTitle(view)}>
          {cells.map((cell) => {
            const selected = cell.key === selectedDate;
            const isToday = cell.key === today;
            const selectable = cell.available && !cell.past;
            const className = [
              'book-cal-day',
              cell.inMonth ? '' : 'is-outside',
              cell.past ? 'is-past' : '',
              selectable ? 'is-available' : 'is-unavailable',
              selected ? 'is-selected' : '',
              isToday && selectable && !selected ? 'is-today' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <button
                key={cell.key}
                type="button"
                className={className}
                disabled={!selectable}
                aria-pressed={selected}
                aria-current={isToday ? 'date' : undefined}
                aria-label={`${formatLongDate(cell.key)}${selectable ? '' : ', unavailable'}`}
                onClick={() => selectDate(cell)}
              >
                <span>{cell.day}</span>
                {selectable && !selected ? <i className="book-cal-dot" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="book-times" aria-label="Choose a time">
        <div className="book-section-label">2. Choose a Time</div>
        {selectedDate ? (
          <h4 className="book-times-date">{formatLongDate(selectedDate)}</h4>
        ) : (
          <p className="apply-muted">Select a date to see open times.</p>
        )}
        <div className="slot-grid" role="radiogroup" aria-label="Available times">
          {daySlots.map((slot) => {
            const selected = selectedSlot === slot.startsAt;
            return (
              <label key={slot.startsAt} className={selected ? 'selected' : ''}>
                <input
                  type="radio"
                  name="slot"
                  value={slot.startsAt}
                  checked={selected}
                  onChange={() => onSelectSlot(slot.startsAt)}
                />
                {formatClock(slot.startsAt, slot.local.timezone)}
              </label>
            );
          })}
        </div>
        {selectedDate && daySlots.length === 0 ? (
          <p className="apply-muted">No open times on this date. Choose another day.</p>
        ) : null}
      </section>

      {chosenSlot ? (
        <div className="book-selected" aria-live="polite">
          <CalendarCheck size={18} strokeWidth={2} aria-hidden="true" />
          <div>
            <small>Selected</small>
            <strong>{formatShortDate(selectedDate)}</strong>
            <span>
              {formatClock(chosenSlot.startsAt, chosenSlot.local.timezone)}
              {' – '}
              {formatClock(chosenSlot.endsAt, chosenSlot.local.timezone)}
            </span>
            <em>Microsoft Teams</em>
          </div>
        </div>
      ) : null}
    </div>
  );
}
