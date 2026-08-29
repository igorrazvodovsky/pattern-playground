#!/usr/bin/env python3
"""Retrieval helper for the research-gate skill. Stdlib only.

Subcommands (all print one JSON object to stdout; per-query failures are
recorded in the output, never retry-looped):

  arxiv "query" ["query" ...]            search arxiv, dedupe across queries
  openalex-search "query" ["query" ...]  search OpenAlex works
  openalex-lineage ID [ID ...]           1-hop lineage over >=2 papers; IDs may
                                         be OpenAlex W-ids, DOIs, or arxiv ids
  openalex-resolve "title" ["title" ...] named papers -> OpenAlex ids, with
                                         reference counts, ready for lineage

Pacing and retry policy live here so runs don't improvise them: arxiv gets
3s between queries and one retry after 10s; OpenAlex gets 0.5s between calls
and one retry after 5s. A request that fails twice is reported as failed and
the run moves on. Set OPENALEX_MAILTO to join OpenAlex's polite pool.
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import defaultdict

MAILTO = os.environ.get("OPENALEX_MAILTO", "")
OA_KEY = os.environ.get("OPENALEX_API_KEY", "")
UA = "research-gate-skill/2.0" + (f" (mailto:{MAILTO})" if MAILTO else "")
ARXIV_PACE = 3.0  # arxiv asks for >=3s between requests; 1s pacing has 429'd
# 0.5s is fine for a single run; long backfills that sweep many slugs have
# tripped 429s at that rate, so the pace is overridable.
OA_PACE = float(os.environ.get("OPENALEX_PACE", "0.5"))
OA = "https://api.openalex.org"
ATOM = "{http://www.w3.org/2005/Atom}"


def get(url, retry_wait, headers=None):
    """One attempt plus one retry. Never more."""
    last = None
    for attempt in (0, 1):
        if attempt:
            time.sleep(retry_wait)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
            with urllib.request.urlopen(req, timeout=45) as resp:
                return resp.read()
        except Exception as exc:  # noqa: BLE001 - report, don't crash the run
            last = exc
    raise RuntimeError(f"{type(last).__name__}: {last}")


def oa_get(path, params):
    # The key goes in a header, not the query string, so it stays out of any
    # URL that gets echoed into a log or an error message.
    if MAILTO:
        params = {**params, "mailto": MAILTO}
    headers = {"Authorization": f"Bearer {OA_KEY}"} if OA_KEY else None
    url = f"{OA}{path}?{urllib.parse.urlencode(params)}"
    return json.loads(get(url, retry_wait=5, headers=headers))


def deinvert(inv):
    """Rebuild abstract text from OpenAlex's inverted index."""
    if not inv:
        return None
    pos = {}
    for word, idxs in inv.items():
        for i in idxs:
            pos[i] = word
    return " ".join(pos[i] for i in sorted(pos))[:2000]


def short_id(url_or_id):
    return (url_or_id or "").rsplit("/", 1)[-1]


def cmd_arxiv(args):
    papers, failures = {}, []
    for i, q in enumerate(args.queries):
        if i:
            time.sleep(ARXIV_PACE)
        url = (
            "https://export.arxiv.org/api/query?search_query="
            + urllib.parse.quote(q)
            + f"&max_results={args.max}&sortBy=relevance"
        )
        try:
            root = ET.fromstring(get(url, retry_wait=10))
        except Exception as exc:  # noqa: BLE001
            failures.append({"query": q, "error": str(exc)})
            continue
        for entry in root.findall(ATOM + "entry"):
            aid = short_id(entry.findtext(ATOM + "id"))
            if not aid:
                continue
            if aid in papers:
                papers[aid]["queries"].append(q)
                continue
            papers[aid] = {
                "arxiv_id": aid,
                "title": " ".join((entry.findtext(ATOM + "title") or "").split()),
                "abstract": " ".join((entry.findtext(ATOM + "summary") or "").split()),
                "year": (entry.findtext(ATOM + "published") or "")[:4],
                "categories": [c.get("term") for c in entry.findall(ATOM + "category")],
                "authors": [a.findtext(ATOM + "name") for a in entry.findall(ATOM + "author")],
                "queries": [q],
            }
    kept = list(papers.values())
    dropped = 0
    if args.categories:
        wanted = set(args.categories.split(","))
        before = len(kept)
        kept = [p for p in kept if wanted & set(p["categories"])]
        dropped = before - len(kept)
    status = "down" if len(failures) == len(args.queries) else "ok"
    print(json.dumps({
        "source": "arxiv",
        "status": status,
        "queries_run": len(args.queries),
        "queries_failed": len(failures),
        "unique_candidates": len(kept),
        "dropped_by_category_filter": dropped,
        "failures": failures,
        "papers": kept,
    }, indent=1))


