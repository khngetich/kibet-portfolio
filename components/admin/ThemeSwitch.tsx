'use client';

import { useTheme } from '@payloadcms/ui';
import { IconSwap } from '@/components/ui/IconSwap';

/**
 * Light / dark switch in the admin's top bar. Payload keeps the choice in its theme cookie, so
 * the server renders the right theme on the next load (no flash). Every transition is held for
 * the one frame of the swap, so the whole screen changes at once instead of smearing.
 */
export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const dark = theme === 'dark';

  const toggle = () => {
    const hold = document.createElement('style');
    hold.textContent = '*,*::before,*::after{transition:none !important}';
    document.head.appendChild(hold);
    setTheme(dark ? 'light' : 'dark');
    void document.documentElement.offsetHeight; // apply the new colours with transitions off
    requestAnimationFrame(() => requestAnimationFrame(() => hold.remove()));
  };

  return (
    <button
      type="button"
      className="cms-theme-switch"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      <IconSwap a="moon" b="sun" show={dark ? 'b' : 'a'} size={18} />
    </button>
  );
}
