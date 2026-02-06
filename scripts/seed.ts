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

// Optionally generate some sample pays
// You can uncomment this and modify as needed
/*
import { randomUUID } from 'crypto';
const insertPay = db.prepare(`
  INSERT INTO pays (id, contact_id, amount, status, date)
  VALUES (?, ?, ?, ?, ?)
`);

const samplePays = [];
for (let i = 0; i < 20; i++) {
  const randomContact = contacts[Math.floor(Math.random() * contacts.length)];
  const randomDate = new Date();
  randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 365));
  
  samplePays.push({
    id: randomUUID(),
    contact_id: randomContact.id,
    amount: Math.floor(Math.random() * 10000) + 1000, // $10 to $100 in cents
    status: Math.random() > 0.5 ? 'paid' : 'pending',
    date: randomDate.toISOString().split('T')[0],
  });
}

const insertManyPays = db.transaction((pays) => {
  for (const pay of pays) {
    insertPay.run(pay.id, pay.contact_id, pay.amount, pay.status, pay.date);
  }
});

insertManyPays(samplePays);
console.log(`✅ Seeded ${samplePays.length} sample pays`);
*/

db.close();
console.log('✅ Database seeded successfully!');

