(function(){
  function bindChamCong(){
    document.querySelectorAll('button').forEach(function(btn){
      var t=(btn.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
      if(t==='🟢 CHẤM CÔNG' || t==='CHẤM CÔNG'){
        btn.onclick=function(){
          if(typeof window.openPunch==='function') window.openPunch();
        };
      }
    });
  }
  bindChamCong();
  setInterval(bindChamCong,1000);
})();