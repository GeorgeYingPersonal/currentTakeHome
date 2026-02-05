// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

export type Pay = {
  id: string;
  // TODO: build out what other fields this should have
};

export type Activity = {
  month: string;
  activity: number;
};

export type LatestPay = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestPayRaw = Omit<LatestPay, 'amount'> & {
  amount: number;
};

export type PaysTable = {
  id: string;
  contact_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid';
};

export type ContactsTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_pays: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedContactsTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_pays: number;
  total_pending: string;
  total_paid: string;
};

export type ContactField = {
  id: string;
  name: string;
};

export type PayForm = {
  id: string;
  contact_id: string;
  amount: number;
  // TODO: more here
  status: 'pending' | 'paid';
};
