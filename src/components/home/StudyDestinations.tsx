import { destinations } from "@/data/destinations";

/** Clip-path lục giác cho ảnh quốc gia (theo spec). */
const HEXAGON_CLIP = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

/**
 * Grid quốc gia du học với ảnh cắt lục giác.
 * Placeholder: gradient + cờ emoji — thay bằng next/image khi có ảnh thật
 * (giữ nguyên clipPath + group-hover:scale-110).
 */
export function StudyDestinations() {
  return (
    <section id="destinations" className="bg-white py-14" aria-labelledby="destinations-title">
      <div className="mx-auto max-w-7xl px-4">
        <h2
          id="destinations-title"
          className="mb-10 text-center text-2xl font-extrabold uppercase tracking-wide text-slate-800"
        >
          <span className="border-b-4 border-primary pb-2">Quốc gia du học</span>
        </h2>

        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {destinations.map((country) => (
            <li key={country.code}>
              <a href="#lead-form" className="group flex flex-col items-center gap-4">
                <div
                  className="h-36 w-36 overflow-hidden md:h-44 md:w-44"
                  style={{ clipPath: HEXAGON_CLIP }}
                >
                  <div
                    className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${country.gradient} transition-transform duration-300 group-hover:scale-110`}
                    role="img"
                    aria-label={`Hình ảnh ${country.name}`}
                  >
                    <span className="text-6xl md:text-7xl" aria-hidden>
                      {country.flag}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold uppercase text-slate-800 transition-colors group-hover:text-primary">
                  {country.name}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
