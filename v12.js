(function(){
  const ADV='TT_CC_V12_ADVANCE';
  let advances=[];
  try{ advances=JSON.parse(localStorage.getItem(ADV)||'[]'); if(!Array.isArray(advances)) advances=[]; }catch(e){ advances=[]; }
  function saveAdv(){localStorage.setItem(ADV,JSON.stringify(advances));}
  function fmt(n){return Number(n||0).toLocaleString('vi-VN')+' đ'}
  function esc2(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function monthOf(d){return String(d||'').slice(0,7)}
  function advMonth(wid,m){return advances.filter(a=>a.workshopId===wid&&monthOf(a.date)===m)}
  function advTotal(wid,m){return advMonth(wid,m).reduce((s,a)=>s+Number(a.amount||0),0)}
  function salaryData(w,m){
    const rows={};
    Object.keys(data.records||{}).forEach(k=>{
      const r=data.records[k];
      if(!r || !k.startsWith(w.id+'|') || monthOf(r.date||k.slice(-10))!==m)return;
      const parts=k.split('|'),name=parts[1];
      if(!rows[name]) rows[name]={name,days:0,pay:0,ot:0,total:0};
      rows[name].days+=1;
      rows[name].pay+=Number(r.wage||0);
      rows[name].ot+=typeof otMoney==='function'?otMoney(r):Number(r.otMoney||0);
    });
    Object.values(rows).forEach(x=>x.total=x.pay+x.ot);
    return Object.values(rows);
  }
  function totalSalary(w,m){return salaryData(w,m).reduce((s,x)=>s+x.total,0)}
  function allAdvForPerson(wid,name,m){return advances.filter(a=>a.workshopId===wid&&a.employee===name&&monthOf(a.date)===m).reduce((s,a)=>s+Number(a.amount||0),0)}
  function payStatus(net){
    const n=Number(net||0);
    if(n<0)return {label:'TRẢ LẠI',value:Math.abs(n)};
    return {label:'TỔNG THỰC NHẬN',value:n};
  }

  function addTab(){
    const tabs=document.getElementById('tabs'); if(!tabs)return;
    if(!tabs.querySelector('[data-advance-tab]')){
      const b=document.createElement('button'); b.className='tab'; b.dataset.advanceTab='1'; b.textContent='💸 TẠM ỨNG';
      b.onclick=function(){view='advance';render();}; tabs.appendChild(b);
    }
    tabs.querySelectorAll('.tab').forEach(b=>{if(b.dataset.advanceTab)b.classList.toggle('active',view==='advance')});
  }

  function renderAdvance(){
    const c=document.getElementById('content'); if(!c)return;
    const w=data.workshops[active]||data.workshops[0]; if(!w){c.innerHTML='<div class="card">Chưa có xưởng.</div>';return;}
    const list=advMonth(w.id,month).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    const total=list.reduce((s,a)=>s+Number(a.amount||0),0);
    c.innerHTML=`<div class="card">
      <div class="bar"><div><div class="title">💸 TẠM ỨNG LƯƠNG</div><div class="hint">Ghi nhận tiền đã ứng cho từng người theo từng xưởng và từng tháng.</div></div>
      <div class="controls"><label>🏭 Xưởng</label><select id="advW">${data.workshops.map(x=>`<option value="${esc2(x.id)}" ${x.id===w.id?'selected':''}>${esc2(x.name)}</option>`).join('')}</select>
      <label>Tháng</label><input id="advM" type="month" value="${month}"></div></div>
      <div class="row"><input id="advName" placeholder="Tên người nhận tạm ứng"><input id="advDate" type="date" value="${month}-01"><input id="advAmount" type="number" min="0" inputmode="numeric" placeholder="Số tiền tạm ứng"><input id="advNote" placeholder="Ghi chú"></div>
      <div class="row"><button class="green" onclick="window.TT_addAdvance()">＋ Lưu tạm ứng</button><button class="gray" onclick="window.TT_clearAdvanceForm()">Xóa nhập</button></div>
      <div class="stats"><div class="stat">Tổng tạm ứng tháng: <b class="money">${fmt(total)}</b></div><div class="stat">Số lượt: <b>${list.length}</b></div></div>
      <div class="tableWrap"><table><thead><tr><th>Ngày</th><th>Người nhận</th><th>Số tiền</th><th>Ghi chú</th><th></th></tr></thead><tbody>${list.length?list.map(a=>`<tr><td>${esc2(a.date)}</td><td class="left">${esc2(a.employee)}</td><td class="money">${fmt(a.amount)}</td><td class="left">${esc2(a.note||'')}</td><td><button class="danger" onclick="window.TT_delAdvance('${a.id}')">Xóa</button></td></tr>`).join(''):'<tr><td colspan="5" class="empty">Chưa có tạm ứng trong tháng này.</td></tr>'}</tbody></table></div>
    </div>`;
    document.getElementById('advW').onchange=function(){active=data.workshops.findIndex(x=>x.id===this.value);if(active<0)active=0;render();};
    document.getElementById('advM').onchange=function(){month=this.value;render();};
  }

  window.TT_addAdvance=function(){
    const wid=document.getElementById('advW').value,name=document.getElementById('advName').value.trim(),date=document.getElementById('advDate').value,amount=Number(document.getElementById('advAmount').value||0),note=document.getElementById('advNote').value.trim();
    if(!name)return toast('Nhập tên người nhận tạm ứng');
    if(!date)return toast('Chọn ngày tạm ứng');
    if(amount<=0)return toast('Nhập số tiền tạm ứng');
    advances.push({id:'a'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),workshopId:wid,employee:name,date,amount,note});
    saveAdv();month=monthOf(date);active=Math.max(0,data.workshops.findIndex(x=>x.id===wid));render();toast('Đã lưu tạm ứng');
  };
  window.TT_delAdvance=function(id){if(!confirm('Xóa khoản tạm ứng này?'))return;advances=advances.filter(a=>a.id!==id);saveAdv();render();toast('Đã xóa tạm ứng');};
  window.TT_clearAdvanceForm=function(){['advName','advAmount','advNote'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=''})};

  function renderSummaryV12(){
    const c=document.getElementById('content'); if(!c)return;
    const rows=data.workshops.map(w=>{const salary=totalSalary(w,month),adv=advTotal(w.id,month),sd=salaryData(w,month),people=sd.length,days=sd.reduce((s,x)=>s+x.days,0);return {w,salary,adv,net:salary-adv,people,days}});
    const grand=rows.reduce((s,x)=>s+x.salary,0),ga=rows.reduce((s,x)=>s+x.adv,0),gn=rows.reduce((s,x)=>s+x.net,0),gs=payStatus(gn);
    c.innerHTML=`<div class="card summaryBox"><div class="bar"><div><div class="title">💰 TỔNG LƯƠNG</div><div class="hint">Tự động đối chiếu tổng lương với toàn bộ tiền tạm ứng.</div></div><div class="controls"><label>Tháng</label><input id="sumM" type="month" value="${month}"></div></div>
      <div class="stats"><div class="stat">Tổng lương: <b>${fmt(grand)}</b></div><div class="stat">Tạm ứng: <b>${fmt(ga)}</b></div><div class="stat summaryTotal">${gs.label}: ${fmt(gs.value)}</div></div>
      <div class="tableWrap"><table><thead><tr><th>Xưởng</th><th>Số người</th><th>Ngày công</th><th>Tổng lương</th><th>Tạm ứng</th><th>THỰC NHẬN / TRẢ LẠI</th></tr></thead><tbody>${rows.map(x=>{const ps=payStatus(x.net);return `<tr><td class="left"><b>${esc2(x.w.name)}</b></td><td>${x.people}</td><td>${x.days}</td><td class="money">${fmt(x.salary)}</td><td>${fmt(x.adv)}</td><td class="summaryTotal">${ps.label}: ${fmt(ps.value)}</td></tr>`}).join('')}<tr><th>TỔNG</th><th>${rows.reduce((s,x)=>s+x.people,0)}</th><th>${rows.reduce((s,x)=>s+x.days,0)}</th><th>${fmt(grand)}</th><th>${fmt(ga)}</th><th class="summaryTotal">${gs.label}: ${fmt(gs.value)}</th></tr></tbody></table></div>
    </div>
    <div class="card"><div class="title">👤 Chi tiết theo người</div><div class="tableWrap"><table><thead><tr><th>Xưởng</th><th>Người</th><th>Ngày công</th><th>Lương</th><th>Tạm ứng</th><th>THỰC NHẬN / TRẢ LẠI</th></tr></thead><tbody>${rows.flatMap(x=>salaryData(x.w,month).map(p=>{const a=allAdvForPerson(x.w.id,p.name,month),ps=payStatus(p.total-a);return `<tr><td>${esc2(x.w.name)}</td><td class="left">${esc2(p.name)}</td><td>${p.days}</td><td>${fmt(p.total)}</td><td>${fmt(a)}</td><td class="summaryTotal">${ps.label}: ${fmt(ps.value)}</td></tr>`})).join('')||'<tr><td colspan="6" class="empty">Chưa có dữ liệu chấm công.</td></tr>'}</tbody></table></div></div>`;
    document.getElementById('sumM').onchange=function(){month=this.value;render();};
  }

  const originalRender=window.render;
  window.render=function(){
    originalRender();
    addTab();
    if(view==='advance')renderAdvance();
    if(view==='summary')renderSummaryV12();
  };
  setTimeout(function(){addTab();if(view==='summary')renderSummaryV12();},0);
})();