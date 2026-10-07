import {
  initializeApp
}
from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut
}
from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {
  getFirestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc, writeBatch, query, where
}
from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
const firebaseConfig = {
  apiKey: 'AIzaSyBb2DdxrS8RmA59gwXYI3HErYH9nwjlB4Q',
  authDomain: 'taathaal.firebaseapp.com',
  projectId: 'taathaal',
  storageBucket: 'taathaal.firebasestorage.app',
  messagingSenderId: '487831785004',
  appId: '1:487831785004:web:c3c6201ef9b3b3fb884b89',
  measurementId: 'G-DEPH3YH6G3'
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
window.taathaalFirebase = {
  app, auth, db, ready: false, admin: false
};
const syncedKeys = new Set(['taathaal-products','taathaal-team','taathaal-coupons','taathaal-homepage','taathaal-featured-reviews','taathaal-orders','taathaal-product-reviews','taathaal-users']);
const originalSetItem = localStorage.setItem.bind(localStorage);
let syncing = false;
function json(v) {
  try {
    return JSON.parse(v)
  }
  catch {
    return null
  }
}
function keyForId(id) {
  return String(id).replaceAll('/','_')
}
async function saveCollection(name, values) {
  if(syncing) return;
  if(!window.taathaalFirebase.admin && !['taathaal-orders','taathaal-product-reviews','taathaal-users'].includes(name)) return;
  const arr = Array.isArray(values) ? values : [];
  const batch = writeBatch(db);
  for(const item of arr) {
    if(!item || item.id==null) continue;
    const copy = JSON.parse(JSON.stringify(item));
    if(name==='taathaal-products') delete copy.reviews;
    if(name==='taathaal-orders' && copy.uid && copy.uid!==auth.currentUser?.uid && !window.taathaalFirebase.admin) continue;
    batch.set(doc(db, collectionName(name), keyForId(item.id)), copy, {
      merge:true
    }
    );
  }
  if(arr.length) await batch.commit();
}
function collectionName(key) {
  return ( {
    'taathaal-products':'products','taathaal-team':'team','taathaal-coupons':'coupons','taathaal-orders':'orders','taathaal-users':'users','taathaal-product-reviews':'reviews'
  }
  )[key]||key
}
async function syncKey(key,value) {
  if(syncing || !syncedKeys.has(key)) return;
  try {
    if(key==='taathaal-homepage') {
      if(window.taathaalFirebase.admin) await setDoc(doc(db,'settings','homepage'), value || {
      }, {
        merge:true
      }
      );
      return;
    }
    if(key==='taathaal-featured-reviews') {
      if(window.taathaalFirebase.admin) await setDoc(doc(db,'settings','featuredReviews'), {
        ids:Array.isArray(value)?value:[]
      }, {
        merge:true
      }
      );
      return;
    }
    if(key==='taathaal-product-reviews') {
      if(!auth.currentUser) return;
      for(const [productId,reviews] of Object.entries(value|| {
      }
      )) {
        for(const review of (Array.isArray(reviews)?reviews:[])) {
          if(!review?.id) continue;
          await setDoc(doc(db,'reviews',keyForId(review.id)), {
            ...review, productId:Number(productId), userId:auth.currentUser.uid
          }, {
            merge:true
          }
          );
        }
      }
      return;
    }
    if(key==='taathaal-users') {
      if(window.taathaalFirebase.admin) await saveCollection(key,value);
      return;
    }
    if(key==='taathaal-orders') {
      if(!auth.currentUser && !window.taathaalFirebase.admin) return;
      await saveCollection(key,value);
      return;
    }
    await saveCollection(key,value);
  }
  catch(err) {
    console.warn('[Taathaal Firebase] sync failed:',err);
  }
}
localStorage.setItem = function(key,value) {
  originalSetItem(key,value);
  if(syncedKeys.has(key)) syncKey(key,json(value));
};
async function seedCollection(name, items) {
  const snap = await getDocs(collection(db,name));
  if(!snap.empty) return false;
  const batch = writeBatch(db);
  for(const item of items) {
    if(item?.id==null) continue;
    const copy=JSON.parse(JSON.stringify(item));
    if(name==='products') delete copy.reviews;
    batch.set(doc(db,name,keyForId(item.id)),copy);
  }
  if(items.length) await batch.commit();
  return true;
}
async function loadCollection(name) {
  const snap=await getDocs(collection(db,name));
  return snap.docs.map(d=>d.data());
}
async function bootstrapData() {
  try {
    const productsSnap=await getDocs(collection(db,'products'));
    if(productsSnap.empty) {
      await seedCollection('products', PRODUCTS);
    }
    else {
      const remote=productsSnap.docs.map(d=>d.data());
      if(remote.length) {
        PRODUCTS.splice(0,PRODUCTS.length,...remote);
        originalSetItem('taathaal-products',JSON.stringify(PRODUCTS));
      }
    }
    const teamSnap=await getDocs(collection(db,'team'));
    if(teamSnap.empty) {
      const team=typeof TEAM_DEFAULT!=='undefined'?TEAM_DEFAULT:[];
      if(window.taathaalFirebase.admin) await seedCollection('team',team);
    }
    else originalSetItem('taathaal-team',JSON.stringify(teamSnap.docs.map(d=>d.data())));
    const couponSnap=await getDocs(collection(db,'coupons'));
    if(couponSnap.empty) {
      if(window.taathaalFirebase.admin) {
        const coupons=typeof getCoupons==='function'?getCoupons():[];
        await seedCollection('coupons',coupons);
      }
    }
    else originalSetItem('taathaal-coupons',JSON.stringify(couponSnap.docs.map(d=>d.data())));
    const home=await getDoc(doc(db,'settings','homepage'));
    if(home.exists()) originalSetItem('taathaal-homepage',JSON.stringify(home.data()));
    const fr=await getDoc(doc(db,'settings','featuredReviews'));
    if(fr.exists()) originalSetItem('taathaal-featured-reviews',JSON.stringify(fr.data().ids||[]));
    const reviews=await loadCollection('reviews');
    if(reviews.length) {
      const grouped= {
      };
      for(const r of reviews) {
        grouped[r.productId]=grouped[r.productId]||[];
        grouped[r.productId].push(r);
      }
      originalSetItem('taathaal-product-reviews',JSON.stringify(grouped));
      for(const p of PRODUCTS) {
        const remote=grouped[p.id]||[];
        const base=(p.reviews||[]).filter(r=>!remote.some(x=>x.id===r.id));
        p.reviews=[...base,...remote];
        p.rating=p.reviews.length?Math.round((p.reviews.reduce((s,r)=>s+Number(r.rating||0),0)/p.reviews.length)*10)/10:0;
      }
    }
    const finalReviews=reviews.length?reviews:await loadCollection('reviews');
    if(finalReviews.length) {
      const grouped= {
      };
      for(const r of finalReviews) {
        grouped[r.productId]=grouped[r.productId]||[];
        grouped[r.productId].push(r);
      }
      originalSetItem('taathaal-product-reviews',JSON.stringify(grouped));
    }
    if(window.taathaalFirebase.admin) {
      const homeSnap=await getDoc(doc(db,'settings','homepage'));
      if(!homeSnap.exists()) await setDoc(doc(db,'settings','homepage'), typeof getHomepage==='function'?getHomepage(): {
      }, {
        merge:true
      }
      );
      const featureSnap=await getDoc(doc(db,'settings','featuredReviews'));
      if(!featureSnap.exists()) await setDoc(doc(db,'settings','featuredReviews'), {
        ids:typeof featuredReviewSet==='function'?featuredReviewSet():[]
      }, {
        merge:true
      }
      );
    }
    const user=auth.currentUser;
    if(user) {
      const ordersSnap=await getDocs(query(collection(db,'orders'),where('uid','==',user.uid)));
      originalSetItem('taathaal-orders',JSON.stringify(ordersSnap.docs.map(d=>d.data())));
      const u=await getDoc(doc(db,'users',user.uid));
      if(u.exists()) originalSetItem('taathaal-user',JSON.stringify( {
        ...u.data(),uid:user.uid,email:user.email
      }
      ));
    }
    refreshUI();
  }
  catch(err) {
    console.warn('[Taathaal Firebase] bootstrap failed:',err);
  }
}
async function checkAdmin(user) {
  if(!user) return false;
  try {
    const s=await getDoc(doc(db,'admins',user.uid));
    return s.exists() && s.data().enabled===true;
  }
  catch {
    return false
  }
}
function refreshUI() {
  try {
    renderFeaturedV5?.();
    renderShopV5?.();
    renderWishlist?.();
    renderCheckout?.();
    renderProfileV5?.();
    renderAdmin?.();
    renderTeam?.();
    renderFeaturedReviews?.();
    renderProductV5?.();
    updateCartCount?.();
  }
  catch(e) {
    console.warn('[Taathaal Firebase] UI refresh:',e)
  }
}
window.taathaalFirebase.login = async (email,password)=>signInWithEmailAndPassword(auth,email,password);
window.taathaalFirebase.register = async (name,email,password)=> {
  const cred=await createUserWithEmailAndPassword(auth,email,password);
  await updateProfile(cred.user, {
    displayName:name
  }
  );
  await setDoc(doc(db,'users',cred.user.uid), {
    uid:cred.user.uid,name,email,joined:new Date().toISOString().slice(0,10)
  }, {
    merge:true
  }
  );
  return cred;
};
window.taathaalFirebase.logout = ()=>signOut(auth);
window.taathaalFirebase.refresh = refreshUI;
onAuthStateChanged(auth, async user=> {
  window.taathaalFirebase.user=user||null;
  window.taathaalFirebase.admin=await checkAdmin(user);
  if(user) {
    const profile=await getDoc(doc(db,'users',user.uid));
    const data=profile.exists()?profile.data(): {
      name:user.displayName||'Taathaal Customer',email:user.email
    };
    originalSetItem('taathaal-user',JSON.stringify( {
      ...data,uid:user.uid,email:user.email
    }
    ));
  } else originalSetItem('taathaal-user','null');
  window.taathaalFirebase.ready=true;
  await bootstrapData();
  if(location.pathname.endsWith('/admin.html')||location.pathname.endsWith('admin.html')) refreshUI();
}
);
window.addEventListener('beforeunload',()=> {
}
);
