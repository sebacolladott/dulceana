/**
 * Proceso principal para la aplicación Electron POS (Punto de Venta).
 * Este archivo configura la base de datos, gestiona la ventana principal y maneja
 * la IPC (Comunicación Inter-Proceso) entre los procesos principal y de renderizado.
 */

import { app, BrowserWindow, ipcMain, Notification } from 'electron';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PosPrinter } from './printer';

// Configuración para usar require en un módulo ES
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuración de la base de datos SQLite
const knex = require('knex')({
  client: 'better-sqlite3',
  connection: {
    filename: path.join(__dirname, 'store.sqlite')
  },
  useNullAsDefault: true
});

// Inicializar módulo de impresión
const posPrinter = new PosPrinter();

// Configuración de rutas y variables de entorno
process.env.APP_ROOT = path.join(__dirname, '..');
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let mainWindow;

/**
 * Crea la ventana principal de la aplicación.
 */
const createWindow = () => {
  mainWindow = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#09090B',
      symbolColor: '#FAFAFA',
      height: 32
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs')
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }

  // mainWindow.webContents.getPrintersAsync().then(data => {
  //   // data will be an array of printer objects}
  //   console.log(data);
  // });
};

/**
 * Configura el esquema de la base de datos SQLite.
 * Crea tablas para productos, ventas, artículos de venta, inventario, configuraciones y categorías si no existen.
 * @returns {Promise} Una promesa que se resuelve cuando la configuración de la base de datos está completa.
 */
const createProductsTable = async () => {
  return knex.schema.hasTable('products').then(exists => {
    if (!exists) {
      return knex.schema
        .createTable('products', table => {
          table.uuid('id').primary().defaultTo(knex.fn.uuid());
          table.string('barcode').unique().notNullable();
          table.string('name').notNullable();
          table.decimal('price', 10, 2).notNullable();
          table.string('unit_of_measurement').notNullable();
          table.timestamps(true, true);
        })
        .then(() => {
          console.log('Products table created successfully.');
        });
    }
  });
};

const createSalesTable = async () => {
  return knex.schema.hasTable('sales').then(exists => {
    if (!exists) {
      return knex.schema
        .createTable('sales', table => {
          table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
          table.decimal('total', 10, 2).notNullable();
          table.timestamps(true, true);
        })
        .then(() => {
          console.log('Sales table created successfully.');
        });
    }
  });
};

const createSaleItemsTable = async () => {
  return knex.schema.hasTable('sale_items').then(exists => {
    if (!exists) {
      return knex.schema
        .createTable('sale_items', table => {
          table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
          table.uuid('sale_id').references('id').inTable('sales').onDelete('CASCADE');
          table.uuid('product_id').references('id').inTable('products').onDelete('RESTRICT');
          table.integer('quantity').notNullable();
          table.decimal('price', 10, 2).notNullable();
          table.timestamps(true, true);
        })
        .then(() => {
          console.log('Sale_items table created successfully.');
        });
    }
  });
};

const createInventoryTable = async () => {
  return knex.schema.hasTable('inventory').then(exists => {
    if (!exists) {
      return knex.schema
        .createTable('inventory', table => {
          table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
          table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
          table.integer('quantity').notNullable();
          table.timestamps(true, true);
        })
        .then(() => {
          console.log('Inventory table created successfully.');
        });
    }
  });
};

const createSettingsTable = async () => {
  return knex.schema.hasTable('settings').then(exists => {
    if (!exists) {
      return knex.schema
        .createTable('settings', table => {
          table.string('key').primary();
          table.text('value');
          table.timestamps(true, true);
        })
        .then(() => {
          console.log('Settings table created successfully.');
        });
    }
  });
};

const createCategoriesTable = async () => {
  return knex.schema.hasTable('categories').then(exists => {
    if (!exists) {
      return knex.schema
        .createTable('categories', table => {
          table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
          table.string('name').notNullable();
          table.timestamps(true, true);
        })
        .then(() => {
          console.log('Categories table created successfully.');
        });
    }
  });
};

