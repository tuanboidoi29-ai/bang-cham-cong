(function(){
function openPunchFixed(){
  var w=(window.data&&data.workshops)?data.workshops[window.active||0]:null;
  var m=document.getElementById('punchModal');
  if(!m)return;
  var n=document.getElementById('pName');if(n)n.value='';
  var d=document.getElementById('pDate');if(d)d.value=(typeof today==='function'?today():new Date().toISOString().slice(0,10));
  var i=document.getElementById('punchWorkshop');if(i&&w)i.textContent=w.name+' · chọn LX hoặc CT';
  var wg=document.getElementById('pWage');if(wg&&w)wg.value=Number(w.lx||0);
  var a=document.getElementById('pOTMorning');if(a)a.value=0;
  var b=document.getElementById('pOTEve');if(b)b.value=0;
  var r=document.getElementById('pOTRate');if(r&&w)r.value=Number(w.ot||0);
  var lx=document.getElementById('btnLX'),ct=document.getElementById('btnCT');if(lx)lx.classList.add('selected');if(ct)ct.classList.remove('selected');
  m.classList.add('show');
}
function bind(){
  document.querySelectorAll('button').forEach(function(btn){
    var t=(btn.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
    if(t.indexOf('CHẤM CÔNG')>=0){btn.onclick=openPunchFixed;}
    if(t.indexOf('XUẤT PDF')>=0){btn.onclick=function(){window.print();};}
  });
}
bind();
setInterval(bind,1000);
})();