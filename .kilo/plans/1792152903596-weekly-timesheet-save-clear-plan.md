# Implementation Plan - Weekly Timesheet Layout & Save/Submit Flow

## Goal
Update `WeeklyTimesheet.jsx` to match standard weekly timesheet layouts, add a **Save** action that stores draft/entered hours locally (without submitting to backend / appearing in approval until **Submit Weekly Timesheet** is clicked), and add a **Clear Data** option for each row after saving or editing.

---

## Proposed Changes

### 1. Weekly Timesheet Layout & UI Refresh (`WeeklyTimesheet.jsx`)
- Reorganize the grid/table layout so that projects are listed vertically as rows (or selectable rows corresponding to employee allocations), with days of the week (Monday through Sunday) as columns.
- Provide inputs for hours and description per day for each project row.

### 2. Save vs Submit Separation
- **Save Button**: Stores the current row's daily entry state locally or marks it as saved/draft in local component state. It does **not** call `submitBatchTimesheet` or send data to the backend, ensuring it does **not** appear in manager approval views.
- **Submit Weekly Timesheet Button**: Sends the saved/batched entries to the backend (`submitBatchTimesheet`), which triggers the backend pending approval state and makes them visible to L1/L2 approvers.

### 3. Clear Data Option
- Add a **Clear Data** button or action next to each project row / after saving that resets the daily hours and notes for that row.

---

## Validation Plan
1. Run `npm test` or verify build in `timesheet-frontend`.
2. Manual verification in browser:
   - Enter weekly hours for a project.
   - Click **Save** -> Verify data is held locally and **not** visible in the approval view.
   - Click **Clear Data** -> Verify row entries reset.
   - Click **Submit Weekly Timesheet** -> Verify data is successfully submitted and appears in the approval view.
