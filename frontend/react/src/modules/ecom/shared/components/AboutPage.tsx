import { Link } from "react-router-dom";

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl py-12 lg:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        About The Casbah Edit
      </h1>

      <section className="mt-8 space-y-4 text-base leading-relaxed text-muted-foreground">
        <p>
          The Casbah Edit is a curated streetwear marketplace born from the
          belief that style should be bold, unapologetic, and accessible. We
          bring together emerging and established streetwear brands from around
          the world, offering everything from limited drops to everyday
          essentials.
        </p>
        <p>
          Our mission is to make streetwear culture discoverable. Every
          collection on our platform is selected for its energy, craftsmanship,
          and authenticity. Whether you are hunting for a grail piece or
          refreshing your rotation, The Casbah Edit is your destination.
        </p>
      </section>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border p-5">
          <h3 className="text-lg font-bold">Curated Drops</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Limited-edition releases from the most exciting brands in streetwear
          </p>
        </div>
        <div className="rounded-lg border p-5">
          <h3 className="text-lg font-bold">Authentic Only</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Every item is verified for quality and originality
          </p>
        </div>
        <div className="rounded-lg border p-5">
          <h3 className="text-lg font-bold">Global Community</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Join a worldwide network of collectors, creatives, and brands
          </p>
        </div>
      </div>

      <div className="mt-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          &larr; Browse Products
        </Link>
      </div>
    </div>
  );
}
