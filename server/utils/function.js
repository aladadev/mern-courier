const os = require("os");
const { parcelCostBySize } = require("./constant");

exports.determineParcelCharge = (size) => {
  return parcelCostBySize[size];
};

// server load
exports.getServerLoad = () => {
  const load = os.loadavg()[0]; // Get the 1-minute CPU load average
  const cpuCores = os.cpus().length;
  const loadPercentage = (load / cpuCores) * 100; // Convert load to percentage

  console.log(`Current load: ${loadPercentage.toFixed(2)}%`);
  return loadPercentage;
};
