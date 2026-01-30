---
id: task-6
title: Dashboard with Sidebar Navigation After Login
status: Done
assignee: []
created_date: '2026-01-30 14:38'
updated_date: '2026-01-30 15:08'
labels: []
dependencies: []
ordinal: 4000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
After the user successfully logs into the application, they must be redirected to a Dashboard page.

The Dashboard should have a persistent layout composed of:

A sidebar (left navigation menu) that remains visible across all dashboard screens.

A main content area on the right that updates dynamically based on the selected menu option.

The sidebar must include an option called “Emendas”.

Behavior requirements:

When the user clicks on “Emendas” in the sidebar, the application should load the Emendas screen inside the Dashboard content area, without removing or reloading the sidebar.

The sidebar must remain visible and unchanged while navigating between dashboard sections.

The Dashboard acts as a layout container, and internal pages (such as Emendas) are rendered within it.

Navigation flow:

User logs in successfully

User is redirected to /dashboard

Dashboard loads with sidebar + default content

User clicks Emendas

Emendas screen is displayed inside the dashboard layout, keeping the sidebar visible

The experience should feel like a single-page application (SPA) with smooth transitions between dashboard sections.
<!-- SECTION:DESCRIPTION:END -->
