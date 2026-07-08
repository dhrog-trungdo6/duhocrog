import { Check } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  features?: string[];
  imagePlaceholder?: string;
}

export function ServiceCard({ title, description, features, imagePlaceholder }: ServiceCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image placeholder */}
      <div className="aspect-[16/9] bg-gradient-to-br from-primary to-primary-light">
        {imagePlaceholder ? (
          <img
            src={imagePlaceholder}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl font-bold text-white/30">{title.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="mb-2 text-lg font-bold text-navy">{title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">{description}</p>
        {features && features.length > 0 && (
          <ul className="space-y-2">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}