def cmd_oa_search(args):
    papers, failures = {}, []
    fields = "id,doi,title,publication_year,primary_location,cited_by_count,abstract_inverted_index"
    flt = []
    if args.hci:
        flt.append("primary_topic.subfield.id:1709")
    if args.from_date:
        flt.append("from_publication_date:" + args.from_date)
    if args.filter:
        flt.append(args.filter)
    for i, q in enumerate(args.queries):
        if i:
            time.sleep(OA_PACE)
        params = {"search": q, "per-page": args.max, "select": fields}
        if flt:
            params["filter"] = ",".join(flt)
        try:
            data = oa_get("/works", params)
        except Exception as exc:  # noqa: BLE001
            failures.append({"query": q, "error": str(exc)})
            continue
        for w in data.get("results", []):
            wid = short_id(w["id"])
            if wid in papers:
                papers[wid]["queries"].append(q)
                continue
            source = (w.get("primary_location") or {}).get("source") or {}
            papers[wid] = {
                "openalex_id": wid,
                "doi": w.get("doi"),
                "title": w.get("title"),
                "year": w.get("publication_year"),
                "venue": source.get("display_name"),
                "cited_by_count": w.get("cited_by_count"),
                "abstract": deinvert(w.get("abstract_inverted_index")),
                "queries": [q],
            }
    status = "down" if len(failures) == len(args.queries) else "ok"
    print(json.dumps({
        "source": "openalex",
        "status": status,
        "queries_run": len(args.queries),
        "queries_failed": len(failures),
        "unique_candidates": len(papers),
        "failures": failures,
        "papers": list(papers.values()),
    }, indent=1))


WORK_FIELDS = "id,title,publication_year,referenced_works,cited_by_count"


def arxiv_title(aid):
    url = "https://export.arxiv.org/api/query?id_list=" + urllib.parse.quote(aid)
    root = ET.fromstring(get(url, retry_wait=10))
    entry = root.find(ATOM + "entry")
    if entry is None:
        raise RuntimeError(f"arxiv has no entry for {aid}")
    return " ".join((entry.findtext(ATOM + "title") or "").split())


def published_version(w):
    """Swap a reference-less preprint record for the published one.

    OpenAlex files an arxiv preprint as its own work, and those records carry
    no ``referenced_works`` — feeding them to lineage yields an empty ancestor
    set. The venue version is a separate work with the bibliography attached,
    reachable by title.
    """
    if w.get("referenced_works"):
        return w
    title = " ".join((w.get("title") or "").replace("\\n", " ").split())
    if not title:
        return w
    time.sleep(OA_PACE)
    try:
        data = oa_get("/works", {
            "filter": "title.search:" + re.sub(r"[,:]", " ", title),
            "per-page": 5,
            "select": WORK_FIELDS,
        })
    except Exception:  # noqa: BLE001 - the preprint record is still usable
        return w
    def norm(t):
        return re.sub(r"[^a-z0-9]", "", (t or "").replace("\\n", " ").lower())
    same = [c for c in data.get("results", []) if norm(c.get("title")) == norm(title)]
    if not same:
        return w
    best = max(same, key=lambda c: len(c.get("referenced_works") or []))
    return best if best.get("referenced_works") else w


