// ------------------------
// [블러 원형 애니메이션]
// ------------------------
const blurCanvas = document.getElementById('blur-canvas');
const ctx = blurCanvas.getContext('2d');
let blurCircles = [
  {x: 400, y: 300, r: 320, dx: 0.7, dy: 0.4, blur: 80, alpha: 0.18},
  {x: 1400, y: 700, r: 420, dx: -0.5, dy: 0.6, blur: 120, alpha: 0.13},
  {x: 900, y: 200, r: 370, dx: 0.3, dy: -0.5, blur: 100, alpha: 0.12}
];
function resizeBlurCanvas() {
  blurCanvas.width = window.innerWidth;
  blurCanvas.height = window.innerHeight;
}
function drawBlurCircles() {
  ctx.clearRect(0,0,blurCanvas.width,blurCanvas.height);
  blurCircles.forEach(c => {
    ctx.save();
    ctx.globalAlpha = c.alpha;
    ctx.filter = `blur(${c.blur}px)`;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI*2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.restore();
    // 움직임
    c.x += c.dx;
    c.y += c.dy;
    // 가장자리 반사
    if (c.x - c.r < 0 || c.x + c.r > blurCanvas.width) c.dx *= -1;
    if (c.y - c.r < 0 || c.y + c.r > blurCanvas.height) c.dy *= -1;
  });
  requestAnimationFrame(drawBlurCircles);
}
window.addEventListener('resize', resizeBlurCanvas);
resizeBlurCanvas();
drawBlurCircles();

// ------------------------
// [페이지 전환 관리]
// ------------------------
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  document.getElementById(pageId).style.display = 'flex';
}

// ------------------------
// [0번 창: 홈]
// ------------------------
document.getElementById('btn-a').onclick = () => showPage('page-a-prologue');
document.getElementById('btn-b').onclick = () => showPage('page-b-session');

// ------------------------
// [A 프롤로그 페이드 시퀀스]
// ------------------------
const aPrologueTexts = [
  "우연히 이 세계에 도착한 당신은 누구일까요?",
  "이건 아주 작은, 당신만의 심리 탐험이에요.",
  "당신의 말, 당신의 기억, 당신의 취향은 어쩌면 당신도 모르는 당신을 말해줄지도 몰라요.",
  "그럼, 준비되셨나요?"
];
let aPrologueIdx = 0, aPrologueSkip = false;
function showAPrologueSeq() {
  const box = document.getElementById('a-prologue-text');
  box.innerHTML = '';
  aPrologueIdx = 0;
  aPrologueSkip = false;
  function next() {
    if (aPrologueIdx >= aPrologueTexts.length || aPrologueSkip) {
      showPage('page-a-photo');
      return;
    }
    box.style.opacity = 0;
    setTimeout(() => {
      box.innerText = aPrologueTexts[aPrologueIdx++];
      box.style.opacity = 1;
      setTimeout(() => {
        box.style.opacity = 0;
        setTimeout(next, 800);
      }, 2200);
    }, 400);
  }
  next();
}
document.getElementById('a-prologue-skip').onclick = () => {
  aPrologueSkip = true;
  showPage('page-a-photo');
};
document.getElementById('page-a-prologue').addEventListener('show', showAPrologueSeq);

// ------------------------
// [A 얼굴 촬영]
// ------------------------
let aPhotoDataUrl = '';
document.getElementById('btn-photo-consent').onclick = () => {
  document.getElementById('camera-area').style.display = 'flex';
  navigator.mediaDevices.getUserMedia({video:true})
    .then(stream => {
      const video = document.getElementById('video');
      video.srcObject = stream;
    });
};
document.getElementById('btn-capture').onclick = () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('photo-canvas');
  canvas.width = 360; canvas.height = 480;
  canvas.getContext('2d').drawImage(video, 0, 0, 360, 480);
  aPhotoDataUrl = canvas.toDataURL('image/png');
  document.getElementById('photo-preview').innerHTML = `<img src="${aPhotoDataUrl}"/>`;
  document.getElementById('btn-photo-next').style.display = 'block';
};
document.getElementById('btn-photo-next').onclick = () => showPage('page-a-quiz');

