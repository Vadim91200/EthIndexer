// services/indexer.js
require('dotenv').config();
const { ethers } = require('ethers');
const provider = require('../provider');
const entryPointAbi = [
  "event UserOperationEvent(bytes32 userOpHash,address indexed sender,address indexed paymaster,uint256 nonce,bool success,uint256 actualGasCost,uint256 actualGasUsed)"
];
const UserOpEventModel = require('../models/UserOpEvent');

const contract = new ethers.Contract(process.env.ENTRY_POINT_ADDRESS, entryPointAbi, provider);

async function syncHistoricalEvents() {
  try {
    const startBlock = Number(process.env.START_BLOCK) || 0;
    const currentBlock = await provider.getBlockNumber();
    
    console.log(`Indexing events from ${startBlock} to ${currentBlock}...`);
    
    const filter = contract.filters.UserOperationEvent();
    const events = await contract.queryFilter(filter, startBlock, currentBlock);
    
    for (const event of events) {
      await handleEvent(event);
    }
    console.log('Historical events successfully indexed!');
  } catch (err) {
    console.error('Error while fetching historical events:', err);
  }
}

// Function to process an event and insert it into the database
async function handleEvent(event) {
  // The event arguments (in order)
  const { userOpHash, sender, paymaster, nonce, success, actualGasCost, actualGasUsed } = event.args;

  // Construct the object to save
  const eventToSave = {
    blockNumber: event.blockNumber,
    transactionHash: event.transactionHash,
    userOpHash: userOpHash,
    sender: sender,
    paymaster: paymaster,
    nonce: nonce.toString(),           // watch out for bigNumber type
    success: success,
    actualGasCost: actualGasCost.toString(),
    actualGasUsed: actualGasUsed.toString()
  };
  
  // Upsert (insert or update) to avoid duplicates if it's already in the database
  await UserOpEventModel.updateOne(
    { userOpHash: eventToSave.userOpHash },
    { $set: eventToSave },
    { upsert: true }
  );
}

// Real-time listening
function listenToNewEvents() {
  contract.on('UserOperationEvent', async (
    userOpHash,
    sender,
    paymaster,
    nonce,
    success,
    actualGasCost,
    actualGasUsed,
    event
  ) => {
    try {
      console.log('[New Event] block', event.blockNumber, ' tx:', event.transactionHash);
      await handleEvent(event);
    } catch (err) {
      console.error('Error during real-time handleEvent:', err);
    }
  });
}

module.exports = {
  syncHistoricalEvents,
  listenToNewEvents
};
