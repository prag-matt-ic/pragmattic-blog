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

import articleIcon from "@/assets/icons/article-white.svg";
import collapseIcon from "@/assets/icons/collapse-green.svg";
import infoIon from "@/assets/icons/info-green.svg";
import githubIcon from "@/assets/icons/socials/github.svg";
import youtubeIcon from "@/assets/icons/socials/youtube.svg";
import Tag from "@/components/Tag";
import { EXAMPLES_METADATA } from "@/resources/examples";
import { ExampleSlug } from "@/resources/pathname";

type Props = {
  exampleSlug: ExampleSlug;
};

const ExampleInfo: FC<Props> = ({ exampleSlug }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const { floatingStyles, refs, context } = useFloating({
    strategy: "fixed",
    placement: "bottom-start",
    transform: false,
    open: isInfoOpen,
    onOpenChange: setIsInfoOpen,
    // TODO: expand transition
    middleware: [offset({ mainAxis: 8, crossAxis: 0 })],
  });
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

  const onInfoEnter = () => {
    // if (!expandedContainer.current) return;
    // const expandedSectionHeight =
    //   expandedContainer.current.getBoundingClientRect().height;
    // gsap
    //   .timeline()
    //   .to("#example-nav-border", {
    //     height: expandedSectionHeight + containerHeight,
    //     duration: 0.3,
    //     ease: "power2.inOut",
    //   })
    //   .to(
    //     "#example-nav-bg",
    //     { opacity: 1, duration: 0.3, ease: "power2.in" },
    //     0
    //   )
    //   .to(
    //     expandedContainer.current,
    //     { opacity: 1, duration: 0.24, ease: "power2.in" },
    //     0.2
    //   );
  };

  const onInfoExit = () => {
    // gsap
    //   .timeline()
    //   .to(expandedContainer.current, {
    //     opacity: 0,
    //     duration: 0.16,
    //     ease: "power1.out",
    //   })
    //   .to("#example-nav-bg", { opacity: 0, duration: 0.2, ease: "power2.out" })
    //   .to(
    //     "#example-nav-border",
    //     {
    //       height: containerHeight,
    //       duration: 0.2,
    //       opacity: 1,
    //       ease: "power2.out",
    //     },
    //     "<"
    //   );
  };

  const metadata = EXAMPLES_METADATA[exampleSlug];
  if (!metadata) return null;
  const { description, tags, blogSlug, youtubeUrl, githubUrl } = metadata;

  return (
    <>
      <button
        {...getReferenceProps()}
        ref={refs.setReference}
        className="fixed bg-black top-20 rounded flex items-center justify-center left-12 z-[900] size-12"
        onClick={() => setIsInfoOpen((prev) => !prev)}
      >
        {isInfoOpen ? (
          <Image src={collapseIcon} alt="collapse" className="size-5" />
        ) : (
          <Image src={infoIon} alt="expand" className="size-7" />
        )}
      </button>
      {/* Expanded Info */}
      <Transition
        in={isInfoOpen}
        timeout={{ enter: 0, exit: 0 }}
        mountOnEnter={true}
        unmountOnExit={true}
        nodeRef={refs.floating}
        onEnter={onInfoEnter}
        onExit={onInfoEnter}
      >
        <section
          ref={refs.setFloating}
          {...getFloatingProps()}
          style={floatingStyles}
          className="fixed left-0 bg-black top-0 z-[1001] max-w-lg space-y-3 overflow-hidden p-4"
        >
          {!!description && <p className="text-light">{description}</p>}

          {!!tags && (
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <Tag key={tag} name={tag} />
              ))}
            </div>
          )}

          <div className="text-white flex items-center gap-6 text-sm font-medium">
            {!!blogSlug && (
              <Link
                href={`/${blogSlug}`}
                target="_blank"
                className="flex items-center gap-2 hover:opacity-50"
              >
                <Image src={articleIcon} alt="Article" className="size-6" />
                Deep Dive
              </Link>
            )}
            {!!youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-50"
              >
                <Image src={youtubeIcon} alt="Youtube" className="size-6" />
                YouTube Video
              </a>
            )}
            {!!githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-50"
              >
                <Image src={githubIcon} alt="Github" className="size-6" />
                Code
              </a>
            )}
          </div>
        </section>
      </Transition>
    </>
  );
};

export default ExampleInfo;
