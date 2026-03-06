"use client";

import { useState } from "react";

export default function AttendeeNotes({
  attendeeId,
  defaultNotes,
}: {
  attendeeId: string;
  defaultNotes: string;
}) {
  const [notes, setNotes] = useState(defaultNotes);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/attendees/${attendeeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setSaved(false);
        }}
        placeholder="add internal notes about this attendee..."
        rows={3}
        className="glass-input rounded-2xl text-[10px] uppercase font-bold tracking-[0.2em] resize-none"
      />
      <div className="flex items-center justify-end gap-4 mt-2">
        {saved && <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-accent">SAVED</span>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-[10px] uppercase font-bold tracking-[0.2em] text-dark bg-accent px-5 py-2.5 rounded-full cursor-pointer disabled:opacity-50 hover:shadow-[0_0_15px_rgba(198,255,0,0.3)] hover:-translate-y-0.5 transition-all shadow-sm"
        >
          {saving ? "SAVING..." : "SAVE NOTES"}
        </button>
      </div>
    </div>
  );
}
