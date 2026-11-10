import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import './style.css';
import { ICON } from './icons.js';

/* monochrome icons use currentColor so they follow the theme; photos live in public/assets */
const ic = (k, cls='') => `<span class="ic ${cls}">${ICON[k]||''}</span>`;
const img = k => `${import.meta.env.BASE_URL}assets/${k}`;

/* ---------------- data ---------------- */
const IP = {
  kanoatov:{id:'kanoatov',name:'Каноатов Джахонгир Якубович',pic:'doc_kanoatov.png',rate:'5.0',rev:'246 отзывов',metro:'Комендантский пр-кт (800 м)',spec:'Терапевт',age:'Взрослый',svc:'Приём терапевта'},
  smirnova:{id:'smirnova',name:'Смирнова Елена Викторовна',pic:'doc_smirnova.png',rate:'4.9',rev:'478 отзывов',metro:'Большой пр-т П.С. (600 м)',spec:'Невролог',age:'Взрослый',svc:'Приём невролога'},
};
const TMS = {
  'Терапевт':[
    {name:'Соколова Анна Дмитриевна',pic:'doc_sokolova.png',rate:'5.0',rev:'246 отзывов',pred:['g','Ответит через 15-30 мин']},
    {name:'Козлова Анна Сергеевна',pic:'doc_kozlova.png',rate:'5.0',rev:'47 отзывов',pred:['g','Ответит через 15-30 мин']},
    {name:'Петров Дмитрий Александрович',pic:'doc_petrov.png',rate:'4.7',rev:'23 отзыва',pred:['o','Ответит завтра после 16:45']},
  ],
  'Невролог':[
    {name:'Кузнецова Мария Андреевна',pic:'doc_kuznetsova.png',rate:'4.7',rev:'15 отзывов',pred:['g','Ответит через 15-30 мин']},
    {name:'Гусева Ирина Михайловна',pic:'doc_guseva.png',rate:'4.8',rev:'31 отзыв',pred:['g','Ответит через 30-60 мин']},
    {name:'Захаров Антон Ильич',ini:'ЗА',rate:'4.9',rev:'18 отзывов',pred:['o','Ответит завтра после 12:00']},
  ],
};
const TM_PRICE = '1 990 ₽';

// offline card states — from the three rows of the Figma frame
const STATES = {
  slots:{price:{now:'2 800 ₽',old:'2 950 ₽',disc:'−5% от НаПоправку'},slots:true},
  points:{price:{now:'2 800 ₽',old:'2 950 ₽',pts:'−500',disc:'−5% от НаПоправку',box:true},slots:true},
  call:{price:{now:'2 800 ₽'},slots:false},
};

const SCEN = [
  {id:'slots',t:'Слоты + скидка',s:'Очная выше телемеда → телемед тянется до очной',items:[['kanoatov','slots']],
    rule:'<b>Очная карточка самая высокая</b> — все телемед-карточки растягиваются до её высоты. Лишнее место уходит между предиктом и кнопкой, кнопка всегда прижата к низу.'},
  {id:'points',t:'Слоты + цена с баллами',s:'Очная ещё выше (зелёная плашка цены)',items:[['kanoatov','points']],
    rule:'<b>Очная карточка выросла</b> из-за плашки с баллами — телемед-карточки снова тянутся до неё, кнопки остаются на одной линии.'},
  {id:'call',t:'Без слотов → «Позвонить»',s:'Очная ниже телемеда → очная тянется до телемеда',items:[['kanoatov','call']],
    rule:'<b>Очная карточка самая низкая</b> — она растягивается до высоты телемед-карточек. Кнопка «Позвонить» прижата к низу на одной линии с «Обратиться онлайн».'},
  {id:'two',t:'Два прошедших приёма',s:'Терапевт со слотами + невролог «Позвонить»',items:[['kanoatov','slots'],['smirnova','call']],
    rule:'<b>Несколько очных врачей.</b> После каждого — свои 3 телемед-врача той же специальности. Вся карусель ровняется по самой высокой карточке, даже если она в другой группе.'},
];

const CHIPS = ['Взрослый невролог','МРТ позвоночника','Педиатр','Анализы'];

