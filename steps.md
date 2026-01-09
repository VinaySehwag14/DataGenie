# InsightPilot Pro - Implementation Steps

Welcome to the InsightPilot Pro implementation guide! Follow these steps to build the application.

## Phase 1: Foundation & UI (Current Phase)

### Step 1: Landing Page
1. Open `src/app/page.tsx`.
2. Create a hero section with a title "InsightPilot Pro" and a brief description.
3. Add a "Get Started" button that links to `/dashboard`.
4. *Goal*: Ensure the landing page looks clean and modern.

### Step 2: Dashboard Layout
1. Create a file `src/app/dashboard/layout.tsx`.
2. Add a sidebar or navbar using standard HTML/CSS or ShadCN components if available.
3. Create `src/app/dashboard/page.tsx` with a placeholder "Welcome to Dashboard".
4. *Goal*: Establish the main application shell.

### Step 3: Data Upload Component
1. Create `src/components/dashboard/upload-zone.tsx`.
2. Implement a drag-and-drop area for CSV/JSON files.
3. Use a state variable to store the uploaded file content.
4. *Goal*: Allow users to select a file.

## Phase 2: Visualization & Logic

### Step 4: Parsing Data
1. Install `papaparse` (already installed).
2. In `upload-zone.tsx`, use `Papa.parse` to convert CSV to JSON.
3. Display a preview of the data (first 5 rows) in a table.

### Step 5: Charts
1. Create `src/components/dashboard/charts-view.tsx`.
2. Use `recharts` to render a BarChart or LineChart using the parsed data.
3. *Goal*: Visualize the uploaded data.

## Phase 3: AI Integration

### Step 6: AI Summary API
1. Create `src/app/api/ai/summary/route.ts`.
2. Implement a POST handler that accepts data and returns a mock summary (connect to Gemini later).
3. Call this API from the frontend.

### Step 7: AI Chat
1. Create `src/components/dashboard/chat-interface.tsx`.
2. Build a chat UI (input + message list).
3. Connect to `src/app/api/ai/chat/route.ts` (to be created).

Good luck!
