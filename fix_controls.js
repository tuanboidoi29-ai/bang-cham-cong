(function(){
  if(window.__TT_FIX_CONTROLS__) return;
  window.__TT_FIX_CONTROLS__=true;

  function byId(id){return document.getElementById(id)}
  function notify(t){try{if(typeof toast==='function')toast(t);else alert(t)}catch(e){alert(t)}}

  // FIX CHAM CONG: mo modal truc tiep, khong phu thuoc wrapper cu
  window.openPunch=function(){
    try{
      const w=(window.data&&data.workshops)?data.workshops[active]:null;
      if(!w)return notify('Chưa chọn xưởng');
      window.pType='xuong';
      if(byId('pName'))byId('pName').value='';
      if(byId('pDate'))byId('pDate').value=(typeof today==='function'?today():new Date().toISOString().slice(0,10));
      if(byId('punchWorkshop'))byId('punchWorkshop').textContent=w.name+' · chọn LX hoặc CT';
      if(byId('pWage'))byId('pWage').value=Number(w.lx||0);
      if(byId('pOTMorning'))byId('pOTMorning').value=0;
      if(byId('pOTEve'))byId('pOTEve').value=0;
      if(byId('pOTRate'))byId('pOTRate').value=Number(w.ot||0);
      if(typeof markType==='function')markType();
      const m=byId('punchModal'); if(m)m.classList.add('show');
    }catch(e){console.error(e);notify('Lỗi mở chấm công')}
  };

  // FIX PDF
  window.TT_exportPDF=function(){
    try{window.print()}catch(e){console.error(e);notify('Không mở được chức năng in PDF')}
  };

  // XUAT / NHAP DU LIEU
  function collect(){
    const storage={};
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(k && (k.indexOf('TT_CC_')===0 || k==='TT_ADVANCES'))storage[k]=localStorage.getItem(k);
    }
    return {app:'TT_BANG_CHAM_CONG',version:1,exportedAt:new Date().toISOString(),storage};
  }
  function exportData(){
    const blob=new Blob([JSON.stringify(collect(),null,2)],{type:'application/json;charset=utf-8'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='TT_BANG_CHAM_CONG_BACKUP_'+new Date().toISOString().slice(0,10)+'.json';
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    notify('Đã xuất dữ liệu');
  }
  function importData(file){
    const r=new FileReader();
    r.onload=function(){
      try{
        const o=JSON.parse(String(r.result||''));
        if(!o||o.app!=='TT_BANG_CHAM_CONG'||!o.storage)throw new Error('invalid');
        if(!confirm('Nhập dữ liệu sẽ thay dữ liệu hiện tại. Tiếp tục?'))return;
        Object.keys(o.storage).forEach(k=>localStorage.setItem(k,o.storage[k]));
        alert('Đã nhập dữ liệu. Trang sẽ tải lại.');location.reload();
      }catch(e){alert('File dữ liệu không hợp lệ')}
    };
    r.readAsText(file,'utf-8');
  }
  function openData(){
    let m=byId('ttDataModal2');
    if(!m){
      m=document.createElement('div');m.id='ttDataModal2';m.className='modal';
      m.innerHTML='<div class="box"><h3>💾 DỮ LIỆU</h3><div class="hint">Xuất dữ liệu từ máy cũ và nhập lại trên máy mới.</div><div class="row"><button class="green" id="ttEx2">⬇️ Xuất dữ liệu</button></div><div class="row"><button id="ttIm2">⬆️ Nhập dữ liệu</button></div><input id="ttFile2" type="file" accept=".json,application/json" style="display:none"><div class="row"><button class="gray" id="ttCl2">Đóng</button></div></div>';
      document.body.appendChild(m);
      byId('ttEx2').onclick=exportData;
      byId('ttIm2').onclick=()=>byId('ttFile2').click();
      byId('ttFile2').onchange=e=>{const f=e.target.files&&e.target.files[0];if(f)importData(f);e.target.value=''};
      byId('ttCl2').onclick=()=>m.classList.remove('show');
    }
    m.classList.add('show');
  }
  window.TT_openData=openData;

  function addDataButton(){
    const tabs=byId('tabs'); if(!tabs)return;
    if(!byId('ttDataBtnFixed')){
      const b=document.createElement('button');b.id='ttDataBtnFixed';b.className='tab purple';b.textContent='💾 DỮ LIỆU';b.onclick=openData;tabs.appendChild(b);
    }
  }

  // Bat su kien o che do capture de bo qua onclick cu bi loi
  document.addEventListener('click',function(e){
    const b=e.target.closest&&e.target.closest('button'); if(!b)return;
    const txt=(b.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
    if(txt==='🟢 CHẤM CÔNG' || (txt==='CHẤM CÔNG' && !b.closest('#punchModal'))){e.preventDefault();e.stopImmediatePropagation();window.openPunch();return}
    if(txt.indexOf('XUẤT PDF')>=0){e.preventDefault();e.stopImmediatePropagation();window.TT_exportPDF();return}
  },true);

  const oldRender=window.render;
  if(typeof oldRender==='function'){
    window.render=function(){const r=oldRender.apply(this,arguments);setTimeout(addDataButton,0);return r};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addDataButton);else addDataButton();
  setTimeout(addDataButton,300);
})();