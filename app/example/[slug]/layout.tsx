import { redirect } from "next/navigation";
import { FC, type ReactNode } from "react";

import ExampleInfo from "@/components/nav/ExampleInfo";
import Nav from "@/components/nav/Nav";
import { Example, EXAMPLES_METADATA } from "@/resources/examples";
import { ExampleSlug } from "@/resources/pathname";

export default async function ExampleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug as ExampleSlug;
  if (!slug || !Object.values(ExampleSlug).includes(slug as ExampleSlug))
    redirect("/");

  const example = EXAMPLES_METADATA[slug as ExampleSlug];
  return (
    <>
      <Nav exampleSlug={slug} />
      {children}
      <ExampleInfo exampleSlug={slug} />
      <JSONSchema {...example} />
    </>
  );
}

const JSONSchema: FC<Example> = ({ title, description, slug: pathname }) => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/${pathname}`;
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: title, // using "name" instead of "headline" for a generic work
          abstract: description,
          image: `${process.env.NEXT_PUBLIC_BASE_URL}/opengraph-image.jpg`,
          url: url,
          // Tells search engines that this creative work is the main entity on the page
          mainEntityOfPage: url,
          author: {
            "@type": "Person",
            givenName: "Matthew",
            name: "Matthew Frawley",
            email: "pragmattic.ltd@gmail.com",
          },
          // TODO: update dates
          datePublished: "2025-02-10",
          dateModified: "2025-02-10",
        }),
      }}
    />
  );
};
