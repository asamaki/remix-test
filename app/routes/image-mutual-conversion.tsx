import React, { useState, useRef } from "react";
import imageCompression from "browser-image-compression";

export default function Index() {
  const [error, setError] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [convertedImgSrc, setConvertedImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [converting, setConverting] = useState<boolean>(false);
  const [imageSize, setImageSize] = useState<number | null>(null); // 元画像のサイズ
  const [imageWidth, setImageWidth] = useState<number | null>(null); // 元画像の幅
  const [imageHeight, setImageHeight] = useState<number | null>(null); // 元画像の高さ
  const [convertedImageSize, setConvertedImageSize] = useState<number | null>(null); // 変換後画像のサイズ
  const [convertedImageWidth, setConvertedImageWidth] = useState<number | null>(null); // 変換後画像の幅
  const [convertedImageHeight, setConvertedImageHeight] = useState<number | null>(null); // 変換後画像の高さ
  const [convertedFormat, setConvertedFormat] = useState<string | null>(null); // 変換後の画像形式
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

      const img = new Image();
      img.onload = () => {
        setImageSize(file.size / (1024 * 1024)); // MBに変換
        setImageWidth(img.width);
        setImageHeight(img.height);
        setLoading(false);
      };
      img.src = reader.result as string;
    };
    reader.onerror = () => {
      setError("ファイルの読み込みに失敗しました");
      setImgSrc(null);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const convertImage = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setError("ファイルが選択されていません");
      return;
    }

    const file = fileInputRef.current.files[0];
    setLoading(true);
    setConverting(true);

    try {
      let convertedFile: File;
      let targetFormat: "image/jpeg" | "image/png";

      if (file.type === "image/jpeg" || file.name.toLowerCase().endsWith(".jpg") || file.name.toLowerCase().endsWith(".jpeg")) {
        targetFormat = "image/png";
        setConvertedFormat("PNG");
      } else if (file.type === "image/png" || file.name.toLowerCase().endsWith(".png")) {
        targetFormat = "image/jpeg";
        setConvertedFormat("JPG");
      } else {
        throw new Error("サポートされていないファイル形式です");
      }

      const options = {
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        fileType: targetFormat === "image/jpeg" ? "jpg" : "png",
      };

      convertedFile = await imageCompression(file, options);

      const reader = new FileReader();
      reader.onloadend = () => {
        setConvertedImgSrc(reader.result as string);

        const img = new Image();
        img.onload = () => {
          setConvertedImageSize(convertedFile.size / (1024 * 1024)); // MBに変換
          setConvertedImageWidth(img.width);
          setConvertedImageHeight(img.height);
          setLoading(false);
          setConverting(false);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(convertedFile);
    } catch (error) {
      setError("画像の変換に失敗しました");
      setLoading(false);
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (convertedImgSrc) {
      const a = document.createElement("a");
      a.href = convertedImgSrc;
      a.download = "converted_image";
      a.click();
    }
  };

  return (
    <>
      <div className="max-w-4xl px-4 py-10 sm:px-4 lg:px-8 lg:py-8 mx-auto">
        <div className="bg-white rounded-xl shadow p-4 sm:p-7">
          <div className="grid sm:grid-cols-12 gap-2 sm:gap-4 py-8 first:pt-0 last:pb-0 border-t first:border-transparent border-gray-200">
            <div className="sm:col-span-12">
              <h2 className="text-lg font-semibold text-gray-800">画像形式変換</h2>
            </div>
            <div className="sm:col-span-12">
              <ul className="list-disc space-y-1 ps-5 text-md text-gray-800 mb-4">
                <li className="ps-1">画像の形式を相互に変換できます。</li>
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
                  className="block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                />
                {error ? <h2>{error}</h2> : null}
                {loading ? <p>画像を読み込み中...</p> : null}

                {imgSrc ? (
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
                      変換前: {imageSize?.toFixed(2)}MB {imageWidth}×{imageHeight}
                    </p>
                    <button
                      type="button"
                      onClick={convertImage}
                      className="w-full my-4 py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      画像を変換（アップロードなし）
                    </button>
                    {converting ? <p>画像を変換中...</p> : null}
                  </>
                ) : null}
              </form>

              {convertedImgSrc ? (
                <>
                  <h2>変換された画像</h2>
                  <img
                    alt="converted"
                    src={convertedImgSrc}
                    style={{ maxWidth: "30%" }}
                  />
                  <p>
                    変換後: {convertedImageSize?.toFixed(2)}MB {convertedImageWidth}×
                    {convertedImageHeight} {convertedFormat}
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
