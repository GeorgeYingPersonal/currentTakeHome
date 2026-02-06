'use client';

import { ContactField } from '@/app/lib/definitions';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createGroupPay } from "@/app/lib/actions";

export default function Form({ contacts }: { contacts: ContactField[] }) {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const amountPerContact = selectedContacts.length > 0 && totalAmount
    ? (parseFloat(totalAmount) || 0) / selectedContacts.length
    : 0;

  // Validation
  const isAmountValid = totalAmount !== '' && !isNaN(parseFloat(totalAmount)) && parseFloat(totalAmount) > 0;
  const isFormValid =
    selectedContacts.length > 0 &&
    isAmountValid &&
    date !== '';

  const handleSubmit = async (formData: FormData) => {
    // Add selected contact IDs to form data
    selectedContacts.forEach(contactId => {
      formData.append('contactIds', contactId);
    });
    return createGroupPay(formData);
  };

  return (
    <form action={handleSubmit}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Multiple Contact Selection */}
        <div className="mb-4">
          <label htmlFor="contacts" className="mb-2 block text-sm font-medium">
            Holding command (⌘) or shift (⇧) to select multiple contacts
          </label>
          <div className="relative">
            <select
              id="contacts"
              multiple
              size={5}
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              value={selectedContacts}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedContacts(values);
              }}
            >
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-3 h-[18px] w-[18px] text-gray-500" />
          </div>
          {selectedContacts.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedContacts.map(contactId => {
                const contact = contacts.find(c => c.id === contactId);
                return contact ? (
                  <span
                    key={contactId}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                  >
                    {contact.name}
                    <button
                      type="button"
                      onClick={() => handleContactToggle(contactId)}
                      className="ml-1 rounded-full hover:bg-blue-200"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Total Amount */}
        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Total amount (will be split evenly)
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="Enter total USD amount"
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 pr-3 text-sm outline-2 placeholder:text-gray-500"
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          {selectedContacts.length > 0 && totalAmount && (
            <p className="mt-1 text-xs text-gray-500">
              Each contact will receive: ${amountPerContact.toFixed(2)}
            </p>
          )}
        </div>

        {/* Pay Date */}
        <div className="mb-4">
          <label htmlFor="date" className="mb-2 block text-sm font-medium">
            Choose a date
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="date"
                name="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>

        {/* Pay Note */}
        <div className="mb-4">
          <label htmlFor="note" className="mb-2 block text-sm font-medium">
            Note (optional)
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <textarea
                id="note"
                name="note"
                rows={3}
                placeholder="Add a note about this group payment..."
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <DocumentTextIcon className="pointer-events-none absolute left-3 top-3 h-[18px] w-[18px] text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>

        {/* Payment Flow */}
        <fieldset className="mb-4">
          <legend className="mb-2 block text-sm font-medium">
            Payment Flow
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="request"
                  name="flow"
                  type="radio"
                  value="request"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="request"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700"
                >
                  Request <ArrowDownTrayIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="pay"
                  name="flow"
                  type="radio"
                  value="pay"
                  defaultChecked
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="pay"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700"
                >
                  Pay <ArrowUpTrayIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
        </fieldset>

        {/* Payment Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Payment Status
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  defaultChecked
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Pending <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="received"
                  name="status"
                  type="radio"
                  value="received"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="received"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Received <CheckIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
        </fieldset>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/pays"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={!isFormValid}>
          Create Group Pay ({selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''})
        </Button>
      </div>
    </form>
  );
}

