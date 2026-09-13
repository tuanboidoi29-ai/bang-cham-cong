(function(){
  if(window.__TT_ENTERPRISE_DEPARTMENT__) return;
  window.__TT_ENTERPRISE_DEPARTMENT__=true;

  const DEPT_KEY='TT_CC_ENTERPRISE_DEPARTMENT_ACTIVE';
  const NAME_KEYS=['ho ten','ho va ten','ten','ten cong nhan','cong nhan','nhan vien','ten nhan vien','employee name','name'];
  const CODE_KEYS=['ma','ma nv','ma nhan vien','ma cong nhan','stt','id','employee id'];
  const DEPT_KEYS=['bo phan','phong ban','to','nhom','department','team'];
  const norm2=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').trim();

  function currentWorkshopSafe(){
    try{return typeof currentW==='function'?currentW():null}catch(e){return null}
  }
  function allWorkersForCurrent(){
    const w=currentWorkshopSafe();
    if(!w||!Array.isArray(window.employees)) return [];
    return employees.filter(x=>x.workshopId===w.id);
  }
  function activeDept(){
    const s=document.getElementById('ttDepartment');
    return s?s.value:(localStorage.getItem(DEPT_KEY)||'__ALL__');
  }
  function departments(){
    return Array.from(new Set(allWorkersForCurrent().map(x=>String(x.department||'Chưa phân bộ phận').trim()||'Chưa phân bộ phận'))).sort((a,b)=>a.localeCompare(b,'vi'));
  }

  function ensureDepartmentUI(){
    if(document.getElementById('ttDepartmentCard')) return;
    const cards=Array.from(document.querySelectorAll('.card'));
    const workerCard=cards.find(c=>(c.textContent||'').toUpperCase().includes('DANH SÁCH CÔNG NHÂN'));
    if(!workerCard) return;
    const card=document.createElement('div');
    card.id='ttDepartmentCard';card.className='card';
    card.innerHTML='<div class="title">🧩 Bộ phận chấm công</div><div class="hint">Chọn bộ phận trước, sau đó chỉ hiện công nhân của bộ phận đó.</div><div class="row" style="margin-top:10px"><select id="ttDepartment"></select><button class="gray" id="ttAddDepartment">＋ Thêm bộ phận</button></div>';
    workerCard.parentNode.insertBefore(card,workerCard);
    document.getElementById('ttDepartment').onchange=function(){localStorage.setItem(DEPT_KEY,this.value);try{render()}catch(e){}};
    document.getElementById('ttAddDepartment').onclick=function(){
      const n=prompt('Tên bộ phận mới:');if(!n||!n.trim())return;
      const name=n.trim();localStorage.setItem(DEPT_KEY,name);refreshDepartmentUI(name);try{render()}catch(e){}
    };
    refreshDepartmentUI();
  }

  function refreshDepartmentUI(force){
    const s=document.getElementById('ttDepartment');if(!s)return;
    const old=force||localStorage.getItem(DEPT_KEY)||'__ALL__';
    const ds=departments();
    if(force&&!ds.includes(force))ds.push(force);
    s.innerHTML='<option value="__ALL__">-- Tất cả bộ phận --</option>'+ds.map(d=>'<option value="'+d.replace(/"/g,'&quot;')+'">'+d+'</option>').join('');
    s.value=[...s.options].some(o=>o.value===old)?old:'__ALL__';
  }

  const originalWorkers=window.workers;
  window.workers=function(){
    const base=typeof originalWorkers==='function'?originalWorkers():allWorkersForCurrent();
    const d=activeDept();
    if(!d||d==='__ALL__')return base;
    return base.filter(x=>(String(x.department||'Chưa phân bộ phận').trim()||'Chưa phân bộ phận')===d);
  };
  try{workers=window.workers}catch(e){}

  window.importRows=function(rows,label){
    if(!rows||!rows.length){if(typeof toast==='function')toast('Danh sách trống');return}
    const keys=Object.keys(rows[0]||{});
    const nk=keys.find(k=>NAME_KEYS.includes(norm2(k)));
    const ck=keys.find(k=>CODE_KEYS.includes(norm2(k)));
    const dk=keys.find(k=>DEPT_KEYS.includes(norm2(k)));
    if(!nk){if(typeof toast==='function')toast('Excel bắt buộc có cột Tên công nhân hoặc Họ tên');return}
    const w=currentWorkshopSafe();if(!w){if(typeof toast==='function')toast('Chưa có xưởng');return}
    const selected=activeDept();
    const existing=allWorkersForCurrent();
    const map=new Map(existing.map(x=>[(x.name||'').toLowerCase(),x]));
    let count=0;
    rows.forEach(x=>{
      const n=String(x[nk]||'').trim();if(!n)return;count++;
      const id=n.toLowerCase();
      const dept=dk?String(x[dk]||'').trim():((selected&&selected!=='__ALL__')?selected:'Chưa phân bộ phận');
      const old=map.get(id)||{};
      map.set(id,{...old,id:old.id||('e'+Date.now()+Math.random()),workshopId:w.id,name:n,code:ck?String(x[ck]||'').trim():(old.code||''),department:dept||old.department||'Chưa phân bộ phận'});
    });
    employees=employees.filter(x=>x.workshopId!==w.id).concat(Array.from(map.values()));
    if(typeof saveEmp==='function')saveEmp();
    refreshDepartmentUI();
    if(typeof render==='function')render();
    const st=document.getElementById('sourceStatus');if(st)st.textContent='Đã lấy danh sách: '+label;
    if(typeof toast==='function')toast('Đã lấy '+count+' công nhân');
  };
  try{importRows=window.importRows}catch(e){}

  const originalRender=window.render;
  window.render=function(){
    const r=typeof originalRender==='function'?originalRender.apply(this,arguments):undefined;
    ensureDepartmentUI();refreshDepartmentUI();
    return r;
  };
  try{render=window.render}catch(e){}

  setTimeout(function(){ensureDepartmentUI();refreshDepartmentUI();try{render()}catch(e){}},100);
})();