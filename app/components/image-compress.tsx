'use client'

import { GhostIcon, Upload, Download, Info, Image as ImageIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Slider } from "~/components/ui/slider"
import { Card, CardContent } from "~/components/ui/card"
import { Alert, AlertDescription } from "~/components/ui/alert"

export function ImageCompress() {
  const services = [
    { name: "ホーム", link: "/" },
    { name: "サービス", link: "/services" },
    { name: "会社概要", link: "/about" },
    { name: "お問い合わせ", link: "/contact" }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <header className="py-4 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <GhostIcon className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">Ghost Tools</span>
            </div>
            <nav>
              <ul className="flex space-x-6">
                {services.map((item) => (
                  <li key={item.name}>
                    <a href={item.link} className="text-gray-600 hover:text-blue-600 transition-colors duration-300">{item.name}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">画像圧縮</h1>
          
          <Alert className="mb-8">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                <li>画像を圧縮できます。</li>
                <li>アップロードは行われず、すべてブラウザで処理されます。</li>
                <li>一度に選択できる画像の最大枚数は3枚です</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">クリックして画像を選択</span>またはドラッグ＆ドロップ</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (最大3枚まで)</p>
                  </div>
                  <Input id="dropzone-file" type="file" accept="image/*" multiple className="hidden" />
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">圧縮設定</h2>
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-sm font-medium min-w-[80px]">圧縮率:</span>
                <Slider id="compression" defaultValue={[50]} max={100} step={1} className="flex-grow" />
                <span className="text-sm font-medium min-w-[40px] text-right">50%</span>
              </div>
              <div className="mb-6">
                <p className="font-medium mb-2">元の画像</p>
                <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
                <p className="mt-2 text-sm text-center text-gray-500">0.02MB 426×340 JPG</p>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Upload className="mr-2 h-4 w-4" /> 画像を圧縮
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">圧縮結果</h2>
              <div className="mb-6">
                <p className="font-medium mb-2">圧縮後の画像</p>
                <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
                <p className="mt-2 text-sm text-center text-gray-500">0.01MB 426×340 JPG</p>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Download className="mr-2 h-4 w-4" /> 圧縮画像をダウンロード
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="py-6 bg-gray-50 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">&copy; 2023 Ghost Tools. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}