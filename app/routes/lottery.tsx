import { useState, useEffect } from 'react';
import { Form } from '@remix-run/react';
import { MetaFunction } from '@remix-run/node';
import { GhostIcon, Info, Shuffle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";

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
    <main className="flex-grow py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">くじ引き・抽選</h1>
        
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <ul className="list-disc list-inside text-blue-800">
                <li>数字や名前のリストからランダムに抽選できます。</li>
                <li>アップロードは行われず、すべてブラウザで処理されます。</li>
              </ul>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <Form method="post" onSubmit={handleSubmit}>
              <div className="mb-4 flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <Input
                    type="radio"
                    name="selectionType"
                    value="range"
                    checked={selectionType === 'range'}
                    onChange={(e) => setSelectionType(e.target.value)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 whitespace-nowrap">数字の範囲</span>
                </label>
                <label className="inline-flex items-center">
                  <Input
                    type="radio"
                    name="selectionType"
                    value="names"
                    checked={selectionType === 'names'}
                    onChange={(e) => setSelectionType(e.target.value)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 whitespace-nowrap">名前リスト</span>
                </label>
              </div>

              {selectionType === 'range' ? (
                <>
                  <label className="block text-sm font-medium text-gray-700">
                    数字の範囲
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      value={minRange}
                      onChange={(e) => setMinRange(e.target.value)}
                      placeholder="最小値"
                      className="py-3 px-4 block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none pr-4"
                    />
                    <span className="py-3 px-2" >〜</span>
                    <Input
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
              <Input
                type="number"
                value={delay}
                onChange={(e) => setDelay(e.target.value)}
                className="py-3 px-4 block w-full mt-1 border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                min="1"
              />

              <Button
                type="submit"
                className="w-full my-4 bg-blue-600 hover:bg-blue-700"
              >
                <Shuffle className="mr-2 h-4 w-4" /> 抽選
              </Button>
            </Form>
          </CardContent>
        </Card>

        {isAnimating && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">抽選中</h2>
              <p className="text-4xl text-gray-500 mr-4">{animationValue}</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">結果</h2>
              <p className="text-4xl text-green-700 mr-4">{result}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}