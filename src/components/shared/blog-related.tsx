import Link from "next/link";
import Image from "next/image";

const ALL_POSTS = [
  { slug: "what-is-website-change-monitoring", title: "What is Website Change Monitoring?", image: "/assets/blog-what-is-hero.webp", tag: "Guide" },
  { slug: "how-to-monitor-website-changes", title: "How to Monitor Any Website in 5 Minutes", image: "/assets/blog-howto-hero.webp", tag: "Tutorial" },
  { slug: "5-ways-teams-use-website-monitoring", title: "5 Ways Teams Use Website Monitoring", image: "/assets/blog-usecases-hero.webp", tag: "Use Cases" },
  { slug: "chrome-extension-website-monitoring", title: "Chrome Extension for Website Monitoring", image: "/assets/blog-extension-hero.webp", tag: "Extension" },
  { slug: "ai-chat-assistant-for-website-changes", title: "Meet Camo: AI Chat Assistant", image: "/assets/blog-aichat-hero.webp", tag: "AI" },
  { slug: "api-integrations-telegram-slack-webhooks", title: "API and Integrations Guide", image: "/assets/blog-api-hero.webp", tag: "Integrations" },
  { slug: "keyword-monitoring-css-selectors", title: "Keyword Monitoring and CSS Selectors", image: "/assets/blog-keywords-hero.webp", tag: "Advanced" },
];

export function BlogRelated({ currentSlug }: { currentSlug: string }) {
  const related = ALL_POSTS.filter((p) => p.slug !== currentSlug).slice(0, 3);

  return (
    <div className="mt-14 border-t border-white/10 pt-10">
      <h3 className="text-lg font-bold text-[var(--text-cream)] mb-5">More from the blog</h3>
      <div className="grid sm:grid-cols-3 gap-4">
        {related.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <div className="card-glass rounded-xl overflow-hidden">
              <div className="aspect-[16/9] relative">
                <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                <div className="absolute top-2 left-2">
                  <span className="text-[9px] font-bold text-[var(--accent-gold)] uppercase tracking-wider bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-full">{post.tag}</span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-[var(--text-cream)] group-hover:text-[var(--accent-jade)] transition leading-snug">{post.title}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
