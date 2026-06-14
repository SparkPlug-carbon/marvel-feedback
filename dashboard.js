// Supabase credentials
const API_URL = 'https://pthqfnqgjwzzinjndbet.supabase.co/rest/v1/rpc/get_all_feedback';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aHFmbnFnand6emluam5kYmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MTMyNjMsImV4cCI6MjA5Njk4OTI2M30.Y1EcUuLKetpcJboIV1mPYrCI1SaHMkKl9SxziWaxRgk';

document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refresh-btn');

    // Manual refresh button
    refreshBtn.addEventListener('click', () => {
        refreshBtn.classList.add('spinning');
        fetchDashboardData();
        setTimeout(() => refreshBtn.classList.remove('spinning'), 800);
    });

    // Initial load
    fetchDashboardData();

    // Auto-refresh every 60 seconds
    setInterval(fetchDashboardData, 60000);
});

async function fetchDashboardData() {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'apikey': API_KEY,
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API Error: ${response.status} ${response.statusText}`, errorBody);
            document.getElementById('last-updated').textContent = `Error: ${response.status}`;
            return;
        }

        const data = await response.json();
        console.log('Fetched data:', data);
        updateDashboard(data);
    } catch (error) {
        console.error("Data pull failed:", error);
        document.getElementById('last-updated').textContent = `Error: ${error.message}`;
    }
}

function updateDashboard(data) {
    const emptyState = document.getElementById('empty-state');
    const submissionsList = document.getElementById('submissions-list');

    if (data.length === 0) {
        emptyState.classList.remove('hidden');
        submissionsList.classList.add('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    submissionsList.classList.remove('hidden');

    // Category configs: [db_rating_field, kpi_el_id, count_el_id, bar_el_id]
    const categories = [
        { rating: 'workout_rating',     comment: 'workout_comment',     kpi: 'kpi-workout',     count: 'kpi-workout-count',     bar: 'bar-workout' },
        { rating: 'equipment_rating',   comment: 'equipment_comment',   kpi: 'kpi-equipment',   count: 'kpi-equipment-count',   bar: 'bar-equipment' },
        { rating: 'cleanliness_rating', comment: 'cleanliness_comment', kpi: 'kpi-clean',       count: 'kpi-clean-count',       bar: 'bar-clean' },
        { rating: 'trainers_rating',    comment: 'trainers_comment',    kpi: 'kpi-trainers',    count: 'kpi-trainers-count',    bar: 'bar-trainers' },
        { rating: 'atmosphere_rating',  comment: 'atmosphere_comment',  kpi: 'kpi-atmosphere',  count: 'kpi-atmosphere-count',  bar: 'bar-atmosphere' }
    ];

    // 1. Calculate and display KPIs
    categories.forEach(cat => {
        const validRatings = data.filter(item => item[cat.rating] > 0).map(item => item[cat.rating]);
        const kpiEl = document.getElementById(cat.kpi);
        const countEl = document.getElementById(cat.count);
        const barEl = document.getElementById(cat.bar);

        if (validRatings.length === 0) {
            kpiEl.textContent = '-';
            countEl.textContent = '0 reviews';
            barEl.style.width = '0%';
            return;
        }

        const sum = validRatings.reduce((a, b) => a + b, 0);
        const avg = sum / validRatings.length;

        kpiEl.textContent = avg.toFixed(1);
        countEl.textContent = `${validRatings.length} review${validRatings.length !== 1 ? 's' : ''}`;
        barEl.style.width = `${(avg / 5) * 100}%`;

        // Color-code the KPI value
        kpiEl.classList.remove('good', 'okay', 'bad');
        if (avg >= 4) kpiEl.classList.add('good');
        else if (avg >= 3) kpiEl.classList.add('okay');
        else kpiEl.classList.add('bad');

        // Color the bar fill
        if (avg >= 4) barEl.style.background = 'linear-gradient(90deg, #4caf50, #66bb6a)';
        else if (avg >= 3) barEl.style.background = 'linear-gradient(90deg, #f0c040, #ffd54f)';
        else barEl.style.background = 'linear-gradient(90deg, #ed1d24, #ff6b6b)';
    });

    // 2. Populate list
    submissionsList.innerHTML = '';

    data.forEach(row => {
        const dateObj = new Date(row.created_at);
        const dateStr = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        // Calculate avg rating for this submission
        const ratings = [row.workout_rating, row.equipment_rating, row.cleanliness_rating, row.trainers_rating, row.atmosphere_rating].filter(r => r > 0);
        const avgRating = ratings.length ? (ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(1) : '-';

        const card = document.createElement('div');
        card.className = 'submission-card';
        
        let gridHtml = '';
        const items = [
            { id: 'workout', name: 'Workout', icon: '🏋️', rating: row.workout_rating, comment: row.workout_comment },
            { id: 'equipment', name: 'Equipment', icon: '⚙️', rating: row.equipment_rating, comment: row.equipment_comment },
            { id: 'cleanliness', name: 'Cleanliness', icon: '✨', rating: row.cleanliness_rating, comment: row.cleanliness_comment },
            { id: 'trainers', name: 'Trainers', icon: '💪', rating: row.trainers_rating, comment: row.trainers_comment },
            { id: 'atmosphere', name: 'Atmosphere', icon: '🎵', rating: row.atmosphere_rating, comment: row.atmosphere_comment }
        ];

        items.forEach(item => {
            if (item.rating > 0 || item.comment) {
                const stars = item.rating ? '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating) : '-';
                const commentHtml = item.comment ? `<div class="feedback-comment">${escapeHtml(item.comment)}</div>` : `<div class="feedback-comment empty">No comment provided.</div>`;
                gridHtml += `
                    <div class="feedback-item">
                        <div class="feedback-item-header">
                            <span class="feedback-category"><span class="icon">${item.icon}</span> ${item.name}</span>
                            <span class="feedback-stars">${stars}</span>
                        </div>
                        ${commentHtml}
                    </div>
                `;
            }
        });

        card.innerHTML = `
            <div class="submission-header">
                <span class="submission-date">${dateStr}</span>
                <span class="submission-rating-avg">Overall: <span>${avgRating} ★</span></span>
            </div>
            <div class="feedback-grid">
                ${gridHtml}
            </div>
        `;
        submissionsList.appendChild(card);
    });

    // 3. Update timestamp
    document.getElementById('last-updated').textContent = new Date().toLocaleTimeString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