// ------------------------
// [A 질문지 로직] (객관식 자동 진행)
// ------------------------
const aQuizQuestions = [
  // [질문, 유형, 선택지(없으면 주관식)]
  ["당신의 이름은 무엇인가요?", "text"],
  ["당신의 직업은 무엇인가요?", "text"],
  ["당신이 사는 지역은 어디인가요?", "text"],
  ["당신이 가장 많이 사용하는 SNS는 무엇인가요?", "choice", ["인스타그램","페이스북","유튜브","틱톡","트위터","스레드","블로그","사용하지 않음"]],
  ["당신은 외향적인가요, 내향적인가요?", "choice", ["매우 외향적","중간","매우 내향적","모르겠음","외향적인 척하는 내향형","내향적인 척하는 외향형"]],
  // 이하 랜덤 출제
  [["당신은 계획을 세우는 편인가요?", ["세세하게 계획하고 지킨다","즉흥적인 것을 즐긴다","계획을 세우지만 잘 지키지 않는다","상황에 따라 다르다"]],
   ["당신은 낯선 사람과 대화를 잘 하는 편인가요?", ["매우 잘한다","어색하지만 시도한다","가능한 피한다","상대가 먼저 다가오면 괜찮다"]]],
  [["당신이 요즘 가장 자주 느끼는 감정은 무엇인가요?", ["쓸쓸함","기쁨","슬픔","화남","불안","평화로움","죄책감","즐거움"]],
   ["당신은 혼자 있을 때 어떤 감정을 가장 많이 느끼나요?", ["안정감","허전함","창의성","자기혐오","몰입감","무기력","자유","혼자가 좋음"]]],
  [["당신을 가장 잘 표현하는 사물은 무엇인가요?", ["선인장","별","고양이","배","단추","풍선","비눗방울","바늘"]],
   ["당신은 어떤 색과 닮았다고 생각하나요?", ["빨강","주황","노랑","초록","파랑","보라","분홍","회색","흰색","검정","갈색"]],
   ["당신의 인생은 어떤 계절과 닮았나요?", ["봄 (꽃, 따뜻함)","여름 (생명, 에너지)","가을 (낙엽, 쓸쓸함)","겨울 (차분함, 멈춤)"]]],
  [["지금 당신의 삶에서 가장 중요한 가치는?", ["진실함","안정감","자유","사랑","창조","이해","용기","자기표현"]],
   ["당신은 당신 자신을 잘 알고 있나요?", ["잘 알고 있다","조금 알고 있다","잘 모르겠다","전혀 모르겠다"]]],
  [["당신이 가장 좋아하는 사람에게 듣고 싶은 말은?", ["천천히 해도 돼","집에 갈까?","눈치 보지 마","넌 내가 좋아하는 사람이야","네가 뭐든지 잘 하는 게 부러워","너 천재야?","오늘 뭐 먹을까?","힘든 거 알지만, 네가 겪고 있는 건 의미가 있어"]]],
  [["당신이 편의점에서 자주 고르는 간식은?", ["초코바","요구르트","삼각김밥","젤리","아이스크림","에너지바","과자","즉석라면"]]],
  [["당신의 오늘 하루를 동물로 표현한다면?", ["고양이","곰","펭귄","고슴도치","개미","코끼리","나비","수달"]],
   ["지금 당신을 가장 잘 표현하는 단어는?", ["잔잔함","불안정","기대","분주함","무기력","자유로움","흐릿함","생동감"]]]
];
let aQuizIdx = 0, aQuizAnswers = [], aName = '';
function randomFrom(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function showAQuizQuestion() {
  const qbox = document.getElementById('question-text');
  const abox = document.getElementById('answer-area');
  abox.innerHTML = '';
  document.getElementById('btn-next-question').style.display = 'none';
  let q, type, choices;
  if (aQuizIdx < 5) {
    q = aQuizQuestions[aQuizIdx][0];
    type = aQuizQuestions[aQuizIdx][1];
    choices = aQuizQuestions[aQuizIdx][2];
  } else {
    // 랜덤 유형별
    const group = aQuizQuestions[aQuizIdx];
    let picked = randomFrom(group);
    q = picked[0];
    type = "choice";
    choices = picked[1];
  }
  qbox.innerText = q;
  if (type === "text") {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 24;
    input.placeholder = '입력';
    abox.appendChild(input);
    input.oninput = () => {
      document.getElementById('btn-next-question').style.display = input.value.trim() ? 'block' : 'none';
    };
    document.getElementById('btn-next-question').style.display = 'none';
  } else if (type === "choice") {
    choices.forEach((c, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerText = `${i+1}. ${c}`;
      btn.onclick = () => {
        abox.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        // 객관식 선택 즉시 다음으로
        handleAChoiceSelection(btn);
      };
      abox.appendChild(btn);
    });
    document.getElementById('btn-next-question').style.display = 'none';
  }
}
function handleAChoiceSelection(btn) {
  const ans = btn.innerText.replace(/^\d+\.\s*/, '');
  aQuizAnswers.push(ans);
  // 색상 질문이면 splash 효과
  if (btn.parentElement.innerHTML.includes('색과 닮았다고')) {
    const colorMap = {
      '빨강':'rgba(255,0,0,0.19)','주황':'rgba(255,140,0,0.18)','노랑':'rgba(255,255,0,0.15)',
      '초록':'rgba(0,200,70,0.16)','파랑':'rgba(0,90,255,0.16)','보라':'rgba(120,0,255,0.13)',
      '분홍':'rgba(255,80,160,0.15)','회색':'rgba(120,120,120,0.14)','흰색':'rgba(255,255,255,0.10)',
      '검정':'rgba(0,0,0,0.18)','갈색':'rgba(120,70,0,0.14)'
    };
    let color = colorMap[ans] || 'rgba(0,0,0,0.13)';
    const splash = document.getElementById('color-splash');
    splash.style.background = `radial-gradient(circle at 50% 60%, ${color} 0%, transparent 85%)`;
    splash.style.opacity = 1;
    setTimeout(() => { splash.style.opacity = 0; }, 900);
  }
  aQuizIdx++;
  if (aQuizIdx < aQuizQuestions.length) {
    showAQuizQuestion();
  } else {
    showPage('page-a-result');
    showASummary();
  }
}
document.getElementById('btn-next-question').onclick = () => {
  const abox = document.getElementById('answer-area');
  let ans = '';
  if (aQuizIdx < 5 && aQuizQuestions[aQuizIdx][1] === 'text') {
    ans = abox.querySelector('input').value.trim();
    if (aQuizIdx === 0) aName = ans;
  } else {
    const selected = abox.querySelector('.selected');
    ans = selected ? selected.innerText.replace(/^\d+\.\s*/, '') : '';
  }
  aQuizAnswers.push(ans);
  aQuizIdx++;
  if (aQuizIdx < aQuizQuestions.length) {
    showAQuizQuestion();
  } else {
    showPage('page-a-result');
    showASummary();
  }
};
document.getElementById('page-a-quiz').addEventListener('show', showAQuizQuestion);

// ------------------------
// [A 결과/초대코드]
// ------------------------
function makeSessionId() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}
let sessionId = '';
let sessionDB = {}; // 세션별 데이터 저장 (로컬)
function showASummary() {
  // 시적 한줄 요약 (간단 예시)
  const poeticTemplates = [
    "당신은 오래된 필름 사진 속 흐릿한 미소 같아요. 정확히 보이지 않아도, 오래 기억에 남는.",
    "당신은 바람 빠진 풍선에 다시 숨을 불어넣는 사람이에요. 예측 불가하지만, 그래서 더 특별한.",
    "당신은 햇빛 아래에서 뛰노는 비눗방울을 닮았어요. 오래 머물진 않아도, 언제나 기억나는 즐거움."
  ];
  const poetic = randomFrom(poeticTemplates);
  document.getElementById('a-summary').innerHTML = `<div class="fade-seq">${poetic}</div>`;
  sessionId = makeSessionId();
  document.getElementById('session-id').innerText = sessionId;
  sessionDB[sessionId] = {
    photo: aPhotoDataUrl,
    answers: aQuizAnswers.slice(),
    name: aName
  };
}

