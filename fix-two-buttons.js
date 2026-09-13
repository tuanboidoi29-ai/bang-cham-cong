(function(){
  function openPunchDirect(){
    try{
      var w=(window.data&&data.workshops&&data.workshops[window.active||0])||null;
      var m=document.getElementById('punchModal');
      if(!m)return;
      if(typeof window.pType!=='undefined') window.pType='xuong';
      var n=document.getElementById('pName'); if(n)n.value='';
      var d=document.getElementById('pDate'); if(d)d.value=(typeof today==='function'?today():new Date().toISOString().slice(0,10));
      var info=document.getElementById('punchWorkshop'); if(info&&w)info.textContent=w.name+' · chọn LX hoặc CT';
      var wage=document.getElementById('pWage'); if(wage&&w)wage.value=Number(w.lx||0);
      var om=document.getElementById('pOTMorning'); if(om)om.value=0;
      var oe=document.getElementById('pOTEve'); if(oe)oe.value=0;
      var rate=document.getElementById('pOTRate'); if(rate&&w)rate.value=Number(w.ot||0);
      var lx=document.getElementById('btnLX'), ct=document.getElementById('btnCT');
      if(lx)lx.classList.add('selected');
      if(ct)ct.classList.remove('selected');
      m.classList.add('show');
    }catch(e){console.error('TT openPunchDirect',e);}
  }

  function exportPdfDirect(){
    try{ window.print(); }catch(e){ console.error('TT exportPdfDirect',e); }
  }

  function bindOnlyTwo(){
    document.querySelectorAll('button').forEach(function(btn){
      var t=(btn.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
      if(t==='🟢 CHẤM CÔNG' || t==='CHẤM CÔNG') btn.onclick=openPunchDirect;
      if(t==='🖨 XUẤT PDF' || t==='XUẤT PDF') btn.onclick=exportPdfDirect;
    });
  }

  bindOnlyTwo();
  new MutationObserver(bindOnlyTwo).observe(document.body,{childList:true,subtree:true});
})();