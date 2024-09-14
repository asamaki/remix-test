import React, { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { MetaFunction } from "@remix-run/node";
import { GhostIcon, Upload, Download, Info, Image as ImageIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Slider } from "~/components/ui/slider";
import { Card, CardContent } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";

export const meta: MetaFunction = () => {
  return [
    { title: "画像圧縮 簡単・高品質な画像圧縮ツール|ゴーストツールズ" },
    { name: "description", content: "ゴーストツールズは、高品質かつ安全な画像圧縮ツールを提供します。オフラインで動作し、アップロード不要で簡単に画像サイズを軽量化できます。" },
    { name: "keywords", content: "画像圧縮,画像最適化,ファイルサイズ削減,オフライン,プライバシー保護,ゴーストツールズ" },
    { property: "og:title", content: "画像圧縮 簡単・高品質な画像圧縮ツール|ゴーストツールズ" },
    { property: "og:description", content: "ゴーストツールズは、高品質かつ安全な画像圧縮ツールを提供します。オフラインで動作し、アップロード不要で簡単に画像サイズを軽量化できます。" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://ghost-tools.site/image-compress" },
  ];
};

export default function ImageCompress() {
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [compressing, setCompressing] = useState<boolean>(false);
  const [compressionRate, setCompressionRate] = useState<number>(50);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setError("ファイルが選択されていません");
      setImages([]);
      return;
    }
    if (files.length > 3) {
      setError("一度に選択できる画像の最大枚数は3枚です");
      setImages([]);
      return;
    }
    setLoading(true);
    const newImages = Array.from(files).map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const imgSrc = reader.result as string;
          const img = new Image();
          img.onload = () => {
            resolve({
              file,
              imgSrc,
              imageSize: file.size / (1024 * 1024),
              imageWidth: img.width,
              imageHeight: img.height,
              compressedImgSrc: null,
              compressedImageSize: null,
              compressedImageWidth: null,
              compressedImageHeight: null,
            });
          };
          img.src = imgSrc;
        };
        reader.onerror = () => {
          reject("ファイルの読み込みに失敗しました");
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newImages)
      .then((results) => {
        setImages(results);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err as string);
        setLoading(false);
      });
  };

  const handleCompress = async () => {
    if (!fileInputRef.current?.files || fileInputRef.current.files.length === 0) {
      setError("ファイルが選択されていません");
      return;
    }

    setCompressing(true);
    setProgress(0);

    try {
      const compressedImages = await Promise.all(
        images.map(async (image, index) => {
          const file = image.file;
          const targetSizeMB = (file.size / (1024 * 1024)) * (compressionRate / 100);

          const options = {
            maxSizeMB: targetSizeMB,
            useWebWorker: true,
            alwaysKeepResolution: true,
          };

          const compressedFile = await imageCompression(file, options);

          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const compressedImgSrc = reader.result as string;
              const img = new Image();
              img.onload = () => {
                resolve({
                  ...image,
                  compressedImgSrc,
                  compressedImageSize: compressedFile.size / (1024 * 1024),
                  compressedImageWidth: img.width,
                  compressedImageHeight: img.height,
                  compressedFile,
                });
                setProgress(((index + 1) / images.length) * 100);
              };
              img.src = compressedImgSrc;
            };
            reader.onerror = () => {
              reject("圧縮ファイルの読み込みに失敗しました");
            };
            reader.readAsDataURL(compressedFile);
          });
        })
      );

      setImages(compressedImages);
      setError(null);
      setCompressing(false);
      setProgress(100);
    } catch (error) {
      setError("画像の圧縮に失敗しました");
      setCompressing(false);
    }
  };

  const handleDownloadAll = () => {
    images.forEach((image) => {
      if (image.compressedImgSrc) {
        handleDownload(image.compressedImgSrc, image.compressedFile.name);
      }
    });
  };

  const handleDownload = (compressedImgSrc: string, name: string) => {
    const a = document.createElement("a");
    a.href = compressedImgSrc;
    a.download = name;
    a.click();
  };

  return (
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">画像圧縮</h1>
          
          <Alert className="mb-8">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                <li>画像を圧縮できます。</li>
                <li>アップロードは行われず、すべてブラウザで処理されます。</li>
                <li>一度に選択できる画像の最大枚数は3枚です</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">クリックして画像を選択</span>またはドラッグ＆ドロップ</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (最大3枚まで)</p>
                  </div>
                  <Input id="dropzone-file" type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} ref={fileInputRef} />
                </label>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
              {loading && <p className="text-blue-500 mt-2">画像を読み込み中...</p>}
            </CardContent>
          </Card>

          {images.length > 0 && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">圧縮設定</h2>
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-sm font-medium min-w-[80px]">圧縮率:</span>
                  <Slider
                    value={[compressionRate]}
                    onValueChange={(value) => setCompressionRate(value[0])}
                    max={99.9}
                    step={0.1}
                    className="flex-grow"
                  />
                  <span className="text-sm font-medium min-w-[40px] text-right">{compressionRate.toFixed(1)}%</span>
                </div>
                <div className="mb-6">
                  <p className="font-medium mb-2">元の画像</p>
                  <div className="flex flex-wrap gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="w-1/3">
                        <div className="aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                          <img src={image.imgSrc} alt={`Original ${index + 1}`} className="object-cover w-full h-full" />
                        </div>
                        <p className="mt-2 text-sm text-center text-gray-500">
                          {image.imageSize.toFixed(2)}MB {image.imageWidth}×{image.imageHeight} {image.imgSrc.includes('jpeg') || image.imgSrc.includes('jpg') ? 'JPG' : 'PNG'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleCompress} disabled={compressing}>
                  <Upload className="mr-2 h-4 w-4" /> 画像を圧縮
                </Button>
                {compressing && <p className="text-blue-500 mt-2">画像を圧縮中... ({progress.toFixed(0)}%)</p>}
              </CardContent>
            </Card>
          )}

          {images.some((image) => image.compressedImgSrc) && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">圧縮結果</h2>
                <div className="mb-6">
                  <p className="font-medium mb-2">圧縮後の画像</p>
                  <div className="flex flex-wrap gap-4">
                    {images.map((image, index) => (
                      image.compressedImgSrc && (
                        <div key={index} className="w-1/3">
                          <div className="aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                            <img src={image.compressedImgSrc} alt={`Compressed ${index + 1}`} className="object-cover w-full h-full" />
                          </div>
                          <p className="mt-2 text-sm text-center text-gray-500">
                            {image.compressedImageSize?.toFixed(2)}MB {image.compressedImageWidth}×{image.compressedImageHeight} {image.compressedImgSrc.includes('jpeg') || image.compressedImgSrc.includes('jpg') ? 'JPG' : 'PNG'}
                          </p>
                        </div>
                      )
                    ))}
                  </div>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleDownloadAll}>
                  <Download className="mr-2 h-4 w-4" /> 圧縮画像をダウンロード
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
  );
}