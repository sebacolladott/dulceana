import { useState } from 'react';
import { Input } from '../components/Input';

const sampleProducts = [
  { id: 1, name: 'Coffee', price: 3.5, image: 'https://via.placeholder.com/150?text=Coffee' },
  { id: 2, name: 'Sandwich', price: 5.0, image: 'https://via.placeholder.com/150?text=Sandwich' },
  { id: 3, name: 'Salad', price: 6.5, image: 'https://via.placeholder.com/150?text=Salad' },
  { id: 4, name: 'Smoothie', price: 4.0, image: 'https://via.placeholder.com/150?text=Smoothie' },
  { id: 5, name: 'Bagel', price: 2.5, image: 'https://via.placeholder.com/150?text=Bagel' },
  { id: 6, name: 'Muffin', price: 2.0, image: 'https://via.placeholder.com/150?text=Muffin' },
  { id: 7, name: 'Croissant', price: 3.0, image: 'https://via.placeholder.com/150?text=Croissant' },
  {
    id: 8,
    name: 'Fruit Salad',
    price: 4.5,
    image: 'https://via.placeholder.com/150?text=Fruit+Salad'
  },
  {
    id: 9,
    name: 'Yogurt Parfait',
    price: 3.75,
    image: 'https://via.placeholder.com/150?text=Yogurt+Parfait'
  },
  { id: 10, name: 'Iced Tea', price: 2.75, image: 'https://via.placeholder.com/150?text=Iced+Tea' }
];

const CartItem = ({ item, removeFromCart, updateQuantity }) => (
  <div className="flex justify-between">
    <div>
      <h4>{item.name}</h4>
      <p>${item.price.toFixed(2)}</p>
    </div>
    <div>
      <input
        type="number"
        value={item.qty}
        onChange={e => updateQuantity(item.id, Number(e.target.value))}
        min="1"
      />
      <button onClick={() => removeFromCart(item.id)}>Remove</button>
    </div>
  </div>
);

export const PointOfSale = () => {
  const [cart, setCart] = useState([]);
  const [cash, setCash] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState(sampleProducts);

  const addToCart = product => {
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
      setCart(cart.map(item => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item)));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = id => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, qty) => {
    setCart(cart.map(item => (item.id === id ? { ...item, qty } : item)));
  };

  const updateCash = amount => {
    setCash(amount);
  };

  const getChange = () => {
    const total = cart.reduce((total, item) => total + item.price * item.qty, 0);
    return cash - total;
  };

  const handleOrderSubmit = () => {
    if (getChange() >= 0) {
      alert('Order submitted!');
      setCart([]);
      setCash(0);
    } else {
      alert('Insufficient cash!');
    }
  };

  return (
    <>
      <div className="flex h-full w-full flex-col py-4">
        <div className="flex flex-row px-2">
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
        </div>
        <div className="mt-4 h-full overflow-hidden">
          <div className="h-full overflow-y-auto px-2">
            <div className="grid grid-cols-4 gap-4 pb-3">
              {products
                .filter(product => product.name.toLowerCase().includes(keyword.toLowerCase()))
                .map(product => (
                  <div
                    key={product.id}
                    className="cursor-pointer select-none overflow-hidden rounded-2xl bg-white shadow transition-shadow hover:shadow-lg"
                    onClick={() => addToCart(product)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-32 w-full rounded object-cover"
                    />
                    <h3 className="mt-2 font-bold">{product.name}</h3>
                    <p className="text-gray-600">${product.price.toFixed(2)}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-1/3 flex-col bg-white p-4">
        <h2 className="mb-4 text-2xl font-bold">Cart</h2>
        <div className="flex-grow overflow-auto">
          <div className="space-y-2">
            {cart.map(item => (
              <CartItem
                key={item.id}
                item={item}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
              />
            ))}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xl font-bold">
            Total: ${cart.reduce((total, item) => total + item.price * item.qty, 0).toFixed(2)}
          </p>
          <input
            type="number"
            value={cash}
            onChange={e => updateCash(Number(e.target.value))}
            className="mt-2 w-full rounded-lg border border-gray-300 p-2"
            placeholder="Enter cash amount"
          />
          <p className="mt-2">Change: ${getChange().toFixed(2)}</p>
          <button onClick={handleOrderSubmit} className="mt-4 w-full rounded-lg p-2">
            Submit Order
          </button>
        </div>
      </div>
    </>
  );
};
