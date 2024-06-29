import { Link, Outlet, useNavigate } from 'react-router-dom';
import { buttonVariants } from '../components/Button';
import { cn } from '../lib/cn';

export const Root = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="flex h-screen bg-gray-100">
        <div className="flex w-[50px] flex-col items-center p-4">
          <div className="space-y-4">
            <Link to={'/'} className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}>
              1
            </Link>
            <Link to={'/pos'} className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}>
              2
            </Link>
          </div>
        </div>
        <main className="flex flex-grow">
          <Outlet />
        </main>
      </div>
    </>
  );
};
