// ==========================================
// Google Sheets Live Sync Configuration
// ==========================================
// คัดลอก ID ของ Google Sheets ของคุณมาวางตรงนี้ (ID คือตัวอักษรยาวๆ ใน URL ของ Google Sheets)
// หากละไว้เป็น "YOUR_SPREADSHEET_ID" ระบบจะใช้ข้อมูลสำรองจากไฟล์ data.js แทน
const SPREADSHEET_ID = "1ZzkZkhTLydVpw4I3JGyqaxFNbDOsVp54TFGHd1cMhFI";
const SHEET_NAME = "Clean & Scored Data";

// Global data array
let currentRestaurants = [];

// District Theme Configurations
const districtThemes = {
    Ari: {
        accent: "#00c9a7",
        glow: "rgba(0, 201, 167, 0.15)",
        rgb: "0, 201, 167"
    },
    Siam: {
        accent: "#ff4b72",
        glow: "rgba(255, 75, 114, 0.15)",
        rgb: "255, 75, 114"
    },
    Thonglor: {
        accent: "#845ec2",
        glow: "rgba(132, 94, 194, 0.15)",
        rgb: "132, 94, 194"
    },
    Asoke: {
        accent: "#0081cf",
        glow: "rgba(0, 129, 207, 0.15)",
        rgb: "0, 129, 207"
    },
    "Phrom Phong": {
        accent: "#ff9671",
        glow: "rgba(255, 150, 113, 0.15)",
        rgb: "255, 150, 113"
    },
    All: {
        accent: "#6366f1",
        glow: "rgba(99, 102, 241, 0.15)",
        rgb: "99, 102, 241"
    }
};

// Dynamic Trade-off Generator based on data
function generateTradeOffs(item) {
    const pros = [];
    const cons = [];

    const rating = parseFloat(item.rating) || 3.5;
    if (rating >= 4.6) {
        pros.push(`คะแนนรีวิวสูงมาก (${rating}/5) มั่นใจได้ในคุณภาพอาหารและบริการ`);
    } else {
        cons.push(`เรตติ้งระดับปานกลาง (${rating}/5) อาจมีรีวิวติดลบในบางจุดบริการ`);
    }

    const reviews = parseInt(item.reviewsCount) || 0;
    if (reviews >= 1000) {
        pros.push(`ฐานเสียงรีวิวหนาแน่น (${reviews.toLocaleString()} รีวิว) มีความเสถียรและน่าเชื่อถือสูง`);
    } else if (reviews < 150) {
        cons.push(`จำนวนรีวิวค่อนข้างน้อย (${reviews} รีวิว) เป็นตัวเลือกใหม่ที่ยังไม่ได้รับการรีวิวในวงกว้าง`);
    }

    const cat = (item.category || "").toLowerCase();
    if (cat.includes("ชาบู") || cat.includes("บุฟเฟ") || cat.includes("ปิ้งย่าง") || cat.includes("shabu") || cat.includes("buffet") || cat.includes("bbq") || cat.includes("หมูกระทะ")) {
        pros.push("อาหารเป็นเตารวม/แชร์ หรือบุฟเฟต์ เหมาะอย่างยิ่งสำหรับการละลายพฤติกรรมและการสังสรรค์ในทีม");
    } else if (cat.includes("คาเฟ่") || cat.includes("กาแฟ") || cat.includes("cafe") || cat.includes("coffee")) {
        cons.push("เน้นเมนูอาหารจานเดี่ยวหรือของหวาน พื้นที่นั่งรวมกันสำหรับ 12 คนอาจจำกัดและไม่สะดวกสบาย");
    }

    const travelScore = parseFloat(item.travelConvenienceScore) || 12;
    if (travelScore >= 14) {
        pros.push("ทำเลเด่นมาก เดินเท้าสั้นๆ จากรถไฟฟ้า BTS/MRT ทีมงานเดินทางสะดวกหลังเลิกงาน");
    } else if (travelScore < 11) {
        cons.push("อยู่ในซอยย่อยลึกพอสมควร การเดินเท้าอาจเหนื่อยเล็กน้อย อาจต้องต่อมอเตอร์ไซค์รับจ้าง");
    }
    
    const priceScore = parseFloat(item.priceSuitabilityScore) || 12;
    if (priceScore >= 14) {
        pros.push(`งบประมาณเหมาะสม (${item.priceRange || "฿200-400"}) คุมรายจ่ายมื้อทีมได้ง่ายและคุ้มค่า`);
    } else if (priceScore <= 9) {
        cons.push(`ระดับราคาค่อนข้างสูง (${item.priceRange || "฿1,000+"}) ต้องระมัดระวังปริมาณการสั่งอาหารเพื่อไม่ให้เกินงบ`);
    } else {
        pros.push(`ช่วงราคามาตรฐาน (${item.priceRange || "฿200-600"}) มีความหลากหลายของราคาให้เลือกเหมาะสม`);
    }
    
    if (pros.length < 2) pros.push("ประเภทอาหารเป็นแบบจานกลางเอื้อต่อการทานร่วมกันของกลุ่มใหญ่");
    if (cons.length < 1) cons.push("เนื่องจากเป็นร้านยอดนิยมในช่วงเย็น แนะนำให้โทรสำรองที่นั่งล่วงหน้าอย่างน้อย 3-5 วัน");

    return { pros, cons };
}

