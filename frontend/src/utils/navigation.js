// Where a signed-in user lands, based on their role.
export const homePathFor = (user) => (user.role === 'admin' ? '/admin' : '/home');
