import { useRef, useState, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { MetaFunction } from '@remix-run/node';


export const meta: MetaFunction = () => {
  return [
    { title: "ゴーストツールズ | 顔モザイク・ぼかしアプリ | プライバシー保護ツール" },
    { name: "description", content: "画像内の顔を自動検出し、モザイクやぼかしを適用するプライバシー保護ツールです。簡単な操作で画像を加工できます。" },
    { name: "keywords", content: "顔認識,モザイク,ぼかし,プライバシー保護,画像編集" },
    { property: "og:title", content: "顔モザイク・ぼかしアプリ | プライバシー保護ツール" },
    { property: "og:description", content: "画像内の顔を自動検出し、モザイクやぼかしを適用するプライバシー保護ツールです。簡単な操作で画像を加工できます。" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://ghost-tools.site/face-mosaic" },
  ];
};

export default function FaceMosaic() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [effectSize, setEffectSize] = useState(10);
  const [blurSize, setBlurSize] = useState(3);
  const [effectType, setEffectType] = useState('mosaic');
  const [detectionSensitivity, setDetectionSensitivity] = useState(5);  // 10段階の中間値
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        console.log('顔認識モデルが正常に読み込まれました');
      } catch (error) {
        console.error('顔認識モデルの読み込み中にエラーが発生しました:', error);
      }
    };
    loadModels();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target.result);
      setProcessedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const applyEffect = useCallback(() => {
    if (!originalImage) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      // 感度を0.1から0.9の範囲に変換
      const minConfidence = 1.1 - (detectionSensitivity * 0.1);

      faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: minConfidence }))
        .then(detections => {
          detections.forEach((detection) => {
            const { x, y, width, height } = detection.box;
            if (effectType === 'mosaic') {
              for (let i = 0; i < width; i += effectSize) {
                for (let j = 0; j < height; j += effectSize) {
                  const pixelColor = ctx.getImageData(x + i, y + j, 1, 1).data;
                  ctx.fillStyle = `rgba(${pixelColor[0]}, ${pixelColor[1]}, ${pixelColor[2]}, ${pixelColor[3]})`;
                  ctx.fillRect(x + i, y + j, effectSize, effectSize);
                }
              }
            } else if (effectType === 'blur') {
              ctx.save();
              ctx.filter = `blur(${blurSize}px)`;
              ctx.drawImage(canvas, x, y, width, height, x, y, width, height);
              ctx.restore();
            }
          });

          const newProcessedImage = canvas.toDataURL();
          setProcessedImage(newProcessedImage);
        })
        .catch(error => {
          console.error('エフェクト適用中にエラーが発生しました:', error);
        });
    };
    img.src = originalImage;
  }, [originalImage, effectType, effectSize, blurSize, detectionSensitivity]);

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = `${effectType === 'mosaic' ? 'モザイク' : 'ぼかし'}_画像.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">顔モザイク・ぼかしツール</h1>
      
      <ul className="mb-6 list-disc list-inside text-gray-600">
        <li>画像内の顔を自動検出し、モザイクやぼかしで画像を加工できます。</li>
        <li>アップロードは行われず、すべてブラウザで処理されます。</li>
      </ul>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">画像選択</h2>
        <div className="mb-6">
          <input
            id="imageUpload"
            type="file"
            onChange={handleImageUpload}
            accept="image/*"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      </section>

      {originalImage && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">エフェクト設定</h2>
          <div className="mb-6">
            <label htmlFor="effectType" className="block text-sm font-medium text-gray-700 mb-2">
              エフェクトタイプ
            </label>
            <select
              id="effectType"
              value={effectType}
              onChange={(e) => setEffectType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="mosaic">モザイク</option>
              <option value="blur">ぼかし</option>
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="effectSize" className="block text-sm font-medium text-gray-700 mb-2">
              {effectType === 'mosaic' ? 'モザイク' : 'ぼかし'}の強さ: {effectType === 'mosaic' ? effectSize : blurSize}px
            </label>
            <input
              id="effectSize"
              type="range"
              min={effectType === 'mosaic' ? 5 : 1}
              max={effectType === 'mosaic' ? 50 : 5}
              value={effectType === 'mosaic' ? effectSize : blurSize}
              onChange={(e) => effectType === 'mosaic' ? setEffectSize(Number(e.target.value)) : setBlurSize(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="detectionSensitivity" className="block text-sm font-medium text-gray-700 mb-2">
              顔認識の感度: {detectionSensitivity} (1: 最も寛容, 9: 最も厳密)
            </label>
            <input
              id="detectionSensitivity"
              type="range"
              min="1"
              max="9"
              step="1"
              value={detectionSensitivity}
              onChange={(e) => setDetectionSensitivity(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <button
            onClick={applyEffect}
            className="mb-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
          >
            エフェクトを適用
          </button>
        </section>
      )}

      {processedImage && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">処理済み画像</h2>
          <button
            onClick={handleDownload}
            className="mb-6 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            画像をダウンロード
          </button>
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">元の画像</h2>
          {originalImage && (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <img src={originalImage} alt="加工前の元画像" className="w-full h-auto object-contain" />
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">処理後の画像</h2>
         
            {processedImage && (
               <div className="border border-gray-300 rounded-lg overflow-hidden">
              <img src={processedImage} alt="顔にモザイクまたはぼかしを適用した加工後の画像" className="w-full h-auto object-contain" />
              </div>
            )}
            <canvas ref={canvasRef} className={processedImage ? 'hidden' : 'w-full h-auto'} />
          
        </div>
      </section>
    </main>
  );
}