import React, { useState, useRef } from "react";
import { removeBackground } from "@imgly/background-removal";
import { MetaFunction } from "@remix-run/node";
import { GhostIcon, Upload, Download, Info, Image as ImageIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";

export const meta: MetaFunction = () => {
  return [
    { title: "画像背景透過 自動でお手軽に背景透過|ゴーストツールズ" },
    { name: "description", content: "画像内の背景を自動検出し、透過させるツールです。アップロードなしの簡単な操作で画像を加工できます。" },
    { name: "keywords", content: "画像,写真,加工,背景透過,プライバシー保護,画像編集,アップロードなし" },
    { property: "og:title", content: "画像背景透過 自動でお手軽に背景透過|ゴーストツールズ" },
    { property: "og:description", content: "画像内の背景を自動検出し、透過させるツールです。アップロードなしの簡単な操作で画像を加工できます。" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://ghost-tools.site/image-background-removal" },
  ];
};

export default function ImageBackgroundRemoval() {
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
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
          processedImgSrc: null,
          processedImageSize: null,
          processedImageWidth: null,
          processedImageHeight: null,
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

  const handleProcess = async () => {
    if (!image) {
      setError("ファイルが選択されていません");
      return;
    }

    setProcessing(true);
    setProgress(0);

    const { file } = image;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      try {
        const base64Image = reader.result as string;
        
        const updateProgress = () => {
          setProgress((prevProgress) => {
            if (prevProgress >= 90) return prevProgress;
            return prevProgress + 10;
          });
        };

        const progressInterval = setInterval(updateProgress, 500);

        const transparentImage = await removeBackground(base64Image);
        
        clearInterval(progressInterval);
        setProgress(100);

        const img = new Image();
        img.onload = () => {
          setImage({
            ...image,
            processedImgSrc: URL.createObjectURL(transparentImage),
            processedImageSize: transparentImage.size / (1024 * 1024),
            processedImageWidth: img.width,
            processedImageHeight: img.height,
          });
          setProcessing(false);
        };
        img.src = URL.createObjectURL(transparentImage);
      } catch (error) {
        setError("背景の透過処理に失敗しました");
        setProcessing(false);
      }
    };

    reader.onerror = () => {
      setError("ファイルの読み込みに失敗しました");
      setProcessing(false);
    };
  };

  const handleDownload = () => {
    if (image && image.processedImgSrc) {
      const a = document.createElement("a");
      a.href = image.processedImgSrc;
      a.download = `transparent_${image.file.name}`;
      a.click();
    }
  };

  return (
    <main className="flex-grow py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">画像背景透過</h1>
        
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <ul className="list-disc list-inside text-blue-800">
                <li>画像の背景を透過できます。</li>
                <li>アップロードは行われず、すべてブラウザで処理されます。</li>
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
                  <p className="text-xs text-gray-500">PNG, JPG</p>
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
              <h2 className="text-lg font-semibold mb-4">背景透過設定</h2>
              <div className="mb-6">
                <p className="font-medium mb-2">元の画像</p>
                <div className="aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  <img src={image.imgSrc} alt="Original" className="object-cover w-full h-full" />
                </div>
                <p className="mt-2 text-sm text-center text-gray-500">
                  {image.imageSize.toFixed(2)}MB {image.imageWidth}×{image.imageHeight} {image.imgSrc.includes('jpeg') || image.imgSrc.includes('jpg') ? 'JPG' : 'PNG'}
                </p>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleProcess} disabled={processing}>
                <Upload className="mr-2 h-4 w-4" /> 背景を透過
              </Button>
              {processing && <p className="text-blue-500 mt-2">画像を処理中... ({progress.toFixed(0)}%)</p>}
            </CardContent>
          </Card>
        )}

        {image && image.processedImgSrc && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">背景透過結果</h2>
              <div className="mb-6">
                <p className="font-medium mb-2">背景透過後の画像</p>
                <div className="aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  <img src={image.processedImgSrc} alt="Processed" className="object-cover w-full h-full" />
                </div>
                <p className="mt-2 text-sm text-center text-gray-500">
                  {image.processedImageSize?.toFixed(2)}MB {image.processedImageWidth}×{image.processedImageHeight} PNG
                </p>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> 透過画像をダウンロード
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}