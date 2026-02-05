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
  id: number;
  name: string
  email: string
  image_url: string;
}

interface Pay {
  id: string;
  amount: number;
  // TODO: fill in 
}
```

# Required operations

1. Pays have been partially defined. Add fields you would feel relevant for querying purposes. Think of pays similar to any p2p you are familiar with. 
2. Generate random pays to and from the pre-populated contacts for the months of a single year. 
3. Incorporate into routes and pre-made UIs by building out the queries in memory.
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
*Replace this: To run this locally, do the following (if anything)*

## Design considerations
*Replace this: I decided to build X for Y reasons...*

- Wallets
- Amount
- Potential enhancements
- Miscellaneous
