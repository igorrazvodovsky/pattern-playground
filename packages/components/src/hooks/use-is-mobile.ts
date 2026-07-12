import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  // Starts false unconditionally so the first client render matches the
  // server HTML (which always renders the desktop branch) — initialising from
  // window.innerWidth makes hydration diverge on phones and strands the
  // server-rendered sidebar as an orphan next to the mobile drawer. The
  // effect below corrects the value immediately after hydration.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isMobile;
}
