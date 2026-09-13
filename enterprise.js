(function(){
  if(window.__TT_ENTERPRISE_MODE__) return;
  window.__TT_ENTERPRISE_MODE__=true;

  const MODE_KEY='TT_CC_APP_MODE';
  const EMP_KEY='TT_CC_ENTERPRISE_EMPLOYEES';
  let appMode=localStorage.getItem(MODE_KEY)||'personal';
  let employees=[];
  try{employees=JSON.parse(localStorage.getItem(EMP_KEY)||'[]');if(!Array.isArray(employees))employees=[]}catch(e){employees=[]}

  function saveEmployees(){localStorage.setItem(EMP_KEY,JSON.stringify(employees));}
  function esc3(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function activeWorkshop(){return (data.workshops||[])[active]||null}
  function workersFor(wid){return employees.filter(x=>x.workshopId===wid)}
  function uniqueNames(list){return Array.from(new Set(list.map(x=>String(x||'').trim()).filter(Boolean)))}

  function setMode(mode){
    appMode=mode==='enterprise'?'enterprise':'personal';
    localStorage.setItem(MODE_KEY,appMode);
    render();
  }
  window.TT_setAppMode=setMode;

  function ensureModeButtons(){
    const tabs=document.getElementById('tabs'); if(!tabs)return;
    let wrap=document.getElementById('ttModeSwitch');
    if(!wrap){
      wrap=document.createElement('div');wrap.id='ttModeSwitch';
      wrap.style.cssText='display:flex;gap:6px;align-items:center;flex:0 0 auto;margin-right:4px';
      wrap.innerHTML='<button id="ttPersonalMode" class="tab" type="button">👤 CÁ NHÂN</button><button id="ttEnterpriseMode" class="tab" type="button">🏢 DOANH NGHIỆP</button>';
      tabs.insertBefore(wrap,tabs.firstChild);
      document.getElementById('ttPersonalMode').onclick=()=>setMode('personal');
      document.getElementById('ttEnterpriseMode').onclick=()=>setMode('enterprise');
    }
    const p=document.getElementById('ttPersonalMode'),e=document.getElementById('ttEnterpriseMode');
    if(p){p.style.background=appMode==='personal'?'#1677ff':'#e2e8f0';p.style.color=appMode==='personal'?'#fff':'#334155'}
    if(e){e.style.background=appMode==='enterprise'?'#7c3aed':'#e2e8f0';e.style.color=appMode==='enterprise'?'#fff':'#334155'}
  }

  const oldNamesForMonth=window.namesForMonth;
  window.namesForMonth=function(w,Y,M){
    const base=typeof oldNamesForMonth==='function'?oldNamesForMonth(w,Y,M):[];
    if(appMode!=='enterprise')return base;
    return uniqueNames(base.concat(workersFor(w.id).map(x=>x.name))).sort((a,b)=>a.localeCompare(b,'vi'));
  };
  try{namesForMonth=window.namesForMonth}catch(e){}

  function openPunchWorker(name){
    if(typeof openPunch==='function')openPunch();
    const n=document.getElementById('pName');if(n){n.value=name;n.readOnly=true}
    const info=document.getElementById('punchWorkshop');if(info)info.textContent=(activeWorkshop()?.name||'')+' · '+name+' · chọn LX hoặc CT';
  }
  window.TT_punchWorker=openPunchWorker;

  function openNormalPunchEnterprise(){
    const sel=document.getElementById('ttWorkerSelect');
    if(!sel||!sel.value)return toast('Chọn công nhân trước');
    openPunchWorker(sel.value);
  }
  window.TT_punchSelectedWorker=openNormalPunchEnterprise;

  function ensurePersonalNameEditable(){
    const n=document.getElementById('pName');
    if(n && appMode==='personal')n.readOnly=false;
  }

  function renderEnterprisePanel(){
    if(appMode!=='enterprise' || view!=='workshop')return;
    const w=activeWorkshop(); if(!w)return;
    const content=document.getElementById('content'); if(!content)return;
    if(document.getElementById('ttEnterprisePanel'))return;
    const list=workersFor(w.id);
    const panel=document.createElement('div');panel.id='ttEnterprisePanel';panel.className='card noPrint';
    panel.innerHTML='<div class="bar"><div><div class="title">🏢 CHẾ ĐỘ DOANH NGHIỆP</div><div class="hint">Nhập danh sách công nhân từ Excel, sau đó chọn từng người để chấm công.</div></div><div class="controls"><button class="purple" id="ttImportExcel">📥 Nhập Excel</button><button class="gray" id="ttManageWorkers">👥 Danh sách ('+list.length+')</button></div></div>'+
      '<div class="row" style="margin-top:12px"><select id="ttWorkerSelect"><option value="">-- Chọn công nhân --</option>'+list.map(x=>'<option value="'+esc3(x.name)+'">'+esc3(x.code?x.code+' · '+x.name:x.name)+'</option>').join('')+'</select><button class="green" id="ttPunchWorker">🟢 Chấm công người đã chọn</button></div>';
    content.insertBefore(panel,content.firstChild);
    document.getElementById('ttImportExcel').onclick=openImport;
    document.getElementById('ttManageWorkers').onclick=openWorkerList;
    document.getElementById('ttPunchWorker').onclick=openNormalPunchEnterprise;

    // Ở chế độ doanh nghiệp, ẩn nút chấm công tự do để tránh nhập sai tên.
    content.querySelectorAll('button').forEach(b=>{
      const t=(b.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
      if((t==='🟢 CHẤM CÔNG'||t==='CHẤM CÔNG') && !b.closest('#ttEnterprisePanel')) b.style.display='none';
    });
  }

  function makeModal(id,title,html){
    let m=document.getElementById(id);
    if(!m){m=document.createElement('div');m.id=id;m.className='modal';m.innerHTML='<div class="box"><h3>'+title+'</h3>'+html+'</div>';document.body.appendChild(m)}
    return m;
  }

  function openImport(){
    const m=makeModal('ttExcelModal','📥 NHẬP DANH SÁCH CÔNG NHÂN TỪ EXCEL','<div class="hint">Hỗ trợ .xlsx, .xls. Hệ thống ưu tiên cột “Họ tên / Họ và tên / Tên / Công nhân”. Nếu không có, lấy cột đầu tiên có dữ liệu.</div><div class="row"><input id="ttExcelFile" type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"></div><div id="ttExcelPreview" class="hint"></div><div class="row"><button class="green" id="ttExcelSave">Nhập danh sách</button><button class="gray" id="ttExcelClose">Hủy</button></div>');
    m.classList.add('show');
    const file=document.getElementById('ttExcelFile');
    file.value='';window.__TT_EXCEL_ROWS=[];
    file.onchange=function(){const f=this.files&&this.files[0];if(f)readExcel(f)};
    document.getElementById('ttExcelSave').onclick=saveExcelRows;
    document.getElementById('ttExcelClose').onclick=()=>m.classList.remove('show');
  }

  function loadXlsx(cb){
    if(window.XLSX)return cb();
    const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    s.onload=cb;s.onerror=()=>toast('Không tải được bộ đọc Excel');document.head.appendChild(s);
  }
  function readExcel(file){
    loadXlsx(function(){
      const r=new FileReader();r.onload=function(){
        try{
          const wb=XLSX.read(r.result,{type:'array'}),ws=wb.Sheets[wb.SheetNames[0]],rows=XLSX.utils.sheet_to_json(ws,{defval:''});
          if(!rows.length)return toast('File Excel không có dữ liệu');
          const keys=Object.keys(rows[0]||{});
          const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').trim();
          let nameKey=keys.find(k=>['ho ten','ho va ten','ten','cong nhan','ten cong nhan','nhan vien'].includes(norm(k)))||keys[0];
          let codeKey=keys.find(k=>['ma','ma nv','ma nhan vien','ma cong nhan','stt'].includes(norm(k)));
          const parsed=rows.map(x=>({name:String(x[nameKey]||'').trim(),code:codeKey?String(x[codeKey]||'').trim():''})).filter(x=>x.name);
          window.__TT_EXCEL_ROWS=parsed;
          const pv=document.getElementById('ttExcelPreview');if(pv)pv.innerHTML='Đã đọc <b>'+parsed.length+'</b> công nhân. Cột tên: <b>'+esc3(nameKey)+'</b>.';
        }catch(e){console.error(e);toast('Không đọc được file Excel')}
      };r.readAsArrayBuffer(file);
    });
  }
  function saveExcelRows(){
    const rows=window.__TT_EXCEL_ROWS||[];if(!rows.length)return toast('Chọn file Excel trước');
    const w=activeWorkshop();if(!w)return;
    const old=workersFor(w.id);const map=new Map(old.map(x=>[x.name.toLowerCase(),x]));
    rows.forEach(x=>{const k=x.name.toLowerCase();if(!map.has(k))map.set(k,{id:'e'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),workshopId:w.id,name:x.name,code:x.code||''})});
    employees=employees.filter(x=>x.workshopId!==w.id).concat(Array.from(map.values()));saveEmployees();
    document.getElementById('ttExcelModal').classList.remove('show');render();toast('Đã nhập '+rows.length+' công nhân');
  }

  function openWorkerList(){
    const w=activeWorkshop();if(!w)return;const list=workersFor(w.id);
    const m=makeModal('ttWorkerModal','👥 DANH SÁCH CÔNG NHÂN','<div id="ttWorkerBody"></div><div class="row"><button class="gray" id="ttWorkerClose">Đóng</button></div>');
    const body=document.getElementById('ttWorkerBody');
    body.innerHTML=list.length?'<div class="tableWrap"><table><thead><tr><th>Mã</th><th>Họ tên</th><th>Chấm công</th><th></th></tr></thead><tbody>'+list.map(x=>'<tr><td>'+esc3(x.code||'')+'</td><td class="left"><b>'+esc3(x.name)+'</b></td><td><button class="green" data-punch="'+esc3(x.id)+'">Chấm công</button></td><td><button class="danger" data-del="'+esc3(x.id)+'">Xóa</button></td></tr>').join('')+'</tbody></table></div>':'<div class="empty">Chưa có công nhân. Hãy nhập từ Excel.</div>';
    body.querySelectorAll('[data-punch]').forEach(b=>b.onclick=()=>{const x=list.find(y=>y.id===b.dataset.punch);m.classList.remove('show');if(x)openPunchWorker(x.name)});
    body.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{const x=list.find(y=>y.id===b.dataset.del);if(x&&confirm('Xóa '+x.name+' khỏi danh sách?')){employees=employees.filter(y=>y.id!==x.id);saveEmployees();m.classList.remove('show');render();openWorkerList()}});
    document.getElementById('ttWorkerClose').onclick=()=>m.classList.remove('show');m.classList.add('show');
  }

  const originalRender=window.render;
  window.render=function(){
    const r=originalRender.apply(this,arguments);
    setTimeout(function(){ensureModeButtons();ensurePersonalNameEditable();renderEnterprisePanel()},0);
    return r;
  };

  const originalOpenPunch=window.openPunch;
  window.openPunch=function(){
    if(appMode==='enterprise')return openNormalPunchEnterprise();
    if(typeof originalOpenPunch==='function')return originalOpenPunch.apply(this,arguments);
  };

  setTimeout(function(){ensureModeButtons();ensurePersonalNameEditable();renderEnterprisePanel()},50);
})();