def fetch_work(raw):
    """Fetch an OpenAlex work from a W-id, DOI, or arxiv id.

    Arxiv-only DOIs (10.48550/...) are missing from OpenAlex whenever the
    paper was later published at a venue, so bare arxiv ids fall back to a
    title match when the DOI lookup 404s.
    """
    r = raw.strip()
    if re.fullmatch(r"W\d+", r):
        return oa_get("/works/" + r, {"select": WORK_FIELDS})
    if r.startswith("10."):
        return oa_get("/works/doi:" + r, {"select": WORK_FIELDS})
    if re.fullmatch(r"\d{4}\.\d{4,5}(v\d+)?", r) or re.fullmatch(r"[a-z-]+(\.[A-Z]{2})?/\d{7}", r):
        aid = re.sub(r"v\d+$", "", r)
        try:
            return oa_get("/works/doi:10.48550/arXiv." + aid, {"select": WORK_FIELDS})
        except Exception:  # noqa: BLE001 - fall back to title match
            title = arxiv_title(aid)
            time.sleep(OA_PACE)
            data = oa_get("/works", {
                # commas and colons are filter syntax; strip them from the value
                "filter": "title.search:" + re.sub(r"[,:]", " ", title),
                "per-page": 1,
                "select": WORK_FIELDS,
            })
            results = data.get("results", [])
            if not results:
                raise RuntimeError(f"no OpenAlex match for arxiv {aid} ({title!r})")
            return results[0]
    raise ValueError(f"unrecognised id: {raw}")


def cmd_resolve(args):
    """Titles to OpenAlex ids, so named-canon papers can be fed to lineage.

    Step 4 names its papers rather than finding them by keyword, and those
    papers then have no identifier to hand. Reference counts come back with the
    candidates because a record with an empty bibliography is useless to
    lineage, and the caller needs to see that before picking.
    """
    out, failures = [], []
    for i, q in enumerate(args.titles):
        if i:
            time.sleep(OA_PACE)
        try:
            data = oa_get("/works", {
                "filter": "title.search:" + re.sub(r"[,:]", " ", q),
                "per-page": args.max,
                "select": WORK_FIELDS,
            })
        except Exception as exc:  # noqa: BLE001
            failures.append({"title": q, "error": str(exc)})
            continue
        out.append({
            "asked": q,
            "candidates": [
                {"openalex_id": short_id(w["id"]), "title": w.get("title"),
                 "year": w.get("publication_year"),
                 "n_refs": len(w.get("referenced_works") or []),
                 "cited_by_count": w.get("cited_by_count")}
                for w in data.get("results", [])
            ],
        })
    print(json.dumps({
        "source": "openalex",
        "status": "down" if len(failures) == len(args.titles) else "ok",
        "note": "pick by title and year; n_refs 0 means the record carries no "
                "bibliography and will contribute nothing to lineage",
        "failures": failures,
        "resolved": out,
    }, indent=1))


def paper_key(title, fallback):
    """Collapse the several records OpenAlex keeps for one paper.

    The same work is often filed two or three times — an arxiv preprint beside
    its venue version, or a book split across its chapters — and counting those
    as separate papers invents convergence that is not there. Titles are matched
    on a normalised prefix because the duplicates are usually truncations of
    each other.
    """
    t = re.sub(r"[^a-z0-9]", "", (title or "").replace("\\n", " ").lower())
    return t[:25] if t else "id:" + fallback


