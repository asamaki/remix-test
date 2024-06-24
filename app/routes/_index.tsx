import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  json,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { createCookie } from "@remix-run/node";
import React, { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const date = new Date();
console.log("log");
console.debug("debug");
console.warn("warn");
console.error("error");

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let { searchParams } = new URL(request.url);
  let query = searchParams.get("view");
  console.log("loader log");
  console.debug("loader debug");

  return json({ date: date, view: searchParams.get("view") });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [view, setView] = React.useState(searchParams.get("view") || "list");
  const [isOpen, setIsOpen] = React.useState(false);

  const [money, setMoney] = useState(0);
  const setM = (money: number) => {
    console.log(money);
    setMoney(money + 1);
  };

  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        <a
          className="group flex flex-col bg-white border shadow-sm rounded-xl hover:shadow-md transition"
          href="#"
        >
          <div className="p-4 md:p-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="group-hover:text-blue-600 font-semibold text-gray-800">
                  Management
                </h3>
                <p className="text-sm text-gray-500">4 job positions</p>
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
          href="#"
        >
          <div className="p-4 md:p-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="group-hover:text-blue-600 font-semibold text-gray-800">
                  App Development
                </h3>
                <p className="text-sm text-gray-500">26 job positions</p>
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