// Set Active Theme Color
function applyTheme(district) {
    const theme = districtThemes[district] || districtThemes["Ari"];
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--accent-glow', theme.glow);
    document.documentElement.style.setProperty('--accent-rgb', theme.rgb);
}

// Get Scenario Text and Icon based on data
function getScenarioTextAndIcon(item) {
    const cat = (item.category || "").toLowerCase();
    const notes = (item.suitabilityNotes || "").toLowerCase();
    const groupScore = parseFloat(item.groupSuitabilityScore) || 0;
    const priceScore = parseFloat(item.priceSuitabilityScore) || 0;
    const reviews = parseInt(item.reviewsCount) || 0;
    
    if (cat.includes("ชาบู") || cat.includes("ปิ้งย่าง") || cat.includes("บุฟเฟ่ต์") || cat.includes("shabu") || cat.includes("buffet") || cat.includes("หมูกระทะ") || groupScore >= 17) {
        return "👥 เหมาะกับทีม (โต๊ะใหญ่/ร้านกว้าง)";
    }
    if (priceScore >= 14 || item.priceRange.includes("฿100") || item.priceRange.includes("฿200-400")) {
        return "💰 ราคาประหยัดสุด (คุมงบง่าย)";
    }
    if (cat.includes("คาเฟ่") || cat.includes("กาแฟ") || cat.includes("cafe") || cat.includes("อิตาเลียน") || notes.includes("ส่วนตัว") || notes.includes("คุย")) {
        return "💬 คุยงานได้ (นั่งคุยสะดวก)";
    }
    if (cat.includes("ราเมน") || cat.includes("จานเดี่ยว") || cat.includes("noodle") || reviews > 3000) {
        return "⚡ บริการไว (รีบกินรีบไป)";
    }
    return "👥 เหมาะกับทีม (โต๊ะใหญ่/ร้านกว้าง)";
}

// Match scenario check
function isMatchScenario(item, scenario) {
    if (scenario === "All") return true;
    const cat = (item.category || "").toLowerCase();
    const notes = (item.suitabilityNotes || "").toLowerCase();
    const groupScore = parseFloat(item.groupSuitabilityScore) || 0;
    const priceScore = parseFloat(item.priceSuitabilityScore) || 0;
    const reviews = parseInt(item.reviewsCount) || 0;
    
    if (scenario === "team") {
        return cat.includes("ชาบู") || cat.includes("ปิ้งย่าง") || cat.includes("บุฟเฟ่ต์") || cat.includes("shabu") || cat.includes("buffet") || cat.includes("หมูกระทะ") || groupScore >= 17;
    }
    if (scenario === "budget") {
        return priceScore >= 14 || item.priceRange.includes("฿100") || item.priceRange.includes("฿200-400");
    }
    if (scenario === "meeting") {
        return cat.includes("คาเฟ่") || cat.includes("กาแฟ") || cat.includes("cafe") || cat.includes("อิตาเลียน") || notes.includes("ส่วนตัว") || notes.includes("คุย");
    }
    if (scenario === "fast") {
        return cat.includes("ราเมน") || cat.includes("จานเดี่ยว") || cat.includes("noodle") || reviews > 3000;
    }
    return true;
}

