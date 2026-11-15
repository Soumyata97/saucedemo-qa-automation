const validCustomer = { firstName: 'Test', lastName: 'User', postalCode: '44600' };

// Data-driven checkout form validation cases
const checkoutValidationCases = [
  {
    id: 'TC-CHK-01',
    title: 'missing first name is rejected',
    data: { firstName: '', lastName: 'User', postalCode: '44600' },
    error: 'First Name is required',
  },
  {
    id: 'TC-CHK-02',
    title: 'missing last name is rejected',
    data: { firstName: 'Test', lastName: '', postalCode: '44600' },
    error: 'Last Name is required',
  },
  {
    id: 'TC-CHK-03',
    title: 'missing postal code is rejected',
    data: { firstName: 'Test', lastName: 'User', postalCode: '' },
    error: 'Postal Code is required',
  },
];

module.exports = { validCustomer, checkoutValidationCases };
