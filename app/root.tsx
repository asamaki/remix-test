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
import { useEffect } from "react";
import * as gtag from "~/utils/gtags.client";
import { GhostIcon } from "lucide-react"

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
      <body>
        <div className="min-h-screen flex flex-col bg-white text-gray-800">
          <header className="py-6 border-b border-gray-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
              <a href="/" className="flex items-center space-x-2">
              <GhostIcon className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">ゴーストツールズ</span>
            </a>
                {/* <nav>
                  <ul className="flex space-x-6">
                    {["ホーム", "サービス", "会社概要", "お問い合わせ"].map((item) => (
                      <li key={item}>
                        <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">{item}</a>
                      </li>
                    ))}
                  </ul>
                </nav> */}
              </div>
            </div>
          </header>
          {children}
          <ScrollRestoration />
          <Scripts />
          {/* Add preline script on every page */}
          {PrelineScript && <PrelineScript />}
          <footer className="py-8 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-gray-600">&copy; 2024 Ghost Tools. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />
}
