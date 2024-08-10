import { Minus, Plus, Trash } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../components/AlertDialog';
import { Button } from '../components/Button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '../components/ContextMenu';
import { Input } from '../components/Input';
import { Label } from '../components/Label';
import { ScrollArea } from '../components/ScrollArea';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '../components/Sheet';
import { useToast } from '../hooks/useToast';

const INITIAL_EDIT_ITEM_STATE = { id: null, quantity: 1, name: '', note: '' };

/**
 * Componente PointOfSale
 *
 * Este componente implementa un sistema de punto de venta con las siguientes características:
 * - Listado y búsqueda de productos
 * - Gestión del carrito de compras
 * - Adición rápida de precios
 * - Generación e impresión de tickets
 * - Registro del nombre del cliente
 *
 * @returns {JSX.Element} El componente PointOfSale renderizado
 */
export const PointOfSale = () => {
  const { toast } = useToast();
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editSheet, setEditSheet] = useState(false);
  const [editItem, setEditItem] = useState(INITIAL_EDIT_ITEM_STATE);
  const [cart, setCart] = useState([]);
  const [quickPrice, setQuickPrice] = useState('');
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [customerName, setCustomerName] = useState('');

  /**
   * Carga los productos desde el backend cuando el componente se monta
   */
  useEffect(() => {
    const loadProducts = () => {
      window.ipcRenderer
        .invoke('products:getAll')
        .then(result => {
          setData(result);
        })
        .catch(error => {
          console.error('Error al cargar los productos:', error);
          toast({
            title: 'Error',
            description: 'No se pudieron cargar los productos.',
            variant: 'destructive'
          });
        });
    };

    loadProducts();
  }, [toast]);

  /**
   * Añade un producto al carrito o incrementa su cantidad si ya está presente
   *
   * @param {Object} product - El producto a añadir al carrito
   */
  const addToCart = useCallback(product => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { ...product, qty: 1, note: '' }];
    });
  }, []);

  /**
   * Elimina un producto del carrito o decrementa su cantidad
   *
   * @param {string|number} productId - El ID del producto a eliminar
   */
  const removeFromCart = useCallback(productId => {
    setCart(prev =>
      prev
        .map(item => (item.id === productId ? { ...item, qty: Math.max(0, item.qty - 1) } : item))
        .filter(item => item.qty > 0)
    );
  }, []);

  /**
   * Maneja el cambio en el campo de búsqueda
   *
   * @param {string} term - El término de búsqueda
   */
  const handleSearch = useCallback(term => {
    setSearchTerm(term);
  }, []);

  /**
   * Filtra los datos de productos basándose en el término de búsqueda
   */
  const filteredData = useMemo(() => {
    if (searchTerm.trim() === '') {
      return data;
    }
    return data.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data, searchTerm]);

  /**
   * Calcula el monto total del carrito incluyendo el precio rápido
   */
  const totalAmount = useMemo(() => {
    return (
      cart.reduce((total, item) => total + item.price * item.qty, 0) +
      (quickPrice ? parseFloat(quickPrice) : 0)
    );
  }, [cart, quickPrice]);

  /**
   * Edita un artículo en el carrito
   *
   * @param {string|number} itemId - El ID del artículo a editar
   * @param {number} newQty - La nueva cantidad
   * @param {string} newName - El nuevo nombre
   * @param {string} newNote - La nueva nota
   */
  const editCartItem = useCallback((itemId, newQty, newName, newNote) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, qty: newQty, name: newName, note: newNote } : item
      )
    );
    setEditSheet(false);
  }, []);

  /**
   * Añade un producto de precio rápido al carrito
   */
  const addProductToCart = useCallback(() => {
    if (quickPrice && !isNaN(quickPrice)) {
      const product = {
        id: Date.now(),
        code: 'quick',
        name: 'Ítem',
        price: parseFloat(quickPrice),
        qty: 1,
        note: ''
      };
      setCart(prevCart => [...prevCart, product]);
      setQuickPrice('');
    }
  }, [quickPrice]);

  /**
   * Maneja la entrada para la función de precio rápido
   *
   * @param {string} key - La tecla presionada
   */
  const handleQuickPriceInput = useCallback(key => {
    setQuickPrice(prev => {
      if (key === '.' && prev.includes('.')) return prev;
      return prev + key;
    });
  }, []);

  /**
   * Maneja los eventos de teclado para la función de precio rápido
   *
   * @param {KeyboardEvent} event - El evento keydown
   */
  const handleKeyDown = useCallback(
    event => {
      const { key, code } = event;
      if (code.startsWith('Numpad')) {
        event.preventDefault();
        if (key === 'Enter' || code === 'NumpadEnter') {
          addProductToCart();
        } else if (key === 'Delete' && code === 'NumpadDecimal') {
          setQuickPrice('');
        } else if ((key === '.' && code === 'NumpadDecimal') || (!isNaN(key) && key !== ' ')) {
          handleQuickPriceInput(key);
        }
      }
    },
    [addProductToCart, handleQuickPriceInput]
  );

  /**
   * Genera los datos para el ticket
   *
   * @returns {Array} Un array de objetos que representan los datos del ticket
   */
  const generateTicketData = useCallback(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString();
    const formattedTime = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const formatRow = (qty, description, totalPrice) => {
      return [
        { type: 'text', value: qty.toString().padEnd(4) },
        { type: 'text', value: description.padEnd(20) },
        { type: 'text', value: totalPrice.padStart(10) }
      ];
    };

    let ticketData = [
      {
        type: 'text',
        value: `Fecha: ${formattedDate} ${formattedTime}`,
        position: 'center',
        style: { fontSize: '12px' }
      }
    ];

    // Añadimos la línea del cliente si se ha ingresado un nombre
    if (customerName) {
      ticketData.push({
        type: 'text',
        value: `Cliente: ${customerName}`,
        position: 'left',
        style: { fontSize: '12px' }
      });
    }

    ticketData.push(
      {
        type: 'text',
        value: '-'.repeat(32),
        position: 'center'
      },
      {
        type: 'table',
        tableHeader: [formatRow('Cant', 'Descripción', 'Subtotal')],
        tableBody: cart.map(item =>
          formatRow(item.qty.toString(), item.name, `$${(item.price * item.qty).toFixed(2)}`)
        ),
        tableFooter: [formatRow('', 'Total', `$${totalAmount.toFixed(2)}`)],
        tableHeaderStyle: { fontWeight: 'bold', backgroundColor: '#f2f2f2' },
        tableBodyStyle: { fontSize: '12px' },
        tableFooterStyle: { fontWeight: 'bold', fontSize: '14px' }
      },
      {
        type: 'text',
        value: '-'.repeat(32),
        position: 'center'
      },
      {
        type: 'text',
        value: 'Gracias por su compra',
        position: 'center',
        style: { fontSize: '12px', fontWeight: 'bold' }
      },
      {
        type: 'text',
        value: 'Este ticket no es válido como factura',
        position: 'center',
        style: { fontSize: '10px', color: 'red' }
      }
    );

    return ticketData;
  }, [cart, totalAmount, customerName]);

  /**
   * Maneja la acción de impresión
   */
  const handlePrint = useCallback(() => {
    const ticketData = generateTicketData();

    window.ipcRenderer
      .invoke('print:execute', ticketData, {
        copies: 1,
        preview: false,
        printerName: 'GP80160',
        pageSize: 80
      })
      .then(() => {
        setCart([]);
        setQuickPrice('');
        setCustomerName('');
        toast({
          title: 'Venta completada',
          description: 'La venta se ha registrado y el ticket se ha impreso correctamente.',
          variant: 'success'
        });
      })
      .catch(error => {
        console.error('Error en el proceso de venta e impresión:', error);
        toast({
          title: 'Error',
          description: `Ocurrió un error: ${error.message}`,
          variant: 'destructive'
        });
      });
  }, [generateTicketData, toast]);

  /**
   * Abre la hoja de edición para un artículo del carrito
   *
   * @param {Object} item - El artículo a editar
   */
  const openEditSheet = useCallback(item => {
    setEditSheet(true);
    setEditItem({ id: item.id, qty: item.qty, name: item.name, note: item.note });
  }, []);

  /**
   * Abre la alerta de eliminación para un artículo del carrito
   *
   * @param {Object} item - El artículo a eliminar
   */
  const openDeleteAlert = useCallback(item => {
    setItemToDelete(item);
    setDeleteAlertOpen(true);
  }, []);

  /**
   * Confirma la eliminación de un artículo del carrito
   */
  const confirmDelete = useCallback(() => {
    if (itemToDelete) {
      setCart(prevCart => prevCart.filter(i => i.id !== itemToDelete.id));
      setItemToDelete(null);
    }
    setDeleteAlertOpen(false);
  }, [itemToDelete]);

  // Efecto para añadir el listener de eventos keydown
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      {/* Búsqueda y listado de productos */}
      <div className="flex size-full flex-col">
        <Input
          type="text"
          placeholder="Buscar productos..."
          className="max-w-xs"
          value={searchTerm}
          onChange={e => handleSearch(e.target.value)}
        />
        <div className="mt-2 flex-1 rounded-md border p-2">
          <ScrollArea className="size-full">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredData.map(product => {
                const cartItem = cart.find(item => item.id === product.id);
                const quantity = cartItem ? cartItem.qty : 0;
                return (
                  <div key={product.id} className="flex flex-col rounded-md border p-4">
                    <div className="flex-1">
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap text-lg font-semibold">
                        {product.name}
                      </div>
                      <div className="mt-2 text-sm">${product.price.toFixed(2)}</div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Button
                        onClick={() => removeFromCart(product.id)}
                        disabled={quantity === 0}
                        variant="outline"
                        size="sm"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span>{quantity}</span>
                      <Button onClick={() => addToCart(product)} variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Carrito de compras */}
      <div className="ml-2 flex h-full w-5/12 flex-col rounded-md border p-2">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Cliente..."
            className="flex-1"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
          />
          <Button
            variant="destructive"
            size="icon"
            disabled={cart.length <= 0}
            onClick={() => setCart([])}
          >
            <Trash className="size-5" />
          </Button>
        </div>
        <ScrollArea className="mt-2 flex-1">
          {quickPrice && (
            <div className="mb-4 rounded-md border bg-secondary p-4 text-secondary-foreground">
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  <span className="font-medium">Ítem</span>
                  <span className="text-muted-foreground">x1</span>
                </div>
                <div className="font-semibold">${parseFloat(quickPrice).toFixed(2)}</div>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">Vista previa</div>
            </div>
          )}
          {cart.map(item => (
            <ContextMenu key={item.id}>
              <ContextMenuTrigger>
                <div className="mb-4 rounded-lg border p-3 transition-colors hover:bg-accent">
                  <div className="flex justify-between">
                    <div className="flex space-x-2">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground">x{item.qty}</span>
                    </div>
                    <div className="font-semibold">${(item.price * item.qty).toFixed(2)}</div>
                  </div>
                  {item.note && (
                    <div className="mt-1 text-sm text-muted-foreground">Nota: {item.note}</div>
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-64">
                <ContextMenuItem onClick={() => openEditSheet(item)}>Editar</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => openDeleteAlert(item)}>Eliminar</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </ScrollArea>
        <div className="mb-4 flex items-center justify-between text-xl font-bold">
          <span>Total</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
        <Button disabled={cart.length <= 0} onClick={handlePrint} className="w-full" size="lg">
          Imprimir
        </Button>
      </div>

      {/* Hoja de edición de artículo */}
      <Sheet open={editSheet} onOpenChange={setEditSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar producto</SheetTitle>
            <SheetDescription>
              Cambia la cantidad, nombre y añade una nota al producto seleccionado.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Cantidad</Label>
              <Input
                type="number"
                value={editItem.qty}
                onChange={e => setEditItem(prev => ({ ...prev, qty: parseInt(e.target.value) }))}
                min={1}
              />
            </div>
            <div className="grid gap-2">
              <Label>Nombre</Label>
              <Input
                type="text"
                value={editItem.name}
                onChange={e => setEditItem(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del producto"
              />
            </div>
            <div className="grid gap-2">
              <Label>Nota</Label>
              <Input
                type="text"
                value={editItem.note}
                onChange={e => setEditItem(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Añadir nota"
              />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button
                type="submit"
                onClick={() =>
                  editCartItem(editItem.id, editItem.qty, editItem.name, editItem.note)
                }
              >
                Guardar
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Diálogo de alerta para eliminar artículo */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que deseas eliminar este artículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará "{itemToDelete?.name}" de tu carrito. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// TODO: Implementar las siguientes mejoras:
// 1. Gestión de estado: Considerar el uso de Redux o Recoil para un manejo de estado más complejo
// 2. Optimización de rendimiento: Implementar virtualización para listas de productos grandes
// 3. Soporte offline: Añadir capacidades offline usando service workers o IndexedDB
// 4. Internacionalización: Implementar soporte i18n para funcionalidad multi-idioma
// 5. Pruebas: Añadir pruebas unitarias y de integración
// 6. Accesibilidad: Mejorar la navegación por teclado y el soporte para lectores de pantalla
// 7. Límites de error: Implementar límites de error para un manejo de errores más elegante
// 8. Hooks personalizados: Extraer lógica reutilizable en hooks personalizados
// 9. Diseño responsivo: Mejorar la respuesta en dispositivos móviles
// 10. División de código: Implementar división de código para reducir el tamaño inicial del paquete
// 11. Memoización: Usar React.memo() para componentes hijos para prevenir re-renderizados innecesarios
// 12. Abstracción de API: Crear una capa de API separada para una mejor separación de preocupaciones
// 13. Tematización: Implementar un sistema de temas para una fácil personalización de la UI
// 14. Registro: Añadir registro completo para una mejor depuración y monitoreo
// 15. Monitoreo de rendimiento: Implementar herramientas para rastrear y optimizar el renderizado de componenteslassName="text-center text-muted-foreground">El carrito está vacío
