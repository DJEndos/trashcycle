// Business rules shared by models, routes and services.
export const SLOTS = ['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00'];
export const STATUSES = ['pending', 'confirmed', 'assigned', 'on_the_way', 'arrived', 'collected', 'completed', 'cancelled', 'rejected'];
export const TRANSITIONS = {
  pending: ['confirmed', 'rejected', 'cancelled'],
  confirmed: ['assigned', 'rejected', 'cancelled'],
  assigned: ['on_the_way', 'cancelled'],
  on_the_way: ['arrived'],
  arrived: ['collected'],
  collected: ['completed'],
  completed: [], cancelled: [], rejected: [],
};

export const ROLES = ['user', 'admin', 'driver'];
export const ACTIVE_STATUSES = ['pending', 'confirmed', 'assigned', 'on_the_way', 'arrived'];
