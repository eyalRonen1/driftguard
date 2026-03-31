"use client";

const TESTIMONIALS = [
  {
    quote: "We caught a competitor's price drop within an hour. Before PageLifeguard, it took us weeks to notice.",
    author: "Sarah K.",
    role: "Head of Marketing, SaaS Startup",
    avatar: "S",
    color: "bg-purple-500",
  },
  {
    quote: "The AI summaries are a game-changer. I get 'regulation X changed requirement Y' instead of a wall of HTML diffs.",
    author: "David M.",
    role: "Compliance Officer, FinTech",
    avatar: "D",
    color: "bg-blue-500",
  },
  {
    quote: "We monitor 50 supplier pages. PageLifeguard pays for itself every time it catches a price increase before it hits our margins.",
    author: "Lisa T.",
    role: "E-commerce Operations",
    avatar: "L",
    color: "bg-green-500",
  },
];

export function Testimonials() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {TESTIMONIALS.map((t) => (
        <div
          key={t.author}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 ${t.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
              {t.avatar}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{t.author}</p>
              <p className="text-xs text-gray-500">{t.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
