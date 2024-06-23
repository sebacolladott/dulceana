import React from "react";
import { Link, Outlet } from "react-router-dom";

export const Root = () => {
  return (
    <>
      {/* <!-- component --> */}
      <div className="flex w-screen h-screen text-gray-700">
        {/* <!-- Component Start --> */}
        <div className="flex flex-col items-center w-16 pb-4 overflow-auto border-r border-gray-300">
          <Link
            to={"/"}
            className="flex items-center justify-center flex-shrink-0 w-full h-16 bg-gray-300"
          >
            {/* <svg
              className="w-8 h-8"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg> */}
          </Link>
          <Link
            to={"/"}
            className="flex items-center justify-center flex-shrink-0 w-10 h-10 mt-4 rounded hover:bg-gray-300"
          >
            1
            {/* <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg> */}
          </Link>
          <Link
            to={"/pos"}
            className="flex items-center justify-center flex-shrink-0 w-10 h-10 mt-4 rounded hover:bg-gray-300"
          >
            2
            {/* <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg> */}
          </Link>
        </div>
        {/* <div className="flex flex-col w-56 border-r border-gray-300">
          <button className="relative text-sm focus:outline-none group">
            <div className="flex items-center justify-between w-full h-16 px-4 border-b border-gray-300 hover:bg-gray-300">
              <span className="font-medium">Dropdown</span>
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div className="absolute z-10 flex-col items-start hidden w-full pb-1 bg-white shadow-lg group-focus:flex">
              <a className="w-full px-4 py-2 text-left hover:bg-gray-300" href="#">
                Menu Item 1
              </a>
              <a className="w-full px-4 py-2 text-left hover:bg-gray-300" href="#">
                Menu Item 1
              </a>
              <a className="w-full px-4 py-2 text-left hover:bg-gray-300" href="#">
                Menu Item 1
              </a>
            </div>
          </button>
          <div className="flex flex-col flex-grow p-4 overflow-auto">
            <a
              className="flex items-center flex-shrink-0 h-10 px-2 text-sm font-medium rounded hover:bg-gray-300"
              href="#"
            >
              <span className="leading-none">Item 1</span>
            </a>
            <a
              className="flex items-center flex-shrink-0 h-10 px-2 text-sm font-medium rounded hover:bg-gray-300"
              href="#"
            >
              <span className="leading-none">Item 2</span>
            </a>
            <a
              className="flex items-center flex-shrink-0 h-10 px-2 text-sm font-medium rounded hover:bg-gray-300"
              href="#"
            >
              <span className="leading-none">Item 3</span>
            </a>
            <a
              className="flex items-center flex-shrink-0 h-10 px-2 text-sm font-medium rounded hover:bg-gray-300"
              href="#"
            >
              <span className="leading-none">Item 4</span>
            </a>
            <a
              className="flex items-center flex-shrink-0 h-10 px-2 text-sm font-medium rounded hover:bg-gray-300"
              href="#"
            >
              <span className="leading-none">Item 5</span>
            </a>
            <a
              className="flex items-center flex-shrink-0 h-10 px-2 text-sm font-medium rounded hover:bg-gray-300"
              href="#"
            >
              <span className="leading-none">Item 6</span>
            </a>
            <a
              className="flex items-center flex-shrink-0 h-10 px-3 mt-auto text-sm font-medium bg-gray-200 rounded hover:bg-gray-300"
              href="#"
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="ml-2 leading-none">New Item</span>
            </a>
          </div>
        </div> */}
        <div className="flex flex-col flex-grow">
          <div className="flex items-center flex-shrink-0 h-16 px-8 border-b border-gray-300">
            <h1 className="text-lg font-medium">Page Title</h1>
            <button className="flex items-center justify-center h-10 px-4 ml-auto text-sm font-medium rounded hover:bg-gray-300">
              Action 1
            </button>
            <button className="flex items-center justify-center h-10 px-4 ml-2 text-sm font-medium bg-gray-200 rounded hover:bg-gray-300">
              Action 2
            </button>
            <button className="relative ml-2 text-sm focus:outline-none group">
              <div className="flex items-center justify-between w-10 h-10 rounded hover:bg-gray-300">
                {/* <svg
                  className="w-5 h-5 mx-auto"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg> */}
              </div>
              <div className="absolute right-0 flex-col items-start hidden w-40 pb-1 bg-white border border-gray-300 shadow-lg group-focus:flex">
                <a
                  className="w-full px-4 py-2 text-left hover:bg-gray-300"
                  href="#"
                >
                  Menu Item 1
                </a>
                <a
                  className="w-full px-4 py-2 text-left hover:bg-gray-300"
                  href="#"
                >
                  Menu Item 1
                </a>
                <a
                  className="w-full px-4 py-2 text-left hover:bg-gray-300"
                  href="#"
                >
                  Menu Item 1
                </a>
              </div>
            </button>
          </div>
          <div className="flex-grow p-6 overflow-auto bg-gray-200">
            {/* <div className="grid grid-cols-3 gap-6">
              <div className="h-24 col-span-1 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-1 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-1 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-2 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-1 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-1 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-2 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-3 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-1 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-1 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-1 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-2 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-1 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-1 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-2 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-3 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-1 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-1 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-1 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-2 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-1 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-1 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-2 bg-white border border-gray-300"></div>
              <div className="h-24 col-span-3 bg-white border border-gray-300"></div>
            </div> */}
            <Outlet />
          </div>
        </div>
        {/* <!-- Component End  --> */}
      </div>
    </>
  );
};
