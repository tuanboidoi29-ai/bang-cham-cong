(function(){
  if(window.__TT_V22_LOADED__) return;
  window.__TT_V22_LOADED__=true;
  let pFraction=1,eFraction=1;
  function money2(n){return Number(n||0).toLocaleString('vi-VN')+' đ'}
  function baseWage(type){const w=data.workshops[active];return Number(type==='congtrinh'?w.ct:w.lx)||0}
  function fractionHTML(edit){const p=edit?'ttE':'';return '<div id="'+p+'Fraction" style="margin:14px 0"><div style="font-size:16px;font-weight:800;margin-bottom:8px">📅 CHỌN SỐ CÔNG</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button id="'+p+'Half" type="button" style="min-height:70px;background:#f59e0b;color:white;font-size:18px">½<br><small>Nửa công</small></button><button id="'+p+'Full" type="button" style="min-height:70px;background:#087443;color:white;font-size:18px">1<br><small>Đủ công</small></button></div><div id="'+p+'Calc" class="hint" style="margin-top:7px;font-weight:800"></div></div>'}
  function inject(){
    const pm=document.getElementById('punchModal');
    if(pm&&!document.getElementById('ttFraction')){
      const wage=document.getElementById('pWage');
      if(wage){wage.insertAdjacentHTML('beforebegin',fractionHTML(false));document.getElementById('ttHalf').onclick=function(){pFraction=.5;markPunch()};document.getElementById('ttFull').onclick=function(){pFraction=1;markPunch()}}
    }
    const em=document.getElementById('editModal');
    if(em&&!document.getElementById('ttEFraction')){
      const wage=document.getElementById('eWage');
      if(wage){wage.insertAdjacentHTML('beforebegin',fractionHTML(true));document.getElementById('ttEHalf').onclick=function(){eFraction=.5;markEdit()};document.getElementById('ttEFull').onclick=function(){eFraction=1;markEdit()}}
    }
  }
  function markPunch(){inject();const h=document.getElementById('ttHalf'),f=document.getElementById('ttFull');if(h)h.style.outline=pFraction===.5?'4px solid #1677ff':'none';if(f)f.style.outline=pFraction===1?'4px solid #1677ff':'none';const pay=baseWage(pType)*pFraction,w=document.getElementById('pWage');if(w){w.value=pay;w.readOnly=true}const c=document.getElementById('ttCalc');if(c)c.textContent=(pFraction===.5?'½ Nửa công':'1 Đủ công')+' = '+money2(pay)}
  function markEdit(){inject();const h=document.getElementById('ttEHalf'),f=document.getElementById('ttEFull');if(h)h.style.outline=eFraction===.5?'4px solid #1677ff':'none';if(f)f.style.outline=eFraction===1?'4px solid #1677ff':'none';const pay=baseWage(editType)*eFraction,w=document.getElementById('eWage');if(w){w.value=pay;w.readOnly=true}const c=document.getElementById('ttECalc');if(c)c.textContent=(eFraction===.5?'½ Nửa công':'1 Đủ công')+' = '+money2(pay)}
  const oldOpenPunch=window.openPunch;
  window.openPunch=function(){pFraction=1;inject();if(typeof oldOpenPunch==='function')oldOpenPunch();setTimeout(markPunch,0)};
  const oldChooseType=window.chooseType;
  window.chooseType=function(t){if(typeof oldChooseType==='function')oldChooseType(t);else pType=t;markPunch()};
  window.doPunch=function(){const w=data.workshops[active],name=document.getElementById('pName').value.trim(),date=document.getElementById('pDate').value||today(),wage=baseWage(pType)*pFraction,om=Number(document.getElementById('pOTMorning').value||0),oe=Number(document.getElementById('pOTEve').value||0),orate=Number(document.getElementById('pOTRate').value||0);if(!name)return toast('Nhập tên người chấm công');let k=key(w,name,date),r=data.records[k];if(!r)data.records[k]={in:now(),out:'',type:pType,wage,workFraction:pFraction,otMorning:om,otEvening:oe,otRate:orate};else if(!r.out){r.out=now();r.type=pType;r.wage=wage;r.workFraction=pFraction;r.otMorning=om;r.otEvening=oe;r.otRate=orate}else data.records[k]={in:now(),out:'',type:pType,wage,workFraction:pFraction,otMorning:om,otEvening:oe,otRate:orate};save();closeM('punchModal')};
  const oldOpenEdit=window.openEdit;
  window.openEdit=function(name,date){inject();if(typeof oldOpenEdit==='function')oldOpenEdit(name,date);const r=rec(data.workshops[active],name,date);eFraction=Number(r&&r.workFraction||1)===.5?.5:1;setTimeout(markEdit,0)};
  const oldChooseEditType=window.chooseEditType;
  window.chooseEditType=function(t){if(typeof oldChooseEditType==='function')oldChooseEditType(t);else editType=t;markEdit()};
  window.saveEdit=function(){if(!editKey)return;let date=document.getElementById('eDate').value,name=editKey.split('|')[1],w=data.workshops[active],wage=baseWage(editType)*eFraction,om=Number(document.getElementById('eOTMorning').value||0),oe=Number(document.getElementById('eOTEve').value||0),orate=Number(document.getElementById('eOTRate').value||0);let nk=key(w,name,date);if(nk!==editOriginalKey)delete data.records[editOriginalKey];data.records[nk]={in:document.getElementById('eIn').value,out:document.getElementById('eOut').value,type:editType,wage,workFraction:eFraction,otMorning:om,otEvening:oe,otRate:orate};save();closeM('editModal');toast('Đã lưu chấm công')};
  function decorateAttendanceGrid(){if(view!=='workshop')return;const w=data.workshops[active];if(!w)return;const table=document.querySelector('#content table.grid');if(!table)return;const ym=(month||'').split('-');if(ym.length<2)return;const Y=Number(ym[0]),M=Number(ym[1]);table.querySelectorAll('tbody tr').forEach(tr=>{const cells=tr.querySelectorAll('td');if(!cells.length||cells[0].classList.contains('empty'))return;const name=cells[0].textContent.trim();for(let d=1;d<=31&&d<cells.length;d++){const date=Y+'-'+String(M).padStart(2,'0')+'-'+String(d).padStart(2,'0');const r=rec(w,name,date);if(!r)continue;const frac=Number(r.workFraction||1)===.5?'1/2':'2/2';const code=r.type==='congtrinh'?'CT':'LX';const tm=(r.in||r.out)?'<div class="times">'+esc(r.in||'')+' → '+esc(r.out||'')+'</div>':'';const roh=otHours(r),ot=roh?'<div class="ot">TC '+roh.toFixed(2)+'h</div>':'';cells[d].innerHTML='<div class="daynum">'+code+'/'+frac+'</div>'+tm+ot}})}
  const oldRender=window.render;
  window.render=function(){oldRender();setTimeout(decorateAttendanceGrid,0)};
  inject();setTimeout(decorateAttendanceGrid,0);
})();