// 복사 버튼: 링크+세션아이디 동시 복사
document.getElementById('btn-copy-link').onclick = () => {
  const link = "https://good-png.github.io/portraitX/"; // ← 실제 배포 주소로 수정!
  const sessionId = document.getElementById('session-id').innerText;
  const text = `우리는 서로를 얼마나 알고 있을까요?\n다음 링크에서 세션 아이디를 입력하여 저에 대한 질문에 답변해주세요.\n웹사이트 링크: ${link}\n세션 아이디: ${sessionId}`;
  navigator.clipboard.writeText(text)
    .then(() => alert('링크와 세션 아이디가 복사되었습니다!'))
    .catch(err => console.error('복사 실패:', err));
};


// ------------------------
// [B 세션 아이디 입력]
// ------------------------
document.getElementById('btn-session-enter').onclick = () => {
  const input = document.getElementById('input-session').value.trim().toUpperCase();
  if (!sessionDB[input]) {
    document.getElementById('session-error').innerText = '존재하지 않는 세션입니다.';
    return;
  }
  // 세션 데이터 로드
  bSessionId = input;
  bAData = sessionDB[input];
  showPage('page-b-quiz');
  startBQuiz();
};

// ------------------------
// [B 퀴즈 로직] (객관식 자동 진행)
// ------------------------
let bSessionId = '', bAData = null;
let bQuizIdx = 0, bQuizAnswers = [], bWrongCount = 0, bFaceImg = '';
function startBQuiz() {
  bQuizIdx = 0; bQuizAnswers = []; bWrongCount = 0;
  bFaceImg = bAData.photo;
  document.getElementById('b-face-img').src = bFaceImg;
  showBQuizQuestion();
}
function showBQuizQuestion() {
  const qbox = document.getElementById('b-question-text');
  const abox = document.getElementById('b-answer-area');
  abox.innerHTML = '';
  document.getElementById('btn-b-next-question').style.display = 'none';
  let q, type, choices;
  if (bQuizIdx < 5) {
    q = aQuizQuestions[bQuizIdx][0];
    type = aQuizQuestions[bQuizIdx][1];
    choices = aQuizQuestions[bQuizIdx][2];
    if (bQuizIdx === 0) q = `초상 속 인물의 이름은 무엇인가요?`;
  } else {
    const group = aQuizQuestions[bQuizIdx];
    let picked = randomFrom(group);
    q = picked[0];
    type = "choice";
    choices = picked[1];
    q = q.replace(/당신/g, bAData.name);
  }
  qbox.innerText = q;
  if (type === "text") {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 24;
    input.placeholder = '입력';
    abox.appendChild(input);
    input.oninput = () => {
      document.getElementById('btn-b-next-question').style.display = input.value.trim() ? 'block' : 'none';
    };
    document.getElementById('btn-b-next-question').style.display = 'none';
  } else if (type === "choice") {
    choices.forEach((c, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerText = `${i+1}. ${c}`;
      btn.onclick = () => {
        abox.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        // 객관식 선택 즉시 다음으로
        handleBChoiceSelection(btn);
      };
      abox.appendChild(btn);
    });
    document.getElementById('btn-b-next-question').style.display = 'none';
  }
}
function handleBChoiceSelection(btn) {
  const ans = btn.innerText.replace(/^\d+\.\s*/, '');
  bQuizAnswers.push(ans);
  // 정답 비교
  if (ans !== bAData.answers[bQuizIdx]) {
    bWrongCount++;
    applyFaceDistortion(bWrongCount);
  }
  bQuizIdx++;
  if (bQuizIdx < aQuizQuestions.length) {
    showBQuizQuestion();
  } else {
    showPage('page-b-epilogue');
    showBEpilogue();
  }
}
document.getElementById('btn-b-next-question').onclick = () => {
  const abox = document.getElementById('b-answer-area');
  let ans = '';
  if (bQuizIdx < 5 && aQuizQuestions[bQuizIdx][1] === 'text') {
    ans = abox.querySelector('input').value.trim();
  } else {
    const selected = abox.querySelector('.selected');
    ans = selected ? selected.innerText.replace(/^\d+\.\s*/, '') : '';
  }
  bQuizAnswers.push(ans);
  // 정답 비교
  if (ans !== bAData.answers[bQuizIdx]) {
    bWrongCount++;
    applyFaceDistortion(bWrongCount);
  }
  bQuizIdx++;
  if (bQuizIdx < aQuizQuestions.length) {
    showBQuizQuestion();
  } else {
    showPage('page-b-epilogue');
    showBEpilogue();
  }
};

