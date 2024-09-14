import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  json,
} from "@remix-run/react";
import { FeatherIcon, ZapIcon, ShieldIcon } from "lucide-react"

export const meta: MetaFunction = () => {
  return [
    { title: "ゴーストツールズ | 安全に使えるWEBツール" },
    {
      name: "description",
      content:
        "ゴーストツールズは、安全性にこだわったWebツールサイトです。オフライン機能を中心に、便利で安心なツールを集めました。",
    },
    { name: "keywords", content: "安全,安心,ツール,オフライン,無料,プライバシー保護,画像編集,アップロードなし" },
    { property: "og:title", content: "ゴーストツールズ | 安全に使えるWEBツール" },
    { property: "og:description", content: "ゴーストツールズは、安全性にこだわったWebツールサイトです。オフライン機能を中心に、便利で安心なツールを集めました。" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://ghost-tools.site/face-mosaic" },
  ];
};

export const date = new Date();

const services = [
  { name: "画像圧縮", description: "画像をアップロードせずに圧縮", link: "/image-compress" },
  { name: "画像サイズ変換", description: "画像をアップロードせずに縦横サイズ変換", link: "/image-size-conversion" },
  { name: "画像PNG/JPG変換", description: "画像のPNG/JPGを相互に変換します", link: "/image-mutual-conversion" },
  { name: "画像背景透過", description: "画像の背景を透過します。", link: "/image-background-removal" },
  { name: "くじ引き・抽選", description: "数字や名前のリストからランダムに抽選します", link: "/lottery" },
  { name: "顔モザイク・ぼかしツール", description: "画像内の顔を自動検出し、モザイクやぼかしで画像を加工できます", link: "/image-face-mosaic" },
  { name: "QRコード生成", description: "QRコードを生成できます。", link: "/qrcode" }
]

const conceptPoints = [
  { icon: ShieldIcon, title: "シンプル", description: "ちょっとしたツールをすぐに利用できる" },
  { icon: FeatherIcon, title: "安全", description: "アップロードが必要ない場合はすべてブラウザで処理" },
  { icon: ZapIcon, title: "保護", description: "アップロードしたファイルは即時削除" }, 
]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let { searchParams } = new URL(request.url);
  return json({ date: date, view: searchParams.get("view") });
};

export default function Index() {
  return (
<main className="flex-grow">
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">ちょっと便利を安全に</h2>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              {conceptPoints.map((point, index) => (
                <div key={index} className="text-center">
                  <point.icon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-xl font-semibold mb-2">{point.title}</h3>
                  <p className="text-gray-600">{point.description}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, i) => (
                <a 
                  key={i} 
                  href={service.link}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 group"
                >
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors duration-300">{service.name}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
  )
}
