/************************************************
 * index.js
 ***********************************************/
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { ethers } = require('ethers');

// ------------- 1. MONGODB CONNECTION -------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

// ------------- 2. ETHERS PROVIDER CREATION -------------
const provider = new ethers.JsonRpcProvider(process.env.ETH_NETWORK_URL);
console.log('Provider created for network URL:', process.env.ETH_NETWORK_URL);

// Optional: you can export this provider if needed elsewhere
// module.exports = provider;

// ------------- 3. REST API SETUP (EXPRESS) -------------
const app = express();
app.use(express.json());

// Example route: GET /ping
app.get('/ping', (req, res) => {
  res.send({ message: 'pong' });
});

// (Optional) Import your indexer or routes here
// const userOpEventsRoutes = require('./routes/userOpEvents');
// const { syncHistoricalEvents, listenToNewEvents } = require('./services/indexer');
// app.use('/api', userOpEventsRoutes);

// (Optional) Initialize your indexer
// (async function initIndexer() {
//   await syncHistoricalEvents();  // Historical event fetch
//   listenToNewEvents();           // Real-time listening
// })();

// ------------- LAUNCH THE SERVER -------------
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
