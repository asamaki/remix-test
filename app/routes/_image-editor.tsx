import { useState, useEffect } from 'react';
import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [
    { title: "画像編集ツール | ゴーストツールズ" },
    { name: "description", content: "Filerobot Image Editorを使用した画像編集ツールです。" },
  ];
};
// 日本語翻訳オブジェクト
const japaneseTranslations = {
  jp: {
    name: '日本語',
    common: {
      apply: '適用',
      cancel: 'キャンセル',
      save: '保存',
      loading: '読み込み中...',
      // その他の共通翻訳
    },
    tabsNames: {
      adjust: '調整',
      annotate: '注釈',
      watermark: 'ウォーターマーク',
      // その他のタブ名
    },
    tools: {
      crop: '切り抜き',
      rotate: '回転',
      flip: '反転',
      brightness: '明るさ',
      contrast: 'コントラスト',
      saturation: '彩度',
      text: 'テキスト',
      // その他のツール名
    },
    // その他のカテゴリ
  }
};
export default function ImageEditorPage() {
  const [isImgEditorShown, setIsImgEditorShown] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const openImgEditor = () => {
    setIsImgEditorShown(true);
  };

  const closeImgEditor = () => {
    setIsImgEditorShown(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">画像編集ツール</h1>
      <button 
        onClick={openImgEditor}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Open Filerobot image editor
      </button>
      {isClient ? (
        <ImageEditor isShown={isImgEditorShown} onClose={closeImgEditor} />
      ) : (
        <div>Loading editor...</div>
      )}
    </div>
  );
}

function ImageEditor({ isShown, onClose }) {
  const [FilerobotImageEditor, setFilerobotImageEditor] = useState(null);
  const [TABS, setTABS] = useState(null);
  const [TOOLS, setTOOLS] = useState(null);

  useEffect(() => {
    import('react-filerobot-image-editor').then(module => {
      setFilerobotImageEditor(() => module.default);
      setTABS(module.TABS);
      setTOOLS(module.TOOLS);
    });
  }, []);

  const handleSave = (editedImageObject, designState) => {
    console.log('保存しました', editedImageObject, designState);

    // 編集された画像のURLを取得
    const imageUrl = editedImageObject.imageBase64;

    // ダウンロードリンクを作成
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'edited_image.png'; // ダウンロードするファイル名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // エディタを閉じる（オプション）
    onClose();
  };

  if (!isShown || !FilerobotImageEditor) return null;

  return (
    <FilerobotImageEditor
      source="https://scaleflex.airstore.io/demo/stephen-walker-unsplash.jpg"
      onSave={handleSave}
      onClose={onClose}
      annotationsCommon={{
        fill: '#ff0000',
      }}
      Text={{ text: 'テキストを入力...' }}
      Rotate={{ angle: 90, componentType: 'slider' }}
      Crop={{
        presetsItems: [
          {
            titleKey: 'classicTv',
            descriptionKey: '4:3',
            ratio: 4 / 3,
          },
          {
            titleKey: 'cinemascope',
            descriptionKey: '21:9',
            ratio: 21 / 9,
          },
        ],
        presetsFolders: [
          {
            titleKey: 'socialMedia',
            groups: [
              {
                titleKey: 'facebook',
                items: [
                  {
                    titleKey: 'profile',
                    width: 180,
                    height: 180,
                    descriptionKey: 'fbProfileSize',
                  },
                  {
                    titleKey: 'coverPhoto',
                    width: 820,
                    height: 312,
                    descriptionKey: 'fbCoverPhotoSize',
                  },
                ],
              },
            ],
          },
        ],
      }}
      tabsIds={TABS ? [TABS.ADJUST, TABS.ANNOTATE, TABS.WATERMARK] : []}
      defaultTabId={TABS ? TABS.ANNOTATE : ''}
      defaultToolId={TOOLS ? TOOLS.TEXT : ''}
      translations={japaneseTranslations} // 日本語翻訳を適用
      language="jp"  // この行を追加
    />
  );
}