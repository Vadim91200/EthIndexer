const express = require('express');
const router = express.Router();
const UserOpEvent = require('../models/UserOpEvent');

/**
 * GET /events?sender=0x...&paymaster=0x...&success=true...
 * Filtering userOpEvents
 */
router.get('/events', async (req, res) => {
  try {
    const { sender, paymaster, userOpHash, success, fromBlock, toBlock } = req.query;
    const filter = {};

    if (sender) filter.sender = sender.toLowerCase();
    if (paymaster) filter.paymaster = paymaster.toLowerCase();
    if (userOpHash) filter.userOpHash = userOpHash.toLowerCase();
    if (typeof success !== 'undefined') filter.success = (success === 'true');
    if (fromBlock) filter.blockNumber = { $gte: Number(fromBlock) };
    if (toBlock) {
      filter.blockNumber = {
        ...(filter.blockNumber || {}),
        $lte: Number(toBlock)
      };
    }

    const events = await UserOpEvent.find(filter).sort({ blockNumber: -1 }).limit(100);
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
