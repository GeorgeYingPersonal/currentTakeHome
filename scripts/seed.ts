import Database from 'better-sqlite3';
import path from 'path';
import { contacts } from '../app/lib/placeholder-data';

const dbPath = path.join(process.cwd(), 'data', 'cpay.db');
const db = new Database(dbPath);

// Clear existing data (optional - comment out if you want to keep existing data)
db.exec('DELETE FROM pays');
db.exec('DELETE FROM contacts');

// Insert contacts
const insertContact = db.prepare(`
  INSERT INTO contacts (id, name, email, image_url)
  VALUES (?, ?, ?, ?)
`);

const insertManyContacts = db.transaction((contacts) => {
  for (const contact of contacts) {
    insertContact.run(contact.id, contact.name, contact.email, contact.image_url);
  }
});

insertManyContacts(contacts);

console.log(`✅ Seeded ${contacts.length} contacts`);

// Generate sample pays distributed across the past 12 months
import { randomUUID } from 'crypto';

const insertPay = db.prepare(`
  INSERT INTO pays (id, contact_id, amount, status, flow, date, note)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

// Activity pattern from placeholder-data.ts (in dollars, we'll convert to cents)
const monthlyActivity = [
  { month: 0, activity: 2000 },  // Jan
  { month: 1, activity: 1800 },  // Feb
  { month: 2, activity: 2200 },  // Mar
  { month: 3, activity: 2500 },  // Apr
  { month: 4, activity: 2300 },  // May
  { month: 5, activity: 3200 },  // Jun
  { month: 6, activity: 3500 },  // Jul
  { month: 7, activity: 3700 },  // Aug
  { month: 8, activity: 2500 },  // Sep
  { month: 9, activity: 2800 },  // Oct
  { month: 10, activity: 3000 }, // Nov
  { month: 11, activity: 4800 }, // Dec
];

interface SamplePay {
  id: string;
  contact_id: string;
  amount: number;
  status: 'pending' | 'received';
  flow: 'request' | 'pay';
  date: string;
  note: string | null;
}

const samplePays: SamplePay[] = [];
const now = new Date();
const notes = [
  'Monthly subscription payment',
  'Project milestone payment',
  'Consulting services',
  'Invoice payment',
  'Reimbursement',
  null, // Some pays have no note
  null,
  null,
];

// Generate pays for each month
monthlyActivity.forEach(({ month, activity }) => {
  // Calculate how many pays to generate for this month (roughly 3-8 pays per month)
  const numPays = Math.floor(activity / 500) + Math.floor(Math.random() * 3);

  // Distribute the activity amount across the pays
  const baseAmount = Math.floor((activity * 100) / numPays); // Convert to cents

  for (let i = 0; i < numPays; i++) {
    const randomContact = contacts[Math.floor(Math.random() * contacts.length)];

    // Generate a random date within the month
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (12 - month), 1);
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
    const payDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), randomDay);

    // Vary the amount slightly (±20%)
    const amountVariation = 0.8 + Math.random() * 0.4;
    const amount = Math.floor(baseAmount * amountVariation);

    // Mix of statuses (70% received, 30% pending)
    const status = Math.random() > 0.3 ? 'received' : 'pending';

    // Mix of flows (60% pay, 40% request)
    const flow = Math.random() > 0.4 ? 'pay' : 'request';

    // Random note (some have notes, some don't)
    const note = notes[Math.floor(Math.random() * notes.length)];

    samplePays.push({
      id: randomUUID(),
      contact_id: randomContact.id,
      amount,
      status,
      flow,
      date: payDate.toISOString().split('T')[0],
      note,
    });
  }
});

const insertManyPays = db.transaction((pays) => {
  for (const pay of pays) {
    insertPay.run(
      pay.id,
      pay.contact_id,
      pay.amount,
      pay.status,
      pay.flow,
      pay.date,
      pay.note
    );
  }
});

insertManyPays(samplePays);
console.log(`✅ Seeded ${samplePays.length} sample pays`);

db.close();
console.log('✅ Database seeded successfully!');