const defaultSettings = {
  // Información de la tienda
  storeName: 'Mi Tienda',
  storeSlogan: 'La mejor calidad al mejor precio',
  address: 'Calle Principal 123, Ciudad, País',
  phone: '123-456-7890',
  email: 'contacto@mitienda.com',
  website: 'www.mitienda.com',

  // Configuraciones fiscales y monetarias
  taxRate: 0.1,
  currency: 'USD',
  currencySymbol: '$',
  decimalSeparator: '.',
  thousandsSeparator: ',',

  // Configuraciones de la aplicación
  language: 'es',
  theme: 'light',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm:ss',

  // Configuraciones de impresión
  printerName: 'Impresora POS',
  receiptWidth: 40, // Ancho del recibo en caracteres
  receiptHeader: '*** MI TIENDA ***\n',
  receiptFooter: '\n¡Gracias por su compra!\nVuelva pronto',

  // Configuraciones de inventario
  lowStockThreshold: 10,
  enableStockAlerts: true,

  // Configuraciones de ventas
  allowReturnWithoutReceipt: false,
  returnPeriod: 30, // Días

  // Configuraciones de seguridad
  requirePasswordForRefunds: true,
  sessionTimeout: 15, // Minutos

  // Configuraciones de fidelización de clientes
  enableLoyaltyProgram: true,
  pointsPerDollar: 1,

  // Configuraciones de descuentos
  enableBulkDiscounts: true,
  seniorDiscountPercent: 10,

  // Configuraciones de backups
  enableAutomaticBackups: true,
  backupFrequency: 'daily', // 'daily', 'weekly', 'monthly'

  // Configuraciones de reportes
  defaultReportPeriod: 'monthly', // 'daily', 'weekly', 'monthly', 'yearly'

  // Configuraciones de notificaciones
  enableEmailNotifications: false,
  notificationEmail: 'admin@mitienda.com',

  // Configuraciones de integración
  enableOnlineSync: false,
  apiKey: '',

  // Configuraciones de empleados
  trackEmployeeHours: true,

  // Configuraciones de métodos de pago
  acceptCreditCards: true,
  acceptCash: true,
  acceptChecks: false,
  acceptMobilePayments: false
};

const setupSettings = async () => {
  try {
    const existingSettings = await knex('settings').select();

    if (existingSettings.length === 0) {
      // If no settings exist, we insert the default ones
      const settingsToInsert = Object.entries(defaultSettings).map(([key, value]) => ({
        key,
        value: JSON.stringify(value)
      }));

      await knex('settings').insert(settingsToInsert);
      console.log('Default settings initialized successfully.');
    } else {
      console.log('Settings already exist in the database.');
    }
  } catch (error) {
    console.error('Error initializing settings:', error);
    throw new Error(
      'Failed to set up application settings. Please check the database connection and try again.'
    );
  }
};

const setupDatabase = async () => {
  return createProductsTable()
    .then(createSalesTable)
    .then(createSaleItemsTable)
    .then(createInventoryTable)
    .then(createSettingsTable)
    .then(createCategoriesTable)
    .then(() => {
      console.log('Database initialized successfully.');
    })
    .catch(error => {
      console.error('Error initializing database:', error);
      throw error;
    });
};

/**
 * Recupera todos los productos de la base de datos.
 * @returns {Promise<Array>} Una promesa que se resuelve con un array de todos los productos.
 */
const getAllProducts = async () => {
  try {
    const products = await knex('products').select();
    return products;
  } catch (error) {
    console.error('Error getting all products:', error);
    throw new Error('Internal server error');
  }
};

/**
 * Recupera un producto por su ID.
 * @param {string} id - El UUID del producto.
 * @returns {Promise<Object>} Una promesa que se resuelve con el objeto del producto o un mensaje de no encontrado.
 */
const getProductById = async id => {
  try {
    const product = await knex('products').where({ id }).first();
    return product || { message: 'Product not found' };
  } catch (error) {
    console.error('Error getting product by ID:', error);
    throw new Error('Internal server error');
  }
};

/**
 * Recupera un producto por su código de barras.
 * @param {string} barcode - El código de barras del producto.
 * @returns {Promise<Object>} Una promesa que se resuelve con el objeto del producto o un mensaje de no encontrado.
 */
const getProductByBarcode = async barcode => {
  try {
    const product = await knex('products').where({ barcode }).first();
    return product || { message: 'Product not found' };
  } catch (error) {
    console.error('Error getting product by barcode:', error);
    throw new Error('Internal server error');
  }
};

