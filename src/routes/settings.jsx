import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button, buttonVariants } from '../components/Button';
import { Checkbox } from '../components/Checkbox';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../components/Form';
import { Input } from '../components/Input';
import { ScrollArea } from '../components/ScrollArea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/Select';
import { cn } from '../lib/cn';

/**
 * @constant printerFormSchema
 * @type {Object}
 * @description Esquema de validación para el formulario de configuración de impresora.
 * Define las reglas de validación para cada campo del formulario.
 */
const printerFormSchema = z.object({
  printerName: z.string().min(1, { message: 'El nombre de la impresora es obligatorio.' }),
  pageSize: z
    .number()
    .min(20, { message: 'El ancho mínimo es 20 caracteres.' })
    .max(80, { message: 'El ancho máximo es 80 caracteres.' }),
  preview: z.boolean(),
  copies: z
    .number()
    .min(1, { message: 'Debe imprimir al menos 1 copia.' })
    .max(10, { message: 'El máximo es 10 copias.' })
});

/**
 * @component Settings
 * @description Componente principal para la configuración de impresión.
 * Permite a los usuarios configurar las opciones de impresión, incluyendo
 * la selección de impresora, tamaño de página, vista previa y número de copias.
 */
export const Settings = () => {
  const [currentSetting, setCurrentSetting] = useState('Impresión');
  const [printers, setPrinters] = useState([]);

  /**
   * @constant printerForm
   * @type {Object}
   * @description Objeto de formulario creado con React Hook Form.
   * Utiliza el esquema de validación de Zod y establece valores por defecto.
   */
  const printerForm = useForm({
    resolver: zodResolver(printerFormSchema),
    defaultValues: {
      printerName: '',
      pageSize: 0,
      preview: false,
      copies: 1
    }
  });

  /**
   * @function useEffect
   * @description Efecto que se ejecuta al montar el componente.
   * Carga la configuración actual de la impresora y la lista de impresoras disponibles.
   */
  useEffect(() => {
    window.ipcRenderer
      .invoke('settings:getPrinter')
      .then(result => {
        printerForm.reset(result);
      })
      .catch(() => {
        toast.message('Error al cargar la configuración', {
          description: 'No se pudo cargar la configuración de la impresora.'
        });
      });

    window.ipcRenderer
      .invoke('printers:getAll')
      .then(result => {
        setPrinters(result);
      })
      .catch(() => {
        toast.message('Error al cargar las impresoras', {
          description: 'No se pudo cargar la lista de impresoras.'
        });
      });
  }, []);

  /**
   * @function onSubmit
   * @param {Object} data - Datos del formulario
   * @description Maneja el envío del formulario. Actualiza la configuración
   * de la impresora en el proceso principal de Electron.
   */
  const onSubmit = data => {
    window.ipcRenderer
      .invoke('settings:update', data)
      .then(() => {
        toast.message('Configuración guardada', {
          description: 'La configuración se ha guardado correctamente.'
        });
      })
      .catch(() => {
        toast.message('Error al guardar', {
          description: 'No se pudo guardar la configuración.'
        });
      });
  };

  return (
    <>
      <ScrollArea className="h-full w-96 rounded-md border">
        <nav className="flex flex-col space-y-1 p-2">
          {['Impresión'].map(setting => (
            <button
              key={setting}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                currentSetting === setting
                  ? 'bg-muted hover:bg-muted'
                  : 'hover:bg-transparent hover:underline',
                'justify-start'
              )}
              onClick={() => setCurrentSetting(setting)}
            >
              {setting}
            </button>
          ))}
        </nav>
      </ScrollArea>
      <ScrollArea className="ml-2 size-full rounded-md border">
        {currentSetting === 'Impresión' && (
          <Form {...printerForm}>
            <form onSubmit={printerForm.handleSubmit(onSubmit)} className="space-y-8 p-2">
              {/* @component FormField (printerName)
                  @description Campo de selección para el nombre de la impresora.
                  Permite al usuario elegir una impresora de la lista de impresoras disponibles. */}
              <FormField
                control={printerForm.control}
                name="printerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la impresora</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una impresora" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {printers.map(printer => (
                          <SelectItem key={printer.name} value={printer.name}>
                            {printer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Seleccione su impresora predeterminada.({printerForm.printerName})
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* @component FormField (pageSize)
                  @description Campo de entrada numérica para el ancho del recibo.
                  Permite al usuario especificar el ancho del recibo en caracteres (entre 20 y 80). */}
              <FormField
                control={printerForm.control}
                name="pageSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ancho del recibo</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="20" max="80" />
                    </FormControl>
                    <FormDescription>
                      Ancho del recibo en caracteres (entre 20 y 80).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* @component FormField (preview)
                  @description Casilla de verificación para activar/desactivar la vista previa.
                  Permite al usuario decidir si desea ver una vista previa antes de imprimir. */}
              <FormField
                control={printerForm.control}
                name="preview"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Vista previa</FormLabel>
                      <FormDescription>Mostrar vista previa antes de imprimir.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              {/* @component FormField (copies)
                  @description Campo de entrada numérica para el número de copias.
                  Permite al usuario especificar cuántas copias desea imprimir (entre 1 y 10). */}
              <FormField
                control={printerForm.control}
                name="copies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de copias</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" max="10" />
                    </FormControl>
                    <FormDescription>Número de copias a imprimir (entre 1 y 10).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Guardar</Button>
            </form>
          </Form>
        )}
      </ScrollArea>
    </>
  );
};
