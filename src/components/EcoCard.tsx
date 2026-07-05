import type { EcoFact } from "@/lib/content";

const GREEN = "#16a34a";

/** Kartu konten EcoFacts. */
export default function EcoCard({ fact }: { fact: EcoFact }) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="text-4xl" aria-hidden>
        {fact.emoji}
      </div>
      <span
        className="mt-3 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold capitalize"
        style={{ color: GREEN }}
      >
        {fact.category}
      </span>
      <h3 className="mt-2 font-serif text-lg text-gray-900">{fact.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-gray-600">{fact.body}</p>
    </article>
  );
}
