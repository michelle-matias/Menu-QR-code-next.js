import { SUPABASE_URL, SUPABASE_KEY } from '../.env.js';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let editingId = null;

// ─── MODAL ───────────────────────────────────────────────────────────────────
window.openModal = function (dish = null) {
    editingId = dish ? dish.id : null;

    document.getElementById('modalTitle').textContent = dish ? 'Edit Dish' : 'Add Dish';
    document.getElementById('saveBtn').textContent = dish ? 'Update Dish' : 'Save Dish';

    document.getElementById('dishName').value = dish?.name ?? '';
    document.getElementById('dishDescription').value = dish?.description ?? '';
    document.getElementById('dishPrice').value = dish?.price ?? '';
    document.getElementById('dishCategory').value = dish?.category ?? 'Starters';

    // Reset file input & show existing image preview when editing
    document.getElementById('dishImage').value = '';
    const preview = document.getElementById('imagePreview');
    if (dish?.image_url) {
        preview.src = dish.image_url;
        preview.style.display = 'block';
    } else {
        preview.src = '';
        preview.style.display = 'none';
    }

    document.getElementById('dishModal').style.display = 'flex';
}

window.closeModal = function () {
    document.getElementById('dishModal').style.display = 'none';
    document.getElementById('dishForm').reset();
    const preview = document.getElementById('imagePreview');
    preview.src = '';
    preview.style.display = 'none';
    editingId = null;
}



window.previewMenu = function () {
    window.open('../menu_editor/preview menu.html');
}

// Close modal when clicking outside modal-content
document.getElementById('dishModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('dishModal')) closeModal();
});

// ─── IMAGE PREVIEW when user picks a file ─────────────────────────────────────
document.getElementById('dishImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    } else {
        preview.src = '';
        preview.style.display = 'none';
    }
});

// ─── FORM SUBMIT (ADD / EDIT) ─────────────────────────────────────────────────
document.getElementById('dishForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    // Upload image if one was selected
    let image_url = null;
    const fileInput = document.getElementById('dishImage');
    const file = fileInput.files[0];

    if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError } = await db.storage
            .from('dish-images')
            .upload(fileName, file);

        if (uploadError) {
            alert('Error uploading image: ' + uploadError.message);
            saveBtn.disabled = false;
            saveBtn.textContent = editingId ? 'Update Dish' : 'Save Dish';
            return;
        }

        const { data: urlData } = db.storage
            .from('dish-images')
            .getPublicUrl(fileName);

        image_url = urlData.publicUrl;

    } else if (editingId) {
        // Editing but no new image selected — keep the existing one
        const preview = document.getElementById('imagePreview');
        image_url = preview.src || null;
    }

    const { data: { user } } = await db.auth.getUser(); // 👈 get current user

    const payload = {
        name: document.getElementById('dishName').value.trim(),
        description: document.getElementById('dishDescription').value.trim(),
        price: parseFloat(document.getElementById('dishPrice').value),
        category: document.getElementById('dishCategory').value,
        image_url,
        user_id: user.id,
    };

    let error;
    if (editingId) {
        ({ error } = await db.from('dishes').update(payload).eq('id', editingId));
    } else {
        ({ error } = await db.from('dishes').insert(payload));
    }

    saveBtn.disabled = false;
    saveBtn.textContent = editingId ? 'Update Dish' : 'Save Dish';

    if (error) {
        alert('Error saving dish: ' + error.message);
        console.error(error);
    } else {
        closeModal();
        loadDishes();
    }
});

// ─── DELETE ───────────────────────────────────────────────────────────────────
async function deleteDish(id) {
    if (!confirm('Delete this dish?')) return;

    const { error } = await db.from('dishes').delete().eq('id', id);

    if (error) {
        alert('Error deleting dish: ' + error.message);
        console.error(error);
    } else {
        loadDishes();
    }
}

// ─── RENDER ───────────────────────────────────────────────────────────────────
function renderDishes(dishes) {
    const container = document.getElementById('menuContainer');

    if (dishes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils"></i>
                <p>No dishes yet. Add your first one!</p>
            </div>
        `;
        return;
    }

    const groups = {};
    dishes.forEach(dish => {
        if (!groups[dish.category]) groups[dish.category] = [];
        groups[dish.category].push(dish);
    });

    const categoryOrder = ['Starters', 'Mains', 'Desserts', 'Drinks'];

    container.innerHTML = categoryOrder
        .filter(cat => groups[cat])
        .map(cat => `
            <div class="category-section">
                <h2 class="category-title">${cat}</h2>
                <div class="dishes-grid">
                    ${groups[cat].map(dish => `
                        <div class="dish-card">
                            ${dish.image_url
                ? `<img src="${escHtml(dish.image_url)}" alt="${escHtml(dish.name)}" onerror="this.style.display='none'">`
                : ''
            }
                            <div class="dish-info">
                                <div class="dish-header">
                                    <span class="dish-name">${escHtml(dish.name)}</span>
                                    <span class="dish-price">€${Number(dish.price).toFixed(2)}</span>
                                </div>
                                <p class="dish-desc">${escHtml(dish.description)}</p>
                                <div class="dish-actions">
                                    <button class="btn-secondary" onclick='openModal(${JSON.stringify(dish)})'>Edit</button>
                                    <button class="btn-danger" onclick="deleteDish('${dish.id}')">Delete</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
}

function escHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ─── LOAD ─────────────────────────────────────────────────────────────────────
async function loadDishes() {
    const container = document.getElementById('menuContainer');
    container.innerHTML = '<p style="color:#888;padding:2rem;">Loading...</p>';

    const { data: { user } } = await db.auth.getUser(); // 👈 get current user

    const { data, error } = await db
        .from('dishes')
        .select('*')
        .eq('user_id', user.id)                        // 👈 filter by user
        .order('created_at', { ascending: true });

    if (error) {
        container.innerHTML = '<p style="color:red;padding:2rem;">Failed to load dishes.</p>';
        console.error(error);
        return;
    }

    renderDishes(data);
}


// ─── PREVIEW ──────────────────────────────────────────────────────────────────
function previewMenu() {
    window.open('../menu_editor/preview menu.html',);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
loadDishes();