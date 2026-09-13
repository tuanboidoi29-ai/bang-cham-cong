(function(){
  if(window.__TT_V22_SINGLETON__) return;
  window.__TT_V22_SINGLETON__=true;

  let pFraction=1,eFraction=1;
  function baseWage(type){const w=data.workshops[active];return Number(type==='congtrinh'?w.ct:w.lx)||0}
  function money2(n){return Number(n||0).toLocaleString('vi-VN')+' đ'}

  function removeAllPunchFractions(){
    const modal=document.getElementById('punchModal'); if(!modal)return;
    modal.querySelectorAll('#ttFraction,[data-tt-punch-fraction="1"]').forEach(x=>x.remove());
  }
  function removeAllEditFractions(){
    const modal=document.getElementById('editModal'); if(!modal)return;
    modal.querySelectorAll('#ttEFraction,[data-tt-edit-fraction="1"]').forEach(x=>x.remove());
  }

  function ensurePunchFraction(){
    const modal=document.getElementById('punchModal'); if(!modal)return null;
    let all=[...modal.querySelectorAll('#ttFraction,[data-tt-punch-fraction="1"]')];
    let box=all.shift()||null; all.forEach(x=>x.remove());
    if(!box){
      const wage=document.getElementById('pWage'); if(!wage)return null;
      box=document.createElement('div'); box.id='ttFraction'; box.setAttribute('data-tt-punch-fraction','1'); box.style.margin='14px 0';
      box.innerHTML='<div style="font-size:16px;font-weight:800;margin-bottom:8px">📅 CHỌN SỐ CÔNG</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button id="ttHalf" type="button" style="min-height:70px;background:#f59e0b;color:white;font-size:18px">½<br><small>Nửa công</small></button><button id="ttFull" type="button" style="min-height:70px;background:#087443;color:white;font-size:18px">1<br><small>Đủ công</small></button></div><div id="ttCalc" class="hint" style="margin-top:7px;font-weight:800"></div>';
      wage.parentNode.insertBefore(box,wage.parentNode);
      document.getElementById('ttHalf').onclick=function(){pFraction=.5;updatePunchFraction()};
      document.getElementById('ttFull').onclick=function(){pFraction=1;updatePunchFraction()};
    }
    return box;
  }

  function updatePunchFraction(){
    const box=ensurePunchFraction(); if(!box)return;
    const h=document.getElementById('ttHalf'),f=document.getElementById('ttFull');
    if(h)h.style.outline=pFraction===.5?'4px solid #1677ff':'none';
    if(f)f.style.outline=pFraction===1?'4px solid #1677ff':'none';
    const pay=baseWage(pType)*pFraction,w=document.getElementById('pWage');
    if(w){w.value=pay;w.readOnly=true}
    const c=document.getElementById('ttCalc'); if(c)c.textContent=(pFraction===.5?'½ Nửa công':'1 Đủ công')+' = '+money2(pay);
  }

  function ensureEditFraction(){
    const modal=document.getElementById('editModal'); if(!modal)return null;
    let all=[...modal.querySelectorAll('#ttEFraction,[data-tt-edit-fraction="1"]')];
    let box=all.shift()||null; all.forEach(x=>x.remove());
    if(!box){
      const wage=document.getElementById('eWage'); if(!wage)return null;
      box=document.createElement('div'); box.id='ttEFraction'; box.setAttribute('data-tt-edit-fraction','1'); box.style.margin='14px 0';
      box.innerHTML='<div style="font-size:16px;font-weight:800;margin-bottom:8px">📅 CHỌN SỐ CÔNG</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button id="ttEHalf" type="button" style="min-height:70px;background:#f59e0b;color:white;font-size:18px">½<br><small>Nửa công</small></button><button id="ttEFull" type="button" style="min-height:70px;background:#087443;color:white;font-size:18px">1<br><small>Đủ công</small></button></div><div id="ttECalc" class="hint" style="margin-top:7px;font-weight:800"></div>';
      wage.parentNode.insertBefore(box,wage.parentNode);
      document.getElementById('ttEHalf').onclick=function(){eFraction=.5;updateEditFraction()};
      document.getElementById('ttEFull').onclick=function(){eFraction=1;updateEditFraction()};
    }
    return box;
  }
  function updateEditFraction(){
    const box=ensureEditFraction(); if(!box)return;
    const h=document.getElementById('ttEHalf'),f=document.getElementById('ttEFull');
    if(h)h.style.outline=eFraction===.5?'4px solid #1677ff':'none';
    if(f)f.style.outline=eFraction===1?'4px solid #1677ff':'none';
    const pay=baseWage(editType)*eFraction,w=document.getElementById('eWage');
    if(w){w.value=pay;w.readOnly=true}
    const c=document.getElementById('ttECalc'); if(c)c.textContent=(eFraction===.5?'½ Nửa công':'1 Đủ công')+' = '+money2(pay);
  }

  const oldOpenPunch=window.openPunch;
  window.openPunch=function(){removeAllPunchFractions();pFraction=1;if(typeof oldOpenPunch==='function')oldOpenPunch();};
  const oldChooseType=window.chooseType;
  window.chooseType=function(t){if(typeof oldChooseType==='function')oldChooseType(t);else pType=t;ensurePunchFraction();updatePunchFraction();};

  window.doPunch=function(){const w=data.workshops[active],name=document.getElementById('pName').value.trim(),date=document.getElementById('pDate').value||today(),wage=baseWage(pType)*pFraction,om=Number(document.getElementById('pOTMorning').value||0),oe=Number(document.getElementById('pOTEve').value||0),orate=Number(document.getElementById('pOTRate').value||0);if(!name)return toast('Nhập tên người chấm công');let k=key(w,name,date),r=data.records[k];if(!r)data.records[k]={in:now(),out:'',type:pType,wage,workFraction:pFraction,otMorning:om,otEvening:oe,otRate:orate};else if(!r.out){r.out=now();r.type=pType;r.wage=wage;r.workFraction=pFraction;r.otMorning=om;r.otEvening=oe;r.otRate=orate}else data.records[k]={in:now(),out:'',type:pType,wage,workFraction:pFraction,otMorning:om,otEvening:oe,otRate:orate};save();closeM('punchModal')};

  const oldOpenEdit=window.openEdit;
  window.openEdit=function(name,date){removeAllEditFractions();if(typeof oldOpenEdit==='function')oldOpenEdit(name,date);const r=rec(data.workshops[active],name,date);eFraction=Number(r&&r.workFraction||1)===.5?.5:1;ensureEditFraction();updateEditFraction();};
  const oldChooseEditType=window.chooseEditType;
  window.chooseEditType=function(t){if(typeof oldChooseEditType==='function')oldChooseEditType(t);else editType=t;updateEditFraction();};
  window.saveEdit=function(){if(!editKey)return;let date=document.getElementById('eDate').value,name=editKey.split('|')[1],w=data.workshops[active],wage=baseWage(editType)*eFraction,om=Number(document.getElementById('eOTMorning').value||0),oe=Number(document.getElementById('eOTEve').value||0),orate=Number(document.getElementById('eOTRate').value||0);let nk=key(w,name,date);if(nk!==editOriginalKey)delete data.records[editOriginalKey];data.records[nk]={in:document.getElementById('eIn').value,out:document.getElementById('eOut').value,type:editType,wage,workFraction:eFraction,otMorning:om,otEvening:oe,otRate:orate};save();closeM('editModal');toast('Đã lưu chấm công')};
})();