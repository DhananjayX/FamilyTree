const prodConfig = {
  api: {
    baseUrl: 'https://api.familytree.com/api', // Replace with actual production API URL
    timeout: 10000
  },
  app: {
    defaultTreeId: 'tree_00000',
    environment: 'production',
    debugMode: false,
    autoSaveInterval: 5000
  },
  storage: {
    localStorageKey: 'familytree_persons',
    enableLocalStorage: true
  }
};

export default prodConfig;