if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

import { createIcons, PlusCircle, Package, ShoppingCart, BarChart3, Camera, Search, ChevronRight, Check, Loader2, MessageCircle, Zap } from 'lucide';

const API_BASE = '/api';
let storeInfo = null;

async function init() {
  try {
    const res = await fetch(`${API_BASE}/store/info`);
    storeInfo = await res.json();
  } catch (e) {
    console.error("Failed to fetch store info", e);
    // Fallback
    storeInfo = {
      name: "The Cream Collective",
      tagline: "Premium Curated Fashion — Kampala",
      phone: "+256774624210",
      whatsapp: "https://wa.me/256774624210",
      departments: ["Men", "Women", "Kids"]
    };
  }
  navigate();
}

// Router
const routes = {
  'hero': renderHero,
  'catalog': renderCatalog,
  'inventory': renderInventory,
  'pos': renderPOS,
  'analytics': renderAnalytics
};

function navigate() {
  const hash = window.location.hash.replace('#', '') || 'hero';
  const renderFn = routes[hash];
  
  // Hide FAB by default on navigation
  const fab = document.getElementById('whatsapp-fab');
  if (fab) fab.style.display = 'none';

  // Update Nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === hash);
  });

  if (renderFn) {
    const main = document.getElementById('main-content');
    main.innerHTML = '';
    renderFn(main);
    createIcons({ icons: { PlusCircle, Package, ShoppingCart, BarChart3, Camera, Search, ChevronRight, Check, Loader2, MessageCircle, Zap } });
  }
}

function updateWhatsAppFAB(sku) {
  let fab = document.getElementById('whatsapp-fab');
  if (!fab) {
    fab = document.createElement('a');
    fab.id = 'whatsapp-fab';
    fab.target = '_blank';
    fab.className = 'whatsapp-fab';
    fab.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: #25D366;
      color: white;
      padding: 12px 20px;
      border-radius: 50px;
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      transition: all 0.3s ease;
    `;
    fab.innerHTML = '<i data-lucide="message-circle" style="width:20px; height:20px"></i> <span>Chat on WhatsApp</span>';
    document.body.appendChild(fab);
    createIcons({ icons: { MessageCircle } });
  }
  fab.href = `${storeInfo.whatsapp}?text=Hi%20${encodeURIComponent(storeInfo.name)}%2C%20I'm%20interested%20in%20${sku}`;
  fab.style.display = 'flex';
}

window.addEventListener('hashchange', navigate);
window.addEventListener('load', init);

// --- Page 0: Hero / Home Dashboard ---
function renderHero(container) {
  container.innerHTML = `
    <div style="padding: 0;">
      <!-- Brand Header -->
      <div style="text-align:center; padding: 30px 20px; background: linear-gradient(180deg, #fdfbf7 0%, #fff 100%); border-bottom: 1px solid #f0f0f0;">
        <h1 style="font-size: 2rem; font-weight: 900; margin: 0; letter-spacing: -0.5px;">THE CREAM<br>COLLECTIVE</h1>
        <p style="font-size: 0.85rem; color: #b89c7d; margin-top: 6px; font-weight: 600; letter-spacing: 1px;">${storeInfo.tagline}</p>
      </div>

      <!-- WhatsApp & Contact Bar -->
      <div style="padding: 16px 20px; background: #075e54; display: flex; align-items: center; justify-content: space-between;">
        <div style="color: white; font-size: 0.85rem; font-weight: 600;">
          <div>Chat with us on WhatsApp</div>
          <div style="font-size: 0.75rem; opacity: 0.8;">+256 774 624 210</div>
        </div>
        <a href="${storeInfo.whatsapp}?text=Hi%20The%20Cream%20Collective%2C%20I'd%20like%20to%20place%20an%20order!" 
           target="_blank"
           style="background: #25D366; color: white; padding: 10px 20px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Order Now
        </a>
      </div>

      <!-- Quick Stats -->
      <div style="padding: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
        <div style="background: white; border-radius: 12px; padding: 16px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #f0f0f0;">
          <div style="font-size: 0.6rem; color: #999; font-weight: 700; text-transform: uppercase;">Depts</div>
          <div style="font-size: 1.1rem; font-weight: 800; margin-top: 4px;">${storeInfo.departments.length}</div>
          <div style="font-size: 0.6rem; color: #999;">Men · Women · Kids</div>
        </div>
        <div style="background: white; border-radius: 12px; padding: 16px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #f0f0f0;">
          <div style="font-size: 0.6rem; color: #999; font-weight: 700; text-transform: uppercase;">Payment</div>
          <div style="font-size: 1.1rem; font-weight: 800; margin-top: 4px; color: #d4af37;">MTN</div>
          <div style="font-size: 0.6rem; color: #999;">Mobile Money</div>
        </div>
        <div style="background: white; border-radius: 12px; padding: 16px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #f0f0f0;">
          <div style="font-size: 0.6rem; color: #999; font-weight: 700; text-transform: uppercase;">Contact</div>
          <div style="font-size: 1.1rem; font-weight: 800; margin-top: 4px;">WhatsApp</div>
          <div style="font-size: 0.6rem; color: #999;">+256 774 624 210</div>
        </div>
      </div>

      <!-- How to Add Items Guide -->
      <div style="padding: 0 20px 20px;">
        <h2 style="font-size: 1rem; font-weight: 800; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 2px solid #1a1a1a; display: inline-block;">ADDING NEW ITEMS</h2>
        
        <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #f0f0f0;">
          <div style="font-weight: 800; font-size: 0.85rem; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <span style="background: #1a1a1a; color: white; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.7rem;">1</span>
            Start a New Bale
          </div>
          <div style="font-size: 0.8rem; color: #666; line-height: 1.5; padding-left: 30px;">
            Go to <strong>Catalog</strong> (bottom nav). Select <strong>"+ Start New Bale"</strong>, choose <strong>type</strong> (Cream/First-Class), <strong>department</strong> (Men/Women/Kids), enter the <strong>bale cost in UGX</strong>, and tap <strong>Confirm Bale</strong>.
          </div>
        </div>

        <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #f0f0f0;">
          <div style="font-weight: 800; font-size: 0.85rem; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <span style="background: #1a1a1a; color: white; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.7rem;">2</span>
            Add Item Details
          </div>
          <div style="font-size: 0.8rem; color: #666; line-height: 1.5; padding-left: 30px;">
            Select the active bale. Choose <strong>Category</strong> (Dress, T-shirt, Jeans, etc.), enter <strong>Size</strong> (e.g. M, 32, 4-5Y), and <strong>Price in UGX</strong>. Take a <strong>photo</strong> of the item. Tap <strong>List Item</strong> — the system auto-generates a unique SKU like <code style="background:#eee;padding:2px 6px;border-radius:4px;font-size:0.75rem;">CEF6-DRE-001</code>.
          </div>
        </div>

        <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #f0f0f0;">
          <div style="font-weight: 800; font-size: 0.85rem; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <span style="background: #1a1a1a; color: white; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.7rem;">3</span>
            Repeat for Every Item
          </div>
          <div style="font-size: 0.8rem; color: #666; line-height: 1.5; padding-left: 30px;">
            The form clears after each item so you can rapidly add items one after another. The session counter shows how many items you've added. <strong>Tip:</strong> Sort items by category first — do all dresses, then all shirts, for faster entry.
          </div>
        </div>

        <div style="background: #fff9e6; border-radius: 12px; padding: 14px; border: 1px solid #ffeeba; margin-top: 16px;">
          <div style="font-size: 0.8rem; color: #856404; font-weight: 700; margin-bottom: 4px;">💡 Pro Tip</div>
          <div style="font-size: 0.8rem; color: #856404; line-height: 1.4;">
            After listing items, use <strong>Inventory</strong> to view all available stock. Use <strong>POS</strong> when a customer buys an item. Check <strong>Stats</strong> to see which bales are performing best.
          </div>
        </div>
      </div>

      <!-- MTN Payment Info -->
      <div style="padding: 16px 20px; background: #fdfbf7; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="background: #ffc107; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.7rem; color: #856404;">MTN</div>
          <div>
            <div style="font-weight: 700; font-size: 0.85rem;">MTN Mobile Money</div>
            <div style="font-size: 0.75rem; color: #666;">Send payments to: <strong>+256 774 624 210</strong></div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 20px; font-size: 0.7rem; color: #bbb;">
        The Cream Collective © ${new Date().getFullYear()} — Kampala, Uganda
      </div>
    </div>
  `;
}

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
      <div class="item-card" data-sku="${item.sku}" style="cursor:pointer">
        <img src="${JSON.parse(item.image_urls)[0]}" class="item-img">
        <div class="item-info">
          <div style="display:flex; justify-content:space-between">
            <span style="font-size:0.6rem; color:#999">${item.sku}</span>
            <span class="badge badge-${item.status.toLowerCase()}">${item.status}</span>
          </div>
          <div style="font-weight:700; margin: 4px 0">${item.category}</div>
          <div style="font-size:0.8rem; color:#666">${item.size}</div>
          <div class="item-price" style="margin-top:8px">${parseInt(item.price).toLocaleString()} UGX</div>
          <a href="${storeInfo.whatsapp}?text=Hi%20${encodeURIComponent(storeInfo.name)}%2C%20I'm%20interested%20in%20${item.sku}" 
             target="_blank"
             style="display:inline-flex; align-items:center; gap:4px; font-size:0.7rem; color:#25D366; font-weight:700; margin-top:8px; text-decoration:none">
             <i data-lucide="message-circle" style="width:12px; height:12px"></i> Chat to Buy
          </a>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.item-card').forEach(card => {
      card.onclick = (e) => {
        // If it's a click on the link, don't trigger the card click
        if (e.target.closest('a')) return;
        
        const sku = card.dataset.sku;
        updateWhatsAppFAB(sku);
        
        // Visual feedback for selection
        document.querySelectorAll('.item-card').forEach(c => c.style.border = 'none');
        card.style.border = '2px solid #25D366';
      };
    });
    
    createIcons({ icons: { MessageCircle } });
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
  let payMethods = [];
  try {
    const res = await fetch(`${API_BASE}/payments/methods`);
    const data = await res.json();
    payMethods = data.methods;
  } catch (e) {
    payMethods = [{ name: "MTN Mobile Money", number: "+256774624210", type: "mobile_money" }, { name: "Cash", type: "cash" }];
  }

  const mmMethod = payMethods.find(m => m.type === 'mobile_money') || { number: '+256774624210' };

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
          ${payMethods.map(m => `<option>${m.name}</option>`).join('')}
        </select>
      </div>
      <div id="mm-details" style="display:none">
        <div style="background:#fff9e6; padding:12px; border-radius:8px; margin-bottom:16px; border:1px solid #ffeeba; font-size:0.85rem; color:#856404">
          Send payment via MTN Mobile Money to <strong>${mmMethod.number}</strong>
        </div>
        
        <div class="form-group">
          <label>Customer Phone (Optional)</label>
          <input type="text" id="cust-phone" placeholder="07...">
        </div>

        <div class="form-group" id="manual-trans-group">
          <label>Transaction Reference</label>
          <input type="text" id="trans-id" placeholder="Reference from SMS">
        </div>
      </div>
      <button class="btn btn-primary" id="btn-complete-sale">Record Sale</button>
    </div>
  `;

  const search = document.getElementById('pos-search');
  const preview = document.getElementById('pos-item-preview');
  const checkout = document.getElementById('pos-checkout-form');
  const mmDetails = document.getElementById('mm-details');
  const payMethod = document.getElementById('payment-method');
  let selectedItem = null;

  payMethod.onchange = () => {
    mmDetails.style.display = payMethod.value.includes('Mobile Money') ? 'block' : 'none';
    document.getElementById('btn-complete-sale').innerText = payMethod.value.includes('Mobile Money') ? 'Record Sale' : 'Complete Cash Sale';
  };

  search.oninput = async () => {
    if (search.value.length < 3) return;
    const res = await fetch(`${API_BASE}/items`);
    const items = await res.json();
    selectedItem = items.find(i => i.sku.toLowerCase() === search.value.toLowerCase() && i.status === 'Available');
    if (selectedItem) {
      preview.innerHTML = `
        <div class="card" style="display:flex; gap:16px; align-items:center">
          <img src="${JSON.parse(selectedItem.image_urls)[0]}" style="width:80px; height:80px; border-radius:8px; object-fit:cover">
          <div style="flex:1">
            <div style="font-weight:800; font-size:1.1rem">${selectedItem.sku}</div>
            <div style="font-size:0.9rem; color:var(--accent); font-weight:700">${parseInt(selectedItem.price).toLocaleString()} UGX</div>
            <a href="${storeInfo.whatsapp}?text=Hi%20${encodeURIComponent(storeInfo.name)}%2C%20I'm%20interested%20in%20${selectedItem.sku}" 
               target="_blank"
               class="btn btn-secondary"
               style="margin-top:8px; padding:6px 12px; font-size:0.75rem; background:#25D366; color:white; border:none; display:inline-flex; align-items:center; gap:6px">
               <i data-lucide="message-circle" style="width:14px; height:14px"></i> WhatsApp Customer
            </a>
          </div>
        </div>
      `;
      checkout.style.display = 'block';
      createIcons({ icons: { MessageCircle } });
      updateWhatsAppFAB(selectedItem.sku);
    } else {
      preview.innerHTML = '';
      checkout.style.display = 'none';
      const fab = document.getElementById('whatsapp-fab');
      if (fab) fab.style.display = 'none';
    }
  };

  const showSuccess = (saleData) => {
    const item = selectedItem;
    const shareText = `*The Cream Collective*\n🛍️ Item: ${item.category} (${item.sku})\n📏 Size: ${item.size}\n💰 Price: ${parseInt(item.price).toLocaleString()} UGX\n✅ Status: Sold\n\nThank you for shopping with us! ✨`;

    container.innerHTML = `
      <div class="card" style="text-align:center; padding:40px">
        <i data-lucide="check-circle" style="width:64px; height:64px; color:#319795; margin-bottom:16px"></i>
        <h2 style="margin-bottom:8px">Sale Completed!</h2>
        <p style="font-size:0.9rem; color:#666; margin-bottom:24px">Payment recorded via ${saleData.payment_method}</p>
        
        <div class="card" style="background:#f9f9f9; text-align:left; padding:12px; margin-bottom:24px">
          <div style="font-size:0.75rem; color:#999; margin-bottom:4px">WhatsApp Share Text:</div>
          <div id="share-content" style="font-size:0.85rem; white-space:pre-wrap; border:1px solid #eee; padding:8px; border-radius:4px; background:white">${shareText}</div>
          <button class="btn btn-secondary" id="btn-copy-share" style="margin-top:8px; padding:8px; font-size:0.8rem">
            <i data-lucide="copy" style="width:14px; height:14px; margin-right:4px; vertical-align:middle"></i> Copy Text
          </button>
        </div>

        <button class="btn btn-primary" onclick="window.location.hash='#inventory'">Back to Inventory</button>
      </div>
    `;
    
    import('lucide').then(({ createIcons, CheckCircle, Copy }) => {
      createIcons({ icons: { CheckCircle, Copy } });
    });

    document.getElementById('btn-copy-share').onclick = () => {
      navigator.clipboard.writeText(shareText);
      const btn = document.getElementById('btn-copy-share');
      btn.innerText = 'Copied!';
      setTimeout(() => btn.innerHTML = '<i data-lucide="copy" style="width:14px; height:14px; margin-right:4px; vertical-align:middle"></i> Copy Text', 2000);
    };
  };

  document.getElementById('btn-complete-sale').onclick = async () => {
    let phone = document.getElementById('cust-phone').value.trim().replace('+', '');
    if (phone) {
      if (phone.startsWith('07')) {
        phone = '256' + phone.substring(1);
      }
    }

    const data = {
      item_id: selectedItem.id,
      amount: selectedItem.price,
      channel: document.getElementById('sale-channel').value,
      payment_method: payMethod.value,
      transaction_id: document.getElementById('trans-id').value,
      customer_phone: phone
    };
    const res = await fetch(`${API_BASE}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      showSuccess(data);
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
