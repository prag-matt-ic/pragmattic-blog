"use client";
import { offset, useFloating, useInteractions } from "@floating-ui/react";
import { useDismiss } from "@floating-ui/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, type FC, type SetStateAction, useState } from "react";
import { Transition } from "react-transition-group";
import { twJoin } from "tailwind-merge";

import dropDownIcon from "@/assets/icons/drop-down-white.svg";
import forwardSlashIcon from "@/assets/icons/forward-slash-light.svg";
import githubIcon from "@/assets/icons/socials/github.svg";
import youtubeIcon from "@/assets/icons/socials/youtube.svg";
import Tag from "@/components/Tag";
import { EXAMPLES_METADATA } from "@/resources/examples";
import { BlogSlug, ExampleSlug, Pathname } from "@/resources/pathname";
import { BLOG_METADATA } from "@/resources/blog";
import logo from "@/assets/brand/pragmattic.svg";

gsap.registerPlugin(useGSAP);

type Props = {
  exampleSlug?: ExampleSlug;
  blogSlug?: BlogSlug;
};

const Nav: FC<Props> = ({ exampleSlug, blogSlug }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { floatingStyles, refs, context } = useFloating({
    strategy: "fixed",
    placement: "bottom-start",
    transform: false,
    open: isMenuOpen,
    onOpenChange: setIsMenuOpen,
    middleware: [
      offset({
        mainAxis: 4,
        crossAxis: -16,
      }),
    ],
  });
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

  const onMenuEnter = () => {
    gsap.fromTo(
      "#menu",
      { y: -16, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.24,
        ease: "power2.out",
      }
    );
  };

  const onMenuExit = () => {
    gsap.to("#menu", {
      y: -16,
      opacity: 0,
      duration: 0.16,
      ease: "power2.out",
    });
  };

  // Extract the metadata
  const current = !!blogSlug
    ? BLOG_METADATA[blogSlug]
    : !!exampleSlug
    ? EXAMPLES_METADATA[exampleSlug]
    : null;

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-[1000] text-white bg-black py-4 items-center flex gap-6 horizontal-padding">
        <Link
          href="https://pragmattic.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="relative shrink-0"
        >
          <Image alt="Pragmattic" src={logo} height={20} className="sm:h-5" />
        </Link>

        <div className="flex select-none items-center gap-2">
          <Link
            href="/"
            className="relative hover:text-white pointer-events-auto cursor-pointer text-light"
          >
            {!!exampleSlug ? "Example" : "Blog"}
          </Link>
          <Image src={forwardSlashIcon} alt="/" className="size-5" />
          <button
            ref={refs.setReference}
            {...getReferenceProps()}
            className="flex items-center gap-1 transition-opacity duration-200 hover:opacity-70"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span
              className={twJoin(
                "text-ellipsis overflow-hidden whitespace-nowrap text-base font-semibold max-w-md",
                !!current ? "text-white" : "text-light"
              )}
            >
              {current?.title ?? "Explore..."}
            </span>
            <Image src={dropDownIcon} alt="open menu" className="size-6" />
          </button>
        </div>
      </nav>

      <Transition
        in={isMenuOpen}
        timeout={{ enter: 0, exit: 300 }}
        mountOnEnter={true}
        unmountOnExit={true}
        nodeRef={refs.floating}
        onEnter={onMenuEnter}
        onExit={onMenuExit}
      >
        <section
          id="menu"
          ref={refs.setFloating}
          {...getFloatingProps()}
          style={floatingStyles}
          className="fixed opacity-0 left-0 top-0 z-[1001] max-w-[calc(100%-16px)] overflow-hidden rounded border border-mid bg-black/80 shadow-xl backdrop-blur-md lg:max-w-xl xl:max-w-2xl"
        >
          <ExamplesPicker
            blogSlug={blogSlug}
            exampleSlug={exampleSlug}
            setIsPickerOpen={setIsMenuOpen}
          />
        </section>
      </Transition>
    </>
  );
};

