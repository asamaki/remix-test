import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { MetaFunction } from '@remix-run/node';
import { GhostIcon, Upload, Download, Info, Link } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";

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
  const [url, setUrl] = useState('');

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
    <main className="flex-grow py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">QRコード生成ツール</h1>
        
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <ul className="list-disc list-inside text-blue-800">
                <li>URLからQRコードをつくることができます。</li>
                <li>アップロードは行われず、すべてブラウザで処理されます。</li>
              </ul>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="mb-6">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                URL入力
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  <Link className="h-5 w-5" />
                </span>
                <Input
                  type="text"
                  id="url"
                  className="flex-1 rounded-none rounded-r-lg"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-center mb-6">
              <ClientOnly>
                <QRCodeSVG value={url} size={256} />
              </ClientOnly>
            </div>
            <Button onClick={handleDownload} className="w-full bg-blue-600 hover:bg-blue-700">
              <Download className="mr-2 h-4 w-4" /> QRコードをダウンロード
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}