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
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors resize-none"
      />
      <div className="flex items-center justify-end gap-2">
        {saved && <span className="text-xs text-green-500">saved</span>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs bg-black text-white px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-50"
        >
          {saving ? "saving..." : "save notes"}
        </button>
      </div>
    </div>
  );
}
