import React, { useEffect, useRef, useState } from 'react';
// @ts-expect-error alpha version types broken
import { AutoModel, AutoProcessor, RawImage, env } from "@xenova/transformers"

env.allowLocalModels = false

// Proxy the WASM backend to prevent the UI from freezing
env.backends.onnx.wasm.proxy = true // already in a worker

const EXAMPLE_URL = 'https://images.pexels.com/photos/5965592/pexels-photo-5965592.jpeg?auto=compress&cs=tinysrgb&w=1024';

export default function Index() {
  const [status, setStatus] = useState('モデルを読み込み中...');
  const [progress, setProgress] = useState(0);
  const fileUploadRef = useRef(null);
  const imageContainerRef = useRef(null);
  const modelRef = useRef(null);
  const processorRef = useRef(null);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [processedImageSrc, setProcessedImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const loadModelAndProcessor = async () => {
      setProgress(10);
      const model = await AutoModel.from_pretrained('briaai/RMBG-1.4',  {
        device: "webgpu",
        dtype: "fp32", // TODO: add fp16 support
        config: {
          model_type: "custom",
        },
      });
      setProgress(50);
      const processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4', {
        config: {
          do_normalize: true,
          do_pad: false,
          do_rescale: true,
          do_resize: true,
          image_mean: [0.5, 0.5, 0.5],
          feature_extractor_type: "ImageFeatureExtractor",
          image_std: [1, 1, 1],
          resample: 2,
          rescale_factor: 0.00392156862745098,
          size: { width: 1024, height: 1024 },
        },
      });
      modelRef.current = model;
      processorRef.current = processor;
      setStatus('準備完了');
      setProgress(100);
    };

    loadModelAndProcessor();

    const checkWebGPUSupport = async () => {
      if ('gpu' in navigator) {
        try {
          const adapter = await (navigator as any).gpu.requestAdapter();
          if (adapter) {
            setIsSupported(true);
          } else {
            setIsSupported(false);
          }
        } catch (e) {
          setIsSupported(false);
        }
      } else {
        setIsSupported(false);
      }
    };

    checkWebGPUSupport();
  }, []);

  const getScale = (width, height, maxSize = 1280) => {
    const size = Math.max(width, height);
  
    // 最大サイズ以下は1
    if (size <= maxSize) {
      return 1;
    }
  
    // 小数第4位で四捨五入する
    const scale = maxSize / size;
    return Math.round(scale * 10000) / 10000;
  };

  const predict = async (url) => {
    setProgress(0);
    const image = await RawImage.fromURL(url);
    const container = imageContainerRef.current;

    container.innerHTML = '';
    setStatus('解析中...');
    setProgress(20);

    const { pixel_values } = await processorRef.current(image);
    setProgress(40);
    const { output } = await modelRef.current({ input: pixel_values });
    setProgress(60);
    const mask = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(image.width, image.height);
    setProgress(80);

    const scale = getScale(image.width, image.height);

    const canvas = document.createElement('canvas');
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image.toCanvas(), 0, 0, image.width * scale, image.height * scale);

    const pixelData = ctx.getImageData(0, 0, image.width, image.height);
    for (let i = 0; i < mask.data.length; ++i) {
      pixelData.data[4 * i + 3] = mask.data[i];
    }
    ctx.putImageData(pixelData, 0, 0);

    const processedImgSrc = canvas.toDataURL(); // Convert canvas to base64 encoded URL
    setProcessedImageSrc(processedImgSrc);

    container.append(canvas);
    setStatus('完了!');
    setProgress(100);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => predict(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (processedImageSrc) {
      const a = document.createElement('a');
      a.href = processedImageSrc;
      a.download = 'processed_image.png';
      a.click();
    }
  };

  return (
    <div>
      <div style={{ maxWidth: '100%', maxHeight: '100vh', overflow: 'hidden' }}>
        <div style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#333' }}>背景削除</h2>
          <h4 style={{ fontSize: '1.2em', color: '#666' }}>ブラウザ内でローカル実行</h4>
          {isSupported === null ? (
            <div>WebGPUサポートをチェック中...</div>
          ) : (
            <div>WebGPUは{isSupported ? 'サポートされています' : 'サポートされていません'}</div>
          )}
        </div>
        <div style={{ padding: '20px' }}>
          <div
            id="container"
            ref={imageContainerRef}
            style={{ maxWidth: '100%', maxHeight: '80vh', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
          ></div>
          <div style={{ marginTop: '20px' }}>
            <label
              id="upload-button"
              htmlFor="upload"
              style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', display: 'inline-block' }}
            >
              画像をアップロード
            </label>
            <input
              id="upload"
              type="file"
              accept="image/*"
              ref={fileUploadRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>
          <div style={{ marginTop: '20px' }}>
            <label id="status" style={{ color: '#333' }}>{status}</label>
            <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '5px', marginTop: '10px', height: '20px' }}>
              <div
                style={{
                  width: `${progress}%`,
                  backgroundColor: '#4CAF50',
                  height: '100%',
                  borderRadius: '5px',
                  transition: 'width 0.5s ease-in-out',
                }}
              ></div>
            </div>
          </div>
          {processedImageSrc && (
            <div style={{ marginTop: '20px' }}>
              <button
                type="button"
                onClick={handleDownload}
                style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', display: 'inline-block', backgroundColor: '#4CAF50', color: '#fff', fontWeight: 'bold' }}
              >
                画像をダウンロード
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
