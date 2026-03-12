import type { Dinner } from '../types/Dinner.js';

export const createDinner = (people: number, budget: number): Dinner => {
  return {
    peopleLimit: people,
    budget: budget,
    members: new Map(),
    orders: [],
  };
};
