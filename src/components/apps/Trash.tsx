"use client";

import { useOS } from "../os/OSContext";
import { TrashCan } from "../os/apps";

export default function TrashApp() {
  const os = useOS();

  if (os.trash.length === 0)
    return (
      <div className="grid h-full place-items-center p-8 text-center">
        <div>
          <TrashCan size={72} className="mx-auto opacity-70" />
          <p className="mt-3 font-medium">Trash is empty</p>
          <p className="mt-1 text-sm text-muted">Drag any sticker, widget or desktop icon onto the Trash in the dock.</p>
          {os.gone.size > 0 && (
            <p className="mt-3 text-xs text-muted">
              {os.gone.size} item{os.gone.size > 1 ? "s" : ""} gone forever (well — until you reload) 🫡
            </p>
          )}
        </div>
      </div>
    );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2 text-[13px]">
        <span className="text-muted">
          {os.trash.length} item{os.trash.length > 1 ? "s" : ""}
        </span>
        <button type="button" onClick={os.emptyTrash} className="rounded-md px-2.5 py-1 font-medium text-[#e5484d] hover:bg-[#e5484d]/10">
          Empty Trash
        </button>
      </div>
      <ul className="flex-1 overflow-auto p-2">
        {os.trash.map((t) => (
          <li key={t.id} className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] hover:bg-hairline/60">
            <span className="text-xl">{t.emoji}</span>
            <span className="flex-1 truncate">{t.label}</span>
            <button
              type="button"
              onClick={() => os.putBack(t.id)}
              className="rounded-md bg-hairline px-2.5 py-1 text-xs font-medium hover:bg-accent hover:text-white"
            >
              Put Back
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
