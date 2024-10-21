import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { useIsClient } from "usehooks-ts";

export default function App({ Component, pageProps }: AppProps) {
  if (useIsClient()) return <Component {...pageProps} />;
  return null;
}
