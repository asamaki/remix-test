import React, { useEffect, useRef, useState } from 'react';
import { AutoModel, AutoProcessor, env, RawImage } from '@xenova/transformers';

env.allowLocalModels = false;
env.backends.onnx.wasm.proxy = true;

const EXAMPLE_URL = 'https://images.pexels.com/photos/5965592/pexels-photo-5965592.jpeg?auto=compress&cs=tinysrgb&w=1024';

export default function Index() {
  const [status, setStatus] = useState('モデルを読み込み中...');
  const [progress, setProgress] = useState(0);
  const fileUploadRef = useRef(null);
  const imageContainerRef = useRef(null);
  const modelRef = useRef(null);
  const processorRef = useRef(null);

  useEffect(() => {
    const loadModelAndProcessor = async () => {
      setProgress(10);
      const model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
        config: { model_type: 'custom' },
        progress_callback: (p) => setProgress(10 + p * 40),
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
        progress_callback: (p) => setProgress(50 + p * 40),
      });
      modelRef.current = model;
      processorRef.current = processor;
      setStatus('準備完了');
      setProgress(100);
    };

    loadModelAndProcessor();
  }, []);

  const predict = async (url) => {
    setProgress(0);
    const image = await RawImage.fromURL(url);
    const container = imageContainerRef.current;

    container.innerHTML = '';
    container.style.backgroundImage = `url(${url})`;

    const ar = image.width / image.height;
    const [cw, ch] = (ar > 720 / 480) ? [720, 720 / ar] : [480 * ar, 480];
    container.style.width = `${cw}px`;
    container.style.height = `${ch}px`;

    setStatus('解析中...');
    setProgress(20);

    const { pixel_values } = await processorRef.current(image);
    setProgress(40);
    const { output } = await modelRef.current({ input: pixel_values });
    setProgress(60);
    const mask = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(image.width, image.height);
    setProgress(80);

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image.toCanvas(), 0, 0);

    const pixelData = ctx.getImageData(0, 0, image.width, image.height);
    for (let i = 0; i < mask.data.length; ++i) {
      pixelData.data[4 * i + 3] = mask.data[i];
    }
    ctx.putImageData(pixelData, 0, 0);

    container.append(canvas);
    container.style.removeProperty('background-image');
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

  const handleExampleClick = (e) => {
    e.preventDefault();
    predict(EXAMPLE_URL);
  };

  return (
    <div>
      <h1>
        背景削除 with{' '}
        <a href="http://github.com/xenova/transformers.js" target="_blank" rel="noopener noreferrer">
          🤗 Transformers.js
        </a>
      </h1>
      <h4>
        ブラウザ内でローカル実行,{' '}
        <a href="https://huggingface.co/briaai/RMBG-1.4" target="_blank" rel="noopener noreferrer">
          RMBG V1.4モデル
        </a>{' '}
        提供{' '}
        <a href="https://bria.ai/" target="_blank" rel="noopener noreferrer">
          BRIA AI
        </a>
      </h4>
      <div id="container" ref={imageContainerRef}>
        <label id="upload-button" htmlFor="upload">
          <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#000"
              d="M3.5 24.3a3 3 0 0 1-1.9-.8c-.5-.5-.8-1.2-.8-1.9V2.9c0-.7.3-1.3.8-1.9.6-.5 1.2-.7 2-.7h18.6c.7 0 1.3.2 1.9.7.5.6.7 1.2.7 2v18.6c0 .7-.2 1.4-.7 1.9a3 3 0 0 1-2 .8H3.6Zm0-2.7h18.7V2.9H3.5v18.7Zm2.7-2.7h13.3c.3 0 .5 0 .6-.3v-.7l-3.7-5a.6.6 0 0 0-.6-.2c-.2 0-.4 0-.5.3l-3.5 4.6-2.4-3.3a.6.6 0 0 0-.6-.3c-.2 0-.4.1-.5.3l-2.7 3.6c-.1.2-.2.4 0 .7.1.2.3.3.6.3Z"
            ></path>
          </svg>
          画像をアップロード
          <label id="example" onClick={handleExampleClick}>
            (または例を試す)
          </label>
        </label>
      </div>
      <label id="status">{status}</label>
      <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '5px', marginTop: '10px' }}>
        <div
          style={{
            width: `${progress}%`,
            backgroundColor: '#4CAF50',
            height: '20px',
            borderRadius: '5px',
            transition: 'width 0.5s ease-in-out',
          }}
        ></div>
      </div>
      <input
        id="upload"
        type="file"
        accept="image/*"
        ref={fileUploadRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
    </div>
  );
}