// ------------------------
// [A 얼굴 왜곡/콜라주 효과]
// ------------------------
function applyFaceDistortion(wrongCount) {
  const img = document.getElementById('b-face-img');
  let canvas = document.createElement('canvas');
  canvas.width = 340; canvas.height = 340;
  let ctx = canvas.getContext('2d');
  let baseImg = new window.Image();
  baseImg.onload = () => {
    ctx.drawImage(baseImg, 0, 0, 340, 340);
    if (wrongCount === 1) {
      ctx.globalAlpha = 0.27;
      ctx.fillStyle = ['#f00','#ff0','#0f0','#00f','#0ff','#f0f','#000'][Math.floor(Math.random()*7)];
      ctx.fillRect(0,0,340,340);
      for (let y=0; y<340; y+=12) {
        for (let x=0; x<340; x+=12) {
          let d = ctx.getImageData(x,y,12,12);
          ctx.putImageData(d, x+Math.floor(Math.random()*3)-1, y+Math.floor(Math.random()*3)-1);
        }
      }
      ctx.globalAlpha = 1;
      ctx.font = "bold 26px Helvetica Neue";
      ctx.fillStyle = "#fff";
      ctx.fillText("감정: "+randomFrom(["Neutral","Joy","Sadness","Confused"]), 30, 320);
    } else if (wrongCount === 2 || wrongCount === 3) {
      ctx.save();
      ctx.drawImage(baseImg, 80,90,60,30, 60,30,120,60);
      ctx.drawImage(baseImg, 200,90,60,30, 180,60,120,60);
      ctx.drawImage(baseImg, 120,200,100,40, 120,220,180,60);
      ctx.restore();
      ctx.globalAlpha = 0.19;
      ctx.fillStyle = "#000";
      ctx.fillRect(0,0,340,340);
      ctx.globalAlpha = 1;
      ctx.font = "bold 32px Helvetica Neue";
      ctx.fillStyle = "#fff";
      ctx.fillText("정체성 파괴", 80, 60);
    } else if (wrongCount >= 4) {
      for (let i=0;i<5;i++) {
        let sx = Math.random()*240, sy = Math.random()*240;
        ctx.globalAlpha = 0.7-0.13*i;
        ctx.drawImage(baseImg, sx, sy, 80, 80, 40*i, 40*i, 120, 120);
      }
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = "#fff";
      ctx.fillRect(30, 120, 280, 70);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#000";
      ctx.strokeRect(30,120,280,70);
      ctx.font = "bold 28px Helvetica Neue";
      ctx.fillStyle = "#c00";
      ctx.fillText("Data Mismatch", 60, 165);
      ctx.font = "16px Helvetica Neue";
      ctx.fillStyle = "#222";
      ctx.fillText("Unknown Subject", 70, 195);
    }
    img.src = canvas.toDataURL('image/png');
  };
  baseImg.src = bFaceImg;
}

