import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { cn } from "#components/lib/utils";
import { buttonVariants } from "#components/lib/button-variants";

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-muted py-16 lg:py-20">
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(90deg, transparent, transparent 48px, currentColor 48px, currentColor 49px),
            repeating-linear-gradient(0deg, transparent, transparent 48px, currentColor 48px, currentColor 49px)
          `,
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          See the Full Collection
        </h2>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
          Every product tells a story. Browse our complete catalog and find your
          next favorite.
        </p>
        <div className="mt-8">
          <a
            href="#catalog"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "inline-flex items-center gap-2 font-semibold",
            )}
          >
            Browse All Products
            <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
