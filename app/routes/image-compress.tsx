import React, { useState, useRef } from "react";
import imageCompression from "browser-image-compression";

export default function Index() {
  const [error, setError] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [compressedImgSrc, setCompressedImgSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const compressedFileRef = useRef<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError("ファイルが選択されていません");
      setImgSrc(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImgSrc(reader.result as string);
      setError(null);
    };
    reader.onerror = () => {
      setError("ファイルの読み込みに失敗しました");
      setImgSrc(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCompress = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setError("ファイルが選択されていません");
      return;
    }

    const file = fileInputRef.current.files[0];

    try {
      const options = {
        maxSizeMB: 1, // 最大サイズを1MBに設定
        maxWidthOrHeight: 800, // 最大の幅または高さを800pxに設定
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      compressedFileRef.current = compressedFile;

      const reader = new FileReader();
      reader.onloadend = () => {
        setCompressedImgSrc(reader.result as string);
        setError(null);
      };
      reader.onerror = () => {
        setError("圧縮ファイルの読み込みに失敗しました");
        setCompressedImgSrc(null);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      setError("画像の圧縮に失敗しました");
      setCompressedImgSrc(null);
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
      <div className="max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        <div className="bg-white rounded-xl shadow p-4 sm:p-7">
          <div className="grid sm:grid-cols-12 gap-2 sm:gap-4 py-8 first:pt-0 last:pb-0 border-t first:border-transparent border-gray-200">
            <div className="sm:col-span-12">
              <h2 className="text-lg font-semibold text-gray-800">画像変換</h2>
            </div>
            <div className="sm:col-span-12">
              <ul className="list-disc space-y-1 ps-5 text-md text-gray-800 mb-4">
                <li className="ps-1">画像を圧縮できます。</li>
                <li className="ps-1">
                  アップロードは行われず、すべてブラウザで処理されます。
                </li>
              </ul>

              {error ? <h2>{error}</h2> : null}
              {imgSrc ? (
                <>
                  <h2>読み込まれた画像（アップロードされていません）</h2>
                  <img
                    className="my-4"
                    alt="uploaded"
                    src={imgSrc}
                    style={{ maxWidth: "30%" }}
                  />
                </>
              ) : null}

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
                <button
                  type="button"
                  onClick={handleCompress}
                  className="w-full my-4 py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                >
                  画像を圧縮（アップロードなし）
                </button>
              </form>

              {compressedImgSrc ? (
                <>
                  <h2>圧縮された画像</h2>
                  <img
                    alt="compressed"
                    src={compressedImgSrc}
                    style={{ maxWidth: "30%" }}
                  />
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
