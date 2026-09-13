(function(){
  let pFraction=1, eFraction=1;
  function money2(n){return Number(n||0).toLocaleString('vi-VN')+' đ'}
  function baseWage(type){const w=data.workshops[active];return Number(type==='congtrinh'?w.ct:w.lx)||0}
  function markPunch(){
    const h=document.getElementById('ttHalf'),f=document.getElementById('ttFull');
    if(h)h.classList.toggle('selected',pFraction===0.5);
    if(f)f.classList.toggle('selected',pFraction===1);
    const pay=baseWage(pType)*pFraction;
    const w=document.getElementById('pWage');if(w){w.value=pay;w.readOnly=true;}
    const c=document.getElementById('ttCalc');if(c)c.textContent=(pFraction===0.5?'1/2 - Nửa công':'2/2 - 1 ngày công')+' = '+money2(pay);
  }
  function markEdit(){
    const h=document.getElementById('ttEHalf'),f=document.getElementById('ttEFull');
    if(h)h.classList.toggle('selected',eFraction===0.5);
    if(f)f.classList.toggle('selected',eFraction===1);
    const pay=baseWage(editType)*eFraction;
    const w=document.getElementById('eWage');if(w){w.value=pay;w.readOnly=true;}
    const c=document.getElementById('ttECalc');if(c)c.textContent=(eFraction===0.5?'1/2 - Nửa công':'2/2 - 1 ngày công')+' = '+money2(pay);
  }
  function inject(){
    const pm=document.getElementById('punchModal');
    if(pm&&!document.getElementById('ttFraction')){
      const choice=pm.querySelector('.choice');
      const box=document.createElement('div');box.id='ttFraction';box.innerHTML='<div class="hint"><b>Chọn số công</b></div><div class="choice"><button id="ttHalf" type="button">1/2<br><small>Nửa công</small></button><button id="ttFull" type="button">2/2<br><small>1 ngày công</small></button></div><div id="ttCalc" class="hint"></div>';
      choice.insertAdjacentElement('afterend',box);
      document.getElementById('ttHalf').onclick=()=>{pFraction=0.5;markPunch()};
      document.getElementById('ttFull').onclick=()=>{pFraction=1;markPunch()};
    }
    const em=document.getElementById('editModal');
    if(em&&!document.getElementById('ttEFraction')){
      const choice=em.querySelector('.choice');
      const box=document.createElement('div');box.id='ttEFraction';box.innerHTML='<div class="hint"><b>Chọn số công</b></div><div class="choice"><button id="ttEHalf" type="button">1/2<br><small>Nửa công</small></button><button id="ttEFull" type="button">2/2<br><small>1 ngày công</small></button></div><div id="ttECalc" class="hint"></div>';
      choice.insertAdjacentElement('afterend',box);
      document.getElementById('ttEHalf').onclick=()=>{eFraction=0.5;markEdit()};
      document.getElementById('ttEFull').onclick=()=>{eFraction=1;markEdit()};
    }
  }
  const oldOpenPunch=window.openPunch;
  window.openPunch=function(){inject();pFraction=1;oldOpenPunch();markPunch()};
  const oldChooseType=window.chooseType;
  window.chooseType=function(t){oldChooseType(t);markPunch()};
  window.doPunch=function(){
    const w=data.workshops[active],name=document.getElementById('pName').value.trim(),date=document.getElementById('pDate').value||today(),wage=baseWage(pType)*pFraction,om=Number(document.getElementById('pOTMorning').value||0),oe=Number(document.getElementById('pOTEve').value||0),orate=Number(document.getElementById('pOTRate').value||0);
    if(!name)return toast('Nhập tên người chấm công');
    let k=key(w,name,date),r=data.records[k];
    if(!r)data.records[k]={in:now(),out:'',type:pType,wage,workFraction:pFraction,otMorning:om,otEvening:oe,otRate:orate};
    else if(!r.out){r.out=now();r.type=pType;r.wage=wage;r.workFraction=pFraction;r.otMorning=om;r.otEvening=oe;r.otRate=orate;}
    else data.records[k]={in:now(),out:'',type:pType,wage,workFraction:pFraction,otMorning:om,otEvening:oe,otRate:orate};
    save();closeM('punchModal');
  };
  const oldOpenEdit=window.openEdit;
  window.openEdit=function(name,date){inject();oldOpenEdit(name,date);const r=rec(data.workshops[active],name,date);eFraction=Number(r&&r.workFraction||1)===0.5?0.5:1;markEdit()};
  const oldChooseEditType=window.chooseEditType;
  window.chooseEditType=function(t){oldChooseEditType(t);markEdit()};
  window.saveEdit=function(){
    if(!editKey)return;let date=document.getElementById('eDate').value,name=editKey.split('|')[1],w=data.workshops[active],wage=baseWage(editType)*eFraction,om=Number(document.getElementById('eOTMorning').value||0),oe=Number(document.getElementById('eOTEve').value||0),orate=Number(document.getElementById('eOTRate').value||0);let nk=key(w,name,date);if(nk!==editOriginalKey)delete data.records[editOriginalKey];data.records[nk]={in:document.getElementById('eIn').value,out:document.getElementById('eOut').value,type:editType,wage,workFraction:eFraction,otMorning:om,otEvening:oe,otRate:orate};save();closeM('editModal');toast('Đã lưu chấm công');
  };
  inject();
})();