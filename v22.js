(function(){
  if(window.__TT_V22_SINGLETON_FINAL__) return;
  window.__TT_V22_SINGLETON_FINAL__=true;

  let pFraction=1,eFraction=1;

  function baseWage(type){
    const w=data.workshops[active];
    return Number(type==='congtrinh'?w.ct:w.lx)||0;
  }
  function money2(n){return Number(n||0).toLocaleString('vi-VN')+' đ'}

  function isFractionBlock(el){
    if(!el || !el.textContent) return false;
    const txt=el.textContent.replace(/\s+/g,' ').trim();
    return txt.includes('CHỌN SỐ CÔNG') && txt.includes('Nửa công') && txt.includes('Đủ công');
  }

  function removeLegacyPunchFractionBlocks(){
    const modal=document.getElementById('punchModal');
    if(!modal)return;
    modal.querySelectorAll('#ttFraction,[data-tt-punch-fraction="1"],.tt-fraction-block').forEach(el=>el.remove());
    const box=modal.querySelector('.box')||modal;
    const nodes=Array.from(box.querySelectorAll('div')).filter(isFractionBlock);
    nodes.forEach(el=>{
      if(el===box || el===modal)return;
      const childFraction=Array.from(el.children).some(isFractionBlock);
      if(!childFraction) el.remove();
    });
  }

  function createPunchFractionOnce(){
    const modal=document.getElementById('punchModal');
    if(!modal)return null;
    let current=modal.querySelector('#ttFraction');
    if(current)return current;
    removeLegacyPunchFractionBlocks();
    const wage=document.getElementById('pWage');
    if(!wage)return null;
    const block=document.createElement('div');
    block.id='ttFraction';
    block.setAttribute('data-tt-punch-fraction','1');
    block.style.margin='14px 0';
    block.innerHTML='<div style="font-size:16px;font-weight:800;margin-bottom:8px">📅 CHỌN SỐ CÔNG</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button id="ttHalf" type="button" style="min-height:70px;background:#f59e0b;color:white;font-size:18px">½<br><small>Nửa công</small></button><button id="ttFull" type="button" style="min-height:70px;background:#087443;color:white;font-size:18px">1<br><small>Đủ công</small></button></div><div id="ttCalc" class="hint" style="margin-top:7px;font-weight:800"></div>';
    const wageRow=wage.parentNode;
    wageRow.parentNode.insertBefore(block,wageRow);
    document.getElementById('ttHalf').onclick=function(){pFraction=.5;updatePunchFraction()};
    document.getElementById('ttFull').onclick=function(){pFraction=1;updatePunchFraction()};
    return block;
  }

  function updatePunchFraction(){
    const block=document.getElementById('ttFraction');
    if(!block)return;
    const h=document.getElementById('ttHalf');
    const f=document.getElementById('ttFull');
    if(h)h.style.outline=pFraction===.5?'4px solid #1677ff':'none';
    if(f)f.style.outline=pFraction===1?'4px solid #1677ff':'none';
    const pay=baseWage(pType)*pFraction;
    const wage=document.getElementById('pWage');
    if(wage){wage.value=pay;wage.readOnly=true}
    const calc=document.getElementById('ttCalc');
    if(calc)calc.textContent=(pFraction===.5?'½ Nửa công':'1 Đủ công')+' = '+money2(pay);
  }

  const originalOpenPunch=window.openPunch;
  window.openPunch=function(){
    removeLegacyPunchFractionBlocks();
    pFraction=1;
    if(typeof originalOpenPunch==='function') originalOpenPunch();
  };

  window.chooseType=function(t){
    pType=t;
    const w=data.workshops[active];
    const wage=document.getElementById('pWage');
    if(wage)wage.value=t==='congtrinh'?Number(w.ct||0):Number(w.lx||0);
    const ot=document.getElementById('pOTRate');
    if(ot)ot.value=Number(w.ot||0);
    if(typeof markType==='function')markType();
    createPunchFractionOnce();
    updatePunchFraction();
  };

  window.doPunch=function(){
    const w=data.workshops[active];
    const name=document.getElementById('pName').value.trim();
    const date=document.getElementById('pDate').value||today();
    const wage=baseWage(pType)*pFraction;
    const om=Number(document.getElementById('pOTMorning').value||0);
    const oe=Number(document.getElementById('pOTEve').value||0);
    const orate=Number(document.getElementById('pOTRate').value||0);
    if(!name)return toast('Nhập tên người chấm công');
    const k=key(w,name,date);
    const r=data.records[k];
    if(!r){
      data.records[k]={in:now(),out:'',type:pType,wage,workFraction:pFraction,otMorning:om,otEvening:oe,otRate:orate};
    }else if(!r.out){
      r.out=now();r.type=pType;r.wage=wage;r.workFraction=pFraction;r.otMorning=om;r.otEvening=oe;r.otRate=orate;
    }else{
      data.records[k]={in:now(),out:'',type:pType,wage,workFraction:pFraction,otMorning:om,otEvening:oe,otRate:orate};
    }
    save();
    closeM('punchModal');
  };

  function ensureEditFraction(){
    const modal=document.getElementById('editModal');
    if(!modal)return null;
    let block=modal.querySelector('#ttEFraction');
    if(block)return block;
    const wage=document.getElementById('eWage');
    if(!wage)return null;
    block=document.createElement('div');
    block.id='ttEFraction';
    block.style.margin='14px 0';
    block.innerHTML='<div style="font-size:16px;font-weight:800;margin-bottom:8px">📅 CHỌN SỐ CÔNG</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button id="ttEHalf" type="button" style="min-height:70px;background:#f59e0b;color:white;font-size:18px">½<br><small>Nửa công</small></button><button id="ttEFull" type="button" style="min-height:70px;background:#087443;color:white;font-size:18px">1<br><small>Đủ công</small></button></div><div id="ttECalc" class="hint" style="margin-top:7px;font-weight:800"></div>';
    const wageRow=wage.parentNode;
    wageRow.parentNode.insertBefore(block,wageRow);
    document.getElementById('ttEHalf').onclick=function(){eFraction=.5;updateEditFraction()};
    document.getElementById('ttEFull').onclick=function(){eFraction=1;updateEditFraction()};
    return block;
  }

  function updateEditFraction(){
    const block=ensureEditFraction();
    if(!block)return;
    const h=document.getElementById('ttEHalf');
    const f=document.getElementById('ttEFull');
    if(h)h.style.outline=eFraction===.5?'4px solid #1677ff':'none';
    if(f)f.style.outline=eFraction===1?'4px solid #1677ff':'none';
    const pay=baseWage(editType)*eFraction;
    const wage=document.getElementById('eWage');
    if(wage){wage.value=pay;wage.readOnly=true}
    const calc=document.getElementById('ttECalc');
    if(calc)calc.textContent=(eFraction===.5?'½ Nửa công':'1 Đủ công')+' = '+money2(pay);
  }

  const originalOpenEdit=window.openEdit;
  window.openEdit=function(name,date){
    if(typeof originalOpenEdit==='function')originalOpenEdit(name,date);
    const r=rec(data.workshops[active],name,date);
    eFraction=Number(r&&r.workFraction||1)===.5?.5:1;
    ensureEditFraction();
    updateEditFraction();
    const info=document.getElementById('editInfo');
    if(info && r) info.textContent=name+' · '+date+' · chỉnh trực tiếp hoặc xóa ngày công này';
  };

  const originalChooseEditType=window.chooseEditType;
  window.chooseEditType=function(t){
    if(typeof originalChooseEditType==='function')originalChooseEditType(t);else editType=t;
    updateEditFraction();
  };

  window.saveEdit=function(){
    if(!editKey)return;
    const date=document.getElementById('eDate').value;
    const name=editKey.split('|')[1];
    const w=data.workshops[active];
    const wage=baseWage(editType)*eFraction;
    const om=Number(document.getElementById('eOTMorning').value||0);
    const oe=Number(document.getElementById('eOTEve').value||0);
    const orate=Number(document.getElementById('eOTRate').value||0);
    const nk=key(w,name,date);
    if(nk!==editOriginalKey)delete data.records[editOriginalKey];
    data.records[nk]={in:document.getElementById('eIn').value,out:document.getElementById('eOut').value,type:editType,wage,workFraction:eFraction,otMorning:om,otEvening:oe,otRate:orate};
    save();closeM('editModal');toast('Đã lưu chấm công');
  };

  window.removeEdit=function(){
    if(!editOriginalKey)return;
    const r=data.records[editOriginalKey];
    if(!r)return toast('Ngày này chưa có chấm công');
    const parts=editOriginalKey.split('|');
    const employee=parts[1]||'';
    const date=parts[2]||'';
    if(!confirm('Xóa chấm công của '+employee+' ngày '+date+'?'))return;
    delete data.records[editOriginalKey];
    if(editKey && editKey!==editOriginalKey)delete data.records[editKey];
    save();
    closeM('editModal');
    toast('Đã xóa ngày chấm công');
  };

  function decorateEditButtons(){
    if(typeof view!=='undefined' && view!=='workshop')return;
    const table=document.querySelector('#content table.grid');
    if(!table)return;
    table.querySelectorAll('td.daycell.worked,td.daycell.construction').forEach(function(td){
      if(td.querySelector('.tt-edit-day-btn'))return;
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='tt-edit-day-btn noPrint';
      btn.textContent='✏️ Sửa/Xóa';
      btn.style.cssText='display:block;margin:4px auto 0;padding:3px 6px;border:0;border-radius:6px;background:#667085;color:#fff;font-size:9px;font-weight:700;line-height:1.2;';
      btn.addEventListener('click',function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        const clickCode=td.getAttribute('onclick')||'';
        const m=clickCode.match(/openEdit\((.+),(.+)\)/);
        if(m){
          try{
            const name=JSON.parse(m[1]);
            const date=JSON.parse(m[2]);
            window.openEdit(name,date);
            return;
          }catch(e){}
        }
        td.click();
      });
      td.appendChild(btn);
    });
  }

  const renderBeforeEditButton=window.render;
  window.render=function(){
    renderBeforeEditButton();
    setTimeout(decorateEditButtons,0);
  };
  setTimeout(decorateEditButtons,0);
})();