const state = {theme:'light', scen:'slots', hl:false, chip:0, booked:new Set()};

document.getElementById('statusImg').src = img('status_right.svg');

/* settings sheet for narrow frames */
const stageEl = document.getElementById('stage');
const toggleCfg = open => stageEl.classList.toggle('cfg-open', open);
document.getElementById('cfgBtn').addEventListener('click', ()=>toggleCfg(true));
document.getElementById('cfgDim').addEventListener('click', ()=>toggleCfg(false));
document.getElementById('panelClose').addEventListener('click', ()=>toggleCfg(false));

/* ---------------- render ---------------- */
const DATES = [['30 июня','Завтра'],['2 июля','Четверг'],['3 июля','Пятница'],['5 июля','Суббота']];
const rating = (r,rev) => `<div class="rate">${ic('star')}${r}<span>&nbsp;· ${rev}</span></div>`;
const pic = (d,cls='') => d.pic ? `<img class="pic ${cls}" src="${img(d.pic)}" alt="">` : `<div class="pic ini">${d.ini}</div>`;

function priceBlock(p){
  const disc = p.disc ? `<div class="pline">${ic('heart','brand')}${p.disc}${ic('info','light')}</div>` : '';
  const pts = p.pts ? `<div class="pline">с учетом ${p.pts}<img src="${img('coin.svg')}" width="16" height="16" alt="">баллов</div>` : '';
  const row = `<div class="prow"><span class="pr">${p.now}</span>${p.old?`<span class="old">${p.old}</span>`:''}</div>`;
  return p.box ? `<div class="pbox">${row}${pts}${disc}</div>` : row + disc;
}

function ipCard(d, st){
  const s = STATES[st];
  const bottom = s.slots
    ? `<div class="slots">
        <div class="dates">${DATES.map((x,i)=>`<div class="dt ${i?'':'on'}"><div class="d">${x[0]}</div><div class="w">${x[1]}</div></div>`).join('')}</div>
        <div class="times">${['11:00','12:30','13:30'].map(t=>`<button class="tb" data-book="${d.id}" data-t="${t}">${t}</button>`).join('')}<button class="tb more" data-more>Еще</button></div>
      </div>`
    : `<button class="btn call" data-call="${d.id}">${ic('phone')}Позвонить</button>`;
  return `<article class="card ip" data-ip="${d.id}">
    <span class="maxmark"></span>
    <div class="top">
      <div class="doc">
        <div class="drow">${pic(d)}<div style="flex:1;min-width:0"><div class="name">${d.name}</div>${rating(d.rate,d.rev)}</div></div>
        <div class="metro"><img src="${img('metro.svg')}" width="8" height="8" alt="">${d.metro}</div>
      </div>
      <div><div class="svc">${d.svc}</div>${priceBlock(s.price)}</div>
    </div>
    ${bottom}
  </article>`;
}

function tmCard(t, ip, i){
  return `<article class="card tmc" data-tm-for="${ip.id}" data-tm-i="${i}">
    <span class="maxmark"></span>
    <div class="top">
      <p class="rec-note">Рекомендация на основе прошедшего приёма</p>
      <div class="doc">
        <div class="drow">${pic(t,'tmbg')}<div style="flex:1;min-width:0"><div class="name">${t.name}</div>${rating(t.rate,t.rev)}</div></div>
        <div class="tags"><span class="tag f">${ip.spec}</span><span class="tag">${ip.age}</span></div>
      </div>
      <div><div class="svc">Онлайн-консультация врача</div><div class="pr">${TM_PRICE}</div></div>
      <div class="pred ${t.pred[0]}">${ic(t.pred[0]==='g'?'flash':'chat')}${t.pred[1]}</div>
    </div>
    <button class="btn tm">Обратиться онлайн</button>
  </article>`;
}