/**
 * Crea un nuevo producto en la base de datos.
 * @param {Object} productData - Los datos para el nuevo producto.
 * @returns {Promise<Object>} Una promesa que se resuelve con el producto creado y un mensaje de éxito.
 */
const createProduct = async productData => {
  try {
    const [newProduct] = await knex('products').insert(productData).returning('*');
    return { message: 'Product added successfully', product: newProduct };
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Internal server error');
  }
};

/**
 * Actualiza un producto existente en la base de datos.
 * @param {string} id - El UUID del producto a actualizar.
 * @param {Object} productData - Los datos actualizados para el producto.
 * @returns {Promise<Object>} Una promesa que se resuelve con un mensaje de éxito o de no encontrado.
 */
const updateProduct = async (id, productData) => {
  try {
    const updatedRows = await knex('products').where({ id }).update(productData);
    return updatedRows > 0
      ? { message: 'Product updated successfully' }
      : { message: 'Product not found' };
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Internal server error');
  }
};

/**
 * Elimina un producto de la base de datos.
 * @param {string} id - El UUID del producto a eliminar.
 * @returns {Promise<Object>} Una promesa que se resuelve con un mensaje de éxito o de no encontrado.
 */
const deleteProduct = async id => {
  try {
    const deletedRows = await knex('products').where({ id }).del();
    return deletedRows > 0
      ? { message: 'Product deleted successfully' }
      : { message: 'Product not found' };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Internal server error');
  }
};

/**
 * Crea una nueva transacción de venta.
 * @param {Object} saleData - Los datos para la nueva venta, incluyendo los artículos vendidos.
 * @returns {Promise<Object>} Una promesa que se resuelve con el objeto de venta creado.
 */
const createSale = async saleData => {
  let createdSale;
  try {
    await knex.transaction(async trx => {
      [createdSale] = await trx('sales')
        .insert({
          total: saleData.total
        })
        .returning('*');

      const saleItems = saleData.items.map(item => ({
        sale_id: createdSale.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price
      }));
      await trx('sale_items').insert(saleItems);

      const inventoryUpdates = saleData.items.map(item =>
        trx('inventory').where({ product_id: item.productId }).decrement('quantity', item.quantity)
      );
      await Promise.all(inventoryUpdates);
    });
    return createdSale;
  } catch (error) {
    console.error('Error creating sale:', error);
    throw new Error('Internal server error');
  }
};

/**
 * Recupera todas las ventas de la base de datos.
 * @returns {Promise<Array>} Una promesa que se resuelve con un array de todas las ventas.
 */
const getAllSales = async () => {
  try {
    return await knex('sales').select();
  } catch (error) {
    console.error('Error getting all sales:', error);
    throw new Error('Internal server error');
  }
};

/**
 * Recupera una venta específica por su ID.
 * @param {string} id - El UUID de la venta.
 * @returns {Promise<Object>} Una promesa que se resuelve con el objeto de la venta.
 */
const getSaleById = async id => {
  try {
    return await knex('sales').where({ id }).first();
  } catch (error) {
    console.error('Error getting sale by ID:', error);
    throw new Error('Internal server error');
  }
};

/**
 * Actualiza la cantidad de inventario para un producto específico.
 * @param {string} productId - El UUID del producto.
 * @param {number} quantity - La nueva cantidad.
 * @returns {Promise<Object>} Una promesa que se resuelve con el objeto de inventario actualizado.
 */
const updateInventory = async (productId, quantity) => {
  try {
    const [inventory] = await knex('inventory')
      .where({ product_id: productId })
      .update({ quantity })
      .returning('*');
    return inventory;
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw new Error('Internal server error');
  }
};

/**
 * Recupera el inventario actual para un producto específico.
 * @param {string} productId - El UUID del producto.
 * @returns {Promise<Object>} Una promesa que se resuelve con el objeto de inventario.
 */
const getInventory = async productId => {
  try {
    return await knex('inventory').where({ product_id: productId }).first();
  } catch (error) {
    console.error('Error getting inventory:', error);
    throw new Error('Internal server error');
  }
};

/**
 * Genera un informe de ventas para un rango de fechas dado.
 * @param {Date} startDate - La fecha de inicio del período del informe.
 * @param {Date} endDate - La fecha de fin del período del informe.
 * @returns {Promise<Object>} Una promesa que se resuelve con los datos del informe de ventas.
 */
const generateSalesReport = async (startDate, endDate) => {
  try {
    return await knex('sales')
      .whereBetween('created_at', [startDate, endDate])
      .sum('total as totalSales')
      .count('id as numberOfSales');
  } catch (error) {
    console.error('Error generating sales report:', error);
    throw new Error('Internal server error');
  }
};

/**
 * Genera un informe del inventario actual.
 * @returns {Promise<Array>} Una promesa que se resuelve con los datos del informe de inventario.
 */
const generateInventoryReport = async () => {
  try {
    return await knex('inventory')
      .join('products', 'inventory.product_id', 'products.id')
      .select('products.name', 'inventory.quantity');
  } catch (error) {
    console.error('Error generating inventory report:', error);
    throw new Error('Internal server error');
  }
};

/**
 * Recupera todas las configuraciones de la aplicación.
 * @returns {Promise<Array>} Una promesa que se resuelve con un array de todas las configuraciones.
 */
const getSettings = async () => {
  try {
    return await knex('settings').select();
  } catch (error) {
    console.error('Error getting settings:', error);
    throw new Error('Internal server error');
  }
};

/**
 * Actualiza las configuraciones de la aplicación.
 * @param {Object} settingsData - Un objeto que contiene las configuraciones a actualizar.
 * @returns {Promise<Object>} Una promesa que se resuelve con un mensaje de éxito.
 */
const updateSettings = async settingsData => {
  try {
    const updates = Object.entries(settingsData).map(([key, value]) =>
      knex('settings')
        .insert({ key, value: JSON.stringify(value) })
        .onConflict('key')
        .merge()
    );
    await Promise.all(updates);
    return { message: 'Settings updated successfully' };
  } catch (error) {
    console.error('Error updating settings:', error);
    throw new Error('Internal server error');
  }
};

/**
 * Recupera todas las categorías de productos.
 * @returns {Promise<Array>} Una promesa que se resuelve con un array de todas las categorías.
 */
const getAllCategories = async () => {
  try {
    return await knex('categories').select();
  } catch (error) {
    console.error('Error getting all categories:', error);
    throw new Error('Internal server error');
  }
};

/**
 * Crea una nueva categoría de producto.
 * @param {Object} categoryData - Los datos para la nueva categoría.
 * @returns {Promise<Object>} Una promesa que se resuelve con el objeto de la categoría creada.
 */
const createCategory = async categoryData => {
  try {
    const [category] = await knex('categories').insert(categoryData).returning('*');
    return category;
  } catch (error) {
    console.error('Error creating category:', error);
    throw new Error('Internal server error');
  }
};

/**
 * Actualiza una categoría de producto existente.
 * @param {string} id - El UUID de la categoría a actualizar.
 * @param {Object} categoryData - Los datos actualizados para la categoría.
 * @returns {Promise<Object>} Una promesa que se resuelve con el objeto de la categoría actualizada.
 */
const updateCategory = async (id, categoryData) => {
  try {
    const [category] = await knex('categories').where({ id }).update(categoryData).returning('*');
    return category;
  } catch (error) {
    console.error('Error updating category:', error);
    throw new Error('Internal server error');
  }
};

/**
 * Elimina una categoría de producto.
 * @param {string} id - El UUID de la categoría a eliminar.
 * @returns {Promise<Object>} Una promesa que se resuelve con un mensaje de éxito.
 */
const deleteCategory = async id => {
  try {
    await knex('categories').where({ id }).del();
    return { message: 'Category deleted successfully' };
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error('Internal server error');
  }
};

// Manejadores de Productos

/**
 * Recupera todos los productos de la base de datos.
 * Canal: 'products:getAll'
 * @returns {Promise<Array>} Una promesa que se resuelve con un array de todos los productos.
 */
ipcMain.handle('products:getAll', () => getAllProducts());

/**
 * Recupera un producto por su ID.
 * Canal: 'products:getById'
 * @param {Object} event - El objeto del evento IPC.
 * @param {Object} payload - El objeto de carga.
 * @param {string} payload.id - El UUID del producto.
 * @returns {Promise<Object>} Una promesa que se resuelve con el objeto del producto o un mensaje de no encontrado.
 */
ipcMain.handle('products:getById', (event, { id }) => getProductById(id));