export default Nav;

type MenuProps = {
  blogSlug?: BlogSlug;
  exampleSlug?: ExampleSlug;
  setIsPickerOpen: Dispatch<SetStateAction<boolean>>;
};

const ALL_TAGS = Object.values({
  ...EXAMPLES_METADATA,
  ...BLOG_METADATA,
}).reduce<string[]>(
  (acc, { tags }) =>
    tags ? [...acc, ...tags.filter((tag) => !acc.includes(tag))] : acc,
  []
);

const ExamplesPicker: FC<MenuProps> = ({
  blogSlug,
  exampleSlug,
  setIsPickerOpen,
}) => {
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const onTagClick = (tag: string) => {
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter((activeTag) => activeTag !== tag));
    } else {
      setActiveTags([...activeTags, tag]);
    }
  };

  const filteredBlogs = Object.values(BLOG_METADATA).filter(
    ({ isDraft, tags }) => {
      if (!!isDraft) return false;
      if (!activeTags.length) return true;
      if (!tags) return true;
      return tags.some((tag) => activeTags.includes(tag));
    }
  );

  const filteredExamples = Object.values(EXAMPLES_METADATA).filter(
    ({ tags }) => {
      if (!activeTags.length) return true;
      if (!tags) return true;
      return tags.some((tag) => activeTags.includes(tag));
    }
  );

  return (
    <div className="w-full overflow-y-auto text-white">
      <div className="flex flex-wrap gap-1.5 p-2">
        {ALL_TAGS.map((tag) => {
          const isActive = activeTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="p-0 hover:opacity-70"
            >
              <Tag name={tag} className={isActive ? "text-green" : undefined} />
            </button>
          );
        })}
      </div>

      {!!filteredBlogs.length && (
        <>
          <div className="mx-2 my-2 h-px w-auto bg-mid" />
          <section>
            <h3 className="px-4 text-sm py-1 text-light font-medium">Blog</h3>
            {filteredBlogs.map(({ slug, title }, index) => {
              return (
                <div
                  key={title}
                  className={twJoin(
                    "flex items-center justify-between gap-6 px-4 py-3 text-white",
                    index % 2 === 0 && "bg-black/50"
                  )}
                >
                  <Link
                    href={`/${slug}`}
                    className="block font-medium hover:text-green"
                    onClick={() => {
                      setIsPickerOpen(false);
                    }}
                  >
                    {title}
                  </Link>
                </div>
              );
            })}
          </section>
        </>
      )}

      {!!filteredExamples.length && (
        <>
          <div className="mx-2 my-2 h-px w-auto bg-mid" />
          <section>
            <h3 className="px-4 py-1 text-sm text-light font-medium">
              Examples
            </h3>
            {filteredExamples.map(
              ({ title, slug: exampleSlug, youtubeUrl, githubUrl }, index) => {
                const hasLinks = !!youtubeUrl || !!githubUrl;
                return (
                  <div
                    key={title}
                    className={twJoin(
                      "flex items-center justify-between gap-6 px-4 py-2 text-white",
                      index % 2 === 0 && "bg-black/40"
                    )}
                  >
                    <Link
                      href={`${Pathname.Example}/${exampleSlug}`}
                      className="block font-medium hover:text-green"
                      onClick={() => {
                        setIsPickerOpen(false);
                      }}
                    >
                      {title}
                    </Link>
                    {hasLinks && (
                      <div className="flex items-center gap-4">
                        {!!youtubeUrl && (
                          <a
                            href={youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-50"
                          >
                            <Image
                              src={youtubeIcon}
                              alt="Youtube"
                              className="size-5"
                            />
                          </a>
                        )}
                        {!!githubUrl && (
                          <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-50"
                          >
                            <Image
                              src={githubIcon}
                              alt="Github"
                              className="size-5"
                            />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </section>
        </>
      )}
    </div>
  );
};
