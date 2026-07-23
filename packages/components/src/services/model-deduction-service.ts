/**
 * Model deduction service: asks the backend what a model is probably missing.
 *
 * The rest of the certainty fisheye computes distance from the data — an
 * authored edge, a rule sentence, a shared membership. This is the one band
 * that cannot be computed, because it is about components the model does not
 * contain: the question is not "what is connected to this" but "what would a
 * person who knows this kind of equipment expect to find beside it". That is a
 * judgement, so it lives behind the API, and when the API is silent the band is
 * simply absent — the two computed bands still argue the pattern on their own.
 */

export interface DeductionNeighbour {
  id: string;
  name: string;
  /** How the model ties it to the focus, in the model's own words. */
  relation: string;
}

export interface DeductionRequest {
  focus: {
    id: string;
    name: string;
    type: string;
    description: string;
    attributes: { name: string; value: string }[];
  };
  neighbourhood: DeductionNeighbour[];
  /** What the model is, in a phrase — steers the vocabulary. */
  subject?: string;
}

/** A component the model does not contain, and why the model thinks it should. */
export interface Proposal {
  name: string;
  rationale: string;
  /** The modelled component it would hang under. */
  anchorId: string;
}

export interface Deduction {
  proposals: Proposal[];
}

function getDeductionEndpoint(): string {
  if (
    import.meta.env.DEV ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  ) {
    return 'http://localhost:3000/api/model/deduce';
  }

  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) return `${apiUrl}/api/model/deduce`;

  return '/api/model/deduce';
}

/**
 * Keep only what the rim can render. A proposal anchored to something the
 * client never sent has no place to hang, and a proposal naming a component
 * that is already modelled is not past the boundary at all — it belongs in one
 * of the computed bands, where it would be stated with more certainty than the
 * rim can offer.
 */
export function resolveProposals(
  deduction: Deduction,
  known: { ids: Set<string>; names: Set<string> }
): Proposal[] {
  const seen = new Set<string>();

  return (deduction.proposals ?? []).filter((proposal) => {
    if (!proposal?.name || !proposal.rationale) return false;
    if (!known.ids.has(proposal.anchorId)) return false;
    const key = proposal.name.trim().toLowerCase();
    if (known.names.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* The same neighbourhood is deduced identically every time it is asked for,
   and a reader walking the model comes back to the same components. Session
   storage rather than local: long enough to cover the visit, short enough that
   a changed prompt is never stale for long. Versioned, because a reply written
   against an older prompt is not a hit — it is a wrong answer served fast. */
const CACHE_PREFIX = 'model-deduction:1:';

function readCache(key: string): Deduction | null {
  try {
    const cached = sessionStorage.getItem(CACHE_PREFIX + key);
    return cached ? (JSON.parse(cached) as Deduction) : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, deduction: Deduction): void {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(deduction));
  } catch {
    /* A full or blocked store is not a reason to fail the view. */
  }
}

export async function deduceConnections(
  request: DeductionRequest,
  options: { signal?: AbortSignal } = {}
): Promise<Deduction> {
  /* The name is part of the key, not just the id: a proposal past the model's
     boundary borrows its anchor's id and its anchor's neighbourhood, and only
     its name says which side of the boundary the question was asked from. */
  const key = [
    request.focus.id,
    request.focus.name,
    request.neighbourhood.map((neighbour) => neighbour.id).join(','),
  ].join('|');
  const cached = readCache(key);
  if (cached) return cached;

  const response = await fetch(getDeductionEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(`Model deduction failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    success: boolean;
    data: Deduction | null;
    error: string | null;
  };

  if (!payload.success || !payload.data) {
    throw new Error(payload.error ?? 'Model deduction returned no data');
  }

  writeCache(key, payload.data);
  return payload.data;
}
