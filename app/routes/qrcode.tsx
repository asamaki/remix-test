import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { MetaFunction } from '@remix-run/node';

const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return null;
  }
  return <>{children}</>;
};

export const meta: MetaFunction = () => {
  return [
    { title: "QRコード生成 簡単・安全にQRコードを作成|ゴーストツールズ" },
    { name: "description", content: "URLからQRコードを簡単に生成するツールです。アップロードなしでブラウザ内で安全に処理され、すぐにQRコードが作成できます。" },
    { name: "keywords", content: "QRコード,生成,作成,URL,オフライン,プライバシー保護,ブラウザ処理,アップロードなし" },
    { property: "og:title", content: "QRコード生成 簡単・安全にQRコードを作成|ゴーストツールズ" },
    { property: "og:description", content: "URLからQRコードを簡単に生成するツールです。アップロードなしでブラウザ内で安全に処理され、すぐにQRコードが作成できます。" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://ghost-tools.site/qrcode" },
  ];
};

export default function QRCodeGenerator() {
  const [url, setUrl] = useState('https://example.com');

  const handleDownload = () => {
    const canvas = document.createElement("canvas");
    const svg = document.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx!.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "qrcode.png";
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold text-center mb-6">QRコード生成ツール</h1>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <ul className="list-disc space-y-1 ps-5 text-md text-gray-800 mb-4">
                  <li className="ps-1">URLからQRコードをつくることができます。</li>
                  <li className="ps-1">
                    アップロードは行われず、すべてブラウザで処理されます。
                  </li>
                </ul>
                <div className="flex flex-col">
                  <label className="leading-loose">URL入力</label>
                  <input
                    type="text"
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div className="flex justify-center mt-6">
                  <ClientOnly>
                    <QRCodeSVG value={url} size={256} />
                  </ClientOnly>
                </div>
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    QRコードをダウンロード
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}