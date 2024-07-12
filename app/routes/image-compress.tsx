import React, { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { MetaFunction } from "@remix-run/node";

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

export default function Index() {
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [compressing, setCompressing] = useState<boolean>(false);
  const [compressionRate, setCompressionRate] = useState<number>(50); // デフォルトは50%
  const [progress, setProgress] = useState<number>(0); // 進捗率を管理
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
    <>
      <div className="max-w-4xl px-4 py-10 sm:px-4 lg:px-8 lg:py-8 mx-auto">
        <div className="bg-white rounded-xl shadow p-4 sm:p-7">
          <div className="grid sm:grid-cols-12 gap-2 sm:gap-4 py-8 first:pt-0 last:pb-0 border-t first:border-transparent border-gray-200">
            <div className="sm:col-span-12">
              <h1 className="text-lg font-semibold text-gray-800">画像圧縮</h1>
            </div>
            <div className="sm:col-span-12">
              <ul className="list-disc space-y-1 ps-5 text-md text-gray-800 mb-4">
                <li className="ps-1">画像を圧縮できます。</li>
                <li className="ps-1">
                  アップロードは行われず、すべてブラウザで処理されます。
                </li>
                <li className="ps-1">一度に選択できる画像の最大枚数は3枚です</li>
              </ul>

              <form>
                <input
                  type="file"
                  name="img"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none
                        file:bg-gray-50 file:border-0
                        file:bg-gray-100 file:me-4
                        file:py-2 file:px-4
                      "
                />
                {error ? <h2>{error}</h2> : null}
                {loading ? <p>画像を読み込み中...</p> : null}

                {images.length > 0 && (
                  <>
                    <h2 className="mt-4">読み込まれた画像（アップロードされていません）</h2>
                    <div className="flex flex-wrap">
                      {images.map((image, index) => (
                        <div key={index} className="m-2 p-2 border rounded-lg">
                          <img
                            className="my-4"
                            alt="uploaded"
                            src={image.imgSrc}
                            style={{ maxWidth: "100px" }}
                          />
                          <p>
                            {image.imageSize.toFixed(2)}MB {image.imageWidth}×{image.imageHeight} {image.imgSrc.includes('jpeg') || image.imgSrc.includes('jpg') ? 'JPG' : 'PNG'}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        圧縮率 {compressionRate}%
                      </label>

                      <input
                        type="range"
                        className="w-full bg-transparent cursor-pointer appearance-none disabled:opacity-50 disabled:pointer-events-none focus:outline-none mb-4
                        [&::-webkit-slider-thumb]:w-5
                        [&::-webkit-slider-thumb]:h-5
                        [&::-webkit-slider-thumb]:-mt-1.5
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:bg-white
                        [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(37,99,235,1)]
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:transition-all
                        [&::-webkit-slider-thumb]:duration-150
                        [&::-webkit-slider-thumb]:ease-in-out

                        [&::-moz-range-thumb]:w-5
                        [&::-moz-range-thumb]:h-5
                        [&::-moz-range-thumb]:appearance-none
                        [&::-moz-range-thumb]:bg-white
                        [&::-moz-range-thumb]:border-4
                        [&::-moz-range-thumb]:border-blue-600
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:transition-all
                        [&::-moz-range-thumb]:duration-150
                        [&::-moz-range-thumb]:ease-in-out

                        [&::-webkit-slider-runnable-track]:w-full
                        [&::-webkit-slider-runnable-track]:h-2
                        [&::-webkit-slider-runnable-track]:bg-gray-100
                        [&::-webkit-slider-runnable-track]:rounded-full
                        [&::-webkit-slider-runnable-track]:

                        [&::-moz-range-track]:w-full
                        [&::-moz-range-track]:h-2
                        [&::-moz-range-track]:bg-gray-100
                        [&::-moz-range-track]:rounded-full"
                        id="basic-range-slider-usage"
                        value={compressionRate}
                        min={0.1}
                        max={99.9}
                        step={0.1}
                        onChange={(e) =>
                          setCompressionRate(Number(e.target.value))
                        }
                      ></input>
                    </div>

                    <button
                      type="button"
                      onClick={handleCompress}
                      className="w-full my-4 py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      画像を圧縮（アップロードなし）
                    </button>
                    {compressing ? <p>画像を圧縮中... ({progress.toFixed(0)}%)</p> : null}
                  </>
                )}
              </form>

              {images.some((image) => image.compressedImgSrc) && (
                <>
                  <h2>圧縮された画像</h2>
                  <div className="flex flex-wrap">
                    {images.map(
                      (image, index) =>
                        image.compressedImgSrc && (
                          <div key={index} className="m-2 p-2 border rounded-lg">
                            <img
                              alt="compressed"
                              src={image.compressedImgSrc}
                              style={{ maxWidth: "100px" }}
                            />
                            <p>
                              {image.compressedImageSize?.toFixed(2)}MB {image.compressedImageWidth}×
                              {image.compressedImageHeight} {image.compressedImgSrc.includes('jpeg') || image.compressedImgSrc.includes('jpg') ? 'JPG' : 'PNG'}
                            </p>
                          </div>
                        )
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadAll}
                    className="w-full my-4 py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    すべてダウンロード
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
