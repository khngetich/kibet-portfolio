import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="page-head-section">
      <div className="wrap page-head">
        <h1 className="h-xl">Page not found</h1>
        <p className="lede">That page has moved or never existed.</p>
        <div className="ctas"><Link className="btn btn-dark" href="/work">See the work</Link><Link className="btn btn-soft" href="/">Home</Link></div>
      </div>
    </section>
  );
}
