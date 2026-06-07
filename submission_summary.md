# Submission Summary & Prompt Log

**โครงการ:** AI Food Assistant - ระบบแนะนำและจัดอันดับร้านอาหารสำหรับทีมขนาดใหญ่ (8-12 คน)  
**วิชา:** AI Workflow  
**ผู้จัดทำ:** นายชินภัทร คล่องนาวา | **Discord:** DS M: Toey  
**วันที่ส่งงาน:** 7 June 2026  

---

## 1. วัตถุประสงค์โครงการ (Project Objective)
ตอบคำถามโจทย์สำคัญ: **"หากต้องเลือกร้านอาหาร 1–3 ร้าน สำหรับจัดมื้อค่ำทีมขนาด 8-12 คน ในย่านธุรกิจหลัก (สยาม, อารีย์, ทองหล่อ, อโศก, พร้อมพงษ์) ร้านไหนตอบโจทย์และมีความคุ้มค่าสูงสุด?"**
ระบบนี้ช่วยแก้ไขปัญหานี้โดยสร้างไปป์ไลน์ประเมินผลอัตโนมัติด้วย AI ที่วิเคราะห์ข้อมูลจริง 100 ร้านจาก Google Maps ตามเกณฑ์ Rubric 100 คะแนนเต็ม และนำเสนอผลลัพธ์ในลักษณะของ Real-time Dashboard ที่โต้ตอบได้และรองรับการใช้งานบนมือถืออย่างสมบูรณ์แบบ

---

## 2. สถาปัตยกรรมระบบ (System Architecture)
ระบบถูกออกแบบเป็นระบบประมวลผลข้อมูล AI แบบทิศทางเดียว (Single-direction AI Pipeline) ดังนี้:
1.  **Data Extraction (Apify Scraper)**: ดึงข้อมูลดิบของร้านอาหาร 100 ร้านจาก Google Maps โดยตรง (พิกัด ข้อมูลการติดต่อ รีวิว ช่วงราคา ประเภทอาหาร)
2.  **Database Storage (Google Sheets)**: จัดเก็บข้อมูลในตารางคลาวด์แยกเป็น 2 แท็บหลัก:
    *   `Raw Data`: ข้อมูลดิบที่เพิ่งได้จากการ Scrape
    *   `Clean & Scored Data`: ข้อมูลที่ผ่านกระบวนการ AIประเมินผลคะแนนแล้ว
3.  **Orchestrator & AI Engine (n8n + Gemini 3.5 Flash)**: ตรวจจับเมื่อมีการเพิ่มหรือแก้ไขแถวข้อมูลดิบ จากนั้นส่งไปให้ Gemini 3.5 Flash คำนวณจำแนกคะแนนตามเกณฑ์แบบเรียลไทม์ และทำการบันทึกข้อมูลย้อนกลับไปยังแท็บคัดกรองแบบอัปเดตทับข้อมูลเดิม (Upsert)
4.  **Frontend Interface (HTML5 / Vanilla CSS3 / JavaScript)**: หน้าเว็บนำเสนอข้อมูลแนว Dark Glassmorphic ดึงข้อมูลเรียลไทม์ผ่าน Google Visualization API (Live Sync) มีระบบถาม-ตอบ AI แชทจำลอง, คิวตรวจสอบรีวิวต่ำ และแสดงผลเป็น Responsive Card Layout บนหน้าจอมือถือ

---

## 3. ข้อมูลตาราง Google Sheets (Data Schema)
*   **แท็บ Raw Data**: เก็บฟิลด์ดิบจากการ Scrape เช่น `placeId`, `title`, `categoryName`, `totalScore` (Rating ดั้งเดิม), `reviewsCount`, `price`, `address`, `website`, `phone`, `openingHours`, `url`, `searchString`
*   **แท็บ Clean & Scored Data**: ประกอบด้วย 20 คอลัมน์สำหรับเปรียบเทียบอันดับ:
    `placeId` | `title` | `district` | `category` | `rating` | `reviewsCount` | `priceRange` | `address` | `website` | `phone` | `openingHours` | `url` | `ratingScore` | `groupSuitabilityScore` | `priceSuitabilityScore` | `travelConvenienceScore` | `dataCompletenessScore` | `uniquenessScore` | `totalScore` | `suitabilityNotes`

---

## 4. บันทึกคำสั่งไปป์ไลน์ n8n (n8n Workflow Prompt Log)

