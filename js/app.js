function money(n) {
  return new Intl.NumberFormat('en-IN', {
    style:'currency',currency:'INR',maximumFractionDigits:0
  }
  ).format(n)
}
function stars(rating) {
  const r=Math.max(0,Math.min(5,Number(rating)||0));
  return `<span class="stars" aria-label="${r} out of 5 stars">${'★'.repeat(r)}${'☆'.repeat(5-r)}</span>`
}
function escapeHtml(value) {
  return String(value??'').replace(/[&<>'"]/g,c=>( {
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }
  [c]))
}
function productCard(p) {
  return `<article class="card"><a href="product.html?id=${p.id}"><div class="product-img"><img src="${productImageSrc(p)}" alt="${escapeHtml(p.name)}" loading="lazy"></div><div class="card-body"><div class="tag">${escapeHtml(p.category)}</div><h3>${escapeHtml(p.name)}</h3><div class="card-meta"><div class="price">${displayPrice(p)}</div><div class="card-rating">${productAverageRating(p)?`${stars(productAverageRating(p))} <span>${productAverageRating(p).toFixed(1)}</span>`:'<span class="muted">No reviews yet</span>'}</div></div></div></a></article>`
}
function header() {
  return `<div class="topbar"><div class="container">Handmade in Assam · Contemporary craft couture</div></div><nav class="nav"><div class="container navin"><a class="brand" href="index.html">TAATHAAL</a><div class="links"><a href="shop.html">Collections</a><a href="index.html#story">Our Story</a><a href="team.html">The Team</a><a href="contact.html">Contact</a></div><div class="nav-actions"><a class="nav-search" href="shop.html" aria-label="Search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 5 5"></path></svg></a><a class="nav-profile" href="profile.html" aria-label="Profile"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"></circle><path d="M5.5 20c.9-3.5 3-5 6.5-5s5.6 1.5 6.5 5"></path></svg></a><a class="wishlist-nav" href="wishlist.html" aria-label="Wishlist">♡</a><a class="bag-btn" href="cart.html" aria-label="Shopping bag"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.5h11l1 12h-13z"></path><path d="M9 9V6.5a3 3 0 0 1 6 0V9"></path></svg><span data-cart-count>0</span></a><button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" onclick="toggleMobileMenu()"><span></span><span></span><span></span></button></div><div class="mobile-menu" id="mobile-menu"><a href="shop.html">Collections</a><a href="index.html#story">Our Story</a><a href="team.html">The Team</a><a href="contact.html">Contact</a><a href="profile.html">Profile & orders</a><a href="wishlist.html">Wishlist</a><a href="admin.html">Shop owner</a></div></div></nav>`
}
function mountHeader() {
  const el=document.querySelector('[data-site-header]');
  if(el)el.innerHTML=header()
}
function toggleMobileMenu() {
  const menu=document.querySelector('#mobile-menu');
  const btn=document.querySelector('.menu-toggle');
  if(!menu||!btn)return;
  const open=menu.classList.toggle('open');
  btn.classList.toggle('open',open);
  btn.setAttribute('aria-expanded',String(open));
  btn.setAttribute('aria-label',open?'Close menu':'Open menu')
}
function renderFeatured() {
  const el=document.querySelector('#featured');
  if(!el)return;
  const home=getHomepage();
  let items=home.featuredProductIds.map(id=>PRODUCTS.find(p=>p.id===id)).filter(Boolean);
  if(!items.length)items=PRODUCTS.filter(p=>p.featured).slice(0,4);
  if(!items.length)items=PRODUCTS.slice(0,4);
  el.innerHTML=items.slice(0,4).map(productCard).join('')
}
function getShopState() {
  const params=new URLSearchParams(location.search);
  return {
    category:params.get('category')||'All',search:(params.get('search')||'').trim(),sort:params.get('sort')||'featured'
  }
}
function renderShop() {
  const el=document.querySelector('#shop-grid');
  if(!el)return;
  const state=getShopState();
  let items=PRODUCTS.filter(p=>state.category==='All'||p.category===state.category);
  if(state.search) {
    const q=state.search.toLowerCase();
    items=items.filter(p=>`${p.name} ${p.category} ${p.craft} ${p.desc}`.toLowerCase().includes(q))
  }
  if(state.sort==='price-low')items.sort((a,b)=>a.price-b.price);
  if(state.sort==='price-high')items.sort((a,b)=>b.price-a.price);
  if(state.sort==='rating')items.sort((a,b)=>b.rating-a.rating);
  if(state.sort==='name')items.sort((a,b)=>a.name.localeCompare(b.name));
  const filters=document.querySelector('#filters');
  if(filters)filters.innerHTML=CATEGORIES.map(c=>`<button class="filter ${c===state.category?'active':''}" type="button" onclick="shopCategory('${encodeURIComponent(c)}')">${escapeHtml(c)}</button>`).join('');
  const search=document.querySelector('#shop-search');
  if(search)search.value=state.search;
  const sort=document.querySelector('#shop-sort');
  if(sort)sort.value=state.sort;
  el.innerHTML=items.length?items.map(productCard).join(''):`<div class="empty shop-empty"><h2>No pieces found.</h2><p>Try another search or collection.</p><button class="btn" onclick="clearShopFilters()">Clear filters</button></div>`;
  const count=document.querySelector('#shop-count');
  if(count)count.textContent=`${items.length} ${items.length===1?'piece':'pieces'}`
}
function shopCategory(category) {
  const state=getShopState();
  const params=new URLSearchParams();
  if(category!=='All')params.set('category',decodeURIComponent(category));
  if(state.search)params.set('search',state.search);
  if(state.sort!=='featured')params.set('sort',state.sort);
  location.href=`shop.html${params.toString()?'?'+params.toString():''}`
}
function updateShop() {
  const state=getShopState();
  const params=new URLSearchParams();
  if(state.category!=='All')params.set('category',state.category);
  const search=document.querySelector('#shop-search')?.value.trim();
  const sort=document.querySelector('#shop-sort')?.value||'featured';
  if(search)params.set('search',search);
  if(sort!=='featured')params.set('sort',sort);
  location.href=`shop.html${params.toString()?'?'+params.toString():''}`
}
function clearShopFilters() {
  location.href='shop.html'
}
function renderProduct() {
  const el=document.querySelector('#product-detail');
  if(!el)return;
  const id=Number(new URLSearchParams(location.search).get('id'));
  const p=PRODUCTS.find(x=>x.id===id)||PRODUCTS[0];
  document.title=`${p.name} — Taathaal`;
  el.innerHTML=`<div class="detail-image"><img src="${productImageSrc(p)}" alt="${escapeHtml(p.name)}"></div><div class="detail-copy"><div class="eyebrow" style="color:var(--crimson)">${escapeHtml(p.category)}</div><h1>${escapeHtml(p.name)}</h1><div class="detail-rating">${productAverageRating(p)?`${stars(productAverageRating(p))} <span>${productAverageRating(p).toFixed(1)} · ${p.reviews.length} reviews</span>`:'<span class="muted">No reviews yet</span>'}</div><div class="price detail-price">${displayPrice(p)}</div><p>${escapeHtml(p.desc)}</p><p class="availability">In stock · Hand-finished in small batches</p><div class="qty"><label for="qty">Quantity</label><div class="qty-control"><button type="button" onclick="changeQty(-1)">−</button><input id="qty" type="number" min="1" value="1"><button type="button" onclick="changeQty(1)">+</button></div></div><button class="btn primary add-bag-large" onclick="addToCart(${p.id})">Add to bag</button></div>`;
  renderReviews(p)
}
function changeQty(delta) {
  const input=document.querySelector('#qty');
  if(!input)return;
  input.value=Math.max(1,Number(input.value||1)+delta)
}
function getLocalProductReviews() {
  try {
    return JSON.parse(localStorage.getItem('taathaal-product-reviews')||'{}')
  }
  catch {
    return {
    }
  }
}
function saveLocalProductReviews(data) {
  localStorage.setItem('taathaal-product-reviews',JSON.stringify(data))
}
function hydrateProductReviews() {
  const saved=getLocalProductReviews();
  PRODUCTS.forEach(p=> {
    const mine=Array.isArray(saved[p.id])?saved[p.id]:[];
    if(mine.length) {
      const existingIds=new Set((p.reviews||[]).map(r=>r.id).filter(Boolean));
      p.reviews=[...(p.reviews||[]),...mine.filter(r=>!existingIds.has(r.id))];
      const total=p.reviews.reduce((sum,r)=>sum+Number(r.rating||0),0);
      p.rating=p.reviews.length?Math.round((total/p.reviews.length)*10)/10:0;
    }
  }
  )
}
hydrateProductReviews()
function renderReviews(p) {
  const el=document.querySelector('#reviews');
  if(!el)return;
  const reviews=p.reviews||[];
  const rating=reviews.length?reviews.reduce((sum,r)=>sum+Number(r.rating||0),0)/reviews.length:0;
  const rounded=Math.round(rating*10)/10;
  el.innerHTML=`<div class="review-head"><div><div class="eyebrow">Customer notes</div><h2>Reviews from the community</h2></div><div class="review-summary">${stars(rounded)} <strong>${rounded.toFixed(1)}</strong><span>${reviews.length} reviews</span></div></div><div class="reviews-grid">${reviews.map(r=>`<article class="review"><div class="review-top"><strong>${escapeHtml(r.name)}${r.verifiedPurchase?` <span class="verified-review">Verified purchase</span>`:''}</strong><span>${escapeHtml(r.date)}</span></div><div>${stars(r.rating)}</div><p>${escapeHtml(r.text)}</p></article>`).join('')}</div>`
}
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('taathaal-cart')||'[]')
  }
  catch {
    return[]
  }
}
function saveCart(c) {
  localStorage.setItem('taathaal-cart',JSON.stringify(c));
  updateCartCount()
}
function addToCart(id) {
  let c=getCart(),qty=Math.max(1,Number(document.querySelector('#qty')?.value||1)),item=c.find(x=>x.id===id);
  item?item.qty+=qty:c.push( {
    id,qty
  }
  );
  saveCart(c);
  showToast('Added to your bag');
}
function updateCartCount() {
  const c=getCart();
  document.querySelectorAll('[data-cart-count]').forEach(e=>e.textContent=c.reduce((a,b)=>a+b.qty,0))
}
function renderCart() {
  const el=document.querySelector('#cart');
  if(!el)return;
  const c=getCart();
  if(!c.length) {
    el.innerHTML='<div class="empty"><h2>Your bag is waiting.</h2><p>Explore the collection and add a handcrafted piece.</p><a class="btn primary" href="shop.html">Explore collection</a></div>';
    return
  }
  let total=0;
  el.innerHTML=c.map(item=> {
    const p=PRODUCTS.find(x=>x.id===item.id);
    if(!p)return '';
    total+=getUnitPrice(p)*item.qty;
    return `<div class="cart-row"><img src="${productImageSrc(p)}" alt="${escapeHtml(p.name)}"><div class="cart-info"><strong>${escapeHtml(p.name)}</strong><div class="tag">${escapeHtml(p.category)}</div><div class="cart-price">${displayPrice(p)}</div></div><div class="cart-qty"><button type="button" onclick="changeCartQty(${p.id},-1)">−</button><span>${item.qty}</span><button type="button" onclick="changeCartQty(${p.id},1)">+</button></div><button class="remove-btn" type="button" onclick="removeFromCart(${p.id})">Remove</button></div>`
  }
  ).join('')+`<div class="cart-summary"><div class="summary-line"><strong>Subtotal</strong><strong>${money(total)}</strong></div><p>Shipping and taxes are calculated at checkout.</p><button class="btn primary full" onclick="goCheckout()">Proceed to checkout</button></div>`
}
function changeCartQty(id,delta) {
  const c=getCart();
  const item=c.find(x=>x.id===id);
  if(!item)return;
  item.qty+=delta;
  saveCart(item.qty<1?c.filter(x=>x.id!==id):c);
  renderCart()
}
function removeFromCart(id) {
  saveCart(getCart().filter(x=>x.id!==id));
  renderCart();
  showToast('Removed from your bag')
}
function demoCheckout() {
  const user=getCurrentUser();
  if(!user) {
    showToast('Please log in before checkout');
    setTimeout(()=>location.href='login.html?return=cart',500);
    return
  }
  showToast('Checkout is ready for Firebase integration')
}
function showToast(message) {
  let toast=document.querySelector('#toast');
  if(!toast) {
    toast=document.createElement('div');
    toast.id='toast';
    toast.className='toast';
    document.body.appendChild(toast)
  }
  toast.textContent=message;
  toast.classList.add('show');
  clearTimeout(window.__toast);
  window.__toast=setTimeout(()=>toast.classList.remove('show'),2200)
}
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('taathaal-user')||'null')
  }
  catch {
    return null
  }
}
function saveUser(user) {
  localStorage.setItem('taathaal-user',JSON.stringify(user))
}
function demoOrders() {
  return[ {
    id:'WL-24091',date:'18 September 2026',status:'Delivered',productId:1,qty:1,price:12499,rating:5,review:'The weave and colour feel beautifully balanced. It looked even better in natural light.'
  }, {
    id:'WL-23744',date:'02 August 2026',status:'Delivered',productId:13,qty:1,price:2199,rating:4,review:'Lovely structure and a thoughtful fusion of Assamese textile details with a modern silhouette.'
  }, {
    id:'WL-23108',date:'21 June 2026',status:'Delivered',productId:3,qty:2,price:1299,rating:5,review:'Bought these as gifts. The finish felt special and the packaging was lovely.'
  }
  ]
}
function renderProfile() {
  const el=document.querySelector('#profile-content');
  if(!el)return;
  const user=getCurrentUser();
  if(!user) {
    el.innerHTML=`<div class="profile-gate"><div class="eyebrow">Your account</div><h1>Welcome back to Taathaal.</h1><p>Log in to view your profile, previous orders and saved reviews.</p><a class="btn primary" href="login.html?return=profile">Log in</a><a class="btn" href="register.html">Create account</a></div>`;
    return
  }
  const orders=demoOrders();
  el.innerHTML=`<div class="profile-header"><div><div class="eyebrow">My account</div><h1>${escapeHtml(user.name)}</h1><p>${escapeHtml(user.email)}</p></div><button class="btn" onclick="logout()">Log out</button></div><section class="profile-section"><div class="section-head"><div><div class="eyebrow">Order history</div><h2>Previous orders</h2></div><span class="order-count">${orders.length} orders</span></div><div class="orders">${orders.map(o=>{const p=PRODUCTS.find(x=>x.id===o.productId);return `<article class="order-card"><div class="order-main"><img src="${productImageSrc(p)}" alt="${escapeHtml(p.name)}"><div><div class="order-meta"><span>Order ${o.id}</span><span>${o.date}</span><span class="status">${o.status}</span></div><h3>${escapeHtml(p.name)}</h3><p>${o.qty} piece${o.qty>1?'s':''} · ${money(o.price*o.qty)}</p></div></div><div class="order-review"><div class="review-top"><strong>Your review</strong><span>${stars(o.rating)}</span></div><p>${escapeHtml(o.review)}</p></div></article>`}).join('')}</div></section>`
}
function handleAuthForm() {
  const form=document.querySelector('#auth-form');
  if(!form)return;
  form.addEventListener('submit',async e=> {
    e.preventDefault();
    const email=document.querySelector('#email').value.trim();
    const password=document.querySelector('#password').value;
    if(password.length<6) {
      showToast('Password must be at least 6 characters');
      return
    }
    try {
      if(window.taathaalFirebase?.login)await window.taathaalFirebase.login(email,password);
      else throw new Error('Firebase is still loading');
      const returnTo=new URLSearchParams(location.search).get('return');
      location.href=returnTo==='cart'?'cart.html':returnTo==='checkout'?'checkout.html':'profile.html'
    }
    catch(err) {
      const msg=err?.code==='auth/invalid-credential'?'Incorrect email or password.':err?.code==='auth/user-not-found'?'No account found for this email.':err?.code==='auth/too-many-requests'?'Too many attempts. Try again later.':err?.message||'Unable to log in.';
      showToast(msg)
    }
  }
  )
}
function handleRegister() {
  const form=document.querySelector('#register-form');
  if(!form)return;
  form.addEventListener('submit',async e=> {
    e.preventDefault();
    const name=document.querySelector('#reg-name').value.trim();
    const email=document.querySelector('#reg-email').value.trim();
    const password=document.querySelector('#reg-password').value;
    if(!name||!email||password.length<6) {
      showToast('Please complete all fields. Password must be at least 6 characters.');
      return
    }
    try {
      if(window.taathaalFirebase?.register)await window.taathaalFirebase.register(name,email,password);
      else throw new Error('Firebase is still loading');
      location.href='profile.html'
    }
    catch(err) {
      const msg=err?.code==='auth/email-already-in-use'?'An account with this email already exists.':err?.code==='auth/weak-password'?'Choose a stronger password.':err?.message||'Unable to create the account.';
      showToast(msg)
    }
  }
  )
}
function logout() {
  if(window.taathaalFirebase?.logout) {
    window.taathaalFirebase.logout().finally(()=> {
      localStorage.removeItem('taathaal-user');
      location.href='profile.html'
    }
    );
    return
  }
  localStorage.removeItem('taathaal-user');
  location.href='profile.html'
}
document.addEventListener('DOMContentLoaded',()=> {
  mountHeader();
  renderFeatured();
  renderShop();
  renderProduct();
  renderCart();
  renderProfile();
  handleAuthForm();
  handleRegister();
  updateCartCount()
}
);
function stockLabel(p) {
  if(p.stock<=0)return '<span class="stock out">Out of stock</span>';
  if(p.stock<=3)return `<span class="stock low">Only ${p.stock} left</span>`;
  return '<span class="stock in">In stock</span>'
}
function wishlist() {
  try {
    return JSON.parse(localStorage.getItem('taathaal-wishlist')||'[]')
  }
  catch {
    return[]
  }
}
function saveWishlist(w) {
  localStorage.setItem('taathaal-wishlist',JSON.stringify(w))
}
function toggleWishlist(id,e) {
  if(e)e.preventDefault();
  let w=wishlist();
  w.includes(id)?w=w.filter(x=>x!==id):w.push(id);
  saveWishlist(w);
  showToast(w.includes(id)?'Saved to your wishlist':'Removed from wishlist');
  renderWishlist();
  renderProduct()
}
function isWishlisted(id) {
  return wishlist().includes(id)
}
function productImageSrc(p) {
  const img=String(p?.image||'');
  return /^https?:\/\//i.test(img)||img.startsWith('data:')||img.startsWith('/')?img:`images/products/${img}`
}
function productAverageRating(p) {
  const reviews=Array.isArray(p?.reviews)?p.reviews:[];
  if(!reviews.length)return 0;
  return Math.round((reviews.reduce((sum,r)=>sum+Number(r.rating||0),0)/reviews.length)*10)/10
}
function productCardV5(p) {
  return `<article class="card product-card"><div class="product-img"><img src="${productImageSrc(p)}" alt="${escapeHtml(p.name)}" loading="lazy"><button class="wish-btn ${isWishlisted(p.id)?'active':''}" aria-label="${isWishlisted(p.id)?'Remove from wishlist':'Add to wishlist'}" onclick="toggleWishlist(${p.id},event)">${isWishlisted(p.id)?'♥':'♡'}</button></div><a href="product.html?id=${p.id}"><div class="card-body"><div class="tag">${escapeHtml(p.category)}</div><h3>${escapeHtml(p.name)}</h3><div class="card-meta"><div class="price">${displayPrice(p)}</div><div class="card-rating">${productAverageRating(p)?`${stars(productAverageRating(p))} <span>${productAverageRating(p).toFixed(1)}</span>`:'<span class="muted">No reviews yet</span>'}</div></div>${stockLabel(p)}</div></a></article>`
}
function replaceProductCards() {
  document.querySelectorAll('#featured .card,#shop-grid .card').forEach(card=> {
    const link=card.querySelector('a[href*="product.html?id="]');
    if(!link)return;
    const id=Number(new URL(link.href).searchParams.get('id'));
    const p=PRODUCTS.find(x=>x.id===id);
    if(p)card.outerHTML=productCardV5(p)
  }
  )
}
function renderFeaturedV5() {
  const el=document.querySelector('#featured');
  if(!el)return;
  const home=getHomepage();
  let items=home.featuredProductIds.map(id=>PRODUCTS.find(p=>p.id===id)).filter(Boolean);
  if(!items.length)items=PRODUCTS.filter(p=>p.featured).slice(0,4);
  if(!items.length)items=PRODUCTS.slice(0,4);
  el.innerHTML=items.slice(0,4).map(productCardV5).join('')
}
function renderShopV5() {
  const el=document.querySelector('#shop-grid');
  if(!el)return;
  const state=getShopState();
  let items=PRODUCTS.filter(p=>state.category==='All'||p.category===state.category);
  if(state.search) {
    const q=state.search.toLowerCase();
    items=items.filter(p=>`${p.name} ${p.category} ${p.craft} ${p.desc}`.toLowerCase().includes(q))
  }
  if(state.sort==='price-low')items.sort((a,b)=>a.price-b.price);
  if(state.sort==='price-high')items.sort((a,b)=>b.price-a.price);
  if(state.sort==='rating')items.sort((a,b)=>b.rating-a.rating);
  if(state.sort==='name')items.sort((a,b)=>a.name.localeCompare(b.name));
  const filters=document.querySelector('#filters');
  if(filters)filters.innerHTML=CATEGORIES.map(c=>`<button class="filter ${c===state.category?'active':''}" type="button" onclick="shopCategory('${encodeURIComponent(c)}')">${escapeHtml(c)}</button>`).join('');
  const search=document.querySelector('#shop-search');
  if(search)search.value=state.search;
  const sort=document.querySelector('#shop-sort');
  if(sort)sort.value=state.sort;
  el.innerHTML=items.length?items.map(productCardV5).join(''):`<div class="empty shop-empty"><h2>No pieces found.</h2><p>Try another search or collection.</p><button class="btn" onclick="clearShopFilters()">Clear filters</button></div>`;
  const count=document.querySelector('#shop-count');
  if(count)count.textContent=`${items.length} ${items.length===1?'piece':'pieces'}`
}
function renderWishlist() {
  const el=document.querySelector('#wishlist-grid');
  if(!el)return;
  const ids=wishlist();
  const items=PRODUCTS.filter(p=>ids.includes(p.id));
  el.innerHTML=items.length?items.map(productCardV5).join(''):`<div class="empty"><h2>Your wishlist is empty.</h2><p>Save pieces you want to come back to.</p><a class="btn primary" href="shop.html">Explore collection</a></div>`
}
function couponSuggestion(subtotal) {
  const now=Date.now();
  const candidates=getCoupons().filter(c=>c.active!==false&&c.start&&c.end&&new Date(c.start+'T00:00:00').getTime()<=now&&new Date(c.end+'T23:59:59').getTime()>=now&&Number(c.minOrder||0)>subtotal);
  if(!candidates.length)return '';
  candidates.sort((a,b)=>Number(a.minOrder)-Number(b.minOrder));
  const c=candidates[0];
  const remaining=Number(c.minOrder)-subtotal;
  const discount=c.type==='fixed'?money(c.value):`${c.value}% off${c.maxDiscount?` up to ${money(c.maxDiscount)}`:''}`;
  return `Add ${money(remaining)} more worth of products and get ${discount} with coupon code ${c.code}.`
}
function renderCheckout() {
  const el=document.querySelector('#checkout');
  if(!el)return;
  const user=getCurrentUser();
  const c=getCart();
  if(!c.length) {
    el.innerHTML='<div class="empty"><h2>Your bag is empty.</h2><a class="btn primary" href="shop.html">Explore collection</a></div>';
    return
  }
  if(!user) {
    el.innerHTML='<div class="profile-gate"><h2>Log in to continue.</h2><p>Your order will be connected to your Taathaal profile.</p><a class="btn primary" href="login.html?return=checkout">Log in</a></div>';
    return
  }
  let subtotal=0;
  const rows=c.map(i=> {
    const p=PRODUCTS.find(x=>x.id===i.id);
    if(!p)return '';
    const unit=getUnitPrice(p);
    subtotal+=unit*i.qty;
    return `<div class="checkout-item"><span>${escapeHtml(p.name)} × ${i.qty}</span><strong>${money(unit*i.qty)}</strong></div>`
  }
  ).join('');
  const saved=readStore('taathaal-applied-coupon',null);
  const applied=saved?validCoupon(saved.code,subtotal): {
    ok:false
  };
  const discount=applied.ok?applied.discount:0;
  const total=Math.max(0,subtotal-discount);
  el.innerHTML=`<div class="checkout-grid"><form class="checkout-form" id="checkout-form">
 <h2>Delivery details</h2>
 <label>Full name<input name="name" required value="${escapeHtml(user.name)}"></label>
 <label>Email<input name="email" type="email" required value="${escapeHtml(user.email)}"></label>
 <label>Phone<input name="phone" required inputmode="numeric" pattern="[0-9]{10}" maxlength="10" placeholder="10-digit phone number"></label>
 <label>Address<textarea name="address" required rows="4" placeholder="House / street / locality"></textarea></label>
 <div class="address-row"><label>City<input name="city" required placeholder="Guwahati"></label><label>State<input name="state" required value="Assam"></label><label>PIN<input name="pin" required inputmode="numeric" pattern="[0-9]{6}" maxlength="6" placeholder="781001"></label></div>
 <h2>Coupon</h2><div id="checkout-subtotal" data-value="${subtotal}" hidden></div><div class="coupon-checkout"><div class="coupon-entry"><input id="coupon-code" placeholder="Enter coupon code" value="${escapeHtml(applied.ok?applied.coupon.code:'')}"><button class="btn" type="button" onclick="applyCheckoutCoupon()">Apply</button></div>${applied.ok?`<div class="coupon-applied"><span><strong>${escapeHtml(applied.coupon.code)}</strong> · ${applied.coupon.type==='fixed'?money(applied.coupon.value):applied.coupon.value+'%'} off</span><button type="button" onclick="clearCheckoutCoupon()">Remove</button></div>`:`<p id="coupon-note" class="coupon-note ${readStore('taathaal-coupon-message','')?'error':''}">${escapeHtml(readStore('taathaal-coupon-message','')||couponSuggestion(subtotal)||'Have a promotion code? Apply it before placing your order.')}</p>`}</div>
 <h2>Payment</h2>
 <div class="payment-options">
  <label class="radio"><input type="radio" name="payment" value="cod" checked onchange="togglePaymentDetails()"> Cash on Delivery <span>Pay on delivery</span></label>
  <label class="radio"><input type="radio" name="payment" value="prepaid" onchange="togglePaymentDetails()"> Prepaid via UPI <span>No gateway</span></label>
 </div>
 <div id="prepaid-details" class="prepaid-box" hidden>
   <div class="prepaid-title">Pay by UPI</div>
   <p>Send <strong>${money(total)}</strong> to the demo UPI ID below, then enter the transaction / UTR ID.</p>
   <div class="upi-id">taathaal@upi</div>
   <label>Transaction / UTR ID<input name="transactionId" id="transaction-id" maxlength="40" placeholder="Enter your UTR / transaction reference"></label>
   <p class="payment-note">This portfolio version uses manual verification. Your order will remain <strong>Payment verification pending</strong> until the shop owner confirms the transaction.</p>
 </div>
 <button class="btn primary full" type="submit">Place order · ${money(total)}</button>
 </form><aside class="checkout-summary"><div class="eyebrow">Your order</div><h2>Order summary</h2>${rows}<div class="summary-line"><span>Subtotal</span><strong>${money(subtotal)}</strong></div>${discount?`<div class="summary-line coupon-line"><span>Coupon · ${escapeHtml(applied.coupon.code)}</span><strong>− ${money(discount)}</strong></div>`:''}<div class="summary-line total"><strong>Total</strong><strong>${money(total)}</strong></div><p class="muted">Shipping is included for this portfolio demo.</p></aside></div>`;
  document.querySelector('#checkout-form').addEventListener('submit',placeOrder)
}
function togglePaymentDetails() {
  const box=document.querySelector('#prepaid-details');
  const prepaid=document.querySelector('input[name="payment"][value="prepaid"]')?.checked;
  if(box)box.hidden=!prepaid;
  const tx=document.querySelector('#transaction-id');
  if(tx)tx.required=!!prepaid
}
function placeOrder(e) {
  e.preventDefault();
  const form=e.currentTarget;
  const c=getCart();
  const user=getCurrentUser();
  if(!user||!c.length)return;
  const fd=new FormData(form);
  const paymentMethod=fd.get('payment');
  const transactionId=String(fd.get('transactionId')||'').trim();
  if(paymentMethod==='prepaid'&&!transactionId) {
    showToast('Enter the UTR / transaction ID');
    return
  }
  for(const i of c) {
    const p=PRODUCTS.find(x=>x.id===i.id);
    if(!p||i.qty>p.stock) {
      showToast('One or more items no longer have enough stock');
      renderCheckout();
      return
    }
  }
  const subtotal=c.reduce((sum,i)=> {
    const p=PRODUCTS.find(x=>x.id===i.id);
    return sum+getUnitPrice(p)*i.qty
  },0);
  const savedCoupon=readStore('taathaal-applied-coupon',null);
  const couponResult=savedCoupon?validCoupon(savedCoupon.code,subtotal): {
    ok:false,discount:0
  };
  const discount=couponResult.ok?couponResult.discount:0;
  const total=Math.max(0,subtotal-discount);
  const orderId='TT-'+Math.floor(10000+Math.random()*89999);
  const order= {
    id:orderId,date:new Date().toLocaleDateString('en-IN', {
      day:'2-digit',month:'long',year:'numeric'
    }
    ),status:'New',uid:user.uid||null,customer:String(fd.get('name')),email:String(fd.get('email')),phone:String(fd.get('phone')),address: {
      line:String(fd.get('address')),city:String(fd.get('city')),state:String(fd.get('state')),pin:String(fd.get('pin'))
    },paymentMethod,paymentStatus:paymentMethod==='cod'?'Pending':'Verification Pending',couponCode:couponResult.ok?couponResult.coupon.code:null,discount,subtotal,transactionId:paymentMethod==='prepaid'?transactionId:null,items:c.map(i=> {
      const p=PRODUCTS.find(x=>x.id===i.id);
      return {
        id:p.id,name:p.name,qty:i.qty,price:p.price,lineId:`${orderId}-${p.id}`,reviewSubmitted:false,reviewRating:null,reviewText:'',reviewDate:null
      }
    }
    ),total
  };
  const orders=JSON.parse(localStorage.getItem('taathaal-orders')||'[]');
  orders.unshift(order);
  localStorage.setItem('taathaal-orders',JSON.stringify(orders));
  if(couponResult.ok) {
    const coupons=getCoupons();
    const cc=coupons.find(x=>x.id===couponResult.coupon.id);
    if(cc)cc.used=Number(cc.used||0)+1;
    writeStore('taathaal-coupons',coupons)
  }
  localStorage.removeItem('taathaal-applied-coupon');
  localStorage.removeItem('taathaal-coupon-message');
  c.forEach(i=> {
    const p=PRODUCTS.find(x=>x.id===i.id);
    if(p)p.stock=Math.max(0,p.stock-i.qty)
  }
  );
  localStorage.setItem('taathaal-products',JSON.stringify(PRODUCTS));
  localStorage.removeItem('taathaal-cart');
  const paymentText=paymentMethod==='cod'?'Cash on Delivery · Payment pending':'Prepaid via UPI · Verification pending';
  document.querySelector('#checkout').innerHTML=`<div class="success-card"><div class="eyebrow">Thank you</div><h1>Order placed.</h1><p>Your order <strong>${order.id}</strong> has been received and is currently <strong>New</strong>.</p><p><strong>${paymentText}</strong>${order.transactionId?`<br>Transaction ID: <strong>${escapeHtml(order.transactionId)}</strong>`:''}</p><p>We'll use your profile to keep the order status updated.</p><a class="btn primary" href="profile.html">View my orders</a> <a class="btn" href="shop.html">Continue shopping</a></div>`;
  updateCartCount()
}
function getOrders() {
  try {
    return JSON.parse(localStorage.getItem('taathaal-orders')||'[]')
  }
  catch {
    return[]
  }
}
function renderProfileV5() {
  const el=document.querySelector('#profile-content');
  if(!el)return;
  const user=getCurrentUser();
  if(!user) {
    renderProfile();
    return;
  }
  const orders=getOrders().filter(o=>o.email===user.email);
  const orderHtml=orders.map(o=> {
    const delivered=o.status==='Delivered';
    const items=o.items.map((i,idx)=> {
      const p=PRODUCTS.find(x=>x.id===i.id);
      if(!p)return '';
      if(typeof i.reviewSubmitted!=='boolean') {
        i.reviewSubmitted=Boolean(o.reviewSubmitted);
        i.reviewRating=o.reviewRating||null;
        i.reviewText=o.reviewText||'';
        i.reviewDate=o.reviewDate||null;
      }
      if(!i.lineId)i.lineId=`${o.id}-${i.id}-${idx}`;
      const review=i.reviewSubmitted
      ? `<div class="review-submitted"><div class="review-top"><strong>Your review</strong><span>${stars(i.reviewRating||5)}</span></div><p>${escapeHtml(i.reviewText||'')}</p>${i.reviewDate?`<small class="muted">Reviewed ${escapeHtml(i.reviewDate)}</small>`:''}<a class="view-piece" href="product.html?id=${i.id}">View your review on this piece ↗</a></div>`
      : delivered
      ? `<div class="review-input"><select id="review-rating-${CSS.escape(i.lineId)}" aria-label="Rating for ${escapeHtml(i.name)}"><option value="5">★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option><option value="2">★★☆☆☆</option><option value="1">★☆☆☆☆</option></select><textarea id="review-text-${CSS.escape(i.lineId)}" rows="2" placeholder="Tell us about this piece..."></textarea><button class="btn" type="button" onclick="submitItemReview('${o.id}','${i.lineId}')">Submit review</button></div>`
      : `<div class="review-locked"><strong>Review after delivery</strong><p class="muted">You can review this item once order ${escapeHtml(o.id)} has been delivered.</p><span class="review-lock-status">Current status: ${escapeHtml(o.status)}</span></div>`;
      return `<article class="order-item"><a class="order-item-link" href="product.html?id=${i.id}" aria-label="Open ${escapeHtml(i.name)}"><img src="${productImageSrc(p)}" alt="${escapeHtml(i.name)}"><div><h3>${escapeHtml(i.name)}</h3><p>${i.qty} piece${i.qty>1?'s':''} · ${money(i.price*i.qty)}</p><span class="view-piece">View piece ↗</span></div></a><div class="item-review"><strong>Review this item</strong>${review}</div></article>`;
    }
    ).join('');
    return `<article class="order-card"><div class="order-meta"><span>Order ${o.id}</span><span>${escapeHtml(o.date)}</span><span class="status ${o.status.toLowerCase()}">${escapeHtml(o.status)}</span></div><div class="order-items">${items}</div><div class="order-total"><strong>Total</strong><strong>${money(o.total)}</strong></div></article>`;
  }
  ).join('');
  const body=orders.length?orderHtml:`<div class="empty"><h2>No orders yet.</h2><p>Your completed orders will appear here.</p><a class="btn primary" href="shop.html">Explore the collection</a></div>`;
  if(orders.length)localStorage.setItem('taathaal-orders',JSON.stringify(getOrders()));
  el.innerHTML=`<div class="profile-header"><div><div class="eyebrow">My account</div><h1>${escapeHtml(user.name)}</h1><p>${escapeHtml(user.email)}</p></div><div class="profile-actions"><a class="btn" href="wishlist.html">Wishlist (${wishlist().length})</a><button class="btn" onclick="logout()">Log out</button></div></div><section class="profile-section"><div class="section-head"><div><div class="eyebrow">Order history</div><h2>Previous orders</h2></div><span class="order-count">${orders.length} orders</span></div><div class="orders">${body}</div></section>`;
}
function adminOrders() {
  const saved=getOrders();
  const demo=[ {
    id:'WL-1042',date:'18 September 2026',status:'Processing',customer:'Riya Das',email:'riya@example.com',items:[ {
      id:1,name:PRODUCTS[0].name,qty:1,price:12499
    }
    ],total:12499
  }, {
    id:'WL-1041',date:'16 September 2026',status:'Shipped',customer:'Mitali Das',email:'mitali@example.com',items:[ {
      id:13,name:PRODUCTS[12].name,qty:1,price:2199
    }
    ],total:2199
  }, {
    id:'WL-1040',date:'14 September 2026',status:'Delivered',customer:'Ananya Bora',email:'ananya@example.com',items:[ {
      id:3,name:PRODUCTS[2].name,qty:2,price:1299
    }
    ],total:2598
  }
  ];
  return [...saved,...demo]
}
function renderAdmin() {
}
function submitItemReview(orderId,lineId) {
  const orders=getOrders();
  const o=orders.find(x=>x.id===orderId);
  if(!o)return;
  if(o.status!=='Delivered') {
    showToast('Reviews are available after delivery');
    return;
  }
  const item=o.items.find(x=>x.lineId===lineId);
  if(!item) {
    showToast('Item not found');
    return;
  }
  if(item.reviewSubmitted) {
    showToast('You have already reviewed this item');
    return;
  }
  const safe=CSS.escape(lineId);
  const rating=Number(document.querySelector(`#review-rating-${safe}`)?.value||0);
  const text=(document.querySelector(`#review-text-${safe}`)?.value||'').trim();
  if(!rating||!text) {
    showToast('Add a rating and description first');
    return;
  }
  item.reviewSubmitted=true;
  item.reviewRating=rating;
  item.reviewText=text;
  item.reviewDate=new Date().toLocaleDateString('en-IN', {
    day:'2-digit',month:'short',year:'numeric'
  }
  );
  localStorage.setItem('taathaal-orders',JSON.stringify(orders));
  const user=getCurrentUser();
  const productReviews=getLocalProductReviews();
  const publicReview= {
    id:item.lineId,name:user?.name||o.customer,date:item.reviewDate,rating:item.reviewRating,text:item.reviewText,verifiedPurchase:true
  };
  productReviews[item.id]=Array.isArray(productReviews[item.id])?productReviews[item.id]:[];
  productReviews[item.id]=productReviews[item.id].filter(r=>r.id!==item.lineId);
  productReviews[item.id].push(publicReview);
  saveLocalProductReviews(productReviews);
  const product=PRODUCTS.find(p=>p.id===item.id);
  if(product) {
    product.reviews=[...(product.reviews||[]),publicReview];
    const total=product.reviews.reduce((sum,r)=>sum+Number(r.rating||0),0);
    product.rating=Math.round((total/product.reviews.length)*10)/10;
  }
  showToast('Your review is now visible on the product page');
  renderProfileV5();
}
function setOrderStatus(id,status) {
  const orders=getOrders();
  const o=orders.find(x=>x.id===id);
  if(o) {
    o.status=status;
    localStorage.setItem('taathaal-orders',JSON.stringify(orders));
    showToast(`Order ${id} marked ${status}`);
    renderAdmin();
  } else showToast('Demo order: status changes will persist after Firebase is connected')
}
function showOrder(id) {
  const o=adminOrders().find(x=>x.id===id);
  if(!o)return;
  alert(`${o.id}\nCustomer: ${o.customer}\nEmail: ${o.email}\nPayment: ${(o.paymentMethod||'cod').toUpperCase()}\nPayment status: ${o.paymentStatus||'Pending'}\nTransaction ID: ${o.transactionId||'—'}\n\n${o.items.map(i=>`${i.name} × ${i.qty}`).join('\n')}\n\nTotal: ${money(o.total)}`)
}
function adjustStock(id,delta) {
  const p=PRODUCTS.find(x=>x.id===id);
  if(!p)return;
  p.stock=Math.max(0,p.stock+delta);
  localStorage.setItem('taathaal-products',JSON.stringify(PRODUCTS));
  renderAdmin()
}
function setStock(id) {
  const p=PRODUCTS.find(x=>x.id===id);
  if(!p)return;
  const n=prompt(`Set stock for ${p.name}`,p.stock);
  if(n!==null&&/^\d+$/.test(n)) {
    p.stock=Number(n);
    localStorage.setItem('taathaal-products',JSON.stringify(PRODUCTS));
    renderAdmin()
  }
}
(function loadLocalProducts() {
  try {
    const saved=JSON.parse(localStorage.getItem('taathaal-products')||'null');
    if(Array.isArray(saved)) {
      PRODUCTS.splice(0,PRODUCTS.length,...saved)
    }
  }
  catch {
  }
}
)()
document.addEventListener('DOMContentLoaded',()=> {
  renderFeaturedV5();
  renderShopV5();
  renderWishlist();
  renderCheckout();
  renderProfileV5();
  renderAdmin();
  renderTeam();
  renderFeaturedReviews();
  renderProductV5();
  updateCartCount()
}
);
function renderFeaturedReviews() {
  const el=document.querySelector('#featured-reviews');
  if(!el)return;
  const featured=featuredReviewSet();
  const rows=[];
  PRODUCTS.forEach(p=>(p.reviews||[]).forEach(r=> {
    if(featured.includes(reviewKey(p,r)))rows.push( {
      p,r
    }
    )
  }
  ));
  el.innerHTML=rows.slice(0,3).map(( {
    p,r
  }
  )=>`<article><div><span class="stars" aria-label="${r.rating} out of 5 stars">${stars(r.rating)}</span></div><p>“${escapeHtml(r.text)}”</p><strong>— ${escapeHtml(r.name)}</strong></article>`).join('')||'<div class="admin-empty">No featured reviews yet.</div>'
}
function renderProductV5() {
  const el=document.querySelector('#product-detail');
  if(!el)return;
  const id=Number(new URLSearchParams(location.search).get('id'));
  const p=PRODUCTS.find(x=>x.id===id)||PRODUCTS[0];
  document.title=`${p.name} — Taathaal`;
  const disabled=p.stock<=0;
  el.innerHTML=`<div class="detail-image"><img src="${productImageSrc(p)}" alt="${escapeHtml(p.name)}"></div><div class="detail-copy"><div class="eyebrow" style="color:var(--crimson)">${escapeHtml(p.category)}</div><h1>${escapeHtml(p.name)}</h1><div class="detail-rating">${productAverageRating(p)?`${stars(productAverageRating(p))} <span>${productAverageRating(p).toFixed(1)} · ${p.reviews.length} reviews</span>`:'<span class="muted">No reviews yet</span>'}</div><div class="price detail-price">${displayPrice(p)}</div><p>${escapeHtml(p.desc)}</p><p class="availability">${stockLabel(p)} · Hand-finished in small batches</p><div class="qty"><label for="qty">Quantity</label><div class="qty-control"><button type="button" ${disabled?'disabled':''} onclick="changeQty(-1)">−</button><input id="qty" type="number" min="1" max="${Math.max(1,p.stock)}" value="1" ${disabled?'disabled':''}><button type="button" ${disabled?'disabled':''} onclick="changeQty(1)">+</button></div></div><button class="btn primary add-bag-large" ${disabled?'disabled':''} onclick="addToCart(${p.id})">${disabled?'Out of stock':'Add to bag'}</button><button class="btn wishlist-detail" onclick="toggleWishlist(${p.id})">${isWishlisted(p.id)?'♥ Saved to wishlist':'♡ Save to wishlist'}</button></div>`;
  renderReviews(p)
}
function changeQty(delta) {
  const input=document.querySelector('#qty');
  if(!input)return;
  const max=Number(input.max)||999;
  input.value=Math.min(max,Math.max(1,Number(input.value||1)+delta))
}
document.addEventListener('input',e=> {
  if(e.target?.id==='qty') {
    const input=e.target;
    const max=Number(input.max)||999;
    let value=Number(input.value);
    if(!Number.isFinite(value)||value<1)value=1;
    input.value=Math.min(max,Math.floor(value))
  }
}
)
function addToCart(id) {
  const p=PRODUCTS.find(x=>x.id===id);
  if(!p||p.stock<=0) {
    showToast('This piece is currently out of stock');
    return
  }
  let c=getCart(),qty=Math.max(1,Number(document.querySelector('#qty')?.value||1)),item=c.find(x=>x.id===id);
  const current=item?item.qty:0;
  if(current+qty>p.stock) {
    showToast(`Only ${p.stock} available`);
    return
  }
  item?item.qty+=qty:c.push( {
    id,qty
  }
  );
  saveCart(c);
  showToast('Added to your bag')
}
function goCheckout() {
  const user=getCurrentUser();
  if(!user) {
    showToast('Please log in before checkout');
    setTimeout(()=>location.href='login.html?return=checkout',500);
    return
  }
  location.href='checkout.html'
}
