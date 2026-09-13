(function(){
  if(window.__TT_ENTERPRISE_SEPARATE__) return;
  window.__TT_ENTERPRISE_SEPARATE__=true;

  function isolate(){
    try{
      var tabs=document.getElementById('tabs');
      if(tabs) tabs.style.display='none';
      var modeHeader=document.getElementById('ttModeHeader');
      if(modeHeader) modeHeader.style.display='none';
      var chooser=document.getElementById('ttModeChooser');
      if(chooser) chooser.style.display='none';

      var content=document.getElementById('content');
      if(!content) return;
      Array.prototype.forEach.call(content.children,function(el){
        if(el.id==='ttEnterprisePanel'){
          el.style.display='';
          el.setAttribute('data-enterprise-visible','1');
        }else{
          el.style.display='none';
          el.setAttribute('data-personal-hidden','1');
        }
      });
    }catch(e){console.error(e)}
  }

  isolate();
  setTimeout(isolate,50);
  setTimeout(isolate,200);
  setTimeout(isolate,700);
  setTimeout(isolate,1500);

  var observer=new MutationObserver(function(){isolate()});
  observer.observe(document.body,{childList:true,subtree:true});
  window.TT_enterpriseIsolate=isolate;
})();