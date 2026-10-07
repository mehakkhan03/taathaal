const TEAM_DEFAULT=[
{
  id:1,initials:'AB',role:'Creative direction',name:'Ananya Bora',bio:'Shapes the visual language of Taathaal and the balance between heritage and contemporary styling.',active:true
},
{
  id:2,initials:'RS',role:'Craft & sourcing',name:'Ritwik Saikia',bio:'Works with textile stories, materials and artisan-led details to keep the collections rooted in Assam.',active:true
},
{
  id:3,initials:'MD',role:'Brand & digital',name:'Mitali Das',bio:'Builds the digital experience, product storytelling and the connection between craft and modern wardrobes.',active:true
}
];
function readStore(key,fallback) {
  try {
    const v=JSON.parse(localStorage.getItem(key)||'null');
    return v??fallback
  }
  catch {
    return fallback
  }
}
function writeStore(key,value) {
  localStorage.setItem(key,JSON.stringify(value))
}
function getTeam() {
  return readStore('taathaal-team',TEAM_DEFAULT)
}
function getCoupons() {
  const fallback=[ {
    id:'coupon-taat10',code:'TAAT10',type:'percent',value:10,minOrder:10000,maxDiscount:1000,usageLimit:0,start:'2026-10-07',end:'2026-12-31',active:true,used:0
  }
  ];
  return readStore('taathaal-coupons',fallback)
}
function getCategories() {
  return readStore('taathaal-categories',CATEGORIES.slice(1))
}
function getHomepage() {
  return readStore('taathaal-homepage', {
    headline:'Made with a sense of place.',eyebrow:'Featured collection',featuredProductIds:[1,2,3,6]
  }
  )
}
function reviewKey(product,review) {
  return String(review.id||`review-${product.id}-${review.name}-${review.date}`).replace(/\s+/g,'-').toLowerCase()
}
function getFeaturedReviews() {
  return readStore('taathaal-featured-reviews',null)
}
function featuredReviewSet() {
  let saved=getFeaturedReviews();
  if(!Array.isArray(saved)) {
    const defaults=[];
    PRODUCTS.forEach(p=>(p.reviews||[]).forEach(r=> {
      if(['Ananya','Mitali','Riya'].includes(r.name))defaults.push(reviewKey(p,r))
    }
    ));
    saved=defaults.slice(0,3);
    writeStore('taathaal-featured-reviews',saved)
  }
  return saved
}
function toggleReviewFeatured(productId,reviewId,value) {
  const p=PRODUCTS.find(x=>x.id===productId);
  if(!p)return;
  const r=(p.reviews||[]).find(x=>reviewKey(p,x)===reviewId);
  if(!r)return;
  const key=reviewKey(p,r);
  let featured=featuredReviewSet();
  featured=value?[...new Set([...featured,key])]:featured.filter(x=>x!==key);
  writeStore('taathaal-featured-reviews',featured);
  renderAdmin();
  renderFeaturedReviews();
  showToast(value?'Review featured on homepage':'Review removed from homepage')
}
function slugId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random()*1000)}`
}
function productSalePrice(p) {
  return Number(p.salePrice)>0&&Number(p.salePrice)<Number(p.price)?Number(p.salePrice):null
}
function getUnitPrice(p) {
  return productSalePrice(p)||Number(p.price)||0
}
function displayPrice(p) {
  const sale=productSalePrice(p);
  return sale?`<span class="sale-price">${money(sale)}</span> <del class="old-price">${money(p.price)}</del>`:money(p.price)
}
function activeProducts() {
  return PRODUCTS.filter(p=>p.active!==false)
}
function renderTeam() {
  const el=document.querySelector('#team-grid');
  if(!el)return;
  const team=getTeam().filter(m=>m.active!==false);
  el.innerHTML=team.map(m=>`<article class="team-card"><div class="team-avatar">${escapeHtml(m.initials||m.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div class="eyebrow">${escapeHtml(m.role)}</div><h2>${escapeHtml(m.name)}</h2><p>${escapeHtml(m.bio)}</p></article>`).join('')
}
function validCoupon(code,subtotal) {
  const c=getCoupons().find(x=>String(x.code).toUpperCase()===String(code).trim().toUpperCase()&&x.active!==false);
  if(!c)return {
    ok:false,message:'Coupon not found.'
  };
  const now=Date.now(),from=c.start?new Date(c.start+'T00:00:00').getTime():-Infinity,to=c.end?new Date(c.end+'T23:59:59').getTime():Infinity;
  if(now<from)return {
    ok:false,message:`This coupon starts on ${c.start}.`
  };
  if(now>to)return {
    ok:false,message:'This coupon has expired.'
  };
  if(c.minOrder&&subtotal<Number(c.minOrder))return {
    ok:false,message:`Minimum order is ${money(c.minOrder)}.`
  };
  if(c.usageLimit&&Number(c.used||0)>=Number(c.usageLimit))return {
    ok:false,message:'This coupon has reached its usage limit.'
  };
  let discount=c.type==='fixed'?Number(c.value):subtotal*(Number(c.value)/100);
  if(c.maxDiscount&&c.type==='percent')discount=Math.min(discount,Number(c.maxDiscount));
  discount=Math.min(discount,subtotal);
  return {
    ok:true,coupon:c,discount
  }
}
function adminProductRows() {
  return PRODUCTS.map(p=> {
    const sale=productSalePrice(p);
    return `<div class="admin-row admin-product-row"><span><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.category)} · ${p.active===false?'Hidden':'Active'}</small></span><span>${displayPrice(p)}</span><span class="stock-cell">${stockLabel(p)}</span><span class="featured-toggle"><label><input type="checkbox" ${p.featured?'checked':''} onchange="toggleProductFlag(${p.id},'featured',this.checked)"> Featured</label></span><span class="admin-actions"><button class="btn small" onclick="editProduct(${p.id})">Edit</button><button class="btn small danger" onclick="deleteProduct(${p.id})">Delete</button></span></div>`
  }
  ).join('')
}
function productForm(p= {
}
) {
  const imageFiles=['mSSni.webp','xxtHn.jpeg','WrMvt.jpeg','OMrPW.jpeg','Z528U.webp','VhHnN.jpg'];
  const current=String(p.image||'');
  const selected=current.startsWith('http')?'':current;
  return `<form class="admin-form" onsubmit="saveProduct(event,${p.id||'null'})"><div class="form-grid"><label>Name<input name="name" required value="${escapeHtml(p.name||'')}"></label><label>Category<select name="category">${getCategories().map(c=>`<option ${c===p.category?'selected':''}>${escapeHtml(c)}</option>`).join('')}</select></label><label>Price (₹)<input name="price" type="number" min="0" required value="${p.price??''}"></label><label>Sale price (₹)<input name="salePrice" type="number" min="0" value="${p.salePrice??''}"></label><label>Stock<input name="stock" type="number" min="0" required value="${p.stock??0}"></label></div><label class="upload-field">Product image<select name="image" required><option value="">Select a product image</option>${imageFiles.map(file=>`<option value="${file}" ${file===selected?'selected':''}>${file}</option>`).join('')}</select><small>Select one of the product images already included with Taathaal. Firebase Storage is not required.</small>${selected?`<span class="current-image"><img src="images/products/${selected}" alt="Current product image"><span>Current image</span></span>`:''}</label><label>Description<textarea name="desc" rows="4">${escapeHtml(p.desc||'')}</textarea><div class="rating-readonly"><span>Customer rating</span><strong>${p.reviews?.length?Number(p.rating||0).toFixed(1):'No reviews yet'}</strong><small>Ratings are calculated automatically from verified customer reviews after delivery.</small></div><div class="form-checks"><label><input type="checkbox" name="featured" ${p.featured?'checked':''}> Featured on homepage</label><label><input type="checkbox" name="active" ${p.active!==false?'checked':''}> Visible in store</label></div><div class="form-actions"><button class="btn primary" type="submit">${p.id?'Save changes':'Add product'}</button><button class="btn" type="button" onclick="closeAdminModal()">Cancel</button></div></form>`
}
function openAdminModal(title,body) {
  let m=document.querySelector('#admin-modal');
  if(!m) {
    m=document.createElement('div');
    m.id='admin-modal';
    m.className='admin-modal';
    document.body.appendChild(m)
  }
  m.innerHTML=`<div class="admin-modal-backdrop" onclick="closeAdminModal()"></div><div class="admin-modal-card"><button class="admin-modal-close" onclick="closeAdminModal()" aria-label="Close">×</button><div class="eyebrow">Taathaal Studio</div><h2>${escapeHtml(title)}</h2>${body}</div>`;
  m.classList.add('open')
}
function closeAdminModal() {
  document.querySelector('#admin-modal')?.classList.remove('open')
}
function editProduct(id) {
  const p=PRODUCTS.find(x=>x.id===id);
  if(p)openAdminModal('Edit product',productForm(p))
}
async function saveProduct(e,id) {
  e.preventDefault();
  const form=e.currentTarget;
  const f=new FormData(form);
  const existing=id?PRODUCTS.find(x=>x.id===id):null;
  const productId=id||Math.max(0,...PRODUCTS.map(p=>Number(p.id)||0))+1;
  const values= {
    name:String(f.get('name')).trim(),category:String(f.get('category')),price:Number(f.get('price')),salePrice:Number(f.get('salePrice')||0),stock:Number(f.get('stock')),image:String(f.get('image')||existing?.image||''),desc:String(f.get('desc')).trim(),featured:f.get('featured')==='on',active:f.get('active')==='on'
  };
  if(values.salePrice>=values.price)values.salePrice=0;
  if(!values.image) {
    showToast('Please select a product image');
    return
  }
  if(id) {
    Object.assign(existing,values)
  } else {
    values.id=productId;
    values.reviews=[];
    values.rating=0;
    PRODUCTS.push(values)
  }
  writeStore('taathaal-products',PRODUCTS);
  closeAdminModal();
  renderAdmin();
  showToast(id?'Product updated':'Product added')
}
function deleteProduct(id) {
  const p=PRODUCTS.find(x=>x.id===id);
  if(!p)return;
  if(!confirm(`Delete “${p.name}”? This cannot be undone in the demo.`))return;
  const i=PRODUCTS.findIndex(x=>x.id===id);
  PRODUCTS.splice(i,1);
  writeStore('taathaal-products',PRODUCTS);
  writeStore('taathaal-homepage', {
    ...getHomepage(),featuredProductIds:getHomepage().featuredProductIds.filter(x=>x!==id)
  }
  );
  renderAdmin();
  showToast('Product deleted')
}
function toggleProductFlag(id,field,value) {
  const p=PRODUCTS.find(x=>x.id===id);
  if(!p)return;
  p[field]=value;
  const home=getHomepage();
  home.featuredProductIds=home.featuredProductIds.filter(x=>x!==id);
  if(value)home.featuredProductIds.push(id);
  home.featuredProductIds=home.featuredProductIds.slice(-4);
  writeStore('taathaal-products',PRODUCTS);
  writeStore('taathaal-homepage',home);
  renderFeaturedV5();
}
function saveTeamMember(e,id) {
  e.preventDefault();
  const f=new FormData(e.currentTarget);
  const item= {
    name:String(f.get('name')).trim(),role:String(f.get('role')).trim(),bio:String(f.get('bio')).trim(),initials:String(f.get('initials')).trim().slice(0,3).toUpperCase(),active:f.get('active')==='on'
  };
  const team=getTeam();
  if(id) {
    Object.assign(team.find(x=>x.id===id),item)
  } else {
    item.id=Date.now();
    team.push(item)
  }
  writeStore('taathaal-team',team);
  closeAdminModal();
  renderAdmin();
  renderTeam();
  showToast(id?'Team member updated':'Team member added')
}
function teamForm(m= {
}
) {
  return `<form class="admin-form" onsubmit="saveTeamMember(event,${m.id||'null'})"><div class="form-grid"><label>Name<input name="name" required value="${escapeHtml(m.name||'')}"></label><label>Role<input name="role" required value="${escapeHtml(m.role||'')}"></label><label>Initials<input name="initials" maxlength="3" value="${escapeHtml(m.initials||'')}"></label></div><label>Bio<textarea name="bio" rows="4" required>${escapeHtml(m.bio||'')}</textarea></label><label><input type="checkbox" name="active" ${m.active!==false?'checked':''}> Visible on team page</label><div class="form-actions"><button class="btn primary" type="submit">${m.id?'Save changes':'Add member'}</button><button class="btn" type="button" onclick="closeAdminModal()">Cancel</button></div></form>`
}
function editTeam(id) {
  const m=getTeam().find(x=>x.id===id);
  if(m)openAdminModal('Edit team member',teamForm(m))
}
function deleteTeam(id) {
  const m=getTeam().find(x=>x.id===id);
  if(!m)return;
  if(!confirm(`Remove ${m.name} from the team?`))return;
  writeStore('taathaal-team',getTeam().filter(x=>x.id!==id));
  renderAdmin();
  renderTeam();
  showToast('Team member removed')
}
function couponForm(c= {
}
) {
  return `<form class="admin-form" onsubmit="saveCoupon(event,'${escapeHtml(c.id||'')}')"><div class="form-grid"><label>Coupon code<input name="code" required value="${escapeHtml(c.code||'')}" placeholder="TAATHAAL10"></label><label>Discount type<select name="type"><option value="percent" ${c.type!=='fixed'?'selected':''}>Percentage</option><option value="fixed" ${c.type==='fixed'?'selected':''}>Fixed amount</option></select></label><label>Discount value<input name="value" type="number" min="0" required value="${c.value??''}"></label><label>Minimum order (₹)<input name="minOrder" type="number" min="0" value="${c.minOrder??0}"></label><label>Maximum discount (₹)<input name="maxDiscount" type="number" min="0" value="${c.maxDiscount??''}"></label><label>Usage limit<input name="usageLimit" type="number" min="0" value="${c.usageLimit??''}"></label><label>Available from<input name="start" type="date" required value="${escapeHtml(c.start||'')}"></label><label>Available until<input name="end" type="date" required value="${escapeHtml(c.end||'')}"></label></div><label><input type="checkbox" name="active" ${c.active!==false?'checked':''}> Coupon enabled</label><div class="form-actions"><button class="btn primary" type="submit">${c.id?'Save coupon':'Release coupon'}</button><button class="btn" type="button" onclick="closeAdminModal()">Cancel</button></div></form>`
}
function editCoupon(id) {
  const c=getCoupons().find(x=>x.id===id);
  if(c)openAdminModal('Edit coupon',couponForm(c))
}
function saveCoupon(e,id) {
  e.preventDefault();
  const f=new FormData(e.currentTarget);
  const item= {
    code:String(f.get('code')).trim().toUpperCase(),type:String(f.get('type')),value:Number(f.get('value')),minOrder:Number(f.get('minOrder')||0),maxDiscount:Number(f.get('maxDiscount')||0),usageLimit:Number(f.get('usageLimit')||0),start:String(f.get('start')),end:String(f.get('end')),active:f.get('active')==='on',used:id?(getCoupons().find(x=>x.id===id)?.used||0):0
  };
  if(item.end<item.start) {
    showToast('End date must be on or after the start date');
    return
  }
  const coupons=getCoupons();
  if(coupons.some(x=>x.code===item.code&&x.id!==id)) {
    showToast('That coupon code already exists');
    return
  }
  if(id)Object.assign(coupons.find(x=>x.id===id),item);
  else {
    item.id=slugId('coupon');
    coupons.push(item)
  }
  writeStore('taathaal-coupons',coupons);
  closeAdminModal();
  renderAdmin();
  showToast(id?'Coupon updated':'Coupon released')
}
function deleteCoupon(id) {
  const c=getCoupons().find(x=>x.id===id);
  if(!c)return;
  if(!confirm(`Delete coupon ${c.code}?`))return;
  writeStore('taathaal-coupons',getCoupons().filter(x=>x.id!==id));
  renderAdmin();
  showToast('Coupon deleted')
}
function couponStatus(c) {
  const now=Date.now(),from=new Date(c.start+'T00:00:00').getTime(),to=new Date(c.end+'T23:59:59').getTime();
  if(c.active===false)return ['Disabled','disabled'];
  if(now<from)return ['Scheduled','scheduled'];
  if(now>to)return ['Expired','expired'];
  if(c.usageLimit&&Number(c.used||0)>=Number(c.usageLimit))return ['Used up','expired'];
  return ['Active','active']
}
function renderAdmin() {
  const el=document.querySelector('#admin-dashboard');
  if(!el)return;
  if(window.taathaalFirebase && !window.taathaalFirebase.ready) {
    el.innerHTML='<div class="empty"><h2>Connecting to Taathaal Studio…</h2><p>Please wait while your Firebase session is checked.</p></div>';
    return;
  }
  if(window.taathaalFirebase && !window.taathaalFirebase.admin) {
    el.innerHTML='<div class="empty"><h2>Admin access required.</h2><p>Sign in with the Taathaal shop-owner account to manage products, orders, coupons, team and reviews.</p><a class="btn primary" href="login.html?return=admin">Shop owner login</a></div>';
    return;
  }
  const orders=adminOrders();
  const revenue=orders.reduce((a,o)=>a+o.total,0);
  const low=PRODUCTS.filter(p=>p.stock>0&&p.stock<=3).length;
  const out=PRODUCTS.filter(p=>p.stock<=0).length;
  const team=getTeam(), coupons=getCoupons(), customers=readStore('taathaal-users',[]);
  const orderRows=orders.map(o=>`<div class="admin-row"><span><strong>${escapeHtml(o.id)}</strong><small>${escapeHtml(o.date)}</small></span><span>${escapeHtml(o.customer)}<small>${escapeHtml(o.email)}</small></span><span>${money(o.total)}</span><span><select onchange="setOrderStatus('${o.id}',this.value)"><option ${o.status==='New'?'selected':''}>New</option><option ${o.status==='Confirmed'?'selected':''}>Confirmed</option><option ${o.status==='Processing'?'selected':''}>Processing</option><option ${o.status==='Shipped'?'selected':''}>Shipped</option><option ${o.status==='Delivered'?'selected':''}>Delivered</option><option ${o.status==='Cancelled'?'selected':''}>Cancelled</option></select></span><span><button class="btn small" onclick="showOrder('${o.id}')">Details</button></span></div>`).join('');
  const inventoryRows=PRODUCTS.map(p=>`<div class="admin-row"><span><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.category)}</small></span><span>${displayPrice(p)}</span><span class="stock-cell">${stockLabel(p)}</span><span class="stock-edit"><button onclick="adjustStock(${p.id},-1)">−</button><strong>${p.stock}</strong><button onclick="adjustStock(${p.id},1)">+</button></span><span><button class="btn small" onclick="setStock(${p.id})">Set stock</button></span></div>`).join('');
  const teamRows=team.map(m=>`<div class="admin-row"><span><strong>${escapeHtml(m.name)}</strong><small>${escapeHtml(m.initials||'')}</small></span><span>${escapeHtml(m.role)}</span><span>${escapeHtml(m.bio)}</span><span>${m.active!==false?'Visible':'Hidden'}</span><span class="admin-actions"><button class="btn small" onclick="editTeam(${m.id})">Edit</button><button class="btn small danger" onclick="deleteTeam(${m.id})">Delete</button></span></div>`).join('');
  const couponRows=coupons.map(c=> {
    const status=couponStatus(c);
    const discount=c.type==='fixed'?money(c.value):`${c.value}%${c.maxDiscount?` · max ${money(c.maxDiscount)}`:''}`;
    return `<div class="admin-row"><span><strong>${escapeHtml(c.code)}</strong><small>${c.usageLimit?`${c.used||0}/${c.usageLimit} uses`:'No usage limit'}</small></span><span>${discount}</span><span>${escapeHtml(c.start)} → ${escapeHtml(c.end)}</span><span><span class="coupon-status ${status[1]}">${status[0]}</span></span><span class="admin-actions"><button class="btn small" onclick="editCoupon('${c.id}')">Edit</button><button class="btn small danger" onclick="deleteCoupon('${c.id}')">Delete</button></span></div>`
  }
  ).join('');
  const customerRows=customers.map(u=>`<div class="admin-row"><span><strong>${escapeHtml(u.name||'Customer')}</strong></span><span>${escapeHtml(u.email||'')}</span><span>${escapeHtml(u.joined||'')}</span><span></span><span></span></div>`).join('');
  const featured=featuredReviewSet();
  const reviewRows=PRODUCTS.flatMap(p=>(p.reviews||[]).map(r=>( {
    p,r
  }
  ))).map(( {
    p,r
  }
  )=> {
    const key=reviewKey(p,r);
    const isFeatured=featured.includes(key);
    return `<div class="admin-review-row"><div class="admin-review-main"><div><strong>${escapeHtml(r.name)}</strong> <span>${stars(r.rating)}</span>${r.verifiedPurchase?` <span class="verified-review">Verified purchase</span>`:''}<small>${escapeHtml(p.name)} · ${escapeHtml(r.date)}</small></div><p>${escapeHtml(r.text)}</p></div><button class="btn small ${isFeatured?'danger':''}" onclick="toggleReviewFeatured(${p.id},'${escapeHtml(key)}',${!isFeatured})">${isFeatured?'Remove feature':'Feature'}</button></div>`
  }
  ).join('');
  el.innerHTML=`
 <div class="admin-stats"><div><span>Orders</span><strong>${orders.length}</strong></div><div><span>Revenue</span><strong>${money(revenue)}</strong></div><div><span>Low stock</span><strong>${low}</strong></div><div><span>Out of stock</span><strong>${out}</strong></div></div>
 <nav class="admin-nav"><a href="#orders">Orders</a><a href="#products">Products</a><a href="#inventory">Inventory</a><a href="#team">Team</a><a href="#coupons">Coupons</a><a href="#customers">Customers</a><a href="#reviews">Reviews</a></nav>
 <section id="orders" class="admin-section"><div class="admin-section-head"><div><div class="eyebrow">Order queue</div><h2>Process orders</h2></div><span class="muted">Firebase-backed data. Changes are saved to Taathaal.</span></div><div class="admin-table"><div class="admin-row admin-head"><span>Order</span><span>Customer</span><span>Total</span><span>Status</span><span>Action</span></div>${orderRows}</div></section>
 <section id="products" class="admin-section"><div class="admin-section-head"><div><div class="eyebrow">Catalogue</div><h2>Products</h2></div><button class="btn primary" onclick="openAdminModal('Add product',productForm())">+ Add product</button></div><div class="admin-table"><div class="admin-row admin-head"><span>Product</span><span>Price</span><span>Stock</span><span>Homepage</span><span>Actions</span></div>${adminProductRows()}</div></section>
 <section id="inventory" class="admin-section"><div class="admin-section-head"><div><div class="eyebrow">Stock control</div><h2>Inventory</h2></div><span class="muted">Quick quantity adjustments</span></div><div class="admin-table">${inventoryRows}</div></section>
 <section id="team" class="admin-section"><div class="admin-section-head"><div><div class="eyebrow">People</div><h2>Team</h2></div><button class="btn primary" onclick="openAdminModal('Add team member',teamForm())">+ Add member</button></div><div class="admin-table"><div class="admin-row admin-head"><span>Member</span><span>Role</span><span>Bio</span><span>Status</span><span>Actions</span></div>${teamRows}</div></section>
 <section id="coupons" class="admin-section"><div class="admin-section-head"><div><div class="eyebrow">Promotions</div><h2>Coupons & sales</h2></div><button class="btn primary" onclick="openAdminModal('Release a coupon',couponForm())">+ New coupon</button></div><div class="admin-table"><div class="admin-row admin-head"><span>Code</span><span>Discount</span><span>Valid dates</span><span>Status</span><span>Actions</span></div>${couponRows||'<div class="admin-empty">No coupons released yet. Create one when you are ready for a promotion.</div>'}</div></section>
 <section id="customers" class="admin-section"><div class="admin-section-head"><div><div class="eyebrow">Customer list</div><h2>Customers</h2></div></div><div class="admin-table"><div class="admin-row admin-head"><span>Name</span><span>Email</span><span>Joined</span><span></span><span></span></div>${customerRows||'<div class="admin-empty">Customer accounts will appear here as people register.</div>'}</div></section>
 <section id="reviews" class="admin-section"><div class="admin-section-head"><div><div class="eyebrow">Community</div><h2>Reviews</h2></div></div><div class="admin-table">${reviewRows||'<div class="admin-empty">No reviews yet.</div>'}</div></section>`;
}
function applyCheckoutCoupon() {
  const input=document.querySelector('#coupon-code');
  if(!input)return;
  const subtotal=Number(document.querySelector('#checkout-subtotal')?.dataset.value||0);
  const result=validCoupon(input.value,subtotal);
  if(!result.ok) {
    localStorage.removeItem('taathaal-applied-coupon');
    writeStore('taathaal-coupon-message',result.message);
    renderCheckout();
    return
  }
  localStorage.removeItem('taathaal-coupon-message');
  writeStore('taathaal-applied-coupon', {
    code:result.coupon.code,discount:result.discount
  }
  );
  renderCheckout()
}
function clearCheckoutCoupon() {
  localStorage.removeItem('taathaal-applied-coupon');
  localStorage.removeItem('taathaal-coupon-message');
  renderCheckout()
}
