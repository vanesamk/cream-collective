if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

import { createIcons, PlusCircle, Package, ShoppingCart, BarChart3, Camera, Search, ChevronRight, Check, Loader2 } from 'lucide';

const API_BASE = 'http://localhost:3000/api';

// Router
const routes = {
  'catalog': renderCatalog,
  'inventory': renderInventory,
  'pos': renderPOS,
  'analytics': renderAnalytics
};

function navigate() {
  const hash = window.location.hash.replace('#', '') || 'catalog';
  const renderFn = routes[hash];
  
  // Update Nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === hash);
  });

  if (renderFn) {
    const main = document.getElementById('main-content');
    main.innerHTML = '';
    renderFn(main);
    createIcons({ icons: { PlusCircle, Package, ShoppingCart, BarChart3, Camera, Search, ChevronRight, Check, Loader2 } });
  }
}

window.addEventListener('hashchange', navigate);
window.addEventListener('load', navigate);

// --- Page 1: Catalog ---
async function renderCatalog(container) {
  let bales = [];
  try {
    const res = await fetch(`${API_BASE}/bales`);
    bales = await res.json();
  } catch (e) { console.error(e); }

  container.innerHTML = `
    <div class="page-header">
      <h2 style="margin:0 0 16px 0">Bale Breaking</h2>
    </div>

    <div class="card">
      <div class="form-group">
        <label>Active Bale</label>
        <select id="bale-selector">
          <option value="new">+ Start New Bale</option>
          ${bales.map(b => `<option value="${b.id}">${b.bale_type} - ${b.department} (${new Date(b.arrival_date).toLocaleDateString()})</option>`).join('')}
        </select>
      </div>

      <div id="new-bale-form" style="display:none; border-top: 1px solid #eee; padding-top: 16px; margin-top: 16px;">
        <div class="form-group">
          <label>Bale Type</label>
          <select id="new-bale-type">
            <option>Cream</option>
            <option>First-Class</option>
          </select>
        </div>
        <div class="form-group">
          <label>Department</label>
          <select id="new-bale-dept">
            <option>Women</option>
            <option>Men</option>
            <option>Kids</option>
          </select>
        </div>
        <div class="form-group">
          <label>Bale Cost (UGX)</label>
          <input type="number" id="new-bale-cost" placeholder="e.g. 1500000">
        </div>
        <button class="btn btn-secondary" id="btn-create-bale">Confirm Bale</button>
      </div>
    </div>

    <div id="item-entry" class="card">
      <h3 style="margin:0 0 16px 0">Add Item</h3>
      <div class="form-group">
        <label>Category</label>
        <select id="item-category">
          <option>Dress</option><option>T-shirt</option><option>Polo</option><option>Jeans</option>
          <option>Jacket</option><option>Blouse</option><option>Skirt</option><option>Shorts</option>
          <option>Sweater</option><option>Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>Size</label>
        <input type="text" id="item-size" placeholder="e.g. M, 32, 4-5Y">
      </div>
      <div class="form-group">
        <label>Price (UGX)</label>
        <input type="number" id="item-price" placeholder="Auto-suggested">
      </div>
      <div class="form-group">
        <label>Photo</label>
        <div style="border: 2px dashed #eee; border-radius: 12px; padding: 30px; text-align:center; color: #aaa;">
          <input type="file" id="item-photo" accept="image/*" capture="environment" style="display:none">
          <div onclick="document.getElementById('item-photo').click()" style="cursor:pointer">
            <i data-lucide="camera" style="width:32px; height:32px"></i>
            <p style="font-size:0.8rem; margin-top:8px">Tap to capture</p>
          </div>
        </div>
      </div>
      <button class="btn btn-primary" id="btn-save-item">List Item</button>
      <p id="session-count" style="text-align:center; font-size: 0.75rem; color: #999; margin-top: 12px;">Items added this session: 0</p>
    </div>
  `;

  let sessionCount = 0;
  const sel = document.getElementById('bale-selector');
  const newBaleForm = document.getElementById('new-bale-form');
  
  sel.onchange = () => {
    newBaleForm.style.display = sel.value === 'new' ? 'block' : 'none';
  };

  document.getElementById('btn-create-bale').onclick = async () => {
    const data = {
      bale_type: document.getElementById('new-bale-type').value,
      department: document.getElementById('new-bale-dept').value,
      cost: document.getElementById('new-bale-cost').value
    };
    const res = await fetch(`${API_BASE}/bales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) renderCatalog(container);
  };

  document.getElementById('btn-save-item').onclick = async () => {
    if (sel.value === 'new') return alert('Please confirm bale first');
    const data = {
      bale_id: sel.value,
      category: document.getElementById('item-category').value,
      size: document.getElementById('item-size').value,
      price: document.getElementById('item-price').value,
      image_urls: ['https://via.placeholder.com/300']
    };
    const res = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      sessionCount++;
      document.getElementById('session-count').innerText = `Items added this session: ${sessionCount}`;
      document.getElementById('item-price').value = '';
      alert('Item Listed!');
    }
  };
}

// --- Page 2: Inventory ---
async function renderInventory(container) {
  let filter = 'Available';
  let items = [];

  const loadItems = async () => {
    const res = await fetch(`${API_BASE}/items?status=${filter}`);
    items = await res.json();
    renderList();
  };

  const renderList = () => {
    const list = document.getElementById('inventory-list');
    list.innerHTML = items.map(item => `
      <div class="item-card">
        <img src="${JSON.parse(item.image_urls)[0]}" class="item-img">
        <div class="item-info">
          <div style="display:flex; justify-content:space-between">
            <span style="font-size:0.6rem; color:#999">${item.sku}</span>
            <span class="badge badge-${item.status.toLowerCase()}">${item.status}</span>
          </div>
          <div style="font-weight:700; margin: 4px 0">${item.category}</div>
          <div style="font-size:0.8rem; color:#666">${item.size}</div>
          <div class="item-price" style="margin-top:8px">${parseInt(item.price).toLocaleString()} UGX</div>
        </div>
      </div>
    `).join('');
  };

  container.innerHTML = `
    <div class="tabs">
      <div class="tab active" data-status="Available">Available</div>
      <div class="tab" data-status="Reserved">Reserved</div>
      <div class="tab" data-status="Sold">Sold</div>
    </div>
    <div id="inventory-list" class="item-grid"></div>
  `;

  document.querySelectorAll('.tab').forEach(t => {
    t.onclick = () => {
      document.querySelector('.tab.active').classList.remove('active');
      t.classList.add('active');
      filter = t.dataset.status;
      loadItems();
    };
  });

  loadItems();
}

// --- Page 3: POS ---
async function renderPOS(container) {
  container.innerHTML = `
    <div class="form-group" style="position:relative">
      <i data-lucide="search" style="position:absolute; left:12px; top:12px; width:20px; color:#aaa"></i>
      <input type="text" id="pos-search" placeholder="Search SKU..." style="padding-left:40px">
    </div>
    <div id="pos-item-preview"></div>
    <div id="pos-checkout-form" style="display:none" class="card">
      <div class="form-group">
        <label>Channel</label>
        <select id="sale-channel">
          <option>Walk-in</option><option>WhatsApp</option><option>Instagram</option><option>TikTok</option>
        </select>
      </div>
      <div class="form-group">
        <label>Payment Method</label>
        <select id="payment-method">
          <option>Cash</option><option>Mobile Money</option>
        </select>
      </div>
      <div id="mm-details" style="display:none">
        <div class="form-group">
          <label>Customer Phone (+256...)</label>
          <input type="text" id="cust-phone" placeholder="+2567...">
        </div>
        <div class="form-group">
          <label>Transaction ID</label>
          <input type="text" id="trans-id" placeholder="Reference from SMS">
        </div>
      </div>
      <button class="btn btn-primary" id="btn-complete-sale">Complete Sale</button>
    </div>
  `;

  const search = document.getElementById('pos-search');
  const preview = document.getElementById('pos-item-preview');
  const checkout = document.getElementById('pos-checkout-form');
  const mmDetails = document.getElementById('mm-details');
  const payMethod = document.getElementById('payment-method');
  let selectedItem = null;

  payMethod.onchange = () => mmDetails.style.display = payMethod.value === 'Mobile Money' ? 'block' : 'none';

  search.oninput = async () => {
    if (search.value.length < 3) return;
    const res = await fetch(`${API_BASE}/items`);
    const items = await res.json();
    selectedItem = items.find(i => i.sku.toLowerCase() === search.value.toLowerCase() && i.status === 'Available');
    if (selectedItem) {
      preview.innerHTML = `
        <div class="card" style="display:flex; gap:16px">
          <img src="${JSON.parse(selectedItem.image_urls)[0]}" style="width:80px; height:80px; border-radius:8px">
          <div>
            <div font-weight:800>${selectedItem.sku}</div>
            <div style="font-size:0.9rem; color:var(--accent)">${parseInt(selectedItem.price).toLocaleString()} UGX</div>
          </div>
        </div>
      `;
      checkout.style.display = 'block';
    } else {
      preview.innerHTML = '';
      checkout.style.display = 'none';
    }
  };

  document.getElementById('btn-complete-sale').onclick = async () => {
    const data = {
      item_id: selectedItem.id,
      amount: selectedItem.price,
      channel: document.getElementById('sale-channel').value,
      payment_method: payMethod.value,
      transaction_id: document.getElementById('trans-id').value,
      customer_phone: document.getElementById('cust-phone').value
    };
    const res = await fetch(`${API_BASE}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      container.innerHTML = `<div class="card" style="text-align:center; padding:40px">
        <i data-lucide="check" style="width:64px; height:64px; color:#319795; margin-bottom:16px"></i>
        <h2>Sale Completed!</h2>
        <button class="btn btn-secondary" onclick="window.location.hash='#inventory'">Back to Inventory</button>
      </div>`;
      createIcons({ icons: { Check } });
    }
  };
}

// --- Page 4: Analytics ---
async function renderAnalytics(container) {
  const [turnoverRes, marginRes, channelRes, itemsRes, salesRes] = await Promise.all([
    fetch(`${API_BASE}/analytics/turnover`),
    fetch(`${API_BASE}/analytics/bale-margins`),
    fetch(`${API_BASE}/analytics/channel-breakdown`),
    fetch(`${API_BASE}/items?status=Available`),
    fetch(`${API_BASE}/sales`)
  ]);
  const turnover = await turnoverRes.json();
  const margins = await marginRes.json();
  const channels = await channelRes.json();
  const availableItems = await itemsRes.json();
  const allSales = await salesRes.json();

  const today = new Date().toISOString().split('T')[0];
  const salesToday = allSales.filter(s => s.sale_date.startsWith(today));
  const revenueToday = salesToday.reduce((sum, s) => sum + s.amount, 0);

  container.innerHTML = `
    <h2 style="margin-bottom:16px">Stats</h2>

    <div class="item-grid" style="margin-bottom:16px">
      <div class="card" style="padding:12px; margin-bottom:0">
        <div style="font-size:0.6rem; color:#999; font-weight:700; text-transform:uppercase">Sold Today</div>
        <div style="font-size:1.2rem; font-weight:800">${salesToday.length}</div>
      </div>
      <div class="card" style="padding:12px; margin-bottom:0">
        <div style="font-size:0.6rem; color:#999; font-weight:700; text-transform:uppercase">Revenue</div>
        <div style="font-size:1.2rem; font-weight:800">${revenueToday.toLocaleString()}</div>
      </div>
    </div>
    
    <div class="card">
      <label>Quick Stats</label>
      <div style="display:flex; justify-content:space-between; font-size:0.9rem">
        <span>Items Available</span>
        <span style="font-weight:800">${availableItems.length}</span>
      </div>
    </div>

    <div class="card">
      <label>Channel Breakdown</label>
      <table style="width:100%; font-size:0.8rem; border-collapse:collapse">
        <tr style="text-align:left; border-bottom:1px solid #eee">
          <th style="padding:8px 0">Channel</th>
          <th>Sales</th>
          <th>Value</th>
        </tr>
        ${channels.map(c => `
          <tr style="border-bottom:1px solid #f9f9f9">
            <td style="padding:8px 0">${c.channel}</td>
            <td>${c.sale_count}</td>
            <td>${parseInt(c.total_value).toLocaleString()}</td>
          </tr>
        `).join('')}
      </table>
    </div>

    <div class="card">
      <label>Bale Performance</label>
      <table style="width:100%; font-size:0.8rem; border-collapse:collapse">
        <tr style="text-align:left; border-bottom:1px solid #eee">
          <th style="padding:8px 0">Bale</th>
          <th>Sales</th>
          <th>ROI</th>
        </tr>
        ${margins.map(m => `
          <tr style="border-bottom:1px solid #f9f9f9">
            <td style="padding:8px 0">${m.bale_type} (${m.department})</td>
            <td>${parseInt(m.total_sales || 0).toLocaleString()}</td>
            <td style="color:${m.roi_percent >= 0 ? 'green' : 'red'}">${(m.roi_percent || 0).toFixed(0)}%</td>
          </tr>
        `).join('')}
      </table>
    </div>

    <div class="card">
      <label>Inventory Turnover</label>
      ${turnover.map(t => `
        <div style="margin-bottom:12px">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px">
            <span>${t.department} - ${t.category}</span>
            <span style="font-weight:800">${t.avg_days_to_sell ? t.avg_days_to_sell.toFixed(1) : 0} days</span>
          </div>
          <div style="height:8px; background:#f0f0f0; border-radius:4px overflow:hidden">
            <div style="height:100%; background:var(--accent); width:${Math.min(100, (t.avg_days_to_sell || 0) * 10)}%"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
