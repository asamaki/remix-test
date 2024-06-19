
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

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {

  let { searchParams } = new URL(request.url);
  let query = searchParams.get("view");


  return json({view:searchParams.get("view")});
};



export default function Index() {



  return (
    
    <div className="flex flex-col bg-white border shadow-sm rounded-xl p-4 md:p-5">
        <h3 className="text-lg font-bold text-gray-800">
            Card title
        </h3>
        <div className="flex flex-col">
  <div className="-m-1.5 overflow-x-auto">
    <div className="p-1.5 min-w-full inline-block align-middle">
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Name</th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Age</th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Address</th>
              <th scope="col" className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="odd:bg-white even:bg-gray-100">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">John Brown</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">45</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">New York No. 1 Lake Park</td>
              <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">Delete</button>
              </td>
            </tr>

            <tr className="odd:bg-white even:bg-gray-100">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">Jim Green</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">27</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">London No. 1 Lake Park</td>
              <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">Delete</button>
              </td>
            </tr>

            <tr className="odd:bg-white even:bg-gray-100">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">Joe Black</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">31</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">Sidney No. 1 Lake Park</td>
              <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">Delete</button>
              </td>
            </tr>

            <tr className="odd:bg-white even:bg-gray-100">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">Edward King</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">16</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">LA No. 1 Lake Park</td>
              <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">Delete</button>
              </td>
            </tr>

            <tr className="odd:bg-white even:bg-gray-100">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">Jim Red</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">45</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">Melbourne No. 1 Lake Park</td>
              <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:pointer-events-none">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

    </div>
  );
}
