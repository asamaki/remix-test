import React, { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { MetaFunction } from "@remix-run/node";
import { GhostIcon, Upload, Download, Info, Image as ImageIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";

export const meta: MetaFunction = () => {
  return [
    { title: "画像サイズ変更 簡単・高品質なリサイズツール|ゴーストツールズ" },
    { name: "description", content: "ゴーストツールズは、安全で使いやすい画像サイズ変更ツールを提供します。オフラインで動作し、アップロード不要で簡単に画像のリサイズが可能です。" },
    { name: "keywords", content: "画像サイズ変更,リサイズ,画像編集,オフライン,プライバシー保護,ゴーストツールズ" },
    { property: "og:title", content: "画像サイズ変更 簡単・高品質なリサイズツール|ゴーストツールズ" },
    { property: "og:description", content: "ゴーストツールズは、安全で使いやすい画像サイズ変更ツールを提供します。オフラインで動作し、アップロード不要で簡単に画像のリサイズが可能です。" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://ghost-tools.site/image-size-conversion" },
  ];
};

export default function ImageSizeConversion() {
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [resizing, setResizing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError("ファイルが選択されていません");
      setImage(null);
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const imgSrc = reader.result as string;
      const img = new Image();
      img.onload = () => {
        setImage({
          file,
          imgSrc,
          imageSize: file.size / (1024 * 1024),
          imageWidth: img.width,
          imageHeight: img.height,
          resizedImgSrc: null,
          resizedImageSize: null,
          resizedImageWidth: null,
          resizedImageHeight: null,
        });
        setError(null);
        setLoading(false);
      };
      img.src = imgSrc;
    };
    reader.onerror = () => {
      setError("ファイルの読み込みに失敗しました");
      setImage(null);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleResize = async () => {
    if (!image) {
      setError("ファイルが選択されていません");
      return;
    }

    const width = parseInt((document.getElementById("resize-width") as HTMLInputElement).value);
    const height = parseInt((document.getElementById("resize-height") as HTMLInputElement).value);

    setResizing(true);
    setProgress(0);

    try {
      const options = {
        maxWidthOrHeight: Math.max(width, height),
        useWebWorker: true,
      };

      const resizedFile = await imageCompression(image.file, options);

      const reader = new FileReader();
      reader.onloadend = () => {
        const resizedImgSrc = reader.result as string;
        const img = new Image();
        img.onload = () => {
          setImage({
            ...image,
            resizedImgSrc,
            resizedImageSize: resizedFile.size / (1024 * 1024),
            resizedImageWidth: img.width,
            resizedImageHeight: img.height,
            resizedFile,
          });
          setError(null);
          setResizing(false);
          setProgress(100);
        };
        img.src = resizedImgSrc;
      };
      reader.onerror = () => {
        setError("リサイズファイルの読み込みに失敗しました");
        setResizing(false);
      };
      reader.readAsDataURL(resizedFile);
    } catch (error) {
      setError("画像のリサイズに失敗しました");
      setResizing(false);
    }
  };

  const handleDownload = () => {
    if (image && image.resizedImgSrc) {
      const a = document.createElement("a");
      a.href = image.resizedImgSrc;
      a.download = image.resizedFile.name;
      a.click();
    }
  };

  return (
    <main className="flex-grow py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">画像サイズ変更</h1>
        
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <ul className="list-disc list-inside text-blue-800">
                <li>画像をリサイズできます。</li>
                <li>アップロードは行われず、すべてブラウザで処理されます。</li>
                <li>画像の縦横比は維持されます。</li>
              </ul>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">クリックして画像を選択</span>またはドラッグ＆ドロップ</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF</p>
                </div>
                <Input id="dropzone-file" type="file" accept="image/*" className="hidden" onChange={handleFileChange} ref={fileInputRef} />
              </label>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {loading && <p className="text-blue-500 mt-2">画像を読み込み中...</p>}
          </CardContent>
        </Card>

        {image && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">リサイズ設定</h2>
              <div className="mb-6">
                <p className="font-medium mb-2">元の画像</p>
                <div className="aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  <img src={image.imgSrc} alt="Original" className="object-cover w-full h-full" />
                </div>
                <p className="mt-2 text-sm text-center text-gray-500">
                  {image.imageSize.toFixed(2)}MB {image.imageWidth}×{image.imageHeight} {image.imgSrc.includes('jpeg') || image.imgSrc.includes('jpg') ? 'JPG' : 'PNG'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="resize-width" className="block text-sm font-medium text-gray-700">幅 (px)</label>
                  <Input type="number" id="resize-width" defaultValue={image.imageWidth} className="mt-1" />
                </div>
                <div>
                  <label htmlFor="resize-height" className="block text-sm font-medium text-gray-700">高さ (px)</label>
                  <Input type="number" id="resize-height" defaultValue={image.imageHeight} className="mt-1" />
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleResize} disabled={resizing}>
                <Upload className="mr-2 h-4 w-4" /> 画像をリサイズ
              </Button>
              {resizing && <p className="text-blue-500 mt-2">画像をリサイズ中... ({progress.toFixed(0)}%)</p>}
            </CardContent>
          </Card>
        )}

        {image && image.resizedImgSrc && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">リサイズ結果</h2>
              <div className="mb-6">
                <p className="font-medium mb-2">リサイズ後の画像</p>
                <div className="aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  <img src={image.resizedImgSrc} alt="Resized" className="object-cover w-full h-full" />
                </div>
                <p className="mt-2 text-sm text-center text-gray-500">
                  {image.resizedImageSize?.toFixed(2)}MB {image.resizedImageWidth}×{image.resizedImageHeight} {image.resizedImgSrc.includes('jpeg') || image.resizedImgSrc.includes('jpg') ? 'JPG' : 'PNG'}
                </p>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> リサイズ画像をダウンロード
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}