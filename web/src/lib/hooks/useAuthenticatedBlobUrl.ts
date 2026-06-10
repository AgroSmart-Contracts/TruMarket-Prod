import { useEffect, useState } from "react";

import { fetchVercelBlobObjectUrl, isVercelBlobObjectUrl } from "src/lib/vercel-blob";

export type AuthenticatedBlobUrlState = {
  /** Resolved URL: original string for non-Blob URLs, or a `blob:` object URL for private Vercel Blob. */
  objectUrl: string | undefined;
  /** True while fetching a private Vercel Blob. */
  loading: boolean;
};

/**
 * For Vercel Blob URLs on a private store, returns a short-lived `blob:` URL fetched with the user JWT.
 * For other URLs, returns the original string.
 */
export function useAuthenticatedBlobUrl(url: string | undefined | null): AuthenticatedBlobUrlState {
  const [state, setState] = useState<AuthenticatedBlobUrlState>(() => {
    if (!url) {
      return { objectUrl: undefined, loading: false };
    }
    if (!isVercelBlobObjectUrl(url)) {
      return { objectUrl: url, loading: false };
    }
    return { objectUrl: undefined, loading: true };
  });

  useEffect(() => {
    if (!url) {
      setState({ objectUrl: undefined, loading: false });
      return;
    }

    if (!isVercelBlobObjectUrl(url)) {
      setState({ objectUrl: url, loading: false });
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    setState({ objectUrl: undefined, loading: true });

    void (async () => {
      try {
        objectUrl = await fetchVercelBlobObjectUrl(url);
        if (!cancelled) {
          setState({ objectUrl, loading: false });
        } else if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      } catch {
        if (!cancelled) {
          setState({ objectUrl: undefined, loading: false });
        }
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  return state;
}
