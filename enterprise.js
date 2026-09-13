(function(){
  if(window.__TT_ENTERPRISE_MODE_V2__) return;
  window.__TT_ENTERPRISE_MODE_V2__=true;

  const MODE_KEY='TT_CC_APP_MODE';
  const EMP_KEY='TT_CC_ENTERPRISE_EMPLOYEES';
  let appMode=localStorage.getItem(MODE_KEY)||'';
  let employees=[];
  try{employees=JSON.parse(localStorage.getItem(EMP_KEY)||'[]');if(!Array.isArray(employees))employees=[]}catch(e){employees=[]}

  function saveEmployees(){localStorage.setItem(EMP_KEY,JSON.stringify(employees))}
  function esc3(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]||c))}
  function activeWorkshop(){try{return (data.workshops||[])[active]||null}catch(e){return null}}
  function workersFor(wid){return employees.filter(x=>x.workshopId===wid)}
  function uniqueNames(list){return Array.from(new Set(list.map(x=>String(x||'').trim()).filter(Boolean)))}

  function addStyle(){
    if(document.getElementById('ttModeStyleV2'))return;
    const s=document.createElement('style');s.id='ttModeStyleV2';
    s.textContent=`
      #ttModeHeader{display:flex;gap:8px;align-items:center;margin:0 0 10px;padding:10px;background:#fff;border-radius:15px;box-shadow:0 2px 12px #0f172a14}
      #ttModeHeader button{flex:1;min-height:48px;font-size:15px}
      #ttModeChooser{position:fixed;inset:0;z-index:9999;background:#f3f6fa;display:flex;align-items:center;justify-content:center;padding:20px}
      #ttModeChooser .ttbox{width:min(520px,100%);background:#fff;border-radius:20px;padding:22px;box-shadow:0 12px 40px #0f172a22;text-align:center}
      #ttModeChooser h2{margin:0 0 6px}.ttmodegrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px}
      .ttmodechoice{min-height:110px;border-radius:16px;font-size:18px}.ttmodechoice small{display:block;font-size:12px;margin-top:7px;font-weight:600}
      body.tt-mode-personal #ttEnterprisePanel,body.tt-mode-personal #ttExcelModal,body.tt-mode-personal #ttWorkerModal{display:none!important}
      body.tt-mode-enterprise .tt-personal-only{display:none!important}
      @media(max-width:600px){.ttmodegrid{grid-template-columns:1fr}#ttModeHeader{position:sticky;top:0;z-index:50}}
    `;
    document.head.appendChild(s);
  }

  function closeEnterpriseModals(){['ttExcelModal','ttWorkerModal'].forEach(id=>{const m=document.getElementById(id);if(m)m.classList.remove('show')})}
  function closeCoreModals(){['punchModal','editModal','workshopModal'].forEach(id=>{const m=document.getElementById(id);if(m)m.classList.remove('show')})}

  function applyModeClass(){
    document.body.classList.remove('tt-mode-personal','tt-mode-enterprise');
    if(appMode==='enterprise')document.body.classList.add('tt-mode-enterprise');
    else if(appMode==='personal')document.body.classList.add('tt-mode-personal');
  }

  function setMode(mode){
    appMode=mode==='enterprise'?'enterprise':'personal';
    localStorage.setItem(MODE_KEY,appMode);
    closeEnterpriseModals();closeCoreModals();applyModeClass();
    try{view='workshop'}catch(e){}
    render();
  }
  window.TT_setAppMode=setMode;

  function makeChooser(){
    if(appMode)return;
    if(document.getElementById('ttModeChooser'))return;
    const q=document.createElement('div');q.id='ttModeChooser';
    q.innerHTML='<div class="ttbox"><h2>🕘 TT - BẢNG CHẤM CÔNG</h2><div class="hint">Chọn chế độ sử dụng</div><div class="ttmodegrid"><button class="ttmodechoice green" id="ttChoosePersonal">👤 CÁ NHÂN<small>Giao diện và tính năng chấm công hiện tại</small></button><button class="ttmodechoice purple" id="ttChooseEnterprise">🏢 DOANH NGHIỆP<small>Danh sách công nhân + chấm công theo từng người</small></button></div></div>';
    document.body.appendChild(q);
    document.getElementById('ttChoosePersonal').onclick=()=>{q.remove();setMode('personal')};
    document.getElementById('ttChooseEnterprise').onclick=()=>{q.remove();setMode('enterprise')};
  }

  function ensureModeHeader(){
    if(!appMode)return;
    let h=document.getElementById('ttModeHeader');
    if(!h){
      h=document.createElement('div');h.id='ttModeHeader';h.className='noPrint';
      const app=document.querySelector('.app');
      if(app)app.insertBefore(h,app.firstChild);else document.body.insertBefore(h,document.body.firstChild);
    }
    h.innerHTML=appMode==='personal'
      ? '<button class="green" type="button">👤 ĐANG DÙNG: CÁ NHÂN</button><button class="gray" id="ttSwitchMode" type="button">Đổi chế độ</button>'
      : '<button class="purple" type="button">🏢 ĐANG DÙNG: DOANH NGHIỆP</button><button class="gray" id="ttSwitchMode" type="button">Đổi chế độ</button>';
    document.getElementById('ttSwitchMode').onclick=function(){localStorage.removeItem(MODE_KEY);appMode='';location.reload()};
  }

  const oldNamesForMonth=window.namesForMonth;
  window.namesForMonth=function(w,Y,M){
    const base=typeof oldNamesForMonth==='function'?oldNamesForMonth(w,Y,M):[];
    if(appMode!=='enterprise')return base;
    return uniqueNames(base.concat(workersFor(w.id).map(x=>x.name))).sort((a,b)=>a.localeCompare(b,'vi'));
  };
  try{namesForMonth=window.namesForMonth}catch(e){}

  function openPunchWorker(name){
    const original=window.__TT_ORIGINAL_OPEN_PUNCH__;
    if(typeof original==='function')original();
    const n=document.getElementById('pName');if(n){n.value=name;n.readOnly=true}
    const info=document.getElementById('punchWorkshop');if(info)info.textContent=(activeWorkshop()?.name||'')+' · '+name+' · chọn LX hoặc CT';
  }
  window.TT_punchWorker=openPunchWorker;

  function openSelectedWorker(){
    const sel=document.getElementById('ttWorkerSelect');
    if(!sel||!sel.value){if(typeof toast==='function')toast('Chọn công nhân trước');return}
    openPunchWorker(sel.value);
  }
  window.TT_punchSelectedWorker=openSelectedWorker;

  function ensurePersonalNameEditable(){const n=document.getElementById('pName');if(n&&appMode==='personal')n.readOnly=false}

  function renderEnterprisePanel(){
    const old=document.getElementById('ttEnterprisePanel');if(old)old.remove();
    if(appMode!=='enterprise'||view!=='workshop')return;
    const w=activeWorkshop(),content=document.getElementById('content');if(!w||!content)return;
    const list=workersFor(w.id);
    const panel=document.createElement('div');panel.id='ttEnterprisePanel';panel.className='card noPrint';
    panel.innerHTML='<div class="bar"><div><div class="title">🏢 CHẤM CÔNG DOANH NGHIỆP</div><div class="hint">Chỉ chấm công cho công nhân trong danh sách đã nhập.</div></div><div class="controls"><button class="purple" id="ttImportExcel">📥 Nhập Excel</button><button class="gray" id="ttManageWorkers">👥 Danh sách ('+list.length+')</button></div></div><div class="row" style="margin-top:12px"><select id="ttWorkerSelect"><option value="">-- Chọn công nhân --</option>'+list.map(x=>'<option value="'+esc3(x.name)+'">'+esc3(x.code?x.code+' · '+x.name:x.name)+'</option>').join('')+'</select><button class="green" id="ttPunchWorker">🟢 Chấm công công nhân</button></div>';
    content.insertBefore(panel,content.firstChild);
    document.getElementById('ttImportExcel').onclick=openImport;
    document.getElementById('ttManageWorkers').onclick=openWorkerList;
    document.getElementById('ttPunchWorker').onclick=openSelectedWorker;

    // Ẩn hoàn toàn nút chấm công tự do của chế độ cá nhân.
    content.querySelectorAll('button').forEach(b=>{
      const t=(b.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
      if((t==='🟢 CHẤM CÔNG'||t==='CHẤM CÔNG')&&!b.closest('#ttEnterprisePanel')){b.classList.add('tt-personal-only');b.style.display='none'}
    });
  }

  function makeModal(id,title,html){let m=document.getElementById(id);if(!m){m=document.createElement('div');m.id=id;m.className='modal';m.innerHTML='<div class="box"><h3>'+title+'</h3>'+html+'</div>';document.body.appendChild(m)}return m}

  function openImport(){
    const m=makeModal('ttExcelModal','📥 NHẬP DANH SÁCH CÔNG NHÂN TỪ EXCEL','<div class="hint">Hỗ trợ .xlsx, .xls. Ưu tiên cột Họ tên / Họ và tên / Tên / Công nhân.</div><div class="row"><input id="ttExcelFile" type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"></div><div id="ttExcelPreview" class="hint"></div><div class="row"><button class="green" id="ttExcelSave">Nhập danh sách</button><button class="gray" id="ttExcelClose">Hủy</button></div>');
    m.classList.add('show');const file=document.getElementById('ttExcelFile');file.value='';window.__TT_EXCEL_ROWS=[];
    file.onchange=function(){const f=this.files&&this.files[0];if(f)readExcel(f)};document.getElementById('ttExcelSave').onclick=saveExcelRows;document.getElementById('ttExcelClose').onclick=()=>m.classList.remove('show');
  }
  function loadXlsx(cb){if(window.XLSX)return cb();const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=cb;s.onerror=()=>toast('Không tải được bộ đọc Excel');document.head.appendChild(s)}
  function readExcel(file){loadXlsx(function(){const r=new FileReader();r.onload=function(){try{const wb=XLSX.read(r.result,{type:'array'}),ws=wb.Sheets[wb.SheetNames[0]],rows=XLSX.utils.sheet_to_json(ws,{defval:''});if(!rows.length)return toast('File Excel không có dữ liệu');const keys=Object.keys(rows[0]||{});const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').trim();let nameKey=keys.find(k=>['ho ten','ho va ten','ten','cong nhan','ten cong nhan','nhan vien'].includes(norm(k)))||keys[0];let codeKey=keys.find(k=>['ma','ma nv','ma nhan vien','ma cong nhan','stt'].includes(norm(k)));const parsed=rows.map(x=>({name:String(x[nameKey]||'').trim(),code:codeKey?String(x[codeKey]||'').trim():''})).filter(x=>x.name);window.__TT_EXCEL_ROWS=parsed;const pv=document.getElementById('ttExcelPreview');if(pv)pv.innerHTML='Đã đọc <b>'+parsed.length+'</b> công nhân.'}catch(e){console.error(e);toast('Không đọc được file Excel')}};r.readAsArrayBuffer(file)})}
  function saveExcelRows(){const rows=window.__TT_EXCEL_ROWS||[];if(!rows.length)return toast('Chọn file Excel trước');const w=activeWorkshop();if(!w)return;const old=workersFor(w.id),map=new Map(old.map(x=>[x.name.toLowerCase(),x]));rows.forEach(x=>{const k=x.name.toLowerCase();if(!map.has(k))map.set(k,{id:'e'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),workshopId:w.id,name:x.name,code:x.code||''})});employees=employees.filter(x=>x.workshopId!==w.id).concat(Array.from(map.values()));saveEmployees();document.getElementById('ttExcelModal').classList.remove('show');render();toast('Đã nhập '+rows.length+' công nhân')}

  function openWorkerList(){
    const w=activeWorkshop();if(!w)return;const list=workersFor(w.id);
    const m=makeModal('ttWorkerModal','👥 DANH SÁCH CÔNG NHÂN','<div id="ttWorkerBody"></div><div class="row"><button class="gray" id="ttWorkerClose">Đóng</button></div>');
    const body=document.getElementById('ttWorkerBody');
    body.innerHTML=list.length?'<div class="tableWrap"><table><thead><tr><th>Mã</th><th>Họ tên</th><th>Chấm công</th><th></th></tr></thead><tbody>'+list.map(x=>'<tr><td>'+esc3(x.code||'')+'</td><td class="left"><b>'+esc3(x.name)+'</b></td><td><button class="green" data-punch="'+esc3(x.id)+'">Chấm công</button></td><td><button class="danger" data-del="'+esc3(x.id)+'">Xóa</button></td></tr>').join('')+'</tbody></table></div>':'<div class="empty">Chưa có công nhân. Hãy nhập từ Excel.</div>';
    body.querySelectorAll('[data-punch]').forEach(b=>b.onclick=()=>{const x=list.find(y=>y.id===b.dataset.punch);m.classList.remove('show');if(x)openPunchWorker(x.name)});
    body.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{const x=list.find(y=>y.id===b.dataset.del);if(x&&confirm('Xóa '+x.name+' khỏi danh sách?')){employees=employees.filter(y=>y.id!==x.id);saveEmployees();m.classList.remove('show');render();openWorkerList()}});
    document.getElementById('ttWorkerClose').onclick=()=>m.classList.remove('show');m.classList.add('show');
  }

  addStyle();applyModeClass();
  window.__TT_ORIGINAL_OPEN_PUNCH__=window.openPunch;
  const originalOpenPunch=window.openPunch;
  window.openPunch=function(){if(appMode==='enterprise')return openSelectedWorker();return typeof originalOpenPunch==='function'?originalOpenPunch.apply(this,arguments):undefined};

  const originalRender=window.render;
  window.render=function(){
    const r=originalRender.apply(this,arguments);
    setTimeout(function(){applyModeClass();ensureModeHeader();ensurePersonalNameEditable();renderEnterprisePanel()},0);
    return r;
  };

  if(appMode){ensureModeHeader();setTimeout(function(){applyModeClass();ensureModeHeader();ensurePersonalNameEditable();renderEnterprisePanel()},50)}else{makeChooser()}
})();