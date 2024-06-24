
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { createCookie } from "@remix-run/node";
import React, { useState } from 'react';

import { s3UploadHandler } from "~/utils/s3.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

import type { ActionFunctionArgs, UploadHandler } from "@remix-run/node";
import {
  json,
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node";
import { useFetcher } from "@remix-run/react";


type ActionData = {
  errorMsg?: string;
  imgSrc?: string;
  imgDesc?: string;
  status?: string;
};

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {

  let { searchParams } = new URL(request.url);
  let query = searchParams.get("view");


  return json({view:searchParams.get("view")});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const uploadHandler: UploadHandler = composeUploadHandlers(
    s3UploadHandler,
    createMemoryUploadHandler(),
  );
  const formData = await parseMultipartFormData(request, uploadHandler);
  const imgSrc = formData.get("img");

  if (!imgSrc) {
    return json({
      status:"error",
      errorMsg: "Something went wrong while uploading",
    });
  }
  return json({
    status:"success",
    imgSrc,
  });
};

export default function Index() {
  const fetcher = useFetcher<ActionData>();
  const isError = fetcher.data?.status === "error"
  const isSuccess = fetcher.data?.status === "success"

  return (
<div className="max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <div className="bg-white rounded-xl shadow p-4 sm:p-7">

          <div className="grid sm:grid-cols-12 gap-2 sm:gap-4 py-8 first:pt-0 last:pb-0 border-t first:border-transparent border-gray-200">
            <div className="sm:col-span-12">
              <h2 className="text-lg font-semibold text-gray-800">
                画像変換
              </h2>
            </div>



            <div className="sm:col-span-12">
              <fetcher.Form method="post" encType="multipart/form-data">
                <input id="img-field" type="file" name="img" accept="image/*" className="block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none
                        file:bg-gray-50 file:border-0
                        file:bg-gray-100 file:me-4
                        file:py-2 file:px-4
                      "/>

                <button type="submit" className="w-full my-4 py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                送信
              </button>
      </fetcher.Form>
      {isError && (

          <h2>{fetcher.data?.errorMsg}</h2>

      )}
      {isSuccess && fetcher.data?.imgSrc && (
        <>
          <div>
            アップロードが完了しました。
          </div>
          <img
            src={fetcher.data?.imgSrc}
            alt="Uploaded Image"
            className="my-4"
          />
          <Link
						reloadDocument
						to={fetcher.data?.imgSrc}
					>
						<button type="button" className="flex items-center gap-x-2 text-gray-500 hover:text-blue-600 whitespace-nowrap dark:text-neutral-500 dark:hover:text-blue-500">
                      <svg className="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                      ダウンロード
                    </button>
					</Link>
        </>
      )}
    </div>

          </div>
          
      </div>

      </div>

  );
}
