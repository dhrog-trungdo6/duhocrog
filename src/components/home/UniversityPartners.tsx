import { partners } from "@/data/partners";

/**
 * Logo đối tác trường đại học — grid responsive.
 * Placeholder chữ viết tắt; khi có logo thật thay bằng
 * <Image src={p.logoUrl} alt={p.name} fill className="object-contain" />.
 */
export function UniversityPartners() {
  return (
    <section className="bg-white py-14" aria-labelledby="partners-title">
      <div className="mx-auto max-w-7xl px-4">
        <h2
          id="partners-title"
          className="mb-10 text-center text-2xl font-extrabold uppercase text-slate-800"
        >
          <span className="border-b-4 border-primary pb-2">Trường liên kết</span>
        </h2>

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {partners.map((partner) => {
            const initials = partner.name
              .split(" ")
              .filter((w) => /^[A-Z]/.test(w))
              .slice(0, 3)
              .map((w) => w[0])
              .join("");
            return (
              <li
                key={partner.id}
                className="flex h-28 flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-extrabold text-primary"
                  aria-hidden
                >
                  {initials}
                </span>
                <span className="text-center text-xs font-semibold text-slate-600">
                  {partner.name}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
