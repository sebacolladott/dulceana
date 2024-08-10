import { ClipboardList, House, Settings, ShoppingBasket } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from '../components/Sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/Tooltip';

export const Root = () => {
  const currentPath = useLocation().pathname.split('/')[1];

  return (
    <>
      <TooltipProvider delayDuration={0}>
        <header
          className="fixed top-0 z-[100] flex h-8 w-full items-center justify-start border-b bg-background"
          style={{ WebkitAppRegion: 'drag' }}
        >
          <nav className="ml-4 flex gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/"
                  className={`flex items-center hover:text-foreground ${
                    currentPath === '' ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <House className="size-5" />
                  <span className="sr-only">Inicio</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={5}>
                Inicio
              </TooltipContent>
            </Tooltip>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/pm"
                    className={`flex items-center hover:text-foreground ${
                      currentPath === 'pm' ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    <ClipboardList className="size-5" />
                    <span className="sr-only">Gestión de productos</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={5}>
                  Gestión de productos
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/pos"
                    className={`flex items-center hover:text-foreground ${
                      currentPath === 'pos' ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    <ShoppingBasket className="size-5" />
                    <span className="sr-only">Punto de Venta</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={5}>
                  Punto de Venta
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/settings"
                    className={`flex items-center hover:text-foreground ${
                      currentPath === 'settings' ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    <Settings className="size-5" />
                    <span className="sr-only">Ajustes</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={5}>
                  Ajustes
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </nav>
        </header>
        <main className="mt-8 flex h-[calc(100vh-2rem)] p-2">
          <Outlet />
        </main>
        <Toaster />
      </TooltipProvider>
    </>
  );
};
