import Dexie, { Table } from 'dexie';

export interface Profile {
  id?: number;
  name: string;
  paymentName: string;
  paymentKey: string;
  avatarUrl: string;
  currency: string;
}

export interface Campaign {
  id?: number;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  endDate?: Date;
  isCompleted?: boolean;
  boxes: Box[];
}

export interface Box {
  id?: number;
  value: number;
  isPaid: boolean;
  contributorName?: string;
}

export class MetaQueshDB extends Dexie {
  profile!: Table<Profile>;
  campaigns!: Table<Campaign>;

  constructor() {
    super('MetaQueshDB');
    this.version(2).stores({
      profile: '++id',
      campaigns: '++id, name, targetAmount, currentAmount, startDate, endDate, isCompleted',
    });
  }
}

export const db = new MetaQueshDB();
