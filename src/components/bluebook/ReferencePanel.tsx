import { X, Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";
import { Formula } from "./Formula";
import { MATH_REFERENCE, TRIG_TABLE } from "./referenceData";

export function ReferencePanel({ onClose }: { onClose: () => void }) {
  const [wide, setWide] = useState(false);

  return (
    <aside
      className={[
        "flex h-full flex-col border-l border-gray-300 bg-white",
        wide ? "w-full md:w-[60%]" : "w-full md:w-[420px]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between border-b border-gray-300 px-4 py-3">
        <h2 className="text-base font-semibold text-black">Qo'llanmalar</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setWide((w) => !w)}
            className="rounded p-1.5 text-gray-700 hover:bg-gray-100"
            aria-label="Kattalashtirish"
          >
            {wide ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-gray-700 hover:bg-gray-100"
            aria-label="Yopish"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {MATH_REFERENCE.map((group) => (
          <section key={group.title} className="mb-6">
            <h3 className="mb-2 border-b border-gray-200 pb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
              {group.title}
            </h3>
            <ul className="space-y-2">
              {group.items.map((item, i) => (
                <li key={i} className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-black">
                  {item.label && (
                    <span className="mr-2 text-xs font-medium text-gray-500">{item.label}:</span>
                  )}
                  <Formula latex={item.latex} />
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="mb-6">
          <h3 className="mb-2 border-b border-gray-200 pb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
            Trigonometrik qiymatlar
          </h3>
          <table className="w-full border-collapse text-center text-black">
            <tbody>
              {[TRIG_TABLE.head, TRIG_TABLE.sin, TRIG_TABLE.cos].map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} className="border border-gray-300 px-2 py-1.5 text-sm">
                      <Formula latex={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </aside>
  );
}