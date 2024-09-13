'use client'

import { GhostIcon, FeatherIcon, ZapIcon, ShieldIcon } from "lucide-react"

export function HomePageComponent() {
  const services = [
    { name: "ゴーストライティング", description: "プロの作家があなたの声で文章を書きます。" },
    { name: "幽霊写真編集", description: "写真に幽霊効果を追加し、超常現象の雰囲気を演出します。" },
    { name: "霊的SEO最適化", description: "あなたのウェブサイトを霊界でも見つけやすくします。" },
    { name: "エクトプラズム分析", description: "霊的現象の科学的分析を提供します。" },
    { name: "幽霊屋敷設計", description: "最高に怖い幽霊屋敷のデザインをお手伝いします。" },
    { name: "霊的ブランディング", description: "あなたのブランドに神秘的な魅力を追加します。" },
    { name: "幽霊ソーシャルメディア管理", description: "死後の世界からSNSを運営します。" },
    { name: "霊的イベント計画", description: "忘れられない超常的なイベントを企画します。" },
    { name: "幽霊音声製作", description: "あの世からのメッセージを作成します。" },
    { name: "霊的コンサルティング", description: "ビジネスに超自然的な視点を提供します。" }
  ]

  const conceptPoints = [
    { icon: FeatherIcon, title: "創造性", description: "幽霊の力で想像を超える創造性を" },
    { icon: ZapIcon, title: "効率", description: "霊的エネルギーで作業効率を最大化" },
    { icon: ShieldIcon, title: "保護", description: "超常的な守護で安全性を確保" }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <header className="py-6 px-8 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <GhostIcon className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">Ghost Tools</span>
        </div>
        <nav>
          <ul className="flex space-x-6">
            {["ホーム", "サービス", "会社概要", "お問い合わせ"].map((item) => (
              <li key={item}>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">{item}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="py-20 px-8">
          <h2 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">幽霊の力を解き放つ</h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {conceptPoints.map((point, index) => (
              <div key={index} className="text-center">
                <point.icon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-semibold mb-2">{point.title}</h3>
                <p className="text-gray-600">{point.description}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {services.map((service, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 group">
                <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors duration-300">{service.name}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-8 px-8 bg-gray-50 text-center">
        <p className="text-gray-600">&copy; 2023 Ghost Tools. All rights reserved.</p>
      </footer>
    </div>
  )
}