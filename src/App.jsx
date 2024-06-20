

/*


//https://www.npmjs.com/package/escpos -> para conectar con la impresora de tickets (mas adelante)
//https://tanstack.com/table/v8 -> para tablas en listados

- actualizar al enrutador hash router de react router dom
- lista de productos -> filtros añadir editar eliminar productos
- punto de venta -> añadis producto, escaneas, producto, lo buscas, imprimis el tickeet de lo que compro, imprimir comanda (lo que tiene que hacer el camarero)
- coneccion web a mercado pago que diga en voz alta cuando llegó el pago del producto (inicia sesion con la cuenta de quien recibe el dinero)
- ver que el codigo de barras lo tome en cualquier parte de la aplicacion ( si lo paso en lista de prod, busca el producto - y si lo hace en punto venta, añade el producto al ticket)

- ver detalles

*/

import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, Route, BrowserRouter as Router, Routes, useNavigate } from 'react-router-dom';

const ProductForm = () => {
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unitOfMeasurement, setUnitOfMeasurement] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('https://p102sdst-3000.brs.devtunnels.ms/products', {
        barcode,
        name,
        price,
        unit_of_measurement: unitOfMeasurement
      });
      navigate('/');
    } catch (error) {
      console.error('Error al agregar el producto:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Código de Barras:</label>
        <input type="text" value={barcode} onChange={e => setBarcode(e.target.value)} required />
      </div>
      <div>
        <label>Nombre:</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label>Precio:</label>
        <input type="number" value={price} onChange={e => setPrice(e.target.value)} required />
      </div>
      <div>
        <label>Unidad de Medida:</label>
        <input
          type="text"
          value={unitOfMeasurement}
          onChange={e => setUnitOfMeasurement(e.target.value)}
          required
        />
      </div>
      <button type="submit">Guardar Producto</button>
    </form>
  );
};

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('https://p102sdst-3000.brs.devtunnels.ms/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error al obtener los productos:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async id => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://p102sdst-3000.brs.devtunnels.ms/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
    }
  };

  return (
    <div>
      <h1>Lista de Productos</h1>
      <Link to="/new-product">Agregar Producto</Link>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            {product.name} - ${product.price} - {product.unit_of_measurement}
            <button onClick={() => handleDelete(product.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const POS = () => {
  const [barcode, setBarcode] = useState('');
  const [cart, setCart] = useState([]);
  const [error, setError] = useState(null);
  const [manualProductName, setManualProductName] = useState('');
  const [manualProductPrice, setManualProductPrice] = useState('');

  const handleAddToCart = async () => {
    try {
      const response = await axios.get(`https://p102sdst-3000.brs.devtunnels.ms/barcode/${barcode}`);
      const product = response.data;
      setCart(prevCart => [...prevCart, product]);
      setBarcode('');
      setError(null);
    } catch (error) {
      console.error('Error al agregar el producto al carrito:', error);
      setError('No se pudo agregar el producto. Verifica el código de barras.');
    }
  };

  const handleAddManualProduct = () => {
    if (!manualProductName || !manualProductPrice) {
      setError('Por favor, ingresa el nombre y precio del producto.');
      return;
    }
    const product = {
      name: manualProductName,
      price: parseFloat(manualProductPrice)
    };
    setCart(prevCart => [...prevCart, product]);
    setManualProductName('');
    setManualProductPrice('');
    setError(null);
  };

  const handleRemoveFromCart = index => {
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
  };

  const handlePrintTicket = () => {
    console.log('Imprimiendo ticket:', cart);
  };

  const calculateTotal = () => {
    return cart.reduce((total, product) => total + product.price, 0).toFixed(2);
  };

  return (
    <div>
      <h1>Punto de Venta</h1>
      <input
        type="text"
        placeholder="Escanea el código de barras"
        value={barcode}
        onChange={e => setBarcode(e.target.value)}
      />
      <button onClick={handleAddToCart}>Agregar al Carrito</button>
      <h2>Agregar Producto Manualmente</h2>
      <input
        type="text"
        placeholder="Nombre del producto"
        value={manualProductName}
        onChange={e => setManualProductName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Precio del producto"
        value={manualProductPrice}
        onChange={e => setManualProductPrice(e.target.value)}
      />
      <button onClick={handleAddManualProduct}>Agregar Producto</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {cart.map((item, index) => (
          <li key={index}>
            {item.name} - ${item.price.toFixed(2)}
            <button onClick={() => handleRemoveFromCart(index)}>Eliminar</button>
          </li>
        ))}
      </ul>
      <h2>Total: ${calculateTotal()}</h2>
      <button onClick={handlePrintTicket}>Imprimir Ticket</button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Lista de productos</Link>
            </li>
            <li>
              <Link to="/pos">Punto de Venta</Link>
            </li>
          </ul>
        </nav>
      </div>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/new-product" element={<ProductForm />} />
        <Route path="/pos" element={<POS />} />
      </Routes>
    </Router>
  );
}

export default App;


