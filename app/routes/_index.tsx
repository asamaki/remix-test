import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  json,
} from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "ゴーストツール 安全に利用できるツールたち" },
    {
      name: "description",
      content:
        "ゴーストツールは、アップロードされたデータをすぐに削除するので安心して使えます。安全なツールです。",
    },
  ];
};

export const date = new Date();

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let { searchParams } = new URL(request.url);
  return json({ date: date, view: searchParams.get("view") });
};

export default function Index() {
  return (
    <div className="max-w-[85rem] px-4 py-8 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <ul className="list-disc space-y-1 ps-5 text-md text-gray-800 mb-4">
        <li className="ps-1">
          ゴーストツールは、アップロードされたデータをすぐに削除します。
        </li>
        <li className="ps-1">
          アップロードが必要ない場合は、すべてブラウザで処理されます。
        </li>
      </ul>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        <a
          className="group flex flex-col bg-white border shadow-sm rounded-xl hover:shadow-md transition"
          href="/image-compress"
        >
          <div className="p-4 md:p-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="group-hover:text-blue-600 font-semibold text-gray-800">
                  画像圧縮
                </h3>
                <p className="text-sm text-gray-500">
                  画像をアップロードせずに圧縮
                </p>
              </div>
              <div className="ps-3">
                <svg
                  className="flex-shrink-0 size-5 text-gray-800"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>
          </div>
        </a>

        <a
          className="group flex flex-col bg-white border shadow-sm rounded-xl hover:shadow-md transition"
          href="/image-size-conversion"
        >
          <div className="p-4 md:p-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="group-hover:text-blue-600 font-semibold text-gray-800">
                  画像サイズ変換
                </h3>
                <p className="text-sm text-gray-500">
                  画像をアップロードせずに縦横サイズ変換
                </p>
              </div>
              <div className="ps-3">
                <svg
                  className="flex-shrink-0 size-5 text-gray-800"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>
          </div>
        </a>


        <a
          className="group flex flex-col bg-white border shadow-sm rounded-xl hover:shadow-md transition"
          href="/image-mutual-conversion"
        >
          <div className="p-4 md:p-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="group-hover:text-blue-600 font-semibold text-gray-800">
                  画像PNG/JPG変換
                </h3>
                <p className="text-sm text-gray-500">
                  画像のPNG/JPGを相互に変換します
                </p>
              </div>
              <div className="ps-3">
                <svg
                  className="flex-shrink-0 size-5 text-gray-800"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>
          </div>
        </a>
        <a
          className="group flex flex-col bg-white border shadow-sm rounded-xl hover:shadow-md transition"
          href="/image-background-removal"
        >
          <div className="p-4 md:p-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="group-hover:text-blue-600 font-semibold text-gray-800">
                  画像背景透過
                </h3>
                <p className="text-sm text-gray-500">
                  画像の背景を透過します。
                </p>
              </div>
              <div className="ps-3">
                <svg
                  className="flex-shrink-0 size-5 text-gray-800"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>
          </div>
        </a>
        <a
          className="group flex flex-col bg-white border shadow-sm rounded-xl hover:shadow-md transition"
          href="/lottery"
        >
          <div className="p-4 md:p-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="group-hover:text-blue-600 font-semibold text-gray-800">
                  くじ引き・抽選
                </h3>
                <p className="text-sm text-gray-500">
                  数字や名前のリストからランダムに抽選します
                </p>
              </div>
              <div className="ps-3">
                <svg
                  className="flex-shrink-0 size-5 text-gray-800"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>
          </div>
        </a>



      </div>
    </div>
  );
}
