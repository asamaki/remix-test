import { useRef, useState, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { MetaFunction } from '@remix-run/node';
import { GhostIcon, Upload, Download, Info, Image as ImageIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Slider } from "~/components/ui/slider";

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
    <main className="flex-grow py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">顔モザイク・ぼかし・目隠しツール</h1>
        
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <ul className="list-disc list-inside text-blue-800">
                <li>画像内の顔を自動検出し、モザイク、ぼかし、または目隠しで画像を加工できます。</li>
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
                <Input id="dropzone-file" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </CardContent>
        </Card>

        {originalImage && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">エフェクト設定</h2>
              <div className="mb-6">
                <label htmlFor="effectType" className="block text-sm font-medium text-gray-700 mb-2">
                  エフェクトタイプ
                </label>
                <Select value={effectType} onValueChange={(value) => setEffectType(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="エフェクトを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mosaic">モザイク</SelectItem>
                    <SelectItem value="blur">ぼかし</SelectItem>
                    <SelectItem value="eyeCover">目隠し</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {effectType !== 'eyeCover' && (
                <div className="mb-6">
                  <label htmlFor="effectSize" className="block text-sm font-medium text-gray-700 mb-2">
                    {effectType === 'mosaic' ? 'モザイク' : 'ぼかし'}の強さ: {effectType === 'mosaic' ? effectSize : blurSize}px
                  </label>
                  <Slider
                    id="effectSize"
                    min={effectType === 'mosaic' ? 1 : 1}
                    max={effectType === 'mosaic' ? 50 : 50}
                    value={[effectType === 'mosaic' ? effectSize : blurSize]}
                    onValueChange={(value) => effectType === 'mosaic' ? setEffectSize(value[0]) : setBlurSize(value[0])}
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
                    <Slider
                      id="lineThickness"
                      min={1}
                      max={50}
                      value={[lineThickness]}
                      onValueChange={(value) => setLineThickness(value[0])}
                      className="w-full"
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="lineLength" className="block text-sm font-medium text-gray-700 mb-2">
                      目隠し帯の長さ: {lineLength}%
                    </label>
                    <Slider
                      id="lineLength"
                      min={50}
                      max={200}
                      value={[lineLength]}
                      onValueChange={(value) => setLineLength(value[0])}
                      className="w-full"
                    />
                  </div>
                </>
              )}
              <div className="mb-6">
                <label htmlFor="detectionSensitivity" className="block text-sm font-medium text-gray-700 mb-2">
                  顔認識の感度: {detectionSensitivity}
                </label>
                <Slider
                  id="detectionSensitivity"
                  min={1}
                  max={99}
                  step={1}
                  value={[detectionSensitivity]}
                  onValueChange={(value) => setDetectionSensitivity(value[0])}
                  className="w-full"
                />
              </div>
              <Button
                onClick={applyEffect}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin inline-block mr-2">&#9696;</span>
                    処理中...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> エフェクトを適用
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {originalImage && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">元の画像</h2>
                <div className="aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  <img src={originalImage} alt="加工前の元画像" className="object-cover w-full h-full" />
                </div>
              </CardContent>
            </Card>
          )}
          {isProcessing ? (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">処理中...</h2>
                <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              </CardContent>
            </Card>
          ) : processedImage ? (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">処理後の画像</h2>
                <div className="aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  <img src={processedImage} alt="顔にモザイク、ぼかし、または目隠しを適用した加工後の画像" className="object-cover w-full h-full" />
                </div>
                <Button onClick={handleDownload} className="w-full mt-4 bg-green-600 hover:bg-green-700">
                  <Download className="mr-2 h-4 w-4" /> 画像をダウンロード
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </main>
  );
}