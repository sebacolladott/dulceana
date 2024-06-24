import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key";

// Configuración de Knex con better-sqlite3
const knex = require("knex")({
  client: "better-sqlite3",
  connection: {
    filename: path.join(__dirname, "database.sqlite"),
  },
  useNullAsDefault: true,
});

async function createTables() {
  await knex.schema.hasTable("users").then(async (exists) => {
    if (!exists) {
      await knex.schema.createTable("users", (table) => {
        table
          .uuid("id")
          .primary()
          .defaultTo(knex.raw("(lower(hex(randomblob(16))))"));
        table.string("email").unique().notNullable();
        table.string("password").notNullable();
      });
    }
  });

  await knex.schema.hasTable("products").then(async (exists) => {
    if (!exists) {
      await knex.schema.createTable("products", (table) => {
        table
          .uuid("id")
          .primary()
          .defaultTo(knex.raw("(lower(hex(randomblob(16))))"));
        table.string("barcode").unique().notNullable();
        table.string("name").notNullable();
        table.integer("price").notNullable();
        table.string("unit_of_measurement").notNullable();
      });
    }
  });
}

let win;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(__dirname, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, "index.html"));
  }
}

// Rutas de IPC

ipcMain.handle("getProducts", async () => {
  try {
    const products = await knex("products").select();
    return products;
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    throw new Error("Error interno del servidor");
  }
});

ipcMain.handle("getProductById", async (event, { id }) => {
  try {
    const product = await knex("products").where({ id }).first();
    if (product) {
      return product;
    } else {
      return { message: "Producto no encontrado" };
    }
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    throw new Error("Error interno del servidor");
  }
});

ipcMain.handle("getProductByBarcode", async (event, { barcode }) => {
  try {
    const product = await knex("products").where({ barcode }).first();
    if (product) {
      return product;
    } else {
      return { message: "Producto no encontrado" };
    }
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    throw new Error("Error interno del servidor");
  }
});

ipcMain.handle("createProduct", async (event, productData) => {
  try {
    const [newProduct] = await knex("products")
      .insert(productData)
      .returning("*");
    return { message: "Producto agregado exitosamente", product: newProduct };
  } catch (error) {
    console.error("Error al agregar el producto:", error);
    throw new Error("Error interno del servidor");
  }
});

ipcMain.handle("updateProduct", async (event, { id, productData }) => {
  try {
    const updatedRows = await knex("products")
      .where({ id })
      .update(productData);
    if (updatedRows > 0) {
      return { message: "Producto actualizado exitosamente" };
    } else {
      return { message: "Producto no encontrado" };
    }
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    throw new Error("Error interno del servidor");
  }
});

ipcMain.handle("deleteProduct", async (event, { id }) => {
  try {
    const deletedRows = await knex("products").where({ id }).del();
    if (deletedRows > 0) {
      return { message: "Producto eliminado exitosamente" };
    } else {
      return { message: "Producto no encontrado" };
    }
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    throw new Error("Error interno del servidor");
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(async () => {
  await createTables();
  createWindow();
  console.log("Servidor iniciado");
});
