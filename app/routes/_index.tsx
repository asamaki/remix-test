import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node"; 
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { createCookie } from "@remix-run/node";
import React, { useState } from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};


export const date = new Date();
console.log("log")
console.debug("debug")
console.warn("warn")
console.error("error")

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {

  let { searchParams } = new URL(request.url);
  let query = searchParams.get("view");
  console.log("loader log")
  console.debug("loader debug")

  return json({ date: date, view:searchParams.get("view")});
};



export default function Index() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [view, setView] = React.useState(
    searchParams.get("view") || "list"
  );
  const [isOpen, setIsOpen] = React.useState(false);

  const [money, setMoney] = useState(0);
const setM = (money: number) => {
  console.log(money)
  setMoney(money+1)
}


  return (
    <div className="font-sans p-4">
      <button onClick={() => setM(money)}>
        Add
      </button>
      {money}
      <div>
      <button onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "閉じる" : "開く"}
      </button>
      <aside hidden={!isOpen}><p>aaaa</p></aside>
    </div>


      <div>
      <div>
        <button
          onClick={() => {
            setView("list");
            navigate(`?view=list`);
          }}
        >
          リストとして表示
        </button>
        <button
          onClick={() => {
            setView("details");
            navigate(`?view=details`);
          }}
        >
          詳細を表示
        </button>
      </div>
      {data.view === "list" ? <p>list</p> : <p>detail</p>}
    </div>
      <h1 className="text-3xl">Welcome to Remix</h1>
      <ul className="list-disc mt-4 pl-6 space-y-2">
        <li>
          <a
            className="text-blue-700 underline visited:text-purple-900"
            target="_blank"
            href="https://remix.run/start/quickstart"
            rel="noreferrer"
          >
            5m Quick Start | {data.date} | {console.log('front log')} {console.debug('front debug')}
          </a>
        </li>
        <li>
          <a
            className="text-blue-700 underline visited:text-purple-900"
            target="_blank"
            href="https://remix.run/start/tutorial"
            rel="noreferrer"
          >
            30m Tutorial
          </a>
        </li>
        <li>
          <a
            className="text-blue-700 underline visited:text-purple-900"
            target="_blank"
            href="https://remix.run/docs"
            rel="noreferrer"
          >
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  );
}
