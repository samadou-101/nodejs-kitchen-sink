import { Link } from "react-router-dom";
import { cn } from "#components/lib/utils";
import { buttonVariants } from "#components/lib/button-variants";

export function CatalogHero() {
  return (
    <section className="relative isolate overflow-hidden bg-primary py-24 lg:py-36">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, transparent, transparent 32px, rgba(255,255,255,0.15) 32px, rgba(255,255,255,0.15) 33px),
            repeating-linear-gradient(-45deg, transparent, transparent 32px, rgba(255,255,255,0.15) 32px, rgba(255,255,255,0.15) 33px)
          `,
        }}
      />
      <div
        className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-foreground/[0.03] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-primary-foreground/[0.02] blur-3xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-foreground/50">
            The Casbah Edit
          </p>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
            Discover Your
            <br />
            Next Drop
          </h1>
          <div className="mt-3 h-1 w-20 rounded-full bg-primary-foreground/20" />
          <p className="mt-6 max-w-md text-lg leading-relaxed text-primary-foreground/70">
            Curated products with bold energy. Streetwear meets local craft. Every drop tells a story.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="#catalog"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "font-semibold",
              )}
            >
              Shop Collection
            </Link>
            <Link
              to="#featured"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground",
              )}
            >
              Featured Drops
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
