# Baseline

Baseline is a personal recovery and activity dashboard built around a simple idea: health data is more useful when it is compared with your own patterns instead of only generic daily targets.

The project is currently an early frontend prototype. It uses seeded demonstration data while I develop the interface, calculations, and data model.

## Current Features

Baseline currently displays:

* A readiness score using a semicircular gauge
* Steps
* Move calories
* Rest
* Mindful breathing minutes

The dashboard organizes these metrics into three sections:

* **Today** shows the most recent entry.
* **Trends** shows the average across the available data.
* **Changes** shows the difference between the latest and previous entries.

The readiness score is currently included in the demonstration data rather than calculated by the application. A transparent scoring model will be added later.

## Built With

* Next.js
* React
* TypeScript
* CSS Modules
* Inline SVG
* Node.js and npm for local development

## Running the Project Locally

From the project directory, install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local address shown in the terminal in your browser.

## Project Status

Baseline is still in active development. The current version focuses on establishing the dashboard layout, reusable components, responsive styling, and basic metric calculations before introducing a backend.

All health and activity information currently shown in the application is temporary demonstration data.

## Planned Work

* Handle empty and incomplete datasets
* Add loading and error states
* Develop a transparent readiness-score calculation
* Serve demonstration data through an API
* Add automated tests for metric calculations
* Store data using PostgreSQL and Prisma
* Add one real activity-data integration

## Why I’m Building It

My professional background is primarily in C# and .NET development. I started Baseline to build practical experience with React, TypeScript, Next.js, and Node.js while working on a problem I genuinely care about.

The project is also an exploration of how recovery and activity products can make personal data easier to understand without presenting opaque recommendations or treating the same target as appropriate for everyone.

## Disclaimer

Baseline is a personal software project and is not a medical device. It does not provide medical advice, diagnosis, or treatment recommendations.