function render(){
  const sc = SCEN.find(s=>s.id===state.scen);
  document.getElementById('theme').innerHTML = [['light','Светлая'],['dark','Тёмная']].map(([k,l])=>`<button class="${k===state.theme?'on':''}" data-theme="${k}">${l}</button>`).join('');
  document.getElementById('scen').innerHTML = SCEN.map(s=>`<button class="opt ${s.id===state.scen?'on':''}" data-scen="${s.id}">${s.t}<small>${s.s}</small></button>`).join('');
  document.getElementById('hl').innerHTML = [[true,'Показать'],[false,'Скрыть']].map(([k,l])=>`<button class="${k===state.hl?'on':''}" data-hl="${k}">${l}</button>`).join('');
  document.getElementById('rule').innerHTML = sc.rule + `<ul>
    <li>Высота карточек в карусели = высота самой высокой карточки (очной или телемеда).</li>
    <li>Кнопки «Записаться»/«Позвонить»/«Обратиться онлайн» всегда прижаты к низу — на одной линии во всех карточках.</li>
    <li>ФИО — максимум 2 строки, теги — в одну строку.</li>
    <li>Если записаться к очному врачу, его карточка и 3 телемед-карточки скрываются.</li></ul>`;
  const screen = document.getElementById('screen');
  screen.className = 'screen theme-'+state.theme + (state.hl?' show-hl':'');

  const rep = document.getElementById('rep');
  rep.innerHTML = sc.items.filter(([id])=>!state.booked.has(id)).map(([id,st])=>{
    const ip = IP[id];
    return ipCard(ip, st) + TMS[ip.spec].map((t,i)=>tmCard(t,ip,i)).join('');
  }).join('');
  document.getElementById('repSec').style.display = rep.children.length ? '' : 'none';
  rep.scrollLeft = 0;

  document.getElementById('chips').innerHTML = CHIPS.map((c,i)=>`<button class="chip ${i===state.chip?'on':''}" data-chip="${i}">${c}</button>`).join('');
  document.getElementById('grid').innerHTML = `
    <button class="svc-card k-brand" data-toast="Выборка: приём невролога в клиниках"><div class="t">${ic('sv_clinic')}<span class="pill">в клинике</span></div>
      <div class="b"><p style="color:var(--text)">Прием невролога</p><div class="row">от 1500 ₽${ic('chev')}</div></div></button>
    <button class="svc-card k-tm" data-toast="Витрина онлайн-неврологов"><div class="t">${ic('sv_chat')}<span class="pill">онлайн</span></div>
      <div class="b"><p style="color:var(--text)">Онлайн-консультация невролога</p><div class="row">1 290 ₽${ic('chev')}</div></div></button>
    <button class="svc-card k-neg" data-toast="Акции на МРТ"><div class="t">${ic('sv_gift')}<span class="pill">акция −30%</span></div>
      <div class="b"><p style="color:var(--text)">Скидка 30% на МРТ в ночное время!</p><div class="row">+10 акций${ic('chev')}</div></div></button>
    <button class="svc-card k-info" data-toast="Трекер здоровья"><div class="t">${ic('sv_fox')}<span class="pill">трекер</span></div>
      <div class="b"><p style="color:var(--text)">Улучшить сон<br>с Трекером</p><div class="row">от 254 ₽/мес${ic('chev')}</div></div></button>`;

  document.querySelectorAll('[data-ic]').forEach(n=>{ n.innerHTML = ICON[n.dataset.ic]||''; });
  requestAnimationFrame(markHeights);
}

/* show which card defines the height and that all are equal */
function markHeights(){
  const rep = document.getElementById('rep');
  document.querySelectorAll('#repSec .hline').forEach(n=>n.remove());
  const cards = [...rep.querySelectorAll(':scope > .card')];
  if(!cards.length) return;
  // natural heights (without stretch) to find the tallest
  rep.style.alignItems='flex-start';
  const nat = cards.map(c=>c.offsetHeight);
  rep.style.alignItems='';
  const mx = Math.max(...nat);
  cards.forEach((c,i)=>{ const m=c.querySelector('.maxmark'); m.textContent = nat[i]===mx ? `задаёт высоту · ${mx}px` : ''; m.style.display = nat[i]===mx ? '' : 'none'; });
  const h = cards[0].offsetHeight;
  const same = cards.every(c=>c.offsetHeight===h);
  const line = document.createElement('div'); line.className='hline';
  line.style.top = (rep.offsetTop + cards[0].offsetTop + h) + 'px';
  line.innerHTML = `<i>${same ? `все ${cards.length} карточек — ${h} px` : 'высоты разные!'}</i>`;
  document.getElementById('repSec').appendChild(line);
}

