# AI Food Assistant - Completed System Walkthrough (Live Sync Enabled)

All tasks have been successfully executed! The restaurant recommendation system has been generated, covering all 5 target districts (Siam, Ari, Thonglor, Asoke, and Phrom Phong) with a total of 100 scored restaurants.

---

## Created Deliverables

Below is the list of files generated in your project folder `F:\Work\Crazy Sprout\Test\Sent on June 8th_\[3]Restaurant`:

1.  **Google Sheets Import Files**:
    *   [raw_restaurants.csv](file:///f:/Work/Crazy Sprout/Test/Sent on June 8th_/[3]Restaurant/raw_restaurants.csv): Raw scraped data of 100 restaurants, ready to be uploaded to your Google Sheets **"Raw Data"** tab.
    *   [scored_restaurants.csv](file:///f:/Work/Crazy Sprout/Test/Sent on June 8th_/[3]Restaurant/scored_restaurants.csv): Scored dataset according to the 100-point rubric, ready to be uploaded to your Google Sheets **"Clean & Scored Data"** tab.
2.  **Automation Component**:
    *   [n8n_workflow.json](file:///f:/Work/Crazy Sprout/Test/Sent on June 8th_/[3]Restaurant/n8n_workflow.json): The n8n integration workflow file (direct Gemini 3.5 Flash API calls).
3.  **Interactive Web Dashboard (HTML5/CSS3/Vanilla JS)**:
    *   [index.html](file:///f:/Work/Crazy Sprout/Test/Sent on June 8th_/[3]Restaurant/index.html): Main webpage structure containing the target layout.
    *   [index.css](file:///f:/Work/Crazy Sprout/Test/Sent on June 8th_/[3]Restaurant/index.css): Styling sheet implementing a premium glassmorphic dark theme.
    *   [index.js](file:///f:/Work/Crazy Sprout/Test/Sent on June 8th_/[3]Restaurant/index.js): Controller script implementing Google Sheets Live Sync and dynamic district styling.
    *   [data.js](file:///f:/Work/Crazy Sprout/Test/Sent on June 8th_/[3]Restaurant/data.js): Scored dataset snapshot (used as a fallback offline).

---

## Step 1: Setting Up Google Sheets

To submit your Google Sheets link:
1.  Create a new Google Spreadsheet named **"AI Food Assistant - [Your Name]"**.
2.  Create two sheets (tabs): **"Raw Data"** and **"Clean & Scored Data"**.
3.  Go to `File > Import > Upload` and select [raw_restaurants.csv](file:///f:/Work/Crazy Sprout/Test/Sent on June 8th_/[3]Restaurant/raw_restaurants.csv) to upload to the **"Raw Data"** tab.
4.  Import [scored_restaurants.csv](file:///f:/Work/Crazy Sprout/Test/Sent on June 8th_/[3]Restaurant/scored_restaurants.csv) to the **"Clean & Scored Data"** tab.
5.  Set sharing permissions to **"Anyone with link can view (ทุกคนที่มีลิงก์สามารถดูได้)"** (Crucial for Live Sync!).
6.  Copy the Spreadsheet ID from the URL of your browser (e.g. `https://docs.google.com/spreadsheets/d/`**`1XW999999999-PLACEHOLDER`**`/edit...`).

---

## Step 2: Enabling Google Sheets Live Sync in HTML

1.  Open the file [index.js](file:///f:/Work/Crazy Sprout/Test/Sent on June 8th_/[3]Restaurant/index.js) in your text editor.
2.  On line 7, locate the line:
    `const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";`
3.  Replace `YOUR_SPREADSHEET_ID` with the actual Google Spreadsheet ID you copied in Step 1.
4.  Save the file.
5.  *Now, whenever you open [index.html](file:///f:/Work/Crazy Sprout/Test/Sent on June 8th_/[3]Restaurant/index.html) or host it on Vercel, it will fetch the scores in real-time directly from Google Sheets! If you make updates, the webpage updates instantly.*

---

## Step 3: Importing the n8n Workflow

To configure the n8n pipeline:
1.  Open your n8n workspace in a browser and create a new workflow.
2.  Open the [n8n_workflow.json](file:///f:/Work/Crazy Sprout/Test/Sent on June 8th_/[3]Restaurant/n8n_workflow.json) file, copy the entire JSON text.
3.  Click anywhere on the n8n canvas and press `Ctrl + V` (or go to `Workflow settings > Import from File`).
4.  Configure the **Google Sheets Trigger** and **Write to Scored Data** nodes by clicking on them, clicking **Sign in with Google**, and selecting the Google Sheet you created in Step 1.
5.  Configure the **Call Gemini API (gemini-3.5-flash)** node:
    *   Change the API key query parameter in the URL from `YOUR_GEMINI_API_KEY` to your actual Gemini API key:
        `AQ.Ab8RN6KhRJvYUVVAqa2gTZXfqz2Bc49kJw6BzogwYGB6r8sT8Q`
6.  Test the flow by adding a new row in Google Sheets under the **`Raw Data`** tab and verifying that n8n adds the scored row to the **`Clean & Scored Data`** tab.
    *   **Crucial Test Fields for `Raw Data` tab**:
        *   **placeId**: `test-id-999`
        *   **title**: `ร้านหมูกระทะพรีเมียมเตาถ่าน (เทสระบบ)`
        *   **categoryName**: `หมูกระทะ`
        *   **totalScore**: `4.9` (คะแนน Rating ดั้งเดิม)
        *   **reviewsCount**: `250`
        *   **price**: `฿300-500`
        *   **address**: `ซอยอารีย์ 3 พญาไท`
        *   **website**: `https://testmookata.com`
        *   **phone**: `089-999-9999`
        *   **openingHours**: `17:00 - 23:00`
        *   **url**: `https://maps.google.com/test`
        *   **searchString**: `ร้านอาหาร อารีย์` (จำเป็นสำหรับระบบนำไปคำนวณย่าน district เป็น Ari อัตโนมัติ)
7.  Verify that a scored row appears at the bottom of the **`Clean & Scored Data`** tab with district `Ari`, scores, and Thai suitability notes! Take a screenshot as **Automation Evidence**.
8.  Turn the workflow **ON**.

---

## Step 4: Deploying to Vercel (Web Hosting)

1.  Sign in to [Vercel](https://vercel.com/) (free).
2.  Drag and drop the folder `F:\Work\Crazy Sprout\Test\Sent on June 8th_\[3]Restaurant` directly onto the Vercel dashboard.
3.  Vercel will build and deploy the files in 10 seconds.
4.  You will get a live link (e.g., `https://restaurant-recommender.vercel.app`) that you can submit as your final website link!

---

## Interactive Features Guide (Newly Added)

We have upgraded the dashboard with advanced interactive features to ensure a premium user experience and secure the highest grades in the AI Workflow Exam:

1.  **Google Sheets Live Reload Button**:
    *   Located in the dashboard header.
    *   Clicking **"รีโหลดข้อมูล"** triggers a fetch query to Google Sheets, updating the cards, tables, and review queues with a loading animation.
2.  **District & Category Multi-faceted Filters**:
    *   Available in the **"ทั้งหมด (All)"** tab.
    *   Allows users to filter all 100 restaurants by District, Food Category, Scenario (Budget-friendly, Fast Service, Meeting-friendly, Team-friendly), and Price Level in real-time.
3.  **Live "Ask AI" Chat (Gemini 3.5 Flash)**:
    *   Located at the bottom of the dashboard.
    *   Uses your configured Gemini API key to make live API calls.
    *   Injects your local restaurant dataset as prompt context, meaning the AI answers questions *exclusively* based on your Google Sheets data.
    *   Fallback logic ensures matching results are displayed even if the API quota limits are hit.
4.  **Human Review Queue (Human-in-the-loop)**:
    *   Docks at the bottom, listing restaurants with `< 150` reviews (which might have lower reliability for automatic AI scoring).
    *   Provides direct Google Maps review links so humans can read real reviews.
    *   Provides interactive `Approve` / `Pending` / `Reject` buttons that persist their selection state in `localStorage` across page reloads.

---

## Step 5: Mobile UX/UI & Responsiveness Optimizations (Newly Completed)

To ensure the dashboard operates flawlessly on smartphones and tablets, we have completed the following mobile enhancements:

1.  **Mobile Table-to-Card Transformations**:
    *   **Top 10 Ranking Table**: On viewports $\le$ 768px, the table elements are transformed using CSS Flexbox/Block rules into a series of beautiful card components. This removes horizontal scrollbars, presents the Rank Badge and Name prominently at the top of each item, and lists the scores, categories, and ratings in a clean, vertical key-value list.
    *   **Human Review Queue Table**: Converts into vertical cards on mobile. The action items (Approve, Pending, Reject) are arranged in a responsive $3$-column layout, making the buttons large and easy to click with fingers (thumb-friendly).
2.  **Layout Spacing and Gap Tightening**:
    *   Removed inline CSS overrides (`style="margin-bottom: 40px;"`) in the HTML markup.
    *   Replaced them with unified responsive CSS layout gaps (`20px` on mobile, scaling up to `40px`/`50px` on desktop) to eliminate the "scattered data" feeling.
    *   Reduced card padding from `30px` to `16px` on mobile screens to maximize screen real estate and increase data density.
3.  **Filter Panel Grid Optimization**:
    *   Adjusted the filter panel grid on screens $\le$ 768px to display in a $2 \times 2$ grid layout. This is much more compact and easier to use than a single-column stack, preventing excessive scrolling.
4.  **Typography & Logo Sizing**:
    *   Rescaled header logo and font sizes dynamically. Title text wraps beautifully and doesn't break header borders on small screen widths down to 320px.
5.  **Top 3 Recommendation Cards & Trade-off Comparison Cards**:
    *   **In-flow Badges (Top 3 Cards)**: Changed the position of Rank 1, 2, and 3 badges from absolute positioning to natural document flow (placed inside the card-title-area, above the name) to guarantee they never overlap restaurant titles.
    *   **Cohesive Rank-Specific Themes (Both Sections)**:
        *   **อันดับ 1 (Gold)**: Styled with a gold gradient, golden glow, and a premium gold stripe across the top of the cards. The title texts are colored gold (`#ffe066`).
        *   **อันดับ 2 (Silver)**: Styled with a slate/silver gradient, silver glow, slate/silver top stripe, and silver-white title texts (`#e2e8f0`).
        *   **อันดับ 3 (Bronze)**: Styled with a copper/bronze gradient, copper glow, bronze top stripe, and warm bronze title texts (`#edbb99`).

---

## Step 6: Header Metadata (Date & Creator) (Newly Completed)

Added a professional metadata block to the top-right corner of the header next to the Live Reload button:
1.  **Date Info**: Displays a static exam date: **7 June 2026** using a calendar icon (`fa-calendar-days`).
2.  **Creator Info**: Displays the authors' names: **ชินภัทร คล่องนาวา** using a user icon (`fa-user`) and **DS M: Toey** using a brand-specific Discord icon (`fa-discord`) wrapped in a clickable hyperlink.
3.  **Responsive Layout**: On mobile screens, the metadata block stacks vertically and center-aligns, keeping the header clean and readable.
4.  **Clickable Discord Integration**: Clicking the Discord username triggers a redirect to the user's Discord profile in a new tab (`target="_blank`), utilizing their actual Discord ID URL: `https://discord.com/users/365891253692268547`.


