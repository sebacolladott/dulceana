import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/Table";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../components/ContextMenu";
import { Checkbox } from "../components/Checkbox";

const defaultData = [
  {
    id: "001",
    barcode: "123456789",
    name: "Pan blanco",
    unit_of_measurement: "Venta al por menor",
    price: 2.99,
  },
  {
    id: "002",
    barcode: "987654321",
    name: "Pan integral",
    unit_of_measurement: "Venta al por mayor",
    price: 3.5,
  },
  {
    id: "003",
    barcode: "456789123",
    name: "Croissant",
    unit_of_measurement: "Venta online",
    price: 1.99,
  },
  {
    id: "004",
    barcode: "135792468",
    name: "Bollo de canela",
    unit_of_measurement: "Venta al por menor",
    price: 1.75,
  },
  {
    id: "005",
    barcode: "246813579",
    name: "Baguette",
    unit_of_measurement: "Venta al por mayor",
    price: 4.25,
  },
  {
    id: "006",
    barcode: "7790580511104",
    name: "Pan de centeno",
    unit_of_measurement: "Venta al por menor",
    price: 2.99,
  },
  {
    id: "007",
    barcode: "123456789",
    name: "Rosquillas",
    unit_of_measurement: "Venta al por mayor",
    price: 2.5,
  },
  {
    id: "008",
    barcode: "987654321",
    name: "Muffins de arándanos",
    unit_of_measurement: "Venta al por menor",
    price: 1.99,
  },
  {
    id: "009",
    barcode: "123456789",
    name: "Palmeras de chocolate",
    unit_of_measurement: "Venta al por mayor",
    price: 3.75,
  },
  {
    id: "010",
    barcode: "987654321",
    name: "Donuts",
    unit_of_measurement: "Venta al por menor",
    price: 1.5,
  },
];

const defaultColumns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "barcode",
    header: "Código de barras",
    cell: ({ row }) => <div>{row.getValue("barcode")}</div>,
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "unit_of_measurement",
    header: "Unidad de medida",
    cell: ({ row }) => <div>{row.getValue("unit_of_measurement")}</div>,
  },
  {
    accessorKey: "price",
    header: "Precio",
    cell: ({ row }) => <div>${row.getValue("price")}</div>,
  },
];

export const Inventory = () => {
  const [data, setData] = useState(defaultData);
  const [columns] = useState(defaultColumns);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { columnFilters, rowSelection },
  });

  return (
    <>
      <div>Inventario</div>
      <div>
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <ContextMenu key={cell.id}>
                      <ContextMenuTrigger asChild>
                        <TableCell className="overflow-hidden text-nowrap">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-64">
                        <ContextMenuItem>Editar</ContextMenuItem>

                        <ContextMenuSeparator />
                        <ContextMenuItem>Eliminar</ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se han encontrado resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