/* ---------------- interactions ---------------- */
const sheet = document.getElementById('sheet'), dim = document.getElementById('dim'), toastEl = document.getElementById('toast');
function openSheet(html){ sheet.innerHTML = '<div class="grab"></div>'+html; dim.classList.add('on'); sheet.classList.add('on'); }
function closeSheet(){ dim.classList.remove('on'); sheet.classList.remove('on'); }
let tt; function toast(m){ toastEl.textContent=m; toastEl.classList.add('on'); clearTimeout(tt); tt=setTimeout(()=>toastEl.classList.remove('on'),2600); }
dim.addEventListener('click', closeSheet);

document.addEventListener('click', e=>{
  const b = e.target.closest('button,.tmc');
  if(!b) return;
  const ds = b.dataset;
  if(ds.theme){ state.theme=ds.theme; render(); return; }
  if(ds.scen){ state.scen=ds.scen; state.booked.clear(); render(); return; }
  if(ds.hl){ state.hl = ds.hl==='true'; render(); return; }
  if(ds.chip){ state.chip=+ds.chip; render(); return; }
  if(ds.toast){ toast(ds.toast+' (вне прототипа)'); return; }
  if(b.id==='reset'){ state.booked.clear(); render(); toast('Записи сброшены'); return; }
  if(ds.more!==undefined){ toast('«Еще» → полное расписание врача (вне прототипа)'); return; }
  if(ds.call){ toast('Звонок в клинику врача (вне прототипа)'); return; }
  if(ds.book){
    const d=IP[ds.book];
    openSheet(`<h3>Запись на приём</h3>
      <div class="row"><span>Врач</span><span>${d.name.split(' ').slice(0,2).join(' ')}</span></div>
      <div class="row"><span>Услуга</span><span>${d.svc}</span></div>
      <div class="row"><span>Когда</span><span>30 июня, ${ds.t}</span></div>
      <div class="act"><button class="btn call" data-confirm="${d.id}">Записаться</button><button class="btn ghost" data-close>Отмена</button></div>`);
    return;
  }
  if(ds.confirm){
    const id=ds.confirm; closeSheet();
    document.querySelectorAll(`#rep [data-ip="${id}"], #rep [data-tm-for="${id}"]`).forEach(c=>c.classList.add('gone'));
    setTimeout(()=>{ state.booked.add(id); render(); }, 330);
    toast('Вы записаны. Карточка врача и 3 телемед-карточки скрыты');
    return;
  }
  if(ds.close!==undefined){ closeSheet(); return; }
  if(ds.pay!==undefined){ closeSheet(); toast('→ Экран оплаты онлайн-консультации (вне прототипа)'); return; }
  const card = b.closest('.tmc');
  if(card){
    const ip = IP[card.dataset.tmFor], t = TMS[ip.spec][+card.dataset.tmI];
    openSheet(`<h3>Онлайн-консультация врача</h3>
      <div class="drow" style="margin-bottom:12px">${pic(t,'tmbg')}<div style="flex:1;min-width:0"><div class="name">${t.name}</div>${rating(t.rate,t.rev)}
        <div class="tags" style="margin-top:6px"><span class="tag f">${ip.spec}</span><span class="tag">${ip.age}</span></div></div></div>
      <div class="row"><span>Формат</span><span>Чат с врачом</span></div>
      <div class="row"><span>Ответ</span><span>${t.pred[1].replace('Ответит ','')}</span></div>
      <div class="row"><span>Стоимость</span><span><b>${TM_PRICE}</b></span></div>
      <div class="act"><button class="btn tm" data-pay>Перейти к оплате</button><button class="btn ghost" data-close>Не сейчас</button></div>`);
  }
});
window.addEventListener('resize', ()=>requestAnimationFrame(markHeights));
document.fonts && document.fonts.ready.then(()=>requestAnimationFrame(markHeights));

render();
