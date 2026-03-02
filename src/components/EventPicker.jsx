import React from 'react'
import dayjs from 'dayjs'

export default function EventPicker({
  events,
  selectedEventId,
  setSelectedEventId,
  onApply,
  compact = false
}) {
  const [open, setOpen] = React.useState(!compact)

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 text-left"
      >
        <div>
          <p className="text-sm font-semibold text-gray-900">Pilih Event (Opsional)</p>
          <p className="text-[11px] text-gray-600">Klik untuk {open ? 'sembunyikan' : 'tampilkan'}.</p>
        </div>
        <div className="text-lg font-extrabold text-gray-600 select-none">
          {open ? '˅' : '>'}
        </div>
      </button>

      {open ? (
        <div className="mt-2">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
          >
            <option value="">-- pilih event --</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}{ev.start_time ? ` (${dayjs(ev.start_time).format('DD/MM HH:mm')})` : ''}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onApply}
            className="w-full mt-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-800 font-semibold rounded-xl text-sm border border-red-100 transition"
          >
            Jadikan Event sebagai Tujuan
          </button>
        </div>
      ) : null}
    </div>
  )
}