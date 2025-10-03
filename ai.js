(async function(){
  const startBtn = document.getElementById('startBtn');
  const prePanel = document.getElementById('prePanel');
  const cameraPanel = document.getElementById('cameraPanel');
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const snapBtn = document.getElementById('snapBtn');
  const cancelCam = document.getElementById('cancelCam');
  const log = document.getElementById('log');
  const loadingPanel = document.getElementById('loadingPanel');
  const bar = document.getElementById('bar');
  const timeLeft = document.getElementById('timeLeft');
  const statusTxt = document.getElementById('statusTxt');
  const resultPanel = document.getElementById('resultPanel');
  const resultText = document.getElementById('resultText');
  const coordText = document.getElementById('coordText');
  const thumb = document.getElementById('thumb');
  const ratingDiv = document.getElementById('rating');
  const sendTime = document.getElementById('sendTime');
  const stopBtn = document.getElementById('stopBtn');
  const finishPanel = document.getElementById('finishPanel');
  const restartBtn = document.getElementById('restartBtn');

  let stream = null;
  let snappedDataUrl = null;

  const users = ["匿名","匿名","匿名","匿名","匿名","匿名"];
  ratingDiv.innerHTML = users.map(u=>{
    const stars = Math.floor(Math.random()*5)+1;
    return `${u}: ${'★'.repeat(stars)}${'☆'.repeat(5-stars)}`;
  }).join('<br>');

  startBtn.addEventListener('click', async ()=>{
    prePanel.style.display='none';
    cameraPanel.style.display='';
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio:false });
      video.srcObject = stream;
    } catch(err){ alert("カメラにアクセスできません。"); }
  });

  cancelCam.addEventListener('click', ()=>{
    stopStream(); cameraPanel.style.display='none'; prePanel.style.display='';
  });

  function stopStream(){ if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; video.srcObject=null; } }

  snapBtn.addEventListener('click', ()=>{
    canvas.width=video.videoWidth; canvas.height=video.videoHeight;
    const ctx=canvas.getContext('2d'); ctx.drawImage(video,0,0,canvas.width,canvas.height);
    snappedDataUrl=canvas.toDataURL('image/jpeg',0.9);
    thumb.src = snappedDataUrl;
    stopStream(); cameraPanel.style.display='none';
    startFakeDiagnosis();
  });

  function startFakeDiagnosis(){
    loadingPanel.style.display=''; resultPanel.style.display='none';
    const total=15; let t=0;
    timeLeft.textContent=total; bar.style.width='0%'; statusTxt.textContent="診断開始";

    const interval = setInterval(()=>{
      t+=0.1;
      const pct=Math.min(100,Math.round((t/total)*100));
      bar.style.width=pct+'%';
      timeLeft.textContent=Math.max(0,Math.ceil(total-t));
      statusTxt.textContent="診断中…("+pct+"%)";
      if(t>=total){ clearInterval(interval); loadingPanel.style.display='none'; showResult(); }
    },100);
  }

  function showResult(){
    resultPanel.style.display='';
    const lat=34.66132, lng=135.60352;
    resultText.innerHTML=`診断完了。<br>この周辺であなたの機種を特定しました。<br><strong>北 ${lat}°, 東 ${lng}°</strong>`;
    coordText.textContent=`座標: ${lat}, ${lng}（表示のみ）`;

    showMap(lat,lng);
    startSendCountdown();
  }

  function showMap(lat,lng){
    const mapDiv=document.getElementById('map'); mapDiv.innerHTML="";
    const map=L.map('map',{scrollWheelZoom:false}).setView([lat,lng],14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    L.circle([lat,lng],{radius:1000,color:'#0077ff',fillColor:'#cfe8ff',fillOpacity:0.4}).addTo(map)
      .bindPopup("この周辺で機種を特定しました。").openPopup();
  }

  function startSendCountdown(){
    let t=15;
    sendTime.textContent=t;
    const interval=setInterval(()=>{
      t--; sendTime.textContent=t;
      if(t<=0){ clearInterval(interval); goToFinishPage(); }
    },1000);

    stopBtn.onclick = ()=>{
      clearInterval(interval);
      alert("送信を停止できません");
    };
  }

  function goToFinishPage(){
    resultPanel.style.display='none';
    finishPanel.style.display='block';
  }

  restartBtn.addEventListener('click', ()=>{
    finishPanel.style.display='none';
    prePanel.style.display='block';
    thumb.src='';
  });

})();
