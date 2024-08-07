import { useRef, useState, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [
    { title: "写真の顔をモザイク、ぼかし、目隠しで加工|ゴーストツールズ" },
    { name: "description", content: "画像内の顔を自動検出し、モザイク、ぼかし、目隠し（黒目線）を適用するツールです。アップロードなしの簡単な操作で画像を加工できます。" },
    { name: "keywords", content: "写真,加工,顔認識,モザイク,ぼかし,目隠し,黒目線,プライバシー保護,画像編集,アップロードなし" },
    { property: "og:title", content: "顔モザイク・ぼかしアプリ | ゴーストツールズ" },
    { property: "og:description", content: "画像内の顔を自動検出し、モザイク、ぼかし、目隠しを適用する画像編集ツールです。簡単な操作で画像を加工できます。" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://ghost-tools.site/image-face-mosaic" },
  ];
};

export default function FaceMosaic() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [effectSize, setEffectSize] = useState(10);
  const [blurSize, setBlurSize] = useState(3);
  const [effectType, setEffectType] = useState('mosaic');
  const [detectionSensitivity, setDetectionSensitivity] = useState(50);
  const [lineThickness, setLineThickness] = useState(5); // 目隠し帯の太さ
  const [lineLength, setLineLength] = useState(100); // 目隠し帯の長さ（パーセント）
  const canvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models');
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

  const drawEyeCover = (ctx, landmarks, thickness, lengthPercent) => {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
  
    // 両目の中心点を計算
    const leftEyeCenter = getCenterPoint(leftEye);
    const rightEyeCenter = getCenterPoint(rightEye);
  
    // 目の角度を計算
    const angle = Math.atan2(rightEyeCenter.y - leftEyeCenter.y, rightEyeCenter.x - leftEyeCenter.x);
  
    // 両目の距離を計算
    const distance = Math.sqrt(
      Math.pow(rightEyeCenter.x - leftEyeCenter.x, 2) + 
      Math.pow(rightEyeCenter.y - leftEyeCenter.y, 2)
    );
  
    // 目隠しの長さを計算
    const adjustedWidth = distance * (lengthPercent / 100);
  
    // 目隠しの中心点を計算
    const centerX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
    const centerY = (leftEyeCenter.y + rightEyeCenter.y) / 2;
  
    // コンテキストを保存し、回転を適用
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
  
    // 長方形を描画
    ctx.fillStyle = 'black';
    ctx.fillRect(-adjustedWidth / 2, -thickness / 2, adjustedWidth, thickness);
  
    // コンテキストを元に戻す
    ctx.restore();
  };
  
  // 補助関数: 点の配列の中心点を計算
  const getCenterPoint = (points) => {
    const sumX = points.reduce((sum, point) => sum + point.x, 0);
    const sumY = points.reduce((sum, point) => sum + point.y, 0);
    return {
      x: sumX / points.length,
      y: sumY / points.length
    };
  };

  const applyEffect = useCallback(() => {
    if (!originalImage) return;
    setIsProcessing(true);  // 処理開始時にフラグを設定

    const img = new Image();
    img.onload = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      const minConfidence = 1.01 - (detectionSensitivity * 0.01);

      const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: minConfidence }))
        .withFaceLandmarks(true);

      if (detections.length === 0) {
        console.log('顔が検出されませんでした。');
        setProcessedImage(canvas.toDataURL());
        return;
      }

      detections.forEach((detection) => {
        if (detection && detection.detection && detection.detection.box) {
          const { box } = detection.detection;
          if (effectType === 'mosaic') {
            for (let i = 0; i < box.width; i += effectSize) {
              for (let j = 0; j < box.height; j += effectSize) {
                const pixelColor = ctx.getImageData(box.x + i, box.y + j, 1, 1).data;
                ctx.fillStyle = `rgba(${pixelColor[0]}, ${pixelColor[1]}, ${pixelColor[2]}, ${pixelColor[3]})`;
                ctx.fillRect(box.x + i, box.y + j, effectSize, effectSize);
              }
            }
          } else if (effectType === 'blur') {
            ctx.save();
            ctx.filter = `blur(${blurSize}px)`;
            ctx.drawImage(canvas, box.x, box.y, box.width, box.height, box.x, box.y, box.width, box.height);
            ctx.restore();
          } else if (effectType === 'eyeCover') {
            if (detection.landmarks) {
              drawEyeCover(ctx, detection.landmarks, lineThickness, lineLength);
            }
          }
        }
      });

      const newProcessedImage = canvas.toDataURL();
      setProcessedImage(newProcessedImage);
      setIsProcessing(false);  // 処理完了時にフラグをリセット
    };
    img.src = originalImage;
  }, [originalImage, effectType, effectSize, blurSize, detectionSensitivity, lineThickness, lineLength]);

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = `${effectType === 'mosaic' ? 'モザイク' : effectType === 'blur' ? 'ぼかし' : '目隠し'}_画像.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">顔モザイク・ぼかし・目隠しツール</h1>
      
      <ul className="mb-6 list-disc list-inside text-gray-600">
        <li>画像内の顔を自動検出し、モザイク、ぼかし、または目隠しで画像を加工できます。</li>
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
              <option value="eyeCover">目隠し</option>
            </select>
          </div>
          {effectType !== 'eyeCover' && (
            <div className="mb-6">
              <label htmlFor="effectSize" className="block text-sm font-medium text-gray-700 mb-2">
                {effectType === 'mosaic' ? 'モザイク' : 'ぼかし'}の強さ: {effectType === 'mosaic' ? effectSize : blurSize}px
              </label>
              <input
                id="effectSize"
                type="range"
                min={effectType === 'mosaic' ? 1 : 1}
                max={effectType === 'mosaic' ? 50 : 50}
                value={effectType === 'mosaic' ? effectSize : blurSize}
                onChange={(e) => effectType === 'mosaic' ? setEffectSize(Number(e.target.value)) : setBlurSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
          {effectType === 'eyeCover' && (
            <>
              <div className="mb-6">
                <label htmlFor="lineThickness" className="block text-sm font-medium text-gray-700 mb-2">
                  目隠し帯の太さ: {lineThickness}px
                </label>
                <input
                  id="lineThickness"
                  type="range"
                  min="1"
                  max="50"
                  value={lineThickness}
                  onChange={(e) => setLineThickness(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="lineLength" className="block text-sm font-medium text-gray-700 mb-2">
                  目隠し帯の長さ: {lineLength}%
                </label>
                <input
                  id="lineLength"
                  type="range"
                  min="50"
                  max="200"
                  value={lineLength}
                  onChange={(e) => setLineLength(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          )}
          <div className="mb-6">
            <label htmlFor="detectionSensitivity" className="block text-sm font-medium text-gray-700 mb-2">
              顔認識の感度: {detectionSensitivity}
            </label>
            <input
              id="detectionSensitivity"
              type="range"
              min="1"
              max="99"
              step="1"
              value={detectionSensitivity}
              onChange={(e) => setDetectionSensitivity(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <button
  onClick={applyEffect}
  disabled={isProcessing}
  className={`mb-6 font-bold py-2 px-4 rounded mr-4 ${
    isProcessing
      ? 'bg-gray-400 cursor-not-allowed'
      : 'bg-blue-500 hover:bg-blue-700 text-white'
  }`}
>
  {isProcessing ? (
    <>
      <span className="animate-spin inline-block mr-2">&#9696;</span>
      処理中...
    </>
  ) : (
    'エフェクトを適用'
  )}
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
          {isProcessing ? (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ) : processedImage ? (
    <>
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <img src={processedImage} alt="顔にモザイク、ぼかし、または目隠しを適用した加工後の画像" className="w-full h-auto object-contain" />
      </div>
      <button
        onClick={handleDownload}
        className="my-6 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        画像をダウンロード
      </button>
    </>
  ) : null}
          <canvas ref={canvasRef} className={processedImage ? 'hidden' : 'w-full h-auto'} />
        </div>
      </section>
    </main>
  );
}