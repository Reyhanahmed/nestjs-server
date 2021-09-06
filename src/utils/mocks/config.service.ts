const mockedConfigService = {
  get(key: string) {
    switch (key) {
      case 'ACCESS_TOKEN_EXPIRATION_TIME':
        return '3600';
    }
  },
};

export default mockedConfigService;
