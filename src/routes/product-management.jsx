import { zodResolver } from '@hookform/resolvers/zod';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/Form';
import { Input } from '../components/Input';
import { ScrollArea } from '../components/ScrollArea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '../components/Select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '../components/Sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';

/**
 * @constant defaultColumns
 * @type {Array}
 * @description Definición de las columnas por defecto para la tabla de productos.
 */
const defaultColumns = [
  {
    accessorKey: 'barcode',
    header: 'Código de barras',
    cell: ({ row }) => <div>{row.getValue('barcode')}</div>
  },
  {
    accessorKey: 'name',
    header: 'Nombre',
    cell: ({ row }) => <div>{row.getValue('name')}</div>
  },
  {
    accessorKey: 'unit_of_measurement',
    header: 'Unidad de medida',
    cell: ({ row }) => <div>{row.getValue('unit_of_measurement')}</div>
  },
  {
    accessorKey: 'price',
    header: 'Precio',
    cell: ({ row }) => <div>${row.getValue('price')}</div>
  }
];

/**
 * @component ProductManagement
 * @description Componente principal para la gestión de productos. Proporciona una interfaz
 * para listar, crear, editar y eliminar productos.
 *
 * @returns {JSX.Element} Componente ProductManagement renderizado
 */
export const ProductManagement = () => {
  const [data, setData] = useState([]);
  const [columns] = useState(defaultColumns);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * @constant productFormSchema
   * @type {Object}
   * @description Esquema de validación Zod para el formulario de producto.
   */
  const productFormSchema = z.object({
    barcode: z
      .string()
      .min(1, { message: 'El código de barras es obligatorio.' })
      .max(20, { message: 'El código de barras no puede tener más de 20 caracteres.' }),
    name: z
      .string()
      .min(1, { message: 'El nombre es obligatorio.' })
      .max(30, { message: 'El nombre no puede tener más de 100 caracteres.' }),
    unit_of_measurement: z.string().min(1, { message: 'La unidad de medida es obligatoria.' }),
    price: z.coerce
      .number()
      .min(0, { message: 'El precio debe ser un número mayor o igual a 0.' })
      .max(9999999.99, { message: 'El precio no puede ser mayor a 9,999,999.99.' })
  });

  const createForm = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      barcode: '',
      name: '',
      unit_of_measurement: '',
      price: 0
    }
  });

  const editForm = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      barcode: '',
      name: '',
      unit_of_measurement: '',
      price: 0
    }
  });

  /**
   * @function fetchProducts
   * @description Obtiene todos los productos del backend y actualiza el estado.
   */
  const fetchProducts = useCallback(() => {
    window.ipcRenderer
      .invoke('products:getAll')
      .then(products => {
        setData(products);
      })
      .catch(error => {
        console.error('Error al obtener productos:', error);
        toast.message('Error al cargar productos', {
          description: 'No se pudieron cargar los productos. Por favor, intente nuevamente.'
        });
      });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /**
   * @function handleCreateProduct
   * @description Abre el modal para crear un nuevo producto.
   */
  const handleCreateProduct = useCallback(() => {
    setIsCreateSheetOpen(true);
  }, []);

  /**
   * @function handleSubmitCreate
   * @description Maneja la creación de un nuevo producto.
   * @param {Object} formData - Datos del formulario para el nuevo producto
   */
  const handleSubmitCreate = useCallback(
    formData => {
      window.ipcRenderer
        .invoke('products:create', formData)
        .then(() => {
          fetchProducts();
          setIsCreateSheetOpen(false);
          createForm.reset();
          toast.message('Producto creado', {
            description: 'El producto se ha creado exitosamente.'
          });
        })
        .catch(error => {
          console.error('Error al crear el producto:', error);
          toast.message('Error al crear producto', {
            description: 'No se pudo crear el producto. Por favor, intente nuevamente.'
          });
        });
    },
    [fetchProducts, createForm]
  );

  /**
   * @function handleEditProduct
   * @description Abre el modal para editar un producto existente.
   * @param {Object} product - Producto a editar
   */
  const handleEditProduct = useCallback(
    product => {
      setSelectedProduct(product);
      editForm.reset(product);
      setIsEditSheetOpen(true);
    },
    [editForm]
  );

  /**
   * @function handleSubmitEdit
   * @description Maneja la actualización de un producto existente.
   * @param {Object} formData - Datos actualizados del producto
   */
  const handleSubmitEdit = useCallback(
    formData => {
      window.ipcRenderer
        .invoke('products:update', {
          id: selectedProduct.id,
          productData: formData
        })
        .then(() => {
          fetchProducts();
          setIsEditSheetOpen(false);
          setSelectedProduct(null);
          toast.message('Producto actualizado', {
            description: 'El producto se ha actualizado exitosamente.'
          });
        })
        .catch(error => {
          console.error('Error al actualizar el producto:', error);
          toast.message('Error al actualizar producto', {
            description: 'No se pudo actualizar el producto. Por favor, intente nuevamente.'
          });
        });
    },
    [fetchProducts, selectedProduct]
  );

  /**
   * @function handleDeleteProduct
   * @description Abre el diálogo de confirmación para eliminar un producto.
   * @param {Object} product - Producto a eliminar
   */
  const handleDeleteProduct = useCallback(product => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  }, []);

  /**
   * @function handleDeleteConfirm
   * @description Confirma y ejecuta la eliminación de un producto.
   */
  const handleDeleteConfirm = useCallback(() => {
    window.ipcRenderer
      .invoke('products:delete', { id: selectedProduct.id })
      .then(() => {
        fetchProducts();
        setIsDeleteDialogOpen(false);
        setSelectedProduct(null);
        toast.message('Producto eliminado', {
          description: 'El producto se ha eliminado exitosamente.'
        });
      })
      .catch(error => {
        console.error('Error al eliminar el producto:', error);
        toast.message('Error al eliminar producto', {
          description: 'No se pudo eliminar el producto. Por favor, intente nuevamente.'
        });
      });
  }, [selectedProduct, fetchProducts]);

  const filteredData = useMemo(() => {
    return data.filter(product =>
      Object.values(product).some(value =>
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { columnFilters, rowSelection }
  });

  return (
    <>
      <div className="flex size-full flex-col">
        <div className="flex justify-between space-x-2">
          <Input
            type="text"
            placeholder="Buscar productos..."
            className="max-w-xs"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center justify-center space-x-2">
            <Button onClick={handleCreateProduct}>Añadir producto</Button>
          </div>
        </div>

        <ScrollArea className="mt-2 flex-1 rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map(cell => (
                      <ContextMenu key={cell.id}>
                        <ContextMenuTrigger asChild>
                          <TableCell>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-64">
                          <ContextMenuItem onClick={() => handleEditProduct(row.original)}>
                            Editar
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem onClick={() => handleDeleteProduct(row.original)}>
                            Eliminar
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No se han encontrado resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Añadir producto</SheetTitle>
            <SheetDescription>Introduzca la información del nuevo producto.</SheetDescription>
          </SheetHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleSubmitCreate)} className="space-y-4 py-4">
              <FormField
                control={createForm.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de barras</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={20} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={100} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="unit_of_measurement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad de medida</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una unidad de medida" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-48">
                        <SelectGroup>
                          <SelectLabel>Masa</SelectLabel>
                          <SelectItem value="kg">kilogramos</SelectItem>
                          <SelectItem value="g">gramos</SelectItem>
                          <SelectItem value="mg">miligramos</SelectItem>
                          <SelectItem value="ug">microgramos</SelectItem>
                          <SelectItem value="ng">nanogramos</SelectItem>
                          <SelectItem value="pg">picogramos</SelectItem>
                          <SelectItem value="t">toneladas</SelectItem>
                          <SelectItem value="q">quilates</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Longitud</SelectLabel>
                          <SelectItem value="m">metros</SelectItem>
                          <SelectItem value="km">kilómetros</SelectItem>
                          <SelectItem value="cm">centímetros</SelectItem>
                          <SelectItem value="mm">milímetros</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Área</SelectLabel>
                          <SelectItem value="m2">metros cuadrados</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Volumen</SelectLabel>
                          <SelectItem value="m3">metros cúbicos</SelectItem>
                          <SelectItem value="l">litros</SelectItem>
                          <SelectItem value="ml">mililitros</SelectItem>
                          <SelectItem value="cm3">centímetros cúbicos</SelectItem>
                          <SelectItem value="mm3">milímetros cúbicos</SelectItem>
                          <SelectItem value="hl">hectolitros</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Energía</SelectLabel>
                          <SelectItem value="kwh">1000 kWh</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Cantidad</SelectLabel>
                          <SelectItem value="u">unidades</SelectItem>
                          <SelectItem value="par">pares</SelectItem>
                          <SelectItem value="doc">docenas</SelectItem>
                          <SelectItem value="mil">millares</SelectItem>
                          <SelectItem value="gru">gruesa</SelectItem>
                          <SelectItem value="pack">packs</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Específicas</SelectLabel>
                          <SelectItem value="naipe">jgo. pqt. mazo naipes</SelectItem>
                          <SelectItem value="curie">curie</SelectItem>
                          <SelectItem value="mcurie">milicurie</SelectItem>
                          <SelectItem value="ucurie">microcurie</SelectItem>
                          <SelectItem value="uiacthor">uiacthor</SelectItem>
                          <SelectItem value="muiacthor">muiacthor</SelectItem>
                          <SelectItem value="kgbase">kg base</SelectItem>
                          <SelectItem value="kgbruto">kg bruto</SelectItem>
                          <SelectItem value="uiactant">uiactant</SelectItem>
                          <SelectItem value="muiactant">muiactant</SelectItem>
                          <SelectItem value="uiactig">uiactig</SelectItem>
                          <SelectItem value="muiactig">muiactig</SelectItem>
                          <SelectItem value="kgactivo">kg activo</SelectItem>
                          <SelectItem value="gactivo">gramo activo</SelectItem>
                          <SelectItem value="gbase">gramo base</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Otra</SelectLabel>
                          <SelectItem value="other">otras unidad</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" max="9999999.99" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter>
                <Button type="submit">Guardar</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar producto</SheetTitle>
            <SheetDescription>Modifique la información del producto.</SheetDescription>
          </SheetHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleSubmitEdit)} className="space-y-4 py-4">
              <FormField
                control={editForm.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de barras</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={20} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={100} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="unit_of_measurement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad de medida</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una unidad de medida" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-48">
                        <SelectGroup>
                          <SelectLabel>Masa</SelectLabel>
                          <SelectItem value="kg">kilogramos</SelectItem>
                          <SelectItem value="g">gramos</SelectItem>
                          <SelectItem value="mg">miligramos</SelectItem>
                          <SelectItem value="ug">microgramos</SelectItem>
                          <SelectItem value="ng">nanogramos</SelectItem>
                          <SelectItem value="pg">picogramos</SelectItem>
                          <SelectItem value="t">toneladas</SelectItem>
                          <SelectItem value="q">quilates</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Longitud</SelectLabel>
                          <SelectItem value="m">metros</SelectItem>
                          <SelectItem value="km">kilómetros</SelectItem>
                          <SelectItem value="cm">centímetros</SelectItem>
                          <SelectItem value="mm">milímetros</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Área</SelectLabel>
                          <SelectItem value="m2">metros cuadrados</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Volumen</SelectLabel>
                          <SelectItem value="m3">metros cúbicos</SelectItem>
                          <SelectItem value="l">litros</SelectItem>
                          <SelectItem value="ml">mililitros</SelectItem>
                          <SelectItem value="cm3">centímetros cúbicos</SelectItem>
                          <SelectItem value="mm3">milímetros cúbicos</SelectItem>
                          <SelectItem value="hl">hectolitros</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Energía</SelectLabel>
                          <SelectItem value="kwh">1000 kWh</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Cantidad</SelectLabel>
                          <SelectItem value="u">unidades</SelectItem>
                          <SelectItem value="par">pares</SelectItem>
                          <SelectItem value="doc">docenas</SelectItem>
                          <SelectItem value="mil">millares</SelectItem>
                          <SelectItem value="gru">gruesa</SelectItem>
                          <SelectItem value="pack">packs</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Específicas</SelectLabel>
                          <SelectItem value="naipe">jgo. pqt. mazo naipes</SelectItem>
                          <SelectItem value="curie">curie</SelectItem>
                          <SelectItem value="mcurie">milicurie</SelectItem>
                          <SelectItem value="ucurie">microcurie</SelectItem>
                          <SelectItem value="uiacthor">uiacthor</SelectItem>
                          <SelectItem value="muiacthor">muiacthor</SelectItem>
                          <SelectItem value="kgbase">kg base</SelectItem>
                          <SelectItem value="kgbruto">kg bruto</SelectItem>
                          <SelectItem value="uiactant">uiactant</SelectItem>
                          <SelectItem value="muiactant">muiactant</SelectItem>
                          <SelectItem value="uiactig">uiactig</SelectItem>
                          <SelectItem value="muiactig">muiactig</SelectItem>
                          <SelectItem value="kgactivo">kg activo</SelectItem>
                          <SelectItem value="gactivo">gramo activo</SelectItem>
                          <SelectItem value="gbase">gramo base</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Otra</SelectLabel>
                          <SelectItem value="other">otras unidad</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" max="9999999.99" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter>
                <Button type="submit">Guardar</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el producto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