// ------------------------
// [B 에필로그]
// ------------------------
const bEpilogueSeq = [
  "A의 얼굴이 맞나요?",
  "당신은 정말로 A(을)를 알고 있나요?",
  "조금은 낯설지만, 우리는 이것 또한 A(이)라는 것을 부정할 수 없습니다. 또한 낯선 타인이 되어버린 A가(이) 여전히 가깝게 느껴지죠. 왜일까요?",
  "A와 당신을 연결하고 있는 것은?",
  "[입력]"
];
function showBEpilogue() {
  const box = document.getElementById('b-epilogue-text');
  let idx = 0;
  function next() {
    if (idx === 4) {
      box.innerHTML = '';
      document.getElementById('b-epilogue-input').style.display = 'block';
      return;
    }
    box.style.opacity = 0;
    setTimeout(() => {
      let t = bEpilogueSeq[idx].replace(/A/g, bAData.name);
      box.innerText = t;
      box.style.opacity = 1;
      setTimeout(() => {
        box.style.opacity = 0;
        setTimeout(next, 800);
      }, 2200);
      idx++;
    }, 400);
  }
  next();
}
document.getElementById('btn-b-epilogue-next').onclick = () => {
  bShortAnswer = document.getElementById('b-short-answer').value.trim();
  if (!bShortAnswer) return;
  showPage('page-b-result');
  drawPostcard();
};

// ------------------------
// [엽서 PNG 생성/다운로드]
// ------------------------
function drawPostcard() {
  const canvas = document.getElementById('postcard-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,600,900);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0,0,600,900);
  // 얼굴 이미지
  let img = new window.Image();
  img.onload = () => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(300, 350, 210, 0, Math.PI*2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 40, 140, 520, 420);
    ctx.restore();
    // 텍스트
    ctx.font = "bold 38px Helvetica Neue";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.fillText(bShortAnswer, 300, 790);
  };
  img.src = document.getElementById('b-face-img').src;
}
document.getElementById('btn-download-postcard').onclick = () => {
  const canvas = document.getElementById('postcard-canvas');
  const link = document.createElement('a');
  link.download = '타인x의초상_엽서.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
};
document.getElementById('btn-b-home').onclick = () => location.reload();

// ------------------------
// [페이지 show 이벤트 트리거]
// ------------------------
const pageShowEvents = {
  'page-a-prologue': showAPrologueSeq,
  'page-a-quiz': showAQuizQuestion
};
document.querySelectorAll('.page').forEach(page => {
  const id = page.id;
  if (pageShowEvents[id]) {
    new MutationObserver(() => {
      if (page.style.display !== 'none') pageShowEvents[id]();
    }).observe(page, {attributes:true, attributeFilter:['style']});
  }
});
