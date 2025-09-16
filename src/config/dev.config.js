const devConfig = {
  api: {
    baseUrl: 'http://localhost:3001/api',
    timeout: 5000
  },
  app: {
    defaultTreeId: 'tree_00000',
    environment: 'development',
    debugMode: true,
    autoSaveInterval: 2000
  },
  storage: {
    localStorageKey: 'familytree_persons_dev',
    enableLocalStorage: true
  }
};

export default devConfig;