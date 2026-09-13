(function(){
  function norm(s){return String(s||'').replace(/\s+/g,' ').trim().toUpperCase();}

  function openPunchDirect(){
    try{pType='xuong';}catch(e){}
    var w=null;
    try{w=data.workshops[active];}catch(e){}
    var m=document.getElementById('punchModal');
    if(!m)return;
    var n=document.getElementById('pName'); if(n)n.value='';
    var d=document.getElementById('pDate'); if(d)d.value=(typeof today==='function'?today():new Date().toISOString().slice(0,10));
    var info=document.getElementById('punchWorkshop'); if(info&&w)info.textContent=w.name+' · chọn LX hoặc CT';
    var wage=document.getElementById('pWage'); if(wage&&w)wage.value=Number(w.lx||0);
    var oms=document.getElementById('pOTMorning'); if(oms)oms.value=0;
    var ome=document.getElementById('pOTEve'); if(ome)ome.value=0;
    var otr=document.getElementById('pOTRate'); if(otr&&w)otr.value=Number(w.ot||0);
    var lx=document.getElementById('btnLX'); if(lx)lx.classList.add('selected');
    var ct=document.getElementById('btnCT'); if(ct)ct.classList.remove('selected');
    m.classList.add('show');
  }

  function handleClick(ev){
    var btn=ev.target.closest && ev.target.closest('button');
    if(!btn)return;
    var t=norm(btn.textContent);
    if(t==='🟢 CHẤM CÔNG' || t==='CHẤM CÔNG'){
      ev.preventDefault(); ev.stopImmediatePropagation();
      openPunchDirect();
      return;
    }
    if(t==='🖨 XUẤT PDF' || t==='XUẤT PDF'){
      ev.preventDefault(); ev.stopImmediatePropagation();
      window.print();
    }
  }

  document.addEventListener('click',handleClick,true);
})();