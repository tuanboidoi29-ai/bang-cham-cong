(function(){
  function clean(){
    var ws=document.getElementById('workshop');
    var month=document.getElementById('month');
    if(!ws||!month)return;
    var card=ws.closest('.card');
    if(!card||card.dataset.ttCleaned==='1')return;
    card.dataset.ttCleaned='1';
    ws.style.display='none';
    var title=card.querySelector('.title');
    if(title) title.textContent='📅 Tháng chấm công';
    var row=ws.closest('.row');
    if(row){
      row.style.display='block';
      month.style.width='100%';
    }
  }
  clean();
  setTimeout(clean,100);
  setTimeout(clean,500);
})();