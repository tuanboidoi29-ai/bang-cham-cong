(function(){
  if(window.__TT_FIX_CONTROLS__) return;
  window.__TT_FIX_CONTROLS__=true;

  function byId(id){return document.getElementById(id)}
  function notify(t){try{if(typeof toast==='function')toast(t);else alert(t)}catch(e){alert(t)}}

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

  window.TT_exportPDF=function(){
    try{window.print()}catch(e){console.error(e);notify('Không mở được chức năng in PDF')}
  };

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

  function openEditFromButton(btn){
    try{
      const td=btn.closest('td.daycell');
      const tr=btn.closest('tr');
      if(!td||!tr)return notify('Không xác định được ngày công');
      const cells=Array.from(tr.querySelectorAll('td'));
      const dayIndex=cells.indexOf(td);
      if(dayIndex<1)return notify('Không xác định được ngày');
      const name=(cells[0].textContent||'').trim();
      const date=String(month||'')+'-'+String(dayIndex).padStart(2,'0');

      try{
        if(typeof window.openEdit==='function')window.openEdit(name,date);
      }catch(err){console.error('TT openEdit',err)}

      const modal=byId('editModal');
      if(!modal)return notify('Không tìm thấy cửa sổ sửa');
      modal.classList.add('show');

      const w=(data.workshops||[])[active];
      const k=(typeof key==='function'&&w)?key(w,name,date):null;
      const rec0=k&&data.records?data.records[k]:null;
      if(rec0){
        try{editKey=k;editOriginalKey=k;editType=rec0.type||'xuong'}catch(_e){}
        if(byId('editInfo'))byId('editInfo').textContent=name+' · '+date+' · sửa hoặc xóa ngày công';
        if(byId('eDate'))byId('eDate').value=date;
        if(byId('eIn'))byId('eIn').value=rec0.in||'';
        if(byId('eOut'))byId('eOut').value=rec0.out||'';
        if(byId('eWage'))byId('eWage').value=Number(rec0.wage||0);
        if(byId('eOTMorning'))byId('eOTMorning').value=Number(rec0.otMorning||0);
        if(byId('eOTEve'))byId('eOTEve').value=Number(rec0.otEvening||0);
        if(byId('eOTRate'))byId('eOTRate').value=Number(rec0.otRate||(w&&w.ot)||0);
        try{if(typeof markEditType==='function')markEditType()}catch(_e){}
        try{if(typeof updateEditCalc==='function')updateEditCalc()}catch(_e){}
      }
    }catch(e){console.error(e);notify('Lỗi mở sửa chấm công')}
  }

  document.addEventListener('click',function(e){
    const editBtn=e.target.closest&&e.target.closest('.tt-edit-day-btn');
    if(editBtn){
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      openEditFromButton(editBtn);
      return;
    }

    const b=e.target.closest&&e.target.closest('button'); if(!b)return;
    const txt=(b.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
    if(txt.indexOf('SỬA/XÓA')>=0){
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      openEditFromButton(b);
      return;
    }
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