const Trade = require('./src/models/Trade');
const KyCSubmission = require('./src/models/KyCSubmission');
const FundingRequest = require('./src/models/FundingRequest');
const User = require('./src/models/User');
const Admin = require('./src/models/Admin');

async function verify() {
  try {
    console.log("1. Testing Trade.findAll('open')...");
    const openTrades = await Trade.findAll('open');
    console.log("   ✅ Open trades:", openTrades.length);

    console.log("2. Testing Trade.cancel(52)...");
    const cancelled = await Trade.cancel(52);
    console.log("   ✅ Cancelled trade:", cancelled ? `#${cancelled.id} status=${cancelled.status}` : "Trade not open (already processed)");

    console.log("3. Testing getDashboardStats dependencies...");
    const clients = await User.findAll('client');
    const admins = await Admin.findAll();
    const kycPending = await KyCSubmission.findAll('pending');
    const fundingPending = await FundingRequest.findAll('pending');
    console.log(`   ✅ clients=${clients.length}, admins=${admins.length}, kycPending=${kycPending.length}, fundingPending=${fundingPending.length}`);

    console.log("\n✅ All checks passed!");
  } catch (e) {
    console.error("❌ Error:", e.message);
  }
  process.exit();
}
verify();
