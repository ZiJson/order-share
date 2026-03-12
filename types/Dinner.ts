import type { Member, Order, userId } from './index.js';

export type Dinner = {
  peopleLimit: number;
  budget: number;
  members: Map<userId, Member>;
  orders: Order[];
};
