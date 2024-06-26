import { Link, Outlet } from 'react-router-dom';

export const Root = () => {
  return (
    <>
      {/* <!-- component --> */}
      <div className="flex h-screen w-screen overflow-hidden text-gray-700">
        {/* <!-- Component Start --> */}
        <div className="flex w-16 flex-col items-center overflow-auto border-r border-gray-300 pb-4">
          <Link
            to={'/'}
            className="mt-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded hover:bg-gray-300"
          >
            1
          </Link>
          <Link
            to={'/pos'}
            className="mt-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded hover:bg-gray-300"
          >
            2
          </Link>
        </div>
        <div className="flex flex-grow flex-col">
          <Outlet />
        </div>
        {/* <!-- Component End  --> */}
      </div>
    </>
  );
};
