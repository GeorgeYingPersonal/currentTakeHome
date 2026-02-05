import { useReducer } from "react";
import {formatCurrency} from './utils';
import {contacts, pays, activity} from "@/app/lib/placeholder-data";

export async function fetchActivity() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    await new Promise((resolve) => setTimeout(resolve, getRandomMillis(3)));

    return activity;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch activity data.');
  }
}

export async function fetchLatestPays() {
  try {
    await new Promise((resolve) => setTimeout(resolve, getRandomMillis(3)));

    // TODO: return latest pays data joined with contacts
    return [];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest pays.');
  }
}

export async function fetchCardData() {
  try {
    const payCountPromise = new Promise((resolve) => setTimeout(resolve, getRandomMillis(3)));
    const contactCountPromise = new Promise((resolve) => setTimeout(resolve, getRandomMillis(3)));
    const payStatusPromise = new Promise((resolve) => setTimeout(resolve, getRandomMillis(3)));

    const data = await Promise.all([
      payCountPromise,
      contactCountPromise,
      payStatusPromise,
    ]);

    // TODO: calculate these values
    const numberOfPays = 0;
    const numberOfContacts = 0;
    const totalPaidPays = 0;
    const totalPendingPays = 0;

    return {
      numberOfContacts,
      numberOfPays,
      totalPaidPays,
      totalPendingPays,
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
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {

    // TODO: filter the related pay joined data for the query string passed
    return [];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch pays.');
  }
}

export async function fetchPaysPages(query: string) {
  try {
    // TODO: filter the related pay joined data for the query string passed to find this value
    return 0;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of pays.');
  }
}

export async function fetchPayById(id: string) {
  try {

    // TODO: return this pay
    return undefined;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch pay.');
  }
}

export async function fetchContacts() {
  try {

    // TODO: return contacts
    return [];
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all contacts.');
  }
}

export async function fetchFilteredContacts(query: string) {
  try {
    // TODO: return contacts with total_pays, total_pending, total_paid
    return [];
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch contact table.');
  }
}

function getRandomMillis(max) {
  return Math.random() * max * 1000;
}