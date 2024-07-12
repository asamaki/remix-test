import React, { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { MetaFunction } from "@remix-run/node";

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

export default function Index() {
  const [error, setError] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [resizedImgSrc, setResizedImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [resizing, setResizing] = useState<boolean>(false);
  const [imageSize, setImageSize] = useState<number | null>(null); // 元画像のサイズ
  const [imageWidth, setImageWidth] = useState<number | null>(null); // 元画像の幅
  const [imageHeight, setImageHeight] = useState<number | null>(null); // 元画像の高さ
  const [resizedImageSize, setResizedImageSize] = useState<number | null>(null); // リサイズ画像のサイズ
  const [resizedImageWidth, setResizedImageWidth] = useState<number | null>(null); // リサイズ画像の幅
  const [resizedImageHeight, setResizedImageHeight] = useState<number | null>(null); // リサイズ画像の高さ
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resizedFileRef = useRef<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError("ファイルが選択されていません");
      setImgSrc(null);
      setImageSize(null);
      setImageWidth(null);
      setImageHeight(null);
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImgSrc(reader.result as string);
      setError(null);
      setLoading(false);

      // 画像のサイズと縦横を取得
      const img = new Image();
      img.onload = () => {
        setImageSize(file.size / (1024 * 1024)); // MBに変換
        setImageWidth(img.width);
        setImageHeight(img.height);
      };
      img.src = reader.result as string;
    };
    reader.onerror = () => {
      setError("ファイルの読み込みに失敗しました");
      setImgSrc(null);
      setLoading(false);
      setImageSize(null);
      setImageWidth(null);
      setImageHeight(null);
    };
    reader.readAsDataURL(file);
  };

  const handleResize = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setError("ファイルが選択されていません");
      return;
    }

    const file = fileInputRef.current.files[0];
    const width = parseInt((document.getElementById("resize-width") as HTMLInputElement).value);
    const height = parseInt((document.getElementById("resize-height") as HTMLInputElement).value);

    setResizing(true);
    try {
      const options = {
        maxWidthOrHeight: Math.max(width, height),
        useWebWorker: true,
      };

      const resizedFile = await imageCompression(file, options);
      resizedFileRef.current = resizedFile;

      const reader = new FileReader();
      reader.onloadend = () => {
        setResizedImgSrc(reader.result as string);
        setError(null);
        setResizing(false);

        // リサイズ画像のサイズと縦横を取得
        const img = new Image();
        img.onload = () => {
          setResizedImageSize(resizedFile.size / (1024 * 1024)); // MBに変換
          setResizedImageWidth(img.width);
          setResizedImageHeight(img.height);
        };
        img.src = reader.result as string;
      };
      reader.onerror = () => {
        setError("リサイズファイルの読み込みに失敗しました");
        setResizedImgSrc(null);
        setResizing(false);
      };
      reader.readAsDataURL(resizedFile);
    } catch (error) {
      setError("画像のリサイズに失敗しました");
      setResizedImgSrc(null);
      setResizing(false);
    }
  };

  const handleDownload = () => {
    if (resizedImgSrc && resizedFileRef.current) {
      const a = document.createElement("a");
      a.href = resizedImgSrc;
      a.download = resizedFileRef.current.name;
      a.click();
    }
  };

  return (
    <>
      <div className="max-w-4xl px-4 py-10 sm:px-4 lg:px-8 lg:py-8 mx-auto">
        <div className="bg-white rounded-xl shadow p-4 sm:p-7">
          <div className="grid sm:grid-cols-12 gap-2 sm:gap-4 py-8 first:pt-0 last:pb-0 border-t first:border-transparent border-gray-200">
            <div className="sm:col-span-12">
              <h2 className="text-lg font-semibold text-gray-800">画像サイズ変更</h2>
            </div>
            <div className="sm:col-span-12">
              <ul className="list-disc space-y-1 ps-5 text-md text-gray-800 mb-4">
                <li className="ps-1">画像をリサイズできます。</li>
                <li className="ps-1">
                  アップロードは行われず、すべてブラウザで処理されます。
                </li>
                <li className="ps-1">
                  画像の縦横比は維持されます。
                </li>
              </ul>

              <form>
                <input
                  type="file"
                  name="img"
                  accept="image/*"
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

                {imgSrc &&
                imageSize !== null &&
                imageWidth !== null &&
                imageHeight !== null ? (
                  <>
                    <h2 className="mt-4">
                      読み込まれた画像（アップロードされていません）
                    </h2>
                    <img
                      className="my-4"
                      alt="uploaded"
                      src={imgSrc}
                      style={{ maxWidth: "30%" }}
                    />
                    <p>
                      {imageSize.toFixed(2)}MB {imageWidth}×{imageHeight}
                    </p>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        幅 (px)
                      </label>
                      <input
                        type="number"
                        id="resize-width"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        defaultValue={imageWidth}
                      />
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        高さ (px)
                      </label>
                      <input
                        type="number"
                        id="resize-height"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        defaultValue={imageHeight}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleResize}
                      className="w-full my-4 py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      画像をリサイズ（アップロードなし）
                    </button>
                    {resizing ? <p>画像をリサイズ中...</p> : null}
                  </>
                ) : null}
              </form>

              {resizedImgSrc ? (
                <>
                  <h2>リサイズされた画像</h2>
                  <img
                    alt="resized"
                    src={resizedImgSrc}
                    style={{ maxWidth: "30%" }}
                  />
                  <p>
                    {resizedImageSize?.toFixed(2)}MB {resizedImageWidth}×
                    {resizedImageHeight}
                  </p>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-x-2 text-gray-500 hover:text-blue-600 whitespace-nowrap dark:text-neutral-500 dark:hover:text-blue-500"
                  >
                    <svg
                      className="flex-shrink-0 size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" x2="12" y1="15" y2="3" />
                    </svg>
                    ダウンロード
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
