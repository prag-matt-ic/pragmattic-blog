import { type Metadata } from "next";

import { BLOG_CONTENT, BLOG_METADATA } from "@/resources/blog";
import { BlogSlug } from "@/resources/pathname";

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export function generateStaticParams(): string[] {
  return Object.values(BlogSlug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const metadata = BLOG_METADATA[params.slug as BlogSlug];
  return {
    title: metadata.title,
    description: metadata.description,
  };
}

export default async function BlogPage({ params }: Props) {
  const slug = params.slug;
  const Content = BLOG_CONTENT[slug as BlogSlug];
  if (!Content) return null;
  return <Content />;
}
