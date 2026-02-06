import { formatCurrency } from './utils';
import { getDb } from './db';
import { ContactsTableType, PaysTable, ContactField, LatestPay, Pay, Activity } from "@/app/lib/definitions";
import { randomUUID } from 'crypto';

export async function fetchActivity(): Promise<Activity[]> {
  try {
    const db = getDb();

    // Group pays by month and calculate total activity
    // Order by year-month to handle cross-year scenarios correctly
    const result = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as year_month,
        strftime('%m', date) as month_num,
        strftime('%Y', date) as year,
        CASE strftime('%m', date)
          WHEN '01' THEN 'Jan'
          WHEN '02' THEN 'Feb'
          WHEN '03' THEN 'Mar'
          WHEN '04' THEN 'Apr'
          WHEN '05' THEN 'May'
          WHEN '06' THEN 'Jun'
          WHEN '07' THEN 'Jul'
          WHEN '08' THEN 'Aug'
          WHEN '09' THEN 'Sep'
          WHEN '10' THEN 'Oct'
          WHEN '11' THEN 'Nov'
          WHEN '12' THEN 'Dec'
        END as month,
        COALESCE(SUM(amount), 0) as activity
      FROM pays
      WHERE date >= date('now', '-12 months')
      GROUP BY year_month, month_num, year
      ORDER BY year_month
    `).all() as Array<{ month: string; year: string; activity: number }>;

    return result.map(r => ({
      month: `${r.month || 'Unknown'} ${r.year || ''}`.trim(),
      activity: r.activity / 100, // Convert from cents to dollars
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch activity data.');
  }
}

export async function fetchLatestPays(): Promise<LatestPay[]> {
  try {
    const db = getDb();

    const latestPays = db.prepare(`
      SELECT 
        p.id,
        p.amount,
        c.name,
        c.email,
        c.image_url
      FROM pays p
      JOIN contacts c ON p.contact_id = c.id
      ORDER BY p.date DESC, p.created_at DESC
      LIMIT 5
    `).all() as Array<{
      id: string;
      amount: number;
      name: string;
      email: string;
      image_url: string;
    }>;

    return latestPays.map((pay) => ({
      id: pay.id,
      name: pay.name,
      email: pay.email,
      image_url: pay.image_url,
      amount: formatCurrency(pay.amount),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest pays.');
  }
}

export async function fetchCardData() {
  try {
    const db = getDb();

    // Get counts and totals in parallel
    const numberOfContacts = db.prepare('SELECT COUNT(*) as count FROM contacts').get() as { count: number };
    const numberOfPays = db.prepare('SELECT COUNT(*) as count FROM pays').get() as { count: number };
    const paidData = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM pays 
      WHERE status = 'paid'
    `).get() as { total: number };
    const pendingData = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM pays 
      WHERE status = 'pending'
    `).get() as { total: number };

    return {
      numberOfContacts: numberOfContacts.count,
      numberOfPays: numberOfPays.count,
      totalPaidPays: paidData.total / 100, // Convert from cents to dollars
      totalPendingPays: pendingData.total / 100, // Convert from cents to dollars
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredPays(
  query: string,
  currentPage: number,
  status?: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<PaysTable[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const db = getDb();

    let sql = `
      SELECT 
        p.id,
        p.contact_id,
        c.name,
        c.email,
        c.image_url,
        p.date,
        p.amount,
        p.status
      FROM pays p
      JOIN contacts c ON p.contact_id = c.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (query) {
      conditions.push(`(c.name LIKE ? OR c.email LIKE ?)`);
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm);
    }

    if (status && status !== 'all') {
      conditions.push(`p.status = ?`);
      params.push(status);
    }

    if (dateFrom) {
      conditions.push(`p.date >= ?`);
      params.push(dateFrom);
    }

    if (dateTo) {
      conditions.push(`p.date <= ?`);
      params.push(dateTo);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY p.date DESC, p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(ITEMS_PER_PAGE, offset);

    const pays = db.prepare(sql).all(...params) as Array<{
      id: string;
      contact_id: string;
      name: string;
      email: string;
      image_url: string;
      date: string;
      amount: number;
      status: 'pending' | 'paid';
    }>;

    return pays.map((pay) => ({
      id: pay.id,
      contact_id: pay.contact_id,
      name: pay.name,
      email: pay.email,
      image_url: pay.image_url,
      date: pay.date,
      amount: pay.amount / 100, // Convert from cents to dollars
      status: pay.status,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch pays.');
  }
}

export async function fetchPaysPages(
  query: string,
  status?: string,
  dateFrom?: string,
  dateTo?: string,
) {
  try {
    const db = getDb();

    let sql = 'SELECT COUNT(*) as count FROM pays p JOIN contacts c ON p.contact_id = c.id';
    const params: any[] = [];
    const conditions: string[] = [];

    if (query) {
      conditions.push(`(c.name LIKE ? OR c.email LIKE ?)`);
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm);
    }

    if (status && status !== 'all') {
      conditions.push(`p.status = ?`);
      params.push(status);
    }

    if (dateFrom) {
      conditions.push(`p.date >= ?`);
      params.push(dateFrom);
    }

    if (dateTo) {
      conditions.push(`p.date <= ?`);
      params.push(dateTo);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = db.prepare(sql).get(...params) as { count: number };
    return Math.ceil(result.count / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of pays.');
  }
}

export async function fetchPayById(id: string): Promise<Pay | undefined> {
  try {
    const db = getDb();

    const pay = db.prepare(`
      SELECT id, contact_id, amount, status, date, note
      FROM pays
      WHERE id = ?
    `).get(id) as {
      id: string;
      contact_id: string;
      amount: number;
      status: 'pending' | 'paid';
      date: string;
      note: string | null;
    } | undefined;

    if (!pay) return undefined;

    return {
      id: pay.id,
      contact_id: pay.contact_id,
      amount: pay.amount / 100, // Convert from cents to dollars
      status: pay.status,
      date: pay.date,
      note: pay.note || undefined,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch pay.');
  }
}

export async function fetchContacts(): Promise<ContactField[]> {
  try {
    const db = getDb();

    const contacts = db.prepare('SELECT id, name FROM contacts ORDER BY name').all() as Array<{
      id: string;
      name: string;
    }>;

    return contacts;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all contacts.');
  }
}

export async function fetchFilteredContacts(query: string): Promise<ContactsTableType[]> {
  try {
    const db = getDb();

    let sql = `
      SELECT 
        c.id,
        c.name,
        c.email,
        c.image_url,
        COUNT(p.id) as total_pays,
        COALESCE(SUM(CASE WHEN p.status = 'pending' THEN p.amount ELSE 0 END), 0) as total_pending,
        COALESCE(SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END), 0) as total_paid
      FROM contacts c
      LEFT JOIN pays p ON c.id = p.contact_id
    `;

    const params: any[] = [];

    if (query) {
      sql += ` WHERE c.name LIKE ? OR c.email LIKE ?`;
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm);
    }

    sql += ` GROUP BY c.id, c.name, c.email, c.image_url ORDER BY c.name`;

    const contacts = db.prepare(sql).all(...params) as Array<{
      id: string;
      name: string;
      email: string;
      image_url: string;
      total_pays: number;
      total_pending: number;
      total_paid: number;
    }>;

    return contacts.map((contact) => ({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      image_url: contact.image_url,
      total_pays: contact.total_pays,
      total_pending: contact.total_pending / 100, // Convert from cents to dollars
      total_paid: contact.total_paid / 100, // Convert from cents to dollars
    }));
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch contact table.');
  }
}
