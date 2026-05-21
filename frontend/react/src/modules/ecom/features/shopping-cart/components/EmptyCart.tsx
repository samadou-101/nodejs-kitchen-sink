import { Link } from "react-router-dom";

export function EmptyCart() {
  return (
    <div className="py-16 text-center">
      <svg
        className="mx-auto h-16 w-16 text-muted-foreground/50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
      <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Looks like you haven't added anything yet.
      </p>
      <Link to="/" className="mt-6 inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80">Continue Shopping</Link>
    </div>
  );
}
