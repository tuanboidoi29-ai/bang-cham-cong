(function(){
  function toast2(t){if(typeof toast==='function')toast(t);else alert(t)}
  function collect(){
    const out={app:'TT_BANG_CHAM_CONG',version:1,exportedAt:new Date().toISOString(),storage:{}};
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(k && (k.indexOf('TT_CC_')===0 || k==='TT_ADVANCES')) out.storage[k]=localStorage.getItem(k);
    }
    return out;
  }
  function download(){
    const payload=JSON.stringify(collect(),null,2);
    const blob=new Blob([payload],{type:'application/json;charset=utf-8'});
    const a=document.createElement('a');
    const d=new Date();
    const stamp=d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'_'+String(d.getHours()).padStart(2,'0')+String(d.getMinutes()).padStart(2,'0');
    a.href=URL.createObjectURL(blob);a.download='TT_BANG_CHAM_CONG_BACKUP_'+stamp+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast2('Đã xuất dữ liệu');
  }
  function importFile(file){
    const r=new FileReader();
    r.onload=function(){
      try{
        const obj=JSON.parse(String(r.result||''));
        if(!obj || obj.app!=='TT_BANG_CHAM_CONG' || !obj.storage) throw new Error('invalid');
        if(!confirm('Nhập dữ liệu sẽ thay dữ liệu chấm công trên thiết bị này. Tiếp tục?'))return;
        Object.keys(obj.storage).forEach(k=>{ if(k.indexOf('TT_CC_')===0 || k==='TT_ADVANCES') localStorage.setItem(k,obj.storage[k]); });
        alert('Đã nhập dữ liệu thành công. Trang sẽ tải lại.');
        location.reload();
      }catch(e){alert('File dữ liệu không hợp lệ hoặc bị lỗi.');}
    };
    r.readAsText(file,'utf-8');
  }
  function openBox(){
    let m=document.getElementById('ttDataModal');
    if(!m){
      m=document.createElement('div');m.id='ttDataModal';m.className='modal';
      m.innerHTML='<div class="box"><h3>💾 XUẤT / NHẬP DỮ LIỆU</h3><div class="hint">Dùng khi chuyển sang điện thoại hoặc máy khác.</div><div class="row"><button class="green" id="ttExportData">⬇️ Xuất dữ liệu</button></div><div class="row"><button id="ttImportData">⬆️ Nhập dữ liệu</button></div><div class="hint">Xuất sẽ tạo file .json chứa toàn bộ dữ liệu chấm công, xưởng, lương, tăng ca và tạm ứng. Trên thiết bị mới, mở web rồi chọn Nhập dữ liệu.</div><input id="ttDataFile" type="file" accept="application/json,.json" style="display:none"><div class="row"><button class="gray" id="ttCloseData">Đóng</button></div></div>';
      document.body.appendChild(m);
      document.getElementById('ttExportData').onclick=download;
      document.getElementById('ttImportData').onclick=()=>document.getElementById('ttDataFile').click();
      document.getElementById('ttDataFile').onchange=e=>{const f=e.target.files&&e.target.files[0];if(f)importFile(f);e.target.value=''};
      document.getElementById('ttCloseData').onclick=()=>m.classList.remove('show');
    }
    m.classList.add('show');
  }
  function addButton(){
    if(document.getElementById('ttDataBtn'))return;
    const top=document.querySelector('.top .controls');if(!top)return;
    const b=document.createElement('button');b.id='ttDataBtn';b.className='purple';b.textContent='💾 Dữ liệu';b.onclick=openBox;top.insertBefore(b,top.firstChild);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addButton);else addButton();
})();