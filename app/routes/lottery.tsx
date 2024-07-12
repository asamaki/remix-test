import { useState, useEffect } from 'react';
import { Form } from '@remix-run/react';
import { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [
    { title: "くじ引き・抽選 公平で簡単な抽選ツール|ゴーストツールズ" },
    { name: "description", content: "ゴーストツールズは、安全で公平なくじ引き・抽選ツールを提供します。オフラインで動作し、アップロード不要で簡単に抽選が行えます。" },
    { name: "keywords", content: "くじ引き,抽選,ランダム選択,オフライン,プライバシー保護,公平性,ゴーストツールズ" },
    { property: "og:title", content: "くじ引き・抽選 公平で簡単な抽選ツール|ゴーストツールズ" },
    { property: "og:description", content: "ゴーストツールズは、安全で公平なくじ引き・抽選ツールを提供します。オフラインで動作し、アップロード不要で簡単に抽選が行えます。" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://ghost-tools.site/lottery" },
  ];
};

export default function Index() {
  const [minRange, setMinRange] = useState(0);
  const [maxRange, setMaxRange] = useState(100);
  const [names, setNames] = useState('');
  const [delay, setDelay] = useState(3);
  const [result, setResult] = useState(null);
  const [selectionType, setSelectionType] = useState('range');
  const [animationValue, setAnimationValue] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let intervalId;
    if (isAnimating) {
      intervalId = setInterval(() => {
        if (selectionType === 'range') {
          const min = parseInt(minRange, 10);
          const max = parseInt(maxRange, 10);
          setAnimationValue(Math.floor(Math.random() * (max - min + 1)) + min);
        } else if (selectionType === 'names') {
          const namesArray = names.split('\n').map((name) => name.trim()).filter(Boolean);
          setAnimationValue(namesArray[Math.floor(Math.random() * namesArray.length)]);
        }
      }, 100);
    }
    return () => clearInterval(intervalId);
  }, [isAnimating, selectionType, minRange, maxRange, names]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setResult(null);
    setIsAnimating(true);
    const delaySeconds = parseInt(delay, 10) * 1000;
    setTimeout(() => {
      setIsAnimating(false);
      if (selectionType === 'range') {
        const min = parseInt(minRange, 10);
        const max = parseInt(maxRange, 10);
        setResult(Math.floor(Math.random() * (max - min + 1)) + min);
      } else if (selectionType === 'names') {
        const namesArray = names.split('\n').map((name) => name.trim()).filter(Boolean);
        setResult(namesArray[Math.floor(Math.random() * namesArray.length)]);
      }
    }, delaySeconds);
  };

  return (
    <div className="max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <div className="bg-white rounded-xl shadow p-4 sm:p-7">
        <div className="grid sm:grid-cols-12 gap-2 sm:gap-4 py-8 first:pt-0 last:pb-0 border-t first:border-transparent border-gray-200">
          <div className="sm:col-span-12">
          <h1 className="text-lg font-semibold text-gray-800">くじ引き・抽選</h1>
          <h2 className="text-sm text-gray-500">数字や名前のリストからランダムに抽選</h2>
          </div>

          <div className="sm:col-span-12">
            <Form method="post" onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="selectionType"
                    value="range"
                    checked={selectionType === 'range'}
                    onChange={(e) => setSelectionType(e.target.value)}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2">数字の範囲</span>
                </label>
                <label className="inline-flex items-center ml-4">
                  <input
                    type="radio"
                    name="selectionType"
                    value="names"
                    checked={selectionType === 'names'}
                    onChange={(e) => setSelectionType(e.target.value)}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2">名前リスト</span>
                </label>
              </div>

              {selectionType === 'range' ? (
                <>
                  <label className="block text-sm font-medium text-gray-700">
                    数字の範囲
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={minRange}
                      onChange={(e) => setMinRange(e.target.value)}
                      placeholder="最小値"
                      className="py-3 px-4 block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none pr-4"
                    />
                    <span className="py-3 px-2" >〜</span>
                    <input
                      type="number"
                      value={maxRange}
                      onChange={(e) => setMaxRange(e.target.value)}
                      placeholder="最大値"
                      className="py-3 px-4 block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none pl-4"
                    />
                  </div>
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mt-4">
                    名前リスト (改行区切り)
                  </label>
                  <textarea
                    value={names}
                    onChange={(e) => setNames(e.target.value)}
                    className="py-3 px-4 block w-full mt-1 border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                    rows="5"
                  />
                </>
              )}

              <label className="block text-sm font-medium text-gray-700 mt-4">
                結果発表までの時間 (秒)
              </label>
              <input
                type="number"
                value={delay}
                onChange={(e) => setDelay(e.target.value)}
                className="py-3 px-4 block w-full mt-1 border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                min="1"
              />

              <button
                type="submit"
                className="w-full my-4 py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                抽選
              </button>
            </Form>
            {isAnimating && (
                <div className="mt-4 p-4 border border-gray-500 rounded-lg">
                    <p className="text-sm text-gray-500">抽選中</p>
                    <p className="text-4xl text-gray-500 mr-4">{animationValue}</p>
                </div>

            )}
            {result && (
              <div className="mt-4 p-4 border border-green-500 rounded-lg">
                    <p className="text-sm text-green-8700">結果</p>
                    <p className="text-4xl text-green-700 mr-4">{result}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
