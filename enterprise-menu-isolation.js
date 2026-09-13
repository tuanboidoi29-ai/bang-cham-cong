(function(){
let mounted=null, store=null;
function ready(){return document.getElementById('ttHome')&&document.getElementById('ttPanel')}
function install(){
 if(document.getElementById('ttIsolationStyle'))return;
 let st=document.createElement('style');st.id='ttIsolationStyle';st.textContent='.tabs{display:none!important}.app>.section{display:none!important}#ttLegacyStore{display:none!important}#ttPanel>.section{display:block!important}';document.head.appendChild(st);
 store=document.createElement('div');store.id='ttLegacyStore';document.body.appendChild(store);
 ['attendance','offline','profiles','online','recruit'].forEach(id=>{let e=document.getElementById(id);if(e&&e.parentNode!==store)store.appendChild(e)});
 function release(){if(mounted&&store){mounted.classList.remove('show');store.appendChild(mounted);mounted=null}}
 const oldGo=window.ttGo;
 window.ttGo=function(name){release();let p=document.getElementById('ttPanel');if(p)p.innerHTML='';document.querySelectorAll('.section').forEach(s=>s.classList.remove('show'));if(typeof oldGo==='function')return oldGo(name)};
 window.ttOpenOld=function(id){release();let p=document.getElementById('ttPanel'),s=document.getElementById(id);if(!p||!s)return;p.innerHTML='';document.querySelectorAll('.section').forEach(x=>x.classList.remove('show'));s.classList.add('show');p.appendChild(s);mounted=s;window.scrollTo({top:0,behavior:'smooth'})};
}
let n=0,t=setInterval(()=>{n++;if(ready()){clearInterval(t);install()}else if(n>30)clearInterval(t)},100);
})();