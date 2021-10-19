import User from '../../users/user.entity';

const mockedUser: User = {
  id: 1,
  name: 'John',
  email: 'user@email.com',
  password: 'hash',
  address: {
    id: 1,
    street: 'streetName',
    city: 'cityName',
    country: 'countryName',
  },
};

export default mockedUser;
