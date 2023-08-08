//Socket instance 
const socketClient = io();

//The event is configured to show the message when the connection is established.
socketClient.on('connect', () => {
  console.log('Conectado al servidor de WebSocket');
});

//Event that receives the data from the server to then create a new product with the information entered and display it in the list.
socketClient.on('addProduct', (newProduct) => {
  const productList = document.getElementById('productList');
  const newItem = document.createElement('li');
  newItem.textContent = `${newProduct.title} - ${newProduct.price} - ${newProduct.description}`;
  productList.appendChild(newItem);
});

//Event to listen when the user submits the form and then create the new product.
document.getElementById('addProductForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const newProduct = {};
  formData.forEach((value, key) => {
    newProduct[key] = value;
  });
  socketClient.emit('addProduct', newProduct);
  form.reset();
});

//Event to listen when the user submits a form with the ID of the product to be removed.
document.getElementById('deleteProductForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const productId = formData.get('productId');
  socketClient.emit('deleteProduct', productId); 
  form.reset();
});

//Event that allows the client to identify and receive the ID of the product that has been removed x form, to remove it from the list.
socketClient.on('productDeleted', (productId) => {
  const productList = document.getElementById('productList');
  const productItem = productList.querySelector(`li[data-product-id="${productId}"]`);
  if (productItem) {
    productList.removeChild(productItem);
  }
});