ไปป์ไลน์ n8n มีโครงสร้าง 4 โหนดหลัก ดังนี้:
1.  **Google Sheets Trigger**: ตรวจจับความเปลี่ยนแปลงแบบตรวจซ้ำทุก 1 นาทีในแท็บ `Raw Data`
2.  **Call Gemini API**: รันคำสั่ง HTTP Request ไปยัง `generativelanguage.googleapis.com` (โมเดล `gemini-3.5-flash`)
3.  **Parse Gemini Response**: สกัดคำตอบ JSON ของ AI และคำนวณย่าน (District) อัตโนมัติจากคำค้นหา
4.  **Write to Scored Data**: ใช้คำสั่ง `Upsert` ลงแท็บ `Clean & Scored Data` อิงคีย์ `placeId`

### [Prompt Log] คำสั่งควบคุมการให้คะแนนของ Gemini ใน n8n
```text
You are a local food critic and data analyst in Bangkok. Score this restaurant for a team dinner of 8-12 people based on its properties:
Title: {{ $json.title }}
Category: {{ $json.categoryName }}
Rating: {{ $json.totalScore }}
Reviews: {{ $json.reviewsCount }}
Price: {{ $json.price }}
Address: {{ $json.address }}

Calculate the scores according to these rules:
1. ratingScore (Max 25): (Rating / 5) * 15 + (log10(Reviews) / log10(5000)) * 10, capped at 10.
2. groupSuitabilityScore (Max 20): Evaluate if the type of food, space, and category is suitable for a team of 8-12 (e.g. Shabu, BBQ, big Thai tables score 17-20. Small coffee shops or noodle stalls score 5-10).
3. priceSuitabilityScore (Max 15): Moderate price is 15, very cheap is 10, very expensive is 8.
4. travelConvenienceScore (Max 15): Distance from BTS/MRT (e.g., 15 for close walk, 8-10 for deep in alleys).
5. dataCompletenessScore (Max 15): 2.5 points for each non-empty field (website, phone, address, price, openingHours, url).
6. uniquenessScore (Max 10): Michelin, awards, great view, or popularity.

Sum them to get totalScore. Also write suitabilityNotes in Thai explaining why it fits.

Respond ONLY with a JSON object containing these keys:
ratingScore (number),
groupSuitabilityScore (number),
priceSuitabilityScore (number),
travelConvenienceScore (number),
dataCompletenessScore (number),
uniquenessScore (number),
totalScore (number),
suitabilityNotes (string in Thai)
```

---

## 5. การวิเคราะห์ข้อมูลเบื้องหน้า (Frontend Interactive Features & Prompt Log)

1.  **Google Sheets Live Sync**: หน้าบ้านจะใช้คำสั่ง Javascript ในการยิงคำร้องแบบดึงข้อมูล (Fetch) ไปที่ Google Sheets JSON endpoint ทำให้ข้อมูลอัปเดตแบบเรียลไทม์ทันทีเมื่อมีข้อมูลเปลี่ยนแปลงในแผ่นงาน
2.  **Ask AI Mode (Gemini 3.5 Flash Integration)**:
    *   **Prompt Context**: ดึงข้อมูลร้านอาหาร 55 อันดับแรกมาแปลงเป็นรูปแบบ JSON ย่อและใส่ต่อท้าย System Prompt เพื่อควบคุมให้ AI ตอบคำถามอยู่บนพื้นฐานข้อมูลจริงเท่านั้น ป้องกันการกุเรื่องของโมเดล (Anti-hallucination)
    *   **Fallback Search**: หาก API Key มีปัญหาหรือสิทธิ์การใช้งานของ Gemini โควต้าหมด ระบบจะสลับไปรันคำสั่งกรองร้านผ่านการเช็กคำหลัก (Keyword-based search) ในตารางทันที ทำให้แชทไม่ล่มและยังให้คำตอบที่อ้างอิงร้านอาหารจริงได้อยู่
3.  **Human Review Queue**:
    *   ดักจับร้านที่มีจำนวนรีวิวน้อยกว่า 150 รีวิวทันที เพื่อคัดแยกให้มนุษย์เข้าไปเปิดลิงก์ Google Maps อ่านรีวิวจริงประกอบการตัดสินใจก่อนอนุมัติ
    *   ปุ่ม Approve / Reject ทำงานร่วมกับ `localStorage` ของเบราว์เซอร์เพื่อคงสถานะเดิมไว้แม้จะกดรีเฟรชหน้าจอ

### [Prompt Log] คำสั่งควบคุมระบบสนทนาบนเว็บแอปพลิเคชัน (Ask AI System Prompt)
```text
You are a local food critic and AI Food Assistant in Bangkok. Your goal is to answer queries strictly based on the following JSON restaurant dataset.
Dataset: [condensed_restaurant_data_in_json]

Guidelines:
1. Only answer queries using the restaurants in the provided dataset. Do NOT make up any restaurants that are not in the list.
2. Recommend 1-3 restaurants that best match the user's query. Explain why based on their scores, price, or suitability notes in the dataset.
3. Keep the response short, professional, and in Thai. Recommend using bold formatting for restaurant names.
4. If there are no restaurants matching the request, politely say so in Thai and suggest options from the dataset.

User Question: [user_query]
```

