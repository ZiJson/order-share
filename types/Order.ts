import type { userId } from './index.js';

export type Order = {
  name: string;
  price: number;
  type: 'personal' | 'share';
  createdBy: userId;
};
