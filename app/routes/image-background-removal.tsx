import React, { useState, useRef } from "react";
import { removeBackground } from "@imgly/background-removal"; // 名前付きエクスポートを使用

export default function Index() {
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 進捗率を管理
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setError("ファイルが選択されていません");
      setImage(null);
      return;
    }

    const file = files[0];
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
        
        // 擬似的な進捗更新
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
            processedImageSize: file.size / (1024 * 1024),
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
      a.download = image.file.name;
      a.click();
    }
  };

  return (
    <>
      <div className="max-w-4xl px-4 py-10 sm:px-4 lg:px-8 lg:py-8 mx-auto">
        <div className="bg-white rounded-xl shadow p-4 sm:p-7">
          <div className="grid sm:grid-cols-12 gap-2 sm:gap-4 py-8 first:pt-0 last:pb-0 border-t first:border-transparent border-gray-200">
            <div className="sm:col-span-12">
              <h2 className="text-lg font-semibold text-gray-800">画像背景透過</h2>
            </div>
            <div className="sm:col-span-12">
              <ul className="list-disc space-y-1 ps-5 text-md text-gray-800 mb-4">
                <li className="ps-1">画像の背景を透過できます。</li>
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

                {image && (
                  <>
                    <div className="m-2 p-2 border rounded-lg">
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
                    <button
                      type="button"
                      onClick={handleProcess}
                      className="w-full my-4 py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      背景を透過
                    </button>
                    {processing ? <p>画像を処理中... ({progress.toFixed(0)}%)</p> : null}
                  </>
                )}

                {image && image.processedImgSrc && (
                  <>
                    <h2>背景が透過された画像</h2>
                    <div className="m-2 p-2 border rounded-lg">
                      <img
                        alt="processed"
                        src={image.processedImgSrc}
                        style={{ maxWidth: "100px" }}
                      />
                      <p>
                        {image.processedImageSize?.toFixed(2)}MB {image.processedImageWidth}×
                        {image.processedImageHeight} {image.processedImgSrc.includes('jpeg') || image.processedImgSrc.includes('jpg') ? 'JPG' : 'PNG'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="w-full my-4 py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      画像をダウンロード
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
