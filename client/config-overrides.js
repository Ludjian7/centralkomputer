const { override, addWebpackModuleRule } = require('customize-cra');

module.exports = override(
  (config) => {
    // Add a rule to handle ESM modules
    config.module.rules.unshift({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    // If webpack needs to be more specifically configured
    if (!config.resolve) config.resolve = {};
    if (!config.resolve.fallback) config.resolve.fallback = {};
    
    return config;
  }
); 