---

## 6. การออกแบบและการตอบสนองต่อผู้ใช้งานมือถือ (Mobile Responsive & Spacing Fixes)
ความท้าทายหลักบนอุปกรณ์เคลื่อนที่คือ **"หน้าจอแตกและตารางแสดงผลซ้อนทับกัน"** ได้รับการปรับปรุงสไตล์การดีไซน์ดังนี้:
1.  **การแปลงตารางเป็น Card (Table-to-Card Transformation)**:
    *   ตารางจัดอันดับ Top 10 และตารางคิวตรวจสอบรีวิวต่ำ จะถูกซ่อนหัวตารางทิ้งเมื่อแสดงผลบนจอ $\le$ 768px และแปลงแถวข้อมูล (`<tr>` และ `<td>`) ให้แสดงผลเป็นลักษณะของกล่องข้อมูลอิสระ (Cards) ทีละบล็อก
    *   สกัดหัวข้อมาพาดเป็นฉลากประกอบค่าข้อมูลผ่านคุณสมบัติ `data-label` ที่ตั้งค่าไว้แบบเรียลไทม์ใน JavaScript ทำให้ผู้ใช้สมาร์ตโฟนสามารถเลื่อนอ่านชื่อร้าน, ประเภทอาหาร, และเกณฑ์คะแนนแบบแนวตั้งได้อย่างสบายตา
2.  **ปรับลดระยะ Spacing & Padding**:
    *   นำคำสั่งเว้นระยะบรรทัดแบบ inline (`margin-bottom: 40px;`) ออกทั้งหมด และเปลี่ยนมาใช้ responsive CSS classes ที่จะลดระยะช่องว่างเหลือเพียง 20px บนหน้าจอมือถือโดยอัตโนมัติ เพื่อประหยัดพื้นที่แนวตั้ง
    *   ลดระยะ Padding ของ Glass Card จาก 30px เหลือ 16px/12px เพื่อเพิ่มความหนาแน่นของข้อมูล (Data Density)
3.  **จัดวางปุ่มกดแบบเป็นมิตรต่อสัมผัส (Thumb-friendly Layout)**:
    *   ปุ่มควบคุมในตารางคิวตรวจพิจารณา (Approve, Pending, Reject) ถูกปรับสเกลเป็นปุ่มกว้างในตาราง 3 คอลัมน์แนวตั้งที่กดง่ายขึ้นด้วยนิ้วโป้งบนหน้าจอมือถือ
4.  **แถบสีระดับพรีเมียม (Distinct Rank Styling)**:
    *   การ์ดแนะนำและประเมิน Trade-off อันดับ 1, 2, และ 3 ได้รับการแยกเฉดสีออกจากกันอย่างชัดเจนตามธีม ทอง (Gold), เงิน (Silver), และทองแดง (Bronze) เพื่อแยกการแสดงผลและเพิ่มความพรีเมียมให้หน้าเว็บ

---

## 7. บทสรุปการเรียนรู้และการแก้ปัญหา (Short Reflection & Lessons Learned)
1.  ** encoding ของภาษาไทย**: การ Scraping และส่ง JSON ไปยัง Gemini ในช่วงแรกภาษาไทยเพี้ยนและวิเคราะห์พิกัดผิดพลาด แก้ไขโดยการใช้ UTF-8 encoding และเรียกคำสั่ง API ผ่าน curl ภายนอก
2.  **การควบคุมความซ้ำซ้อนข้อมูล (n8n Upsert)**: หาก n8n บันทึกข้อมูลแบบ Append ธรรมดา ข้อมูลเดิมที่ถูกแก้ไขในชีตดิบจะถูกเพิ่มเข้าไปเป็นแถวใหม่เสมอ ทำให้เกิดแถวร้านซ้ำซ้อนเป็นจำนวนมากใน Clean & Scored Data แก้ปัญหาโดยกำหนดให้ n8n ดำเนินงานในโหมด `Upsert` โดยใช้คีย์เชื่อมโยง `placeId`
3.  **ปัญหา JSON พังใน n8n**: เมื่อชื่อร้านอาหารมีเครื่องหมายวงเล็บหรืออัญประกาศ เช่น *ร้านหมูกระทะพรีเมียมเตาถ่าน (เทสระบบ)* โครงสร้าง JSON payload ที่ส่งไปยัง Gemini API จะเกิดปัญหามิดเดิลแวร์ตัดคำและเออเร่อ Bad Request (400) เสมอ ปัญหานี้แก้ไขโดยการครอบ JSON Body ทั้งชุดด้วยคำสั่งจาวาสคริปต์ `JSON.stringify({...})` แทนการเขียน Object เปล่าใน Expression