// Match price check
function isMatchPrice(item, priceRange) {
    if (priceRange === "All") return true;
    const priceScore = parseFloat(item.priceSuitabilityScore) || 0;
    if (priceRange === "cheap") return priceScore >= 14;
    if (priceRange === "medium") return priceScore >= 10 && priceScore <= 13;
    if (priceRange === "expensive") return priceScore <= 9;
    return true;
}

// Render Dashboard Data
function renderDashboard(district) {
    applyTheme(district);
    
    const filterPanel = document.getElementById("filter-panel");
    let filteredData = [];
    
    if (district === "All") {
        if (filterPanel) filterPanel.style.display = "block";
        
        // Read filter values
        const fDistrict = document.getElementById("filter-district").value;
        const fCategory = document.getElementById("filter-category").value;
        const fScenario = document.getElementById("filter-scenario").value;
        const fPrice = document.getElementById("filter-price").value;
        
        filteredData = currentRestaurants.filter(item => {
            const matchDistrict = (fDistrict === "All" || item.district === fDistrict);
            const matchCategory = (fCategory === "All" || item.category === fCategory);
            const matchScenario = isMatchScenario(item, fScenario);
            const matchPrice = isMatchPrice(item, fPrice);
            return matchDistrict && matchCategory && matchScenario && matchPrice;
        });
    } else {
        if (filterPanel) filterPanel.style.display = "none";
        filteredData = currentRestaurants.filter(item => item.district === district);
    }
    
    // Sort by totalScore descending
    filteredData.sort((a, b) => (parseFloat(b.totalScore) || 0) - (parseFloat(a.totalScore) || 0));

    // Update count badge
    document.getElementById("results-count").textContent = `พบ ${filteredData.length} ร้านค้า`;

    // 1. Render Top 3 Recommendation Cards
    const top3Container = document.getElementById("top-3-container");
    top3Container.innerHTML = "";
    
    if (filteredData.length === 0) {
        top3Container.innerHTML = `
            <div class="glass-card text-center" style="grid-column: span 3; padding: 50px; color: var(--text-muted);">
                <i class="fa-solid fa-folder-open" style="font-size: 3rem; color: var(--accent); margin-bottom: 15px;"></i>
                <h3>ไม่พบข้อมูลร้านอาหาร</h3>
                <p style="margin-top: 10px;">ลองปรับเปลี่ยนเงื่อนไขในตัวกรองเพื่อค้นหาอีกครั้งครับ</p>
            </div>
        `;
        document.getElementById("table-body").innerHTML = `
            <tr><td colspan="9" class="text-center" style="color: var(--text-muted); padding: 30px;">ไม่พบร้านอาหารที่ตรงกับตัวกรอง</td></tr>
        `;
        document.getElementById("comparison-container").innerHTML = `
            <div class="glass-card text-center" style="grid-column: span 3; padding: 20px; color: var(--text-muted);">ไม่มีข้อมูลสำหรับเปรียบเทียบ</div>
        `;
        return;
    }

    const top3 = filteredData.slice(0, 3);
    top3.forEach((item, index) => {
        const rating = item.rating || "3.5";
        const reviews = parseInt(item.reviewsCount) ? parseInt(item.reviewsCount).toLocaleString() : "0";
        const websiteText = item.website && item.website !== "website" ? `<div class="detail-row"><i class="fa-solid fa-globe"></i><span>${item.website.substring(0, 30)}...</span></div>` : "";
        const phoneText = item.phone && item.phone !== "phone" ? `<div class="detail-row"><i class="fa-solid fa-phone"></i><span>${item.phone}</span></div>` : "";
        
        const cardHtml = `
            <div class="glass-card recommendation-card">
                <div class="card-badge"><i class="fa-solid fa-trophy"></i> อันดับ ${index + 1}</div>
                <div class="card-top">
                    <div class="card-title-area">
                        <h3>${item.title}</h3>
                        <span class="card-category">${item.category || "ร้านอาหาร"}</span>
                        <div style="margin-top: 6px;"><span class="scenario-badge">${getScenarioTextAndIcon(item)}</span></div>
                    </div>
                    <div class="score-circle">
                        <span class="score-num">${item.totalScore}</span>
                        <span class="score-max">/100</span>
                    </div>
                </div>
                <div class="card-stats">
                    <span class="stat-item"><i class="fa-solid fa-star"></i> ${rating}</span>
                    <span class="stat-item"><i class="fa-solid fa-comment-dots"></i> ${reviews} รีวิว</span>
                    <span class="stat-item"><i class="fa-solid fa-money-bill-wave"></i> ${item.priceRange || "฿200-400"}</span>
                </div>
                <div class="card-body">
                    <div class="suitability-box">
                        <h4><i class="fa-solid fa-lightbulb"></i> เหตุผลความเหมาะสม</h4>
                        <p>${item.suitabilityNotes}</p>
                    </div>
                    <div class="card-details">
                        <div class="detail-row">
                            <i class="fa-solid fa-location-dot"></i>
                            <span>${item.address ? item.address.substring(0, 60) + '...' : 'ย่าน ' + (item.district || district)}</span>
                        </div>
                        ${phoneText}
                        ${websiteText}
                        <div class="detail-row">
                            <i class="fa-solid fa-clock"></i>
                            <span>${item.openingHours && item.openingHours !== "openingHours" ? item.openingHours.substring(0, 60) + '...' : 'เวลาเปิดตามรายละเอียด Google Maps'}</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <a href="${item.url || '#'}" target="_blank" class="btn btn-card-map">
                        <i class="fa-solid fa-map-location-dot"></i> เปิดดูตำแหน่งใน Google Maps
                    </a>
                </div>
            </div>
        `;
        top3Container.innerHTML += cardHtml;
    });

    // 2. Render Top 10 Table Rows
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";
    
    const top10 = filteredData.slice(0, 10);
    top10.forEach((item, index) => {
        const rating = item.rating || "3.5";
        const reviews = parseInt(item.reviewsCount) ? parseInt(item.reviewsCount).toLocaleString() : "0";
        const isTop3 = index < 3;
        
        let rankClass = "rank-other";
        if (index === 0) rankClass = "rank-1";
        else if (index === 1) rankClass = "rank-2";
        else if (index === 2) rankClass = "rank-3";
        
        const rowHtml = `
            <tr class="${isTop3 ? 'top-3-row' : ''}">
                <td class="text-center">
                    <span class="rank-badge ${rankClass}">${index + 1}</span>
                </td>
                <td>
                    <span class="restaurant-name">${item.title}</span>
                </td>
                <td>${item.category || "ร้านอาหาร"}</td>
                <td class="text-center cell-score">${item.totalScore}</td>
                <td class="text-center"><i class="fa-solid fa-star text-gold"></i> ${rating}</td>
                <td class="text-center">${reviews}</td>
                <td class="text-center">${item.priceRange || "฿200-400"}</td>
                <td style="font-size: 0.9rem;">
                    <strong>${item.suitabilityNotes}</strong>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">${item.address ? item.address.substring(0, 75) + '...' : ''} (ย่าน ${item.district})</div>
                </td>
                <td class="text-center">
                    <a href="${item.url || '#'}" target="_blank" class="map-link">
                        <i class="fa-solid fa-location-arrow"></i>
                    </a>
                </td>
            </tr>
        `;
        tableBody.innerHTML += rowHtml;
    });

    // 3. Render Trade-off Cards
    const comparisonContainer = document.getElementById("comparison-container");
    comparisonContainer.innerHTML = "";

    top3.forEach((item, index) => {
        const { pros, cons } = generateTradeOffs(item);

        const prosHtml = pros.map(pro => `<li><i class="fa-solid fa-circle-check"></i><span>${pro}</span></li>`).join("");
        const consHtml = cons.map(con => `<li><i class="fa-solid fa-circle-xmark"></i><span>${con}</span></li>`).join("");

        const compHtml = `
            <div class="glass-card comparison-card">
                <h3>อันดับ ${index + 1}: ${item.title}</h3>
                <ul class="comp-list comp-pros">
                    ${prosHtml}
                </ul>
                <ul class="comp-list comp-cons">
                    ${consHtml}
                </ul>
            </div>
        `;
        comparisonContainer.innerHTML += compHtml;
    });
}

