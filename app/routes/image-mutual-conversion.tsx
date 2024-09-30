import React, { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { MetaFunction } from "@remix-run/node";
import { GhostIcon, Upload, Download, Info, Image as ImageIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";

export const meta: MetaFunction = () => {
  return [
    { title: "画像PNG/JPG変換 簡単・高品質なフォーマット変換ツール|ゴーストツールズ" },
    { name: "description", content: "ゴーストツールズは、安全で便利な画像フォーマット変換ツールを提供します。オフラインで動作し、アップロード不要でPNGとJPG間の変換が簡単に行えます。" },
    { name: "keywords", content: "画像変換,PNG,JPG,JPEG,フォーマット変更,オフライン,プライバシー保護,ゴーストツールズ" },
    { property: "og:title", content: "画像PNG/JPG変換 簡単・高品質なフォーマット変換ツール|ゴーストツールズ" },
    { property: "og:description", content: "ゴーストツールズは、安全で便利な画像フォーマット変換ツールを提供します。オフラインで動作し、アップロード不要でPNGとJPG間の変換が簡単に行えます。" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://ghost-tools.site/image-format-conversion" },
  ];
};

export default function ImageMutualConversion() {
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [converting, setConverting] = useState<boolean>(false);
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
          convertedImgSrc: null,
          convertedImageSize: null,
          convertedImageWidth: null,
          convertedImageHeight: null,
          convertedFormat: null,
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

  const convertImage = async () => {
    if (!image) {
      setError("ファイルが選択されていません");
      return;
    }

    setConverting(true);
    setProgress(0);

    try {
      let convertedFile: File;
      let targetFormat: "image/jpeg" | "image/png";

      if (image.file.type === "image/jpeg" || image.file.name.toLowerCase().endsWith(".jpg") || image.file.name.toLowerCase().endsWith(".jpeg")) {
        targetFormat = "image/png";
      } else if (image.file.type === "image/png" || image.file.name.toLowerCase().endsWith(".png")) {
        targetFormat = "image/jpeg";
      } else {
        throw new Error("サポートされていないファイル形式です");
      }

      const options = {
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        fileType: targetFormat === "image/jpeg" ? "jpg" : "png",
      };

      convertedFile = await imageCompression(image.file, options);

      const reader = new FileReader();
      reader.onloadend = () => {
        const convertedImgSrc = reader.result as string;
        const img = new Image();
        img.onload = () => {
          setImage({
            ...image,
            convertedImgSrc,
            convertedImageSize: convertedFile.size / (1024 * 1024),
            convertedImageWidth: img.width,
            convertedImageHeight: img.height,
            convertedFile,
            convertedFormat: targetFormat === "image/jpeg" ? "JPG" : "PNG",
          });
          setError(null);
          setConverting(false);
          setProgress(100);
        };
        img.src = convertedImgSrc;
      };
      reader.readAsDataURL(convertedFile);
    } catch (error) {
      setError("画像の変換に失敗しました");
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (image && image.convertedImgSrc) {
      const a = document.createElement("a");
      a.href = image.convertedImgSrc;
      a.download = `converted_image.${image.convertedFormat.toLowerCase()}`;
      a.click();
    }
  };

  return (
    <main className="flex-grow py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">画像PNG/JPG変換</h1>
        
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <ul className="list-disc list-inside text-blue-800">
                <li>画像の形式を相互に変換できます。</li>
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
              <h2 className="text-lg font-semibold mb-4">変換設定</h2>
              <div className="mb-6">
                <p className="font-medium mb-2">元の画像</p>
                <div className="aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  <img src={image.imgSrc} alt="Original" className="object-cover w-full h-full" />
                </div>
                <p className="mt-2 text-sm text-center text-gray-500">
                  {image.imageSize.toFixed(2)}MB {image.imageWidth}×{image.imageHeight} {image.imgSrc.includes('jpeg') || image.imgSrc.includes('jpg') ? 'JPG' : 'PNG'}
                </p>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={convertImage} disabled={converting}>
                <Upload className="mr-2 h-4 w-4" /> 画像を変換
              </Button>
              {converting && <p className="text-blue-500 mt-2">画像を変換中... ({progress.toFixed(0)}%)</p>}
            </CardContent>
          </Card>
        )}

        {image && image.convertedImgSrc && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">変換結果</h2>
              <div className="mb-6">
                <p className="font-medium mb-2">変換後の画像</p>
                <div className="aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  <img src={image.convertedImgSrc} alt="Converted" className="object-cover w-full h-full" />
                </div>
                <p className="mt-2 text-sm text-center text-gray-500">
                  {image.convertedImageSize?.toFixed(2)}MB {image.convertedImageWidth}×{image.convertedImageHeight} {image.convertedFormat}
                </p>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> 変換画像をダウンロード
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}