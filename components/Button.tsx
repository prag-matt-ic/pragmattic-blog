import Link from "next/link";
import {
  type ButtonHTMLAttributes,
  forwardRef,
  type PropsWithChildren,
} from "react";
import { twMerge } from "tailwind-merge";

type Variant = "filled" | "outlined" | "text";
type Size = "small" | "medium" | "large";
type Colour = "primary" | "secondary";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  PropsWithChildren<{
    variant: Variant;
    size?: Size;
    href?: string;
    colour?: Colour;
  }>;

const SIZE_CLASSES: Record<Size, string> = {
  small: "py-1.5 px-4 text-xs sm:text-sm gap-1",
  medium: "py-2 px-6 text-sm sm:text-base sm:px-8 gap-2",
  large: "py-3 px-8 text-base sm:text-lg gap-3",
} as const;

const VARIANT_CLASSES: Record<
  Variant,
  {
    [key in Colour]: string;
  }
> = {
  filled: {
    primary: "bg-green text-black hover:bg-white",
    secondary: "bg-light text-black hover:bg-white",
  },
  outlined: {
    primary: "border border-green text-white bg-black/30 hover:border-white",
    secondary: "border border-light text-white bg-black/50 hover:bg-black/80",
  },
  text: {
    primary: "text-green hover:text-white",
    secondary: "text-white hover:text-light",
  },
} as const;

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    children,
    size = "medium",
    variant = "filled",
    colour = "primary",
    className,
    href,
    ...rest
  } = props;

  const button = (
    <button
      ref={ref}
      {...rest}
      className={twMerge(
        "group pointer-events-auto flex select-none items-center justify-center overflow-hidden whitespace-nowrap rounded-full font-sans font-semibold leading-none tracking-wide transition-colors duration-300",
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant][colour],
        className
      )}
    >
      {children}
    </button>
  );

  if (href?.startsWith("/")) return <Link href={href}>{button}</Link>;

  if (!!href)
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {button}
      </a>
    );

  return button;
});

Button.displayName = "Button";

export default Button;
