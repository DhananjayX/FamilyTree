import devConfig from './dev.config.js';
import prodConfig from './prod.config.js';

// Determine which config to use based on environment
const isDevelopment = import.meta.env.MODE === 'development' || 
                     import.meta.env.DEV || 
                     process.env.NODE_ENV === 'development';

const config = isDevelopment ? devConfig : prodConfig;

console.log(`Using ${config.app.environment} configuration`);

export default config;