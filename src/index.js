import React from 'react';
import ReactDOM from 'react-dom/client';
import { useReducer } from 'react';

// Define the initial state of the cart
const initialCartState = {
  items : [],
  total : 0
} 

// Define the Reducer function to update state of cart
function cartReducer (state, action) {
  switch(action.type) {
    case 'ADD_ITEM':
      //  Check if the item already exists in cart
    const exisitingItemindex = state.items.findIndex(item => item.id === item.payload.id);
    if (exisitingItemindex !== -1) {
      // if item already exists, we just add the quantity
      const updatedItems = [...state.items];
      updatedItems[exisitingItemindex].quantity += 1;
      return {
        ...state,
        items : updatedItems,
        total : state.total + action.payload.price
      };
    } else {
      // if item does not exist, we add it to the cart
      const newItems = [
        ...state.items,
        {
          id: action.payload.id,
          name: action.payload.name,
          price: action.payload.price,
          quantity: 1
        },
      ];
      return {
        ...state,
        items : newItems,
        total: state.total + action.payload.price
      }
    }
  default:
    return state;
  }
}

// Define a Product Component that is responsible to display name and price
function Product(props) {
  const [isLoading, setLoading] = React.useState(false);
  const [cartState, dispatch] = useReducer(cartReducer, initialCartState);

  async function addToCart() {
    setLoading(true);
    try {
      // Make an API call to add product to the cart
      const response = await fetch(`/api/cart/add`,{
        method: 'POST',
        body: JSON.stringify({product: props.id}),
        headers: {'Content-Type': 'application/json'},
      });
      if(response.ok) {
        console.log(`Added ${props.name} to the cart!`);
        // Update the cart state with added item
        dispatch({type: 'ADD_ITEM', payload : {id: props.id, name: props.name, price: props.price}});
      } else {
        console.error(`Failed to add ${props.name} to cart: ${response.status} ${response.statusText}`);
      }
    } catch(error) {
      console.error(`Failed to add ${props.name} to cart: $[error]`);
    }
    setLoading(false);
  }
  
  return(
    <div>
      <h3>{props.name}</h3>
      <p>Price: {props.price}</p>
      <button onClick={addToCart} disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add to Cart'}
      </button>
      <p>Total items in cart: {cartState.items.reduce((total, item) => total + item.quantity, 0)}</p>
      <p>Total cart value: ${cartState.total.toFixed(2)}</p>
    </div>
  );
}

// Render the Product Component with cart functionality
function App (){
  return (
    <div>
      <Product id="1" name="T-shirt" price="$19.99" />
      <Product id="2" name="Sweater" price="$29.99" />
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);