def cmd_lineage(args):
    inputs, failures = [], []
    for i, raw in enumerate(args.ids):
        if i:
            time.sleep(OA_PACE)
        try:
            w = published_version(fetch_work(raw))
        except Exception as exc:  # noqa: BLE001
            failures.append({"id": raw, "error": str(exc)})
            continue
        wid = short_id(w["id"])
        time.sleep(OA_PACE)
        citing = []
        try:
            cites_filter = f"cites:{wid}"
            if args.citing_since:
                cites_filter += f",from_publication_date:{args.citing_since}"
            data = oa_get("/works", {
                "filter": cites_filter,
                "sort": "cited_by_count:desc",
                "per-page": args.top_citing,
                "select": "id,title,publication_year,cited_by_count",
            })
            citing = data.get("results", [])
        except Exception as exc:  # noqa: BLE001
            failures.append({"id": raw, "error": f"citations: {exc}"})
        seen = next((p for p in inputs if p["openalex_id"] == wid), None)
        if seen:  # the note cited the same paper twice, e.g. by arxiv id and DOI
            seen.setdefault("also_given", []).append(raw)
            continue
        inputs.append({
            "given": raw,
            "openalex_id": wid,
            "title": w.get("title"),
            "refs": [short_id(r) for r in w.get("referenced_works") or []],
            "citing": citing,
        })

    ref_owners = defaultdict(dict)
    for p in inputs:
        for r in set(p["refs"]):
            ref_owners[r][paper_key(p["title"], p["given"])] = p["title"] or p["given"]
    convergent = sorted(
        ((r, list(o.values())) for r, o in ref_owners.items() if len(o) >= 2),
        key=lambda kv: -len(kv[1]),
    )[:25]
    ancestors = []
    for r, owners in convergent:
        time.sleep(OA_PACE)
        try:
            w = oa_get("/works/" + r, {"select": "id,title,publication_year,cited_by_count"})
        except Exception as exc:  # noqa: BLE001
            failures.append({"id": r, "error": f"ancestor lookup: {exc}"})
            continue
        ancestors.append({
            "openalex_id": r,
            "title": w.get("title"),
            "year": w.get("publication_year"),
            "cited_by_count": w.get("cited_by_count"),
            "ancestor_of": owners,
        })

    cite_owners, cite_meta = defaultdict(dict), {}
    input_keys = {paper_key(p["title"], p["given"]) for p in inputs}
    for p in inputs:
        for c in p["citing"]:
            cid = short_id(c["id"])
            cite_owners[cid][paper_key(p["title"], p["given"])] = p["title"] or p["given"]
            cite_meta[cid] = c
    descendants = [
        {
            "openalex_id": cid,
            "title": cite_meta[cid].get("title"),
            "year": cite_meta[cid].get("publication_year"),
            "cited_by_count": cite_meta[cid].get("cited_by_count"),
            # a kept paper can cite its siblings; say so rather than listing it
            # among the descendants as if it were outside the set
            "is_input": paper_key(cite_meta[cid].get("title"), cid) in input_keys,
            "cites": list(owners.values()),
        }
        for cid, owners in cite_owners.items()
        if len(owners) >= 2
    ]
    descendants.sort(key=lambda d: -(d["cited_by_count"] or 0))

    # A spent OpenAlex budget fails the citing-works queries while single-work
    # lookups keep working, so a half-empty run still looks healthy. Say so.
    citing_failed = sum(1 for f in failures if str(f.get("error", "")).startswith("citations:"))
    if not inputs:
        status = "down"
    elif citing_failed > len(inputs) / 2:
        status = "degraded: descendants unavailable"
    else:
        status = "ok"
    print(json.dumps({
        "source": "openalex",
        "status": status,
        "note": (
            "descendants are approximate: computed from each paper's top "
            f"{args.top_citing} citing works by citation count"
        ),
        "inputs": [
            {"given": p["given"], "also_given": p.get("also_given", []),
             "openalex_id": p["openalex_id"], "title": p["title"],
             "n_refs": len(p["refs"]), "n_citing_fetched": len(p["citing"])}
            for p in inputs
        ],
        "failures": failures,
        "convergent_ancestors": ancestors,
        "influential_descendants": descendants[:25],
    }, indent=1))


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("arxiv")
    p.add_argument("queries", nargs="+")
    p.add_argument("--max", type=int, default=25)
    p.add_argument("--categories", default="cs.HC,cs.AI,cs.CY,cs.LG,cs.CL",
                   help="comma-separated whitelist; pass '' to disable")
    p.set_defaults(func=cmd_arxiv)

    p = sub.add_parser("openalex-resolve")
    p.add_argument("titles", nargs="+")
    p.add_argument("--max", type=int, default=4)
    p.set_defaults(func=cmd_resolve)

    p = sub.add_parser("openalex-search")
    p.add_argument("queries", nargs="+")
    p.add_argument("--max", type=int, default=25)
    p.add_argument("--hci", action="store_true",
                   help="restrict to the HCI subfield (primary_topic.subfield.id:1709)")
    p.add_argument("--from-date", default=None,
                   help="only work published on/after this date (YYYY-MM-DD)")
    p.add_argument("--filter", default=None,
                   help="raw OpenAlex filter clause(s), comma-joined into the request")
    p.set_defaults(func=cmd_oa_search)

    p = sub.add_parser("openalex-lineage")
    p.add_argument("ids", nargs="+")
    p.add_argument("--top-citing", type=int, default=50)
    p.add_argument("--citing-since", default=None,
                   help="only citing work published on/after this date (YYYY-MM-DD) — "
                        "the refresh-as-diff move: descendants new since a note's date")
    p.set_defaults(func=cmd_lineage)

    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
