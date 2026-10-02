'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { openDoc } from '../DocModal';

/**
 * Quick capture: type what you're working on, pick its disciplines, press Enter, and a draft
 * project exists. Drafts skip required fields, so the cover, summary and the rest can come
 * later; the full editor opens in the pop-up straight away to carry on.
 */
export function QuickProject({ disciplines }: { disciplines: { label: string; value: string }[] }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (v: string) => setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/projects?draft=true&depth=0', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), client: client.trim() || undefined, disciplines: picked.length ? picked : undefined, year: String(new Date().getFullYear()), _status: 'draft' }),
      });
      const json = await res.json().catch(() => null);
      const id = json?.doc?.id;
      if (!res.ok || !id) throw new Error(json?.errors?.[0]?.message || 'Couldn’t create the project.');
      setTitle(''); setClient(''); setPicked([]);
      router.refresh();
      openDoc({ collection: 'projects', id });
    } catch (err) {
      setError(`${(err as Error).message} Check your connection and try again.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="cms-capture" onSubmit={submit} aria-label="Start a project">
      <div className="cms-capture-row">
        <span className="cms-capture-icon" aria-hidden="true"><Icon name="plus" size={16} /></span>
        <label className="cms-sr" htmlFor="cms-capture-title">Project title</label>
        <input id="cms-capture-title" className="cms-capture-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What are you working on? e.g. Matchday posters for Ngepe" autoComplete="off" />
        <label className="cms-sr" htmlFor="cms-capture-client">Client</label>
        <input id="cms-capture-client" className="cms-capture-client" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client" autoComplete="off" />
        <button type="submit" className="cms-btn cms-btn-primary cms-btn-sm" disabled={!title.trim() || busy}>{busy ? 'Starting…' : 'Start draft'}</button>
      </div>
      <div className="cms-capture-chips" role="group" aria-label="Disciplines">
        {disciplines.map((d) => (
          <button key={d.value} type="button" className="cms-chip" aria-pressed={picked.includes(d.value)} onClick={() => toggle(d.value)}>{d.label}</button>
        ))}
      </div>
      {error && <p className="cms-alert" role="alert">{error}</p>}
    </form>
  );
}
