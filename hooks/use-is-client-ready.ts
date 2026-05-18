"use client";

import * as React from "react";

/** True after mount so SSR and the first client paint match for hydration-sensitive UI. */
export function useIsClientReady(): boolean {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    queueMicrotask(() => {
      setReady(true);
    });
  }, []);
  return ready;
}
