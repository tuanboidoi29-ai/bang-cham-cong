(function(){
let pFraction=1,eFraction=1;
function baseWage(type){const w=data.workshops[active]||{};return Number(type==='congtrinh'?w.ct:w.lx)||0}
function fmt(n){return Number(n||0).toLocaleString('vi-VN')+' đ'}
function addChoices(modalId,wageId,prefix,isEdit){
 const modal=document.getElementById(modalId),wage=document.getElementById(wageId);if(!modal||!wage||document.getElementById(prefix+'Fraction'))return;
 const box=document.createElement('div');box.id=prefix+'Fraction';box.style.margin='14px 0';box.innerHTML='<div style="font-weight:800;margin-bottom:8px">📅 CHỌN SỐ CÔNG</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button type="button" id="'+prefix+'Half" style="min-height:70px;background:#f59e0b">½<br><small>Nửa công</small></button><button type="button" id="'+prefix+'Full" style="min-height:70px;background:#087443">1<br><small>Đủ công</small></button></div><div id="'+prefix+'Calc" class="hint" style="margin-top:8px;font-weight:800"></div>';
 wage.parentElement.insertAdjacentElement('beforebegin',box);
 document.getElementById(prefix+'Half').onclick=function(){if(isEdit)eFraction=.5;else pFraction=.5;isEdit?refreshEdit():refreshPunch()};
 document.getElementById(prefix+'Full').onclick=function(){if(isEdit)eFraction=1;else pFraction=1;isEdit?refreshEdit():refreshPunch()};
}
function inject(){addChoices('punchModal','pWage','tt',false);addChoices('editModal','eWage','ttE',true)}
function paint(prefix,fraction,pay){const h=document.getElementById(prefix+'Half'),f=document.getElementById(prefix+'Full'),c=document.getElementById(prefix+'Calc');if(h)h.style.outline=fraction===.5?'4px solid #1677ff':'none';if(f)f.style.outline=fraction===1?'4px solid #1677ff':'none';if(c)c.textContent=(fraction===.5?'½ Nửa công':'1 Đủ công')+' = '+fmt(pay)}
function refreshPunch(){inject();const pay=baseWage(pType)*pFraction,w=document.getElementById('pWage');if(w){w.value=pay;w.readOnly=true}paint('tt',pFraction,pay)}
function refreshEdit(){inject();const pay=baseWage(editType)*eFraction,w=document.getElementById('eWage');if(w){w.value=pay;w.readOnly=true}paint('ttE',eFraction,pay)}
const oldOpenPunch=window.openPunch,oldChooseType=window.chooseType,oldDoPunch=window.doPunch;
window.openPunch=function(){pFraction=1;if(typeof oldOpenPunch==='function')oldOpenPunch();inject();refreshPunch()};
window.chooseType=function(t){if(typeof oldChooseType==='function')oldChooseType(t);refreshPunch()};
window.doPunch=function(){const w=data.workshops[active],name=document.getElementById('pName').value.trim(),date=document.getElementById('pDate').value||today(),om=Number(document.getElementById('pOTMorning').value||0),oe=Number(document.getElementById('pOTEve').value||0),orate=Number(document.getElementById('pOTRate').value||0),wage=baseWage(pType)*pFraction;if(!name)return toast('Nhập tên người chấm công');let k=key(w,name,date),r=data.records[k];if(!r)data.records[k]={in:now(),out:'',type:pType,wage,workFraction:pFraction,otMorning:om,otEvening:oe,otRate:orate};else if(!r.out){r.out=now();Object.assign(r,{type:pType,wage,workFraction:pFraction,otMorning:om,otEvening:oe,otRate:orate})}else data.records[k]={in:now(),out:'',type:pType,wage,workFraction:pFraction,otMorning:om,otEvening:oe,otRate:orate};save();closeM('punchModal')};
const oldOpenEdit=window.openEdit,oldChooseEditType=window.chooseEditType;
window.openEdit=function(name,date){if(typeof oldOpenEdit==='function')oldOpenEdit(name,date);inject();const r=rec(data.workshops[active],name,date);eFraction=Number(r&&r.workFraction||1)===.5?.5:1;refreshEdit()};
window.chooseEditType=function(t){if(typeof oldChooseEditType==='function')oldChooseEditType(t);refreshEdit()};
window.saveEdit=function(){if(!editKey)return;const date=document.getElementById('eDate').value,name=editKey.split('|')[1],w=data.workshops[active],wage=baseWage(editType)*eFraction,om=Number(document.getElementById('eOTMorning').value||0),oe=Number(document.getElementById('eOTEve').value||0),orate=Number(document.getElementById('eOTRate').value||0),nk=key(w,name,date);if(nk!==editOriginalKey)delete data.records[editOriginalKey];data.records[nk]={in:document.getElementById('eIn').value,out:document.getElementById('eOut').value,type:editType,wage,workFraction:eFraction,otMorning:om,otEvening:oe,otRate:orate};save();closeM('editModal');toast('Đã lưu chấm công')};
try{inject()}catch(e){console.error('TT V22',e)}
})();