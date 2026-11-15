// Credentials are the public demo credentials published on https://www.saucedemo.com
const PASSWORD = 'secret_sauce';

const users = {
  standard: { username: 'standard_user', password: PASSWORD },
  lockedOut: { username: 'locked_out_user', password: PASSWORD },
};

// Data-driven negative login cases
const invalidLoginCases = [
  {
    id: 'TC-LOGIN-03',
    title: 'wrong password is rejected',
    username: 'standard_user',
    password: 'wrong_password',
    error: 'Username and password do not match any user in this service',
  },
  {
    id: 'TC-LOGIN-04',
    title: 'unknown username is rejected',
    username: 'unknown_user',
    password: PASSWORD,
    error: 'Username and password do not match any user in this service',
  },
  {
    id: 'TC-LOGIN-05',
    title: 'empty username shows required message',
    username: '',
    password: PASSWORD,
    error: 'Username is required',
  },
  {
    id: 'TC-LOGIN-06',
    title: 'empty password shows required message',
    username: 'standard_user',
    password: '',
    error: 'Password is required',
  },
];

module.exports = { users, invalidLoginCases, PASSWORD };
