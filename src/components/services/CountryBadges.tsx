interface CountryBadge {
  name: string;
  code: string;
  gradient: string; // tailwind gradient classes
}

interface CountryBadgesProps {
  countries: CountryBadge[];
}

export function CountryBadges({ countries }: CountryBadgesProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {countries.map((country) => (
        <div
          key={country.code}
          className="flex flex-col items-center gap-2 transition-transform hover:scale-105"
        >
          <div
            className={`h-16 w-16 rounded-full bg-gradient-to-br ${country.gradient} flex items-center justify-center shadow-md ring-2 ring-white`}
          >
            <span className="text-xl font-bold text-white">
              {country.code.toUpperCase().slice(0, 2)}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-700">{country.name}</span>
        </div>
      ))}
    </div>
  );
}