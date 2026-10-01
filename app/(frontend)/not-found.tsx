import Link from 'next/link';

/** 404 as a misprint: the number in two inks slightly out of register, on the proof-sheet paper. */
export default function NotFound() {
  return (
    <section className="page-head-section misprint">
      <div className="wrap">
        <div className="misprint-sheet">
          <p className="misprint-label" aria-hidden="true"><span>Proof 404</span><span>Rejected · not for print</span></p>
          <p className="misprint-num" aria-hidden="true"><span>404</span><span>404</span></p>
          <h1 className="h-lg">This page didn’t make it to print.</h1>
          <p className="lede">It has moved, or it never existed. The work is still here.</p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/work">See the work</Link>
            <Link className="btn btn-soft" href="/">Home</Link>
            <Link className="btn btn-soft" href="/lab">Make a poster instead</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
