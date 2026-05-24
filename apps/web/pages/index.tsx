import type { GetStaticProps } from "next";
import { TopStatusBar, Header, Footer, Hero, CardRow, NewsletterCTA } from "@visurena/ui";
import { getLatestStories } from "@/lib/content";
import type { ContentItem } from "@visurena/core";

export default function Home({ stories }: { stories: ContentItem[] }) {
  const [featured, ...rest] = stories;
  return (
    <main>
      <TopStatusBar />
      <Header />
      {featured && (
        <Hero eyebrow={`Now reading · ${featured.genre ?? ""}`} title={featured.title}
          summary={featured.summary} href={`/stories/${featured.slug}`} cover={featured.cover} />
      )}
      <CardRow eyebrow="Stories — published every Monday" title="New this week"
        items={rest.map((s) => ({ section: "stories", slug: s.slug, title: s.title,
          genre: s.genre, accent: s.accent, cover: s.cover }))} />
      <NewsletterCTA />
      <Footer />
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return { props: { stories: getLatestStories(), section: "stories" } };
};
