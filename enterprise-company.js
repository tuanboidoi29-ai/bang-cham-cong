(function(){
  if(window.__TT_ENTERPRISE_COMPANY_V1__) return;
  window.__TT_ENTERPRISE_COMPANY_V1__=true;

  const COMPANY_KEY='TT_CC_ENTERPRISE_COMPANY_NAME';
  const SOURCE_KEY='TT_CC_ENTERPRISE_EMPLOYEE_SOURCE_URL';
  const NAME_HEADERS=['ho ten','ho va ten','ten','ten cong nhan','cong nhan','nhan vien','ten nhan vien','employee name','name'];
  const CODE_HEADERS=['ma','ma nv','ma nhan vien','ma cong nhan','stt','id','employee id'];

  function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').trim()}
  function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function msg(t){if(typeof toast==='function')toast(t);else alert(t)}

  function addStyle(){
    if(document.getElementById('ttCompanyStyle'))return;
    const st=document.createElement('style');st.id='ttCompanyStyle';st.textContent=`
      #ttCompanyGate{position:fixed;inset:0;z-index:9999;background:#f3f6fa;display:flex;align-items:center;justify-content:center;padding:18px}
      #ttCompanyGate .gateBox{width:min(520px,100%);background:#fff;border-radius:20px;padding:22px;box-shadow:0 12px 40px #0f172a22}
      #ttCompanyGate h2{margin:0 0 8px}#ttCompanyGate input{width:100%;margin:10px 0;font-size:17px}
      #ttCompanyCard .companyName{font-size:22px;font-weight:900;margin-top:4px}
      #ttShareUrl{width:100%}.ttSourceStatus{font-size:12px;color:#667085;margin-top:6px;word-break:break-all}
      .ttLinkRow{display:grid;grid-template-columns:1fr auto auto;gap:8px;margin-top:10px}
      @media(max-width:600px){.ttLinkRow{grid-template-columns:1fr}.ttLinkRow button{width:100%}}
    `;document.head.appendChild(st);
  }

  function companyName(){return (localStorage.getItem(COMPANY_KEY)||'').trim()}
  function openCompanyGate(force){
    let g=document.getElementById('ttCompanyGate');
    if(g)g.remove();
    if(!force && companyName())return;
    g=document.createElement('div');g.id='ttCompanyGate';
    g.innerHTML='<div class="gateBox"><h2>🏢 ĐĂNG KÝ DOANH NGHIỆP</h2><div class="hint">Nhập tên doanh nghiệp để sử dụng chế độ Doanh nghiệp.</div><input id="ttCompanyNameInput" placeholder="Tên doanh nghiệp" value="'+esc(companyName())+'"><div class="row"><button class="green" id="ttCompanySave">Lưu tên doanh nghiệp</button></div></div>';
    document.body.appendChild(g);
    const inp=document.getElementById('ttCompanyNameInput');setTimeout(()=>inp.focus(),50);
    document.getElementById('ttCompanySave').onclick=function(){
      const name=inp.value.trim();if(!name)return msg('Nhập tên doanh nghiệp');
      localStorage.setItem(COMPANY_KEY,name);g.remove();renderCompanyCard();
    };
  }

  function renderCompanyCard(){
    let card=document.getElementById('ttCompanyCard');if(card)card.remove();
    const app=document.querySelector('.app');if(!app)return;
    card=document.createElement('div');card.id='ttCompanyCard';card.className='card';
    card.innerHTML='<div class="row" style="align-items:center"><div><div class="hint">🏢 DOANH NGHIỆP</div><div class="companyName">'+esc(companyName()||'Chưa đăng ký')+'</div></div><button class="gray" id="ttEditCompany" style="flex:0 0 auto">✏️ Đổi tên</button></div>';
    const top=app.querySelector('.top');if(top&&top.nextSibling)app.insertBefore(card,top.nextSibling);else app.insertBefore(card,app.firstChild);
    document.getElementById('ttEditCompany').onclick=()=>openCompanyGate(true);
  }

  function normalizeSharedUrl(raw){
    let u=String(raw||'').trim();if(!u)return '';
    const m=u.match(/https?:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if(m){
      const gid=(u.match(/[?&#]gid=([0-9]+)/)||[])[1];
      return 'https://docs.google.com/spreadsheets/d/'+m[1]+'/export?format=xlsx'+(gid?'&gid='+gid:'');
    }
    return u;
  }

  function findHeaders(rows){
    if(!rows.length)return null;
    const keys=Object.keys(rows[0]||{});
    const nk=keys.find(k=>NAME_HEADERS.includes(norm(k)));
    const ck=keys.find(k=>CODE_HEADERS.includes(norm(k)));
    return {keys,nk,ck};
  }

  function importRows(rows,sourceLabel){
    if(!Array.isArray(rows)||!rows.length){msg('Không có dữ liệu công nhân');return false}
    const h=findHeaders(rows);
    if(!h||!h.nk){
      msg('Excel bắt buộc phải có cột Tên công nhân / Họ tên');
      return false;
    }
    const w=typeof currentW==='function'?currentW():null;if(!w){msg('Chưa có xưởng');return false}
    const existing=typeof workers==='function'?workers():[];
    const map=new Map(existing.map(x=>[String(x.name||'').trim().toLowerCase(),x]));
    let added=0,valid=0;
    rows.forEach(x=>{
      const n=String(x[h.nk]||'').trim();if(!n)return;valid++;
      const key=n.toLowerCase();
      if(!map.has(key)){map.set(key,{id:'e'+Date.now().toString(36)+Math.random().toString(36).slice(2,8),workshopId:w.id,name:n,code:h.ck?String(x[h.ck]||'').trim():''});added++}
    });
    if(!valid){msg('Không tìm thấy tên công nhân trong Excel');return false}
    employees=employees.filter(x=>x.workshopId!==w.id).concat(Array.from(map.values()));
    if(typeof saveEmp==='function')saveEmp();if(typeof render==='function')render();
    msg('Đã lấy '+valid+' công nhân'+(added?' · mới '+added:''));
    const st=document.getElementById('ttSourceStatus');if(st)st.textContent='Đã đồng bộ: '+sourceLabel;
    return true;
  }

  async function fetchShared(){
    const input=document.getElementById('ttShareUrl');if(!input)return;
    const raw=input.value.trim();if(!raw)return msg('Dán link chia sẻ Excel / Google Sheets');
    localStorage.setItem(SOURCE_KEY,raw);
    const url=normalizeSharedUrl(raw),btn=document.getElementById('ttFetchShared');
    if(btn){btn.disabled=true;btn.textContent='Đang lấy...'}
    try{
      const res=await fetch(url,{cache:'no-store'});if(!res.ok)throw new Error('HTTP '+res.status);
      const buf=await res.arrayBuffer();
      if(!window.XLSX)throw new Error('Thiếu bộ đọc Excel');
      const wb=XLSX.read(buf,{type:'array'});if(!wb.SheetNames.length)throw new Error('Không có sheet');
      const ws=wb.Sheets[wb.SheetNames[0]],rows=XLSX.utils.sheet_to_json(ws,{defval:''});
      importRows(rows,raw);
    }catch(err){
      console.error(err);
      msg('Không lấy được link. Hãy bật quyền “Bất kỳ ai có liên kết” hoặc dùng link Excel công khai.');
    }finally{if(btn){btn.disabled=false;btn.textContent='🔄 Lấy danh sách'}}
  }

  function enhanceWorkerCard(){
    const cards=Array.from(document.querySelectorAll('.card'));
    const card=cards.find(c=>(c.querySelector('.title')?.textContent||'').includes('Công nhân'));
    if(!card||document.getElementById('ttShareUrl'))return;
    const wrap=document.createElement('div');
    wrap.innerHTML='<div class="hint" style="margin-top:12px"><b>🔗 Link chia sẻ danh sách công nhân</b><br>Google Sheets hoặc file Excel công khai. File bắt buộc có cột <b>Tên công nhân / Họ tên</b>.</div><div class="ttLinkRow"><input id="ttShareUrl" placeholder="Dán link chia sẻ Excel / Google Sheets"><button class="purple" id="ttFetchShared">🔄 Lấy danh sách</button><button class="gray" id="ttClearShared">Xóa link</button></div><div class="ttSourceStatus" id="ttSourceStatus"></div>';
    card.appendChild(wrap);
    const saved=localStorage.getItem(SOURCE_KEY)||'';document.getElementById('ttShareUrl').value=saved;
    document.getElementById('ttFetchShared').onclick=fetchShared;
    document.getElementById('ttClearShared').onclick=function(){localStorage.removeItem(SOURCE_KEY);document.getElementById('ttShareUrl').value='';document.getElementById('ttSourceStatus').textContent=''};
  }

  // Siết nhập file cục bộ: không chấp nhận file thiếu cột tên công nhân.
  const fileInput=document.getElementById('excel');
  if(fileInput){
    fileInput.onchange=function(e){
      const f=e.target.files&&e.target.files[0];if(!f)return;
      const r=new FileReader();r.onload=function(){try{const wb=XLSX.read(r.result,{type:'array'}),ws=wb.Sheets[wb.SheetNames[0]],rows=XLSX.utils.sheet_to_json(ws,{defval:''});importRows(rows,f.name)}catch(err){console.error(err);msg('Không đọc được Excel')}};r.readAsArrayBuffer(f);
    };
  }

  addStyle();renderCompanyCard();enhanceWorkerCard();openCompanyGate(false);
  const obs=new MutationObserver(()=>enhanceWorkerCard());obs.observe(document.body,{childList:true,subtree:true});
})();