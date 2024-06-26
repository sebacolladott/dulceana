import { useState } from 'react';
import 'tailwindcss/tailwind.css';

const products = [
  { id: '1', name: 'Pan', price: 1.0 },
  { id: '2', name: 'Croissant', price: 1.5 },
  { id: '3', name: 'Tarta de Manzana', price: 2.5 },
  { id: '4', name: 'Café', price: 1.2 },
  { id: '5', name: 'Jugo de Naranja', price: 1.8 }
];

export const PointOfSale = () => {
  const [cart, setCart] = useState([]);

  const addToCart = product => {
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
      setCart(
        cart.map(item => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = productId => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCart(cart.map(item => (item.id === productId ? { ...item, quantity } : item)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleCheckout = () => {
    alert('Venta realizada con éxito');
    clearCart();
  };

  return (
    <>
      <div className="shrink-0">
        <div>Punto de venta</div>
      </div>
      <div className="flex">
        <div className="grow overflow-auto">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map(product => (
              <li
                key={product.id}
                className="flex flex-col items-center justify-between rounded-lg bg-white p-4 shadow-md"
              >
                <span className="mb-2 text-lg">{product.name}</span>
                <span className="mb-4 text-xl font-bold">${product.price}</span>
                <button
                  onClick={() => addToCart(product)}
                  className="rounded bg-green-500 px-4 py-2 text-white"
                >
                  Agregar
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-1/3 bg-gray-100 p-6">
          <h2 className="mb-4 text-2xl font-semibold">Orden actual</h2>
          <ul className="space-y-4">
            {cart.map(item => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-lg bg-white p-4 shadow-md"
              >
                <span>
                  {item.name} - ${item.price}
                </span>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={e => updateQuantity(item.id, parseInt(e.target.value, 10))}
                  className="mx-2 w-16 rounded border p-1"
                />
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="rounded bg-red-500 px-4 py-2 text-white"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-lg bg-white p-4 shadow-md">
            <h3 className="text-lg font-semibold">
              Total: ${cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
            </h3>
            <button
              onClick={handleCheckout}
              className="mt-2 w-full rounded bg-blue-500 px-4 py-2 text-white"
            >
              Finalizar Venta
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PointOfSale;
