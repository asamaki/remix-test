import React, { useState, useEffect, useRef } from 'react';
import { AutoModel, AutoProcessor, env, RawImage } from '@xenova/transformers';

// サーバーサイドレンダリング時にエラーを回避するために必要
if (typeof window !== 'undefined') {
  env.allowLocalModels = false;
  env.backends.onnx.wasm.proxy = true;
}

const EXAMPLE_URL = 'https://images.pexels.com/photos/5965592/pexels-photo-5965592.jpeg?auto=compress&cs=tinysrgb&w=1024';

export default function Index() {
  const [status, setStatus] = useState('Loading model...');
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [model, setModel] = useState<any>(null);
  const [processor, setProcessor] = useState<any>(null);

  useEffect(() => {
    const loadModelAndProcessor = async () => {
      const loadedModel = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
        config: { model_type: 'custom' },
      });
      const loadedProcessor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4', {
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
        }
      });
      setModel(loadedModel);
      setProcessor(loadedProcessor);
      setStatus('Ready');
    };

    loadModelAndProcessor();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e2 => {
      if (typeof e2.target?.result === 'string') {
        setImage(e2.target.result);
        predict(e2.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const predict = async (url: string) => {
    if (!model || !processor) return;

    setStatus('Analysing...');
    const image = await RawImage.fromURL(url);

    if (imageContainerRef.current) {
      const ar = image.width / image.height;
      const [cw, ch] = (ar > 720 / 480) ? [720, 720 / ar] : [480 * ar, 480];
      imageContainerRef.current.style.width = `${cw}px`;
      imageContainerRef.current.style.height = `${ch}px`;
    }

    const { pixel_values } = await processor(image);
    const { output } = await model({ input: pixel_values });
    const mask = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(image.width, image.height);

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(image.toCanvas(), 0, 0);
    const pixelData = ctx.getImageData(0, 0, image.width, image.height);
    for (let i = 0; i < mask.data.length; ++i) {
      pixelData.data[4 * i + 3] = mask.data[i];
    }
    ctx.putImageData(pixelData, 0, 0);

    setProcessedImage(canvas.toDataURL());
    setStatus('Done!');
  };

  return (
    <div className="max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <div className="bg-white rounded-xl shadow p-4 sm:p-7 dark:bg-slate-900">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            画像背景透過
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Status: {status}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="file-upload" className="sr-only">Choose file</label>
            <input
              ref={fileInputRef}
              id="file-upload"
              name="file-upload"
              type="file"
              accept="image/*"
              className="block w-full border border-gray-200 shadow-sm rounded-md text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400
                file:bg-transparent file:border-0
                file:bg-gray-100 file:mr-4
                file:py-3 file:px-4
                dark:file:bg-gray-700 dark:file:text-gray-400"
              onChange={handleFileChange}
            />
          </div>

          <button
            type="button"
            className="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
            onClick={() => predict(EXAMPLE_URL)}
          >
            サンプル画像を使用
          </button>

          <div ref={imageContainerRef} className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {image && (
              <img src={image} alt="Original" className="w-full h-full object-contain" />
            )}
            {processedImage && (
              <img src={processedImage} alt="Processed" className="absolute top-0 left-0 w-full h-full object-contain" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}