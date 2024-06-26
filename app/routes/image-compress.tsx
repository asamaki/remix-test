import React, { useState, useRef } from "react";
import imageCompression from "browser-image-compression";

export default function Index() {
  const [error, setError] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [compressedImgSrc, setCompressedImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [compressing, setCompressing] = useState<boolean>(false);
  const [compressionRate, setCompressionRate] = useState<number>(50); // デフォルトは50%
  const [imageSize, setImageSize] = useState<number | null>(null); // 元画像のサイズ
  const [imageWidth, setImageWidth] = useState<number | null>(null); // 元画像の幅
  const [imageHeight, setImageHeight] = useState<number | null>(null); // 元画像の高さ
  const [compressedImageSize, setCompressedImageSize] = useState<number | null>(
    null,
  ); // 圧縮画像のサイズ
  const [compressedImageWidth, setCompressedImageWidth] = useState<
    number | null
  >(null); // 圧縮画像の幅
  const [compressedImageHeight, setCompressedImageHeight] = useState<
    number | null
  >(null); // 圧縮画像の高さ
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const compressedFileRef = useRef<File | null>(null);

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

  const handleCompress = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setError("ファイルが選択されていません");
      return;
    }

    const file = fileInputRef.current.files[0];
    const targetSizeMB = (file.size / (1024 * 1024)) * (compressionRate / 100);

    setCompressing(true);
    try {
      const options = {
        maxSizeMB: targetSizeMB,
        useWebWorker: true,
        alwaysKeepResolution: true,
      };

      const compressedFile = await imageCompression(file, options);
      compressedFileRef.current = compressedFile;

      const reader = new FileReader();
      reader.onloadend = () => {
        setCompressedImgSrc(reader.result as string);
        setError(null);
        setCompressing(false);

        // 圧縮画像のサイズと縦横を取得
        const img = new Image();
        img.onload = () => {
          setCompressedImageSize(compressedFile.size / (1024 * 1024)); // MBに変換
          setCompressedImageWidth(img.width);
          setCompressedImageHeight(img.height);
        };
        img.src = reader.result as string;
      };
      reader.onerror = () => {
        setError("圧縮ファイルの読み込みに失敗しました");
        setCompressedImgSrc(null);
        setCompressing(false);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      setError("画像の圧縮に失敗しました");
      setCompressedImgSrc(null);
      setCompressing(false);
    }
  };

  const handleDownload = () => {
    if (compressedImgSrc && compressedFileRef.current) {
      const a = document.createElement("a");
      a.href = compressedImgSrc;
      a.download = compressedFileRef.current.name;
      a.click();
    }
  };

  return (
    <>
      <div className="max-w-4xl px-4 py-10 sm:px-4 lg:px-8 lg:py-8 mx-auto">
        <div className="bg-white rounded-xl shadow p-4 sm:p-7">
          <div className="grid sm:grid-cols-12 gap-2 sm:gap-4 py-8 first:pt-0 last:pb-0 border-t first:border-transparent border-gray-200">
            <div className="sm:col-span-12">
              <h2 className="text-lg font-semibold text-gray-800">画像圧縮</h2>
            </div>
            <div className="sm:col-span-12">
              <ul className="list-disc space-y-1 ps-5 text-md text-gray-800 mb-4">
                <li className="ps-1">画像を圧縮できます。</li>
                <li className="ps-1">
                  アップロードは行われず、すべてブラウザで処理されます。
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
                        圧縮率 {compressionRate}%
                      </label>

                      <input
                        type="range"
                        className="w-full bg-transparent cursor-pointer appearance-none disabled:opacity-50 disabled:pointer-events-none focus:outline-none
                        [&::-webkit-slider-thumb]:w-2.5
                        [&::-webkit-slider-thumb]:h-2.5
                        [&::-webkit-slider-thumb]:-mt-0.5
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:bg-white
                        [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(37,99,235,1)]
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:transition-all
                        [&::-webkit-slider-thumb]:duration-150
                        [&::-webkit-slider-thumb]:ease-in-out
                        [&::-webkit-slider-thumb]:

                        [&::-moz-range-thumb]:w-2.5
                        [&::-moz-range-thumb]:h-2.5
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
                    {compressing ? <p>画像を圧縮中...</p> : null}
                  </>
                ) : null}
              </form>

              {compressedImgSrc ? (
                <>
                  <h2>圧縮された画像</h2>
                  <img
                    alt="compressed"
                    src={compressedImgSrc}
                    style={{ maxWidth: "30%" }}
                  />
                  <p>
                    {compressedImageSize?.toFixed(2)}MB {compressedImageWidth}×
                    {compressedImageHeight}
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
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
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