/**
 * Recupera un producto por su código de barras.
 * Canal: 'products:getByBarcode'
 * @param {Object} event - El objeto del evento IPC.
 * @param {Object} payload - El objeto de carga.
 * @param {string} payload.barcode - El código de barras del producto.
 * @returns {Promise<Object>} Una promesa que se resuelve con el objeto del producto o un mensaje de no encontrado.
 */
ipcMain.handle('products:getByBarcode', (event, { barcode }) => getProductByBarcode(barcode));

/**
 * Crea un nuevo producto en la base de datos.
 * Canal: 'products:create'
 * @param {Object} event - El objeto del evento IPC.
 * @param {Object} productData - Los datos para el nuevo producto.
 * @returns {Promise<Object>} Una promesa que se resuelve con el producto creado y un mensaje de éxito.
 */
ipcMain.handle('products:create', (event, productData) => createProduct(productData));

/**
 * Actualiza un producto existente en la base de datos.
 * Canal: 'products:update'
 * @param {Object} event - El objeto del evento IPC.
 * @param {Object} payload - El objeto de carga.
 * @param {string} payload.id - El UUID del producto a actualizar.
 * @param {Object} payload.productData - Los datos actualizados para el producto.
 * @returns {Promise<Object>} Una promesa que se resuelve con un mensaje de éxito o de no encontrado.
 */
ipcMain.handle('products:update', (event, { id, productData }) => updateProduct(id, productData));

/**
 * Elimina un producto de la base de datos.
 * Canal: 'products:delete'
 * @param {Object} event - El objeto del evento IPC.
 * @param {Object} payload - El objeto de carga.
 * @param {string} payload.id - El UUID del producto a eliminar.
 * @returns {Promise<Object>} Una promesa que se resuelve con un mensaje de éxito o de no encontrado.
 */
ipcMain.handle('products:delete', (event, { id }) => deleteProduct(id));

// Manejadores de Ventas

/**
 * Crea una nueva transacción de venta.
 * Canal: 'sales:create'
 * @param {Object} event - El objeto del evento IPC.
 * @param {Object} saleData - Los datos para la nueva venta, incluyendo los artículos vendidos.
 * @returns {Promise<Object>} Una promesa que se resuelve con el objeto de venta creado.
 */
ipcMain.handle('sales:create', (event, saleData) => createSale(saleData));

/**
 * Recupera todas las ventas de la base de datos.
 * Canal: 'sales:getAll'
 * @returns {Promise<Array>} Una promesa que se resuelve con un array de todas las ventas.
 */
ipcMain.handle('sales:getAll', () => getAllSales());

/**
 * Recupera una venta específica por su ID.
 * Canal: 'sales:getById'
 * @param {Object} event - El objeto del evento IPC.
 * @param {Object} payload - El objeto de carga.
 * @param {string} payload.id - El UUID de la venta.
 * @returns {Promise<Object>} Una promesa que se resuelve con el objeto de la venta.
 */
ipcMain.handle('sales:getById', (event, { id }) => getSaleById(id));

// Manejadores de Inventario

/**
 * Actualiza la cantidad de inventario para un producto específico.
 * Canal: 'inventory:update'
 * @param {Object} event - El objeto del evento IPC.
 * @param {Object} payload - El objeto de carga.
 * @param {string} payload.productId - El UUID del producto.
 * @param {number} payload.quantity - La nueva cantidad.
 * @returns {Promise<Object>} Una promesa que se resuelve con el objeto de inventario actualizado.
 */
ipcMain.handle('inventory:update', (event, { productId, quantity }) =>
  updateInventory(productId, quantity)
);

/**
 * Recupera el inventario actual para un producto específico.
 * Canal: 'inventory:get'
 * @param {Object} event - El objeto del evento IPC.
 * @param {Object} payload - El objeto de carga.
 * @param {string} payload.productId - El UUID del producto.
 * @returns {Promise<Object>} Una promesa que se resuelve con el objeto de inventario.
 */
ipcMain.handle('inventory:get', (event, { productId }) => getInventory(productId));

// Manejadores de Informes

/**
 * Genera un informe de ventas para un rango de fechas dado.
 * Canal: 'reports:sales'
 * @param {Object} event - El objeto del evento IPC.
 * @param {Object} payload - El objeto de carga.
 * @param {Date} payload.startDate - La fecha de inicio del período del informe.
 * @param {Date} payload.endDate - La fecha de fin del período del informe.
 * @returns {Promise<Object>} Una promesa que se resuelve con los datos del informe de ventas.
 */
