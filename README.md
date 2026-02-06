## CPay App

This is the starter template from the Next.js App Router Course. It contains the starting code for the dashboard application modified for our take home exercise purposes.

## Overview

The P2P payment market is booming, with projections estimating it will surpass $5.2 trillion by 2028. As more consumers and businesses adopt these technologies, being a part of this space positions you at the forefront of financial innovation and growth. This is your chance to contribute to a sector that is reshaping how money is transferred and managed.

The goal of this assessment is to generate sample data and persist it in memory. Then create functionality using that data to query and mutate.

## Schema

See the schemas in `./lib/definitions.ts` as well as the data in `lib/data.ts`. Part of the exercise is to define a schema that encompasses p2p transactions in a concise and scalable way.

A majority of the UI has already been implemented, but there is room for addition depending on the models you implement.

```
interface Contact {
  id: string(UUID); // changed it to uuid
  name: string
  email: string
  image_url: string;
}

interface Pay {
  id: string (UUID);
  contact_id: string (UUID);
  amount: number;
  status: (enum); // pending | received
  flow: (enum); // request | pay
  date: string; // Date in YYYY-MM-DD format
  note: ?string;
  created_at: string // timestamp
}
```

# Required operations

1. Pays have been partially defined. Add fields you would feel relevant for querying purposes. Think of pays similar to any p2p you are familiar with. 
2. Generate random pays to and from the pre-populated contacts for the months of a single year. 
3. Incorporate into routes and pre-made UIs by building out the queries in memory. (Used db for storage)
4. Set up create and edit/action pay. (Remember, the UI will need updating per your `pay` model)
5. Commit and share! Feel free to leave notes in your thought process.

## Bonus operations

- Filtering UI
- Group pay UI

### Hints

Boot up the app. Navigate to the dashboard. Most of these cards will show empty data. 
After you generate your data, fill these in. Replace `Recent Activity` with your data.

Click to the other routes. 

`Pays` will have a table that should have more columns. `Create Pay` will probably require more fields.

`Contacts` will use the contacts we've provided but the aggregation of data you've created. 

There are `TODO`s. Try to get to them all.

## Requirements

- Node version - v18.18.0 or higher for this version of Next.js

# Candidate README
## Bootstrap instructions

* Install node library
* Follow DATABASE_SETUP.md for db setup if needed (optional, can create data manually)
* Start application by "npm run dev"

## Design considerations

Recognizing this is a 2-5 hour assignment on the project: I focused mostly on the UI and suggested operations. Here are some considerations/actions: 

* For the application, almost all defaulted the current actor is the only user here. So we really don't have current user id neither login vs logout state. To fix this, we need user table and bring userid in both contact table and pay table. 

* ✅ Include sqlite as dependency and move test data there. Sqlite is the most straightforward and easy solution for now. This will help me verify the data is created and persisted. Also, this should be much closer to real application environment.

* For pay model data, the fields are shown above in the interface section. Most fields are self-explaintory. One note is contact_id as foreign key meaning we required payment to be between contacts which is different from current applications such as venmo/zelle but much closer to initial design (can be changed later)

* ✅ For filtering on dashboard/pays, decided to reload the data once filtering is changed. The tradeoff is if we want to keep most data on clientside and filtering be faster since we don't need to refetch data. But once data becomes large and we might not want to store all data on client side and also we might want to work with server side pagination, I choose to update the url and refetch data when filtering

* ✅ Add some easy validation in create/update form. Not sure on the business require like whether we should support future payment etc. So this part is the most basic version.


## Further iteration direction
* Adding users, user passwords and login logout functionality (current signout not working)
* Adding unit tests and e2e automation tests to ensure functionality


