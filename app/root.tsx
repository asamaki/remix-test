import { json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import stylesheet from "~/tailwind.css?url";
import PrelineScript from "~/components/preline.client";
import HeaderIcon from "/public/icon-ghost-tools.png"
import { useEffect } from "react";
import * as gtag from "~/utils/gtags.client";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const loader = async () => {
  return json({ gaTrackingId: process.env.GA_TRACKING_ID });
};

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { gaTrackingId } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (gaTrackingId?.length) {
      gtag.pageview(location.pathname, gaTrackingId);
    }
  }, [location, gaTrackingId]);
  
  return (
    <html lang="ja" className="bg-gray-100">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      {process.env.NODE_ENV === "development" || !gaTrackingId ? null : (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
            />
            <script
              async
              id="gtag-init"
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${gaTrackingId}', {
                  page_path: window.location.pathname,
                });
              `,
              }}
            />
          </>
        )}
      <body >
          <header className="flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full bg-primary-950 text-sm py-3 sm:py-0 ">
            <nav className="relative max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8" aria-label="Global">
              <div className="flex items-center justify-between sm:my-4 sm:ps-4">
                
                
                <a className="flex-none text-xl font-semibold text-white" href="/" aria-label="Brand"><img className="inline-block size-[34px] mr-2" src={HeaderIcon} alt="Image Description"/>ゴーストツールズ</a>
              </div>
            </nav>
          </header>
        {children}
        <ScrollRestoration />
        <Scripts />
        {/* Add preline script on every page */}
        {PrelineScript && <PrelineScript />}
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />
}