ipcMain.handle('reports:sales', (event, { startDate, endDate }) =>
  generateSalesReport(startDate, endDate)
);

/**
 * Genera un informe del inventario actual.
 * Canal: 'reports:inventory'
 * @returns {Promise<Array>} Una promesa que se resuelve con los datos del informe de inventario.
 */
ipcMain.handle('reports:inventory', () => generateInventoryReport());

// Manejadores de Configuraciones

/**
 * Recupera todas las configuraciones de la aplicación.
 * Canal: 'settings:get'
 * @returns {Promise<Array>} Una promesa que se resuelve con un array de todas las configuraciones.
 */
ipcMain.handle('settings:get', () => getSettings());

/**
 * Actualiza las configuraciones de la aplicación.
 * Canal: 'settings:update'
 * @param {Object} event - El objeto del evento IPC.
 * @param {Object} settingsData - Un objeto que contiene las configuraciones a actualizar.
 * @returns {Promise<Object>} Una promesa que se resuelve con un mensaje de éxito.
 */
ipcMain.handle('settings:update', (event, settingsData) => updateSettings(settingsData));

// Manejadores de Categorías

/**
 * Recupera todas las categorías de productos.
 * Canal: 'categories:getAll'
 * @returns {Promise<Array>} Una promesa que se resuelve con un array de todas las categorías.
 */
ipcMain.handle('categories:getAll', () => getAllCategories());

/**
 * Crea una nueva categoría de producto.
 * Canal: 'categories:create'
 * @param {Object} event - El objeto del evento IPC.
 * @param {Object} categoryData - Los datos para la nueva categoría.
 * @returns {Promise<Object>} Una promesa que se resuelve con el objeto de la categoría creada.
 */
ipcMain.handle('categories:create', (event, categoryData) => createCategory(categoryData));

/**
 * Actualiza una categoría de producto existente.
 * Canal: 'categories:update'
 * @param {Object} event - El objeto del evento IPC.
 * @param {Object} payload - El objeto de carga.
 * @param {string} payload.id - El UUID de la categoría a actualizar.
 * @param {Object} payload.categoryData - Los datos actualizados para la categoría.
 * @returns {Promise<Object>} Una promesa que se resuelve con el objeto de la categoría actualizada.
 */
ipcMain.handle('categories:update', (event, { id, categoryData }) =>
  updateCategory(id, categoryData)
);

/**
 * Elimina una categoría de producto.
 * Canal: 'categories:delete'
 * @param {Object} event - El objeto del evento IPC.
 * @param {Object} payload - El objeto de carga.
 * @param {string} payload.id - El UUID de la categoría a eliminar.
 * @returns {Promise<Object>} Una promesa que se resuelve con un mensaje de éxito.
 */
ipcMain.handle('categories:delete', (event, { id }) => deleteCategory(id));

// Manejador de Impresión

/**
 * Maneja las solicitudes de impresión del proceso de renderizado.
 * Canal: 'print'
 * @param {Object} event - El objeto del evento IPC.
 * @param {Object} data - Los datos a imprimir.
 * @param {Object} options - Opciones de impresión.
 * @returns {Promise<Object>} Una promesa que se resuelve con el resultado de la impresión.
 */
ipcMain.handle('print', async (event, data, options) => {
  try {
    await posPrinter.print(data, options);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Manejador de eventos para cuando todas las ventanas están cerradas.
 * Cierra la aplicación en todas las plataformas excepto macOS.
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    mainWindow = null;
  }
});

/**
 * Manejador de eventos para la activación de la aplicación.
 * Crea una nueva ventana si no hay ventanas abiertas (comportamiento típico en macOS).
 */
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const NOTIFICATION_TITLE = 'Basic Notification';
const NOTIFICATION_BODY = 'Notification from the Main process';

function showNotification() {
  new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show();
}

/**
 * Inicializa la aplicación.
 * Configura la base de datos y crea la ventana principal cuando la aplicación está lista.
 */
app
  .whenReady()
  .then(() => {
    setupDatabase();
  })
  .then(() => {
    createWindow();
  })
  .then(() => {
    showNotification();
  });
