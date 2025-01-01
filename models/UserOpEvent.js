const mongoose = require('mongoose');

const UserOpEventSchema = new mongoose.Schema({
  blockNumber: { type: Number, index: true },
  transactionHash: { type: String, index: true },
  userOpHash: { type: String, unique: true, index: true },
  sender: { type: String, index: true },
  paymaster: { type: String, index: true },
  nonce: { type: String },
  success: { type: Boolean },
  actualGasCost: { type: String },
  actualGasUsed: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('UserOpEvent', UserOpEventSchema);
