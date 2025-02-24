import BlogPostHeader from "@/components/blog/BlogPostHeader";
import "./code.css";

import BlogBackgroundCanvas from "@/components/blog/blogBackground/BlogBackground";
import Nav from "@/components/nav/Nav";
import { BLOG_METADATA, BlogMetadata } from "@/resources/blog";
import { BlogSlug } from "@/resources/pathname";
import { FC } from "react";
import BlogHeadingsNav from "@/components/blog/BlogHeadingsNav";

export default async function BlogLayout({
  children,
  params,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const slug = (await params).slug as BlogSlug;
  const metadata = BLOG_METADATA[slug];
  if (!metadata) return null;
  return (
    <>
      <BlogBackgroundCanvas />
      <Nav blogSlug={slug} />

      <main className="relative w-full font-sans">
        <BlogPostHeader {...metadata} />

        <div className="grid grid-cols-1 grid-rows-1 xl:grid-cols-[auto_1fr]">
          <article className="prose-sm mx-auto w-full !max-w-5xl overflow-hidden text-pretty bg-white px-4 py-12 text-black md:prose xl:prose-lg prose-pre:bg-off-black md:px-12 xl:px-16 xl:py-16">
            {children}
            <hr />
            <h3>Thanks for reading, Matt ✌️</h3>
          </article>
          <BlogHeadingsNav />
        </div>
      </main>

      <JSONSchema {...metadata} />
    </>
  );
}

const JSONSchema: FC<BlogMetadata> = ({ title, description, date, slug }) => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/${slug}`;
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: title,
          datePublished: date,
          dateModified: date,
          description: description,
          mainEntityOfPage: url,
          image: `${process.env.NEXT_PUBLIC_BASE_URL}/opengraph-image.jpg`,
          // TODO: dynamically generated image with the blog title.
          // image: post.metadata.image
          //   ? `${baseUrl}${post.metadata.image}`
          //   : `/og?title=${encodeURIComponent(post.metadata.title)}`,
          url: url,
          author: {
            "@type": "Person",
            givenName: "Matthew",
            name: "Matthew Frawley",
            brand: "Pragmattic",
            email: "pragmattic.ltd@gmail.com",
          },
        }),
      }}
    />
  );
};