// Fetch Live Data from Google Sheets API
function fetchGoogleSheetsData(spreadsheetId) {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
    
    return fetch(url)
        .then(res => {
            if (!res.ok) throw new Error("Network response was not ok");
            return res.text();
        })
        .then(text => {
            // Extract and parse JSON from the response text
            const jsonStart = text.indexOf('{');
            const jsonEnd = text.lastIndexOf('}') + 1;
            if (jsonStart === -1 || jsonEnd === -1) throw new Error("Invalid response format");
            
            const jsonString = text.substring(jsonStart, jsonEnd);
            const data = JSON.parse(jsonString);
            
            const rows = data.table.rows;
            if (!rows || rows.length === 0) throw new Error("No rows found in sheet");
            
            // Map table values
            const mapped = rows.map(r => {
                const c = r.c;
                return {
                    placeId: c[0] ? String(c[0].v) : "",
                    title: c[1] ? String(c[1].v) : "",
                    district: c[2] ? String(c[2].v) : "",
                    category: c[3] ? String(c[3].v) : "",
                    rating: c[4] ? String(c[4].v) : "3.5",
                    reviewsCount: c[5] ? parseInt(c[5].v) || 0 : 0,
                    priceRange: c[6] ? String(c[6].v) : "",
                    address: c[7] ? String(c[7].v) : "",
                    website: c[8] ? String(c[8].v) : "",
                    phone: c[9] ? String(c[9].v) : "",
                    openingHours: c[10] ? String(c[10].v) : "",
                    url: c[11] ? String(c[11].v) : "",
                    ratingScore: c[12] ? parseFloat(c[12].v) || 0 : 0,
                    groupSuitabilityScore: c[13] ? parseFloat(c[13].v) || 0 : 0,
                    priceSuitabilityScore: c[14] ? parseFloat(c[14].v) || 0 : 0,
                    travelConvenienceScore: c[15] ? parseFloat(c[15].v) || 0 : 0,
                    dataCompletenessScore: c[16] ? parseFloat(c[16].v) || 0 : 0,
                    uniquenessScore: c[17] ? parseFloat(c[17].v) || 0 : 0,
                    totalScore: c[18] ? parseFloat(c[18].v) || 0 : 0,
                    suitabilityNotes: c[19] ? String(c[19].v) : ""
                };
            });
            
            // Filter out header row and empty rows
            return mapped.filter(item => item.title !== "title" && item.title.trim() !== "");
        });
}

// Populate unique categories in filter dropdown
function populateCategoryFilter(data) {
    const catSelect = document.getElementById("filter-category");
    if (!catSelect) return;
    
    const selectedVal = catSelect.value;
    const categories = new Set();
    
    data.forEach(item => {
        if (item.category && item.category !== "category" && item.category.trim() !== "") {
            categories.add(item.category.trim());
        }
    });
    
    catSelect.innerHTML = `<option value="All">ทุกประเภท (${categories.size})</option>`;
    Array.from(categories).sort().forEach(cat => {
        catSelect.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
    
    if (Array.from(categories).includes(selectedVal)) {
        catSelect.value = selectedVal;
    } else {
        catSelect.value = "All";
    }
}

// Render Human Review Queue for low reviews count
function renderQueue(data) {
    const queueBody = document.getElementById("queue-body");
    if (!queueBody) return;
    
    const lowReviews = data.filter(item => {
        const reviews = parseInt(item.reviewsCount) || 0;
        return reviews > 0 && reviews < 150 && item.title.trim() !== "" && item.title !== "title";
    });
    
    if (lowReviews.length === 0) {
        queueBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center" style="color: var(--accent); padding: 30px;">
                    🎉 ยอดเยี่ยม! ไม่พบร้านอาหารที่มีรีวิวน้อยกว่า 150 ในระบบ ทุกร้านมีข้อมูลน่าเชื่อถือเพียงพอ
                </td>
            </tr>
        `;
        return;
    }
    
    queueBody.innerHTML = "";
    lowReviews.forEach(item => {
        const savedDecision = localStorage.getItem(`decision-${item.placeId}`) || "pending";
        
        let statusBadgeClass = "status-pending";
        let statusText = "⏳ รอการตรวจสอบ";
        if (savedDecision === "approve") {
            statusBadgeClass = "status-approved";
            statusText = "✅ อนุมัติแล้ว";
        } else if (savedDecision === "reject") {
            statusBadgeClass = "status-rejected";
            statusText = "❌ ปฏิเสธแล้ว";
        }
        
        const rowHtml = `
            <tr>
                <td><strong>${item.title}</strong></td>
                <td><span class="badge badge-accent">${item.district}</span></td>
                <td>${item.category || "ร้านอาหาร"}</td>
                <td class="text-center cell-score" style="color: #ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> ${item.reviewsCount}</td>
                <td class="text-center cell-score">${item.totalScore}</td>
                <td class="text-center">
                    <a href="${item.url || '#'}" target="_blank" class="map-link btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px;">
                        <i class="fa-solid fa-up-right-from-square"></i> อ่านรีวิวจริง
                    </a>
                </td>
                <td class="text-center">
                    <div class="decision-container">
                        <button class="btn-decision approve ${savedDecision === 'approve' ? 'active' : ''}" onclick="saveDecision('${item.placeId}', 'approve')">Approve</button>
                        <button class="btn-decision pending ${savedDecision === 'pending' ? 'active' : ''}" onclick="saveDecision('${item.placeId}', 'pending')">Pending</button>
                        <button class="btn-decision reject ${savedDecision === 'reject' ? 'active' : ''}" onclick="saveDecision('${item.placeId}', 'reject')">Reject</button>
                    </div>
                    <div style="margin-top: 5px;">
                        <span class="status-badge ${statusBadgeClass}">${statusText}</span>
                    </div>
                </td>
            </tr>
        `;
        queueBody.innerHTML += rowHtml;
    });
}

// Save decision from inline click
window.saveDecision = function(placeId, decision) {
    localStorage.setItem(`decision-${placeId}`, decision);
    renderQueue(currentRestaurants);
};

// Ask AI Chat UI Handler
function initAskAIChat() {
    const btnSend = document.getElementById("btn-chat-send");
    const chatInput = document.getElementById("chat-input");
    const chatMessages = document.getElementById("chat-messages");
    
    if (!btnSend || !chatInput || !chatMessages) return;
    
    // Prevent duplicate binding
    if (btnSend.getAttribute("data-bound") === "true") return;
    btnSend.setAttribute("data-bound", "true");
    
    function appendMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `message ${sender}-message`;
        msgDiv.innerHTML = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function handleSend() {
        const query = chatInput.value.trim();
        if (query === "") return;
        
        appendMessage(query, "user");
        chatInput.value = "";
        
        // Show typing indicator
        const typingDiv = document.createElement("div");
        typingDiv.className = "message ai-message loading-skeleton";
        typingDiv.style.width = "100px";
        typingDiv.style.height = "35px";
        typingDiv.id = "typing-indicator";
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Prepare context data
        const contextData = currentRestaurants.slice(0, 55).map(item => ({
            title: item.title,
            district: item.district,
            category: item.category,
            totalScore: item.totalScore,
            priceRange: item.priceRange,
            suitabilityNotes: item.suitabilityNotes
        }));
        
        const systemPrompt = `You are a local food critic and AI Food Assistant in Bangkok. Your goal is to answer queries strictly based on the following JSON restaurant dataset.
Dataset: ${JSON.stringify(contextData)}

Guidelines:
1. Only answer queries using the restaurants in the provided dataset. Do NOT make up any restaurants that are not in the list.
2. Recommend 1-3 restaurants that best match the user's query. Explain why based on their scores, price, or suitability notes in the dataset.
3. Keep the response short, professional, and in Thai. Recommend using bold formatting for restaurant names.
4. If there are no restaurants matching the request, politely say so in Thai and suggest options from the dataset.`;

        const apiKey = "AQ.Ab8RN6KhRJvYUVVAqa2gTZXfqz2Bc49kJw6BzogwYGB6r8sT8Q";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
        
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: `${systemPrompt}\n\nUser Question: ${query}` }
                        ]
                    }
                ]
            })
        })
        .then(res => {
            if (!res.ok) throw new Error("API call failed");
            return res.json();
        })
        .then(data => {
            const indicator = document.getElementById("typing-indicator");
            if (indicator) indicator.remove();
            
            const reply = data.candidates[0].content.parts[0].text;
            const formattedReply = reply
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br/>');
            
            appendMessage(formattedReply, "ai");
        })
        .catch(err => {
            console.error("Gemini chat error:", err);
            const indicator = document.getElementById("typing-indicator");
            if (indicator) indicator.remove();
            
            const queryLower = query.toLowerCase();
            let matches = [];
            
            if (queryLower.includes("ชาบู") || queryLower.includes("shabu") || queryLower.includes("บุฟเฟ่ต์")) {
                matches = currentRestaurants.filter(r => (r.category || "").toLowerCase().includes("ชาบู") || (r.category || "").toLowerCase().includes("shabu") || (r.category || "").toLowerCase().includes("บุฟเฟ่ต์"));
            } else if (queryLower.includes("ปิ้งย่าง") || queryLower.includes("bbq") || queryLower.includes("บาร์บีคิว")) {
                matches = currentRestaurants.filter(r => (r.category || "").toLowerCase().includes("ย่าง") || (r.category || "").toLowerCase().includes("bbq") || (r.category || "").toLowerCase().includes("บาร์บีคิว"));
            } else if (queryLower.includes("สยาม") || queryLower.includes("siam")) {
                matches = currentRestaurants.filter(r => r.district === "Siam");
            } else if (queryLower.includes("อารีย์") || queryLower.includes("ari")) {
                matches = currentRestaurants.filter(r => r.district === "Ari");
            } else if (queryLower.includes("ทองหล่อ") || queryLower.includes("thonglor")) {
                matches = currentRestaurants.filter(r => r.district === "Thonglor");
            } else if (queryLower.includes("อโศก") || queryLower.includes("asoke")) {
                matches = currentRestaurants.filter(r => r.district === "Asoke");
            } else if (queryLower.includes("พร้อมพงษ์") || queryLower.includes("phrom")) {
                matches = currentRestaurants.filter(r => r.district === "Phrom Phong");
            }
            
            if (matches.length > 0) {
                let response = `ขออภัยครับ เกิดปัญหาในการเชื่อมต่อ Gemini API (ลิมิตโควต้าคีย์ฟรีชั่วคราว) แต่ผมวิเคราะห์ในตารางแล้วเจอบทความที่ตรงกับสิ่งที่คุณตามหาดังนี้ครับ:<br/><br/>`;
                matches.slice(0, 3).forEach(m => {
                    response += `- <strong>${m.title}</strong> (ย่าน ${m.district}) คะแนนรวม ${m.totalScore}/100<br/>&nbsp;&nbsp;<em>เหมาะสำหรับ: ${m.suitabilityNotes}</em><br/><br/>`;
                });
                appendMessage(response, "ai");
            } else {
                appendMessage("ขออภัยครับ ระบบส่งคำร้องไปยัง AI โควต้าหมดชั่วคราว และไม่พบคีย์เวิร์ดด่วนในตาราง (ลองถามใหม่โดยใช้คำค้น เช่น ชาบู, ปิ้งย่าง, สยาม, หรือ อารีย์ ครับ)", "ai");
            }
        });
    }
    
    btnSend.addEventListener("click", handleSend);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSend();
    });
}

// Setup Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    // Current Date display
    const dateEl = document.getElementById("current-date");
    if (dateEl) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('th-TH', options);
    }

    // Initial load handler
    function onDataLoaded(data) {
        currentRestaurants = data;
        populateCategoryFilter(data);
        renderQueue(data);
        initAskAIChat();
        renderDashboard("Ari");
    }

    // Check if Spreadsheet ID is set for Live Sync
    if (SPREADSHEET_ID && SPREADSHEET_ID !== "YOUR_SPREADSHEET_ID") {
        console.log(`Initialising Live Sync with Google Sheets: ${SPREADSHEET_ID}`);

        // Dynamically update Google Sheets link button in the dashboard
        const sheetLink = document.getElementById("sheet-link");
        if (sheetLink) {
            sheetLink.href = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?usp=sharing`;
        }

        fetchGoogleSheetsData(SPREADSHEET_ID)
            .then(data => {
                console.log(`Live Sync loaded ${data.length} restaurants successfully!`);
                onDataLoaded(data);
            })
            .catch(err => {
                console.error("Live Sync failed, falling back to offline dataset (data.js):", err);
                onDataLoaded(restaurantData);
            });
    } else {
        console.log("No Spreadsheet ID configured. Running in offline snapshot mode (data.js).");
        onDataLoaded(restaurantData);
    }

    // Tab Clicks
    const tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            tabs.forEach(t => t.classList.remove("active"));

            const btn = e.currentTarget;
            btn.classList.add("active");

            const district = btn.getAttribute("data-district");
            renderDashboard(district);
        });
    });

    // Hook up Multi-faceted Filter event listeners
    const filters = ["filter-district", "filter-category", "filter-scenario", "filter-price"];
    filters.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("change", () => {
                renderDashboard("All");
            });
        }
    });

    // Hook up Reload Button
    const btnReload = document.getElementById("btn-reload");
    if (btnReload) {
        btnReload.addEventListener("click", () => {
            const icon = document.getElementById("reload-icon");
            if (icon) icon.classList.add("spin");
            btnReload.disabled = true;
            
            // Show loading state in dashboard
            document.getElementById("top-3-container").innerHTML = `
                <div class="glass-card loading-skeleton" style="height: 350px;"></div>
                <div class="glass-card loading-skeleton" style="height: 350px;"></div>
                <div class="glass-card loading-skeleton" style="height: 350px;"></div>
            `;
            document.getElementById("table-body").innerHTML = `
                <tr><td colspan="9" class="text-center" style="padding: 50px;">กำลังรีโหลดข้อมูลสดจาก Google Sheets...</td></tr>
            `;
            
            fetchGoogleSheetsData(SPREADSHEET_ID)
                .then(data => {
                    console.log(`Live Sync reloaded ${data.length} restaurants!`);
                    currentRestaurants = data;
                    populateCategoryFilter(data);
                    
                    const activeTab = document.querySelector(".tab-btn.active");
                    const activeDistrict = activeTab ? activeTab.getAttribute("data-district") : "Ari";
                    renderDashboard(activeDistrict);
                    renderQueue(data);
                })
                .catch(err => {
                    console.error("Reload failed:", err);
                    alert("รีโหลดข้อมูลล้มเหลว กำลังใช้ข้อมูลสำรองแทน: " + err.message);
                    currentRestaurants = restaurantData;
                    const activeTab = document.querySelector(".tab-btn.active");
                    const activeDistrict = activeTab ? activeTab.getAttribute("data-district") : "Ari";
                    renderDashboard(activeDistrict);
                })
                .finally(() => {
                    if (icon) icon.classList.remove("spin");
                    btnReload.disabled = false;
                });
        });
    }
});
