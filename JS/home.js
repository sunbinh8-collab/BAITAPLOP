const PRODUCTS = window.PRODUCTS || [];

const currency = (n)=> new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n);

function getCart(){
  return JSON.parse(localStorage.getItem('minishop_cart')||'{}');
}
function saveCart(cart){localStorage.setItem('minishop_cart',JSON.stringify(cart));}

function renderProducts(list=PRODUCTS){
  const container = document.getElementById('products');
  container.innerHTML = '';
  list.forEach(p=>{
    const el = document.createElement('div'); el.className='product';
    el.innerHTML = `
      <div class="media"><img src="${p.image}" alt="${p.name}"/></div>
      <h4>${p.name}</h4>
      <div class="price">${currency(p.price)}</div>
      <div class="actions">
        <button class="btn view" data-id="${p.id}">Xem</button>
        <button class="btn add" data-id="${p.id}">Thêm vào giỏ</button>
      </div>`;
    container.appendChild(el);
  });
}

function updateCartCount(){
  const cart = getCart();
  const count = Object.values(cart).reduce((s,it)=>s+it.qty,0);
  document.getElementById('cart-count').textContent = count;
}

function addToCart(id){
  const product = PRODUCTS.find(p=>p.id==id); if(!product) return;
  const cart = getCart();
  if(cart[id]) cart[id].qty +=1; else cart[id]={...product,qty:1};
  saveCart(cart); updateCartCount();
}

function renderCart(){
  const cart = getCart();
  const items = document.getElementById('cartItems'); items.innerHTML='';
  let total = 0;
  for(const id in cart){
    const it = cart[id]; total += it.price * it.qty;
    const row = document.createElement('div'); row.className='cart-item';
    row.innerHTML = `<img src="${it.image}" alt="${it.name}"/>
      <div style="flex:1">
        <div>${it.name}</div>
        <div style="color:var(--muted)">${currency(it.price)} × ${it.qty}</div>
      </div>
      <div><button class="btn" data-remove="${id}">Xóa</button></div>`;
    items.appendChild(row);
  }
  document.getElementById('cartTotal').textContent = currency(total);
}

function openCart(){
  document.getElementById('cartModal').setAttribute('aria-hidden','false'); renderCart();
}
function closeCart(){document.getElementById('cartModal').setAttribute('aria-hidden','true');}

document.addEventListener('click',e=>{
  const add = e.target.closest('.add');
  if(add){ addToCart(Number(add.dataset.id)); return; }
  const view = e.target.closest('.view');
  if(view){ const id = Number(view.dataset.id); window.location.href = 'HTML/chitietsanpham.html?id='+id; return; }
  if(e.target.id==='cartBtn') openCart();
  if(e.target.id==='closeCart') closeCart();
  const rem = e.target.closest('[data-remove]');
  if(rem){ const id = rem.dataset.remove; const cart = getCart(); delete cart[id]; saveCart(cart); renderCart(); updateCartCount(); }
  if(e.target.id==='clearCart'){ localStorage.removeItem('minishop_cart'); renderCart(); updateCartCount(); }
  if(e.target.id==='checkoutBtn'){ window.location.href='HTML/thanhtoan.html'; }
});

document.addEventListener('DOMContentLoaded',()=>{
  renderProducts(); updateCartCount();
  document.getElementById('newsletterForm').addEventListener('submit',e=>{ e.preventDefault(); alert('Cảm ơn! Chúng tôi đã ghi nhận email.'); e.target.reset(); });

  document.getElementById('searchInput').addEventListener('input',e=>{
    const q = e.target.value.trim().toLowerCase();
    if(!q) return renderProducts();
    const filtered = PRODUCTS.filter(p=>p.name.toLowerCase().includes(q));
    renderProducts(filtered);
  });

  document.getElementById('cartModal').addEventListener('click',ev=>{ if(ev.target===document.getElementById('cartModal')) closeCart(); });
});
