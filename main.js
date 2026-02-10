const today = new Date().toISOString().slice(0, 10);
let currentUser = null;
let questions = [];
let mood = [];
let currentQuestions = [];
let achievements = [
    "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg",
    "13.jpg", "14.jpg", "15.jpg", "16.jpg", "17.jpg", "18.jpg", "19.jpg", "20.jpg",
];

fetch('questions.json').then(res => res.json()).then(data => questions = data);

function $(id){ return document.getElementById(id); }
function hideAll() {
    ["home-page", "selection-page", "journal-page", "previous-page", "achievements-page", "draw-area"]
        .forEach(id => $(id).style.display = "none");
}
function hasEntryToday(name){
    const entry = JSON.parse(localStorage.getItem("entries")||"{}");
    return entry[name] && entry[name][today];
}

function loadUsers(){
    const users = JSON.parse(localStorage.getItem("users")||"[]");
    $("user-select").innerHTML='';
    users.forEach(user => {
        const option = document.createElement("option");
        option.textContent = user.name;
        option.value = user.name;
        $("user-select").appendChild(option);
    });
}
loadUsers();

$("add-user-btn").onclick=()=>$("new-user-form").style.display="block";
$("save-user-btn").onclick=()=>{
    const name=$("new-user-name").value;
    const age=$("new-user-age").value;
    if(!name || !age) return;

    const users=JSON.parse(localStorage.getItem("users")||"[]");
    users.push({name, age});
    localStorage.setItem("users",JSON.stringify(users));
    loadUsers();
};

$("user-select").onchange=()=>{
    const users=JSON.parse(localStorage.getItem("users")||"[]");
    currentUser = users.find(user=>user.name===$("user-select").value);
    hideAll();
    $("selection-page").style.display="block";
    $("welcome-msg").innerText=`Welcome ${currentUser.name} !`;
};

$("add-page-btn").onclick=()=>{
    if(hasEntryToday(currentUser.name)){
        alert("You've already done today's entry")
        return;
    }
    startJournal();
};

$("draw-btn").onclick=()=>{$("draw-area").style.display="block"; clearCanvas();}

$("previous-pages-btn").onclick=()=>{ hideAll(); loadPrevious(); }
$("achievements-btn").onclick=()=>{ hideAll(); loadAchievements(); }

function startJournal(){
    hideAll();
    $("journal-page").style.display="block";
    $("journal-welcome").innerText=`Welcome ${currentUser.name} - ${today}`;

    const pool=questions.filter(p=>p.ageMin<=currentUser.age&&p.ageMax>=currentUser.age);
    currentQuestions = pool[Math.floor(Math.random()*pool.length)];

    $("daily-qu-1").innerText=currentQuestions[0].text;
    $("daily-answer-1").style.display="block";
    $("daily-qu-2").innerText=currentQuestions[1].text;
    $("daily-answer-2").style.display="block";
}

const canvas = $("draw-canvas");
const ctx = canvas.getContext("2d");
let drawing = false;
let colour = "black";

canvas.addEventListener("pointerdown", ()=>{drawing = true;});
canvas.addEventListener("pointerup", ()=>{drawing = false; ctx.beginPath();});
canvas.addEventListener("pointermove", e=>{
    if(!drawing)return;
    const r=canvas.getBoundingClientRect();
    ctx.strokeStyle=colour;
    ctx.lineWidth=4;
    ctx.lineTo(e.clientX-r.left,e.clientY-r.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX-r.left,e.clientY-r.top);
});

$("clear-canvas").onclick=clearCanvas;

function clearCanvas(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
}

document.querySelectorAll("#mood-picker button").foreach(b => {
    b.onclick = ()=>{ mood.push(b.id);}
});

$("other-emotion").addEventListener("blur", (event) => {
    if (event.target.value) {
        mood.push(event.target.value);
    }
});

function getRandomAchievement() {
    const index = Math.floor(Math.random()*(achievements.length-1));
    return achievements[index];
}

$("save-entry-btn").onclick=() => {
    if(!mood) return alert("You've not selected how you feel");
    const earnedAchievement = getRandomAchievement();
    const entries=JSON.parse(localStorage.getItem("entries")||"{}");
    entries[currentUser.name]=entries[currentUser.name]||{};
    entries[currentUser.name][today]= {
        mood,
        goodThing1: $("good-thing-1"),
        goodThing2: $("good-thing-2"),
        goodThing3: $("good-thing-3"),
        dailyQu1: currentQuestions[0].value,
        dailyAns1: $("daily-ans-1"),
        dailyQu2: currentQuestions[1].value,
        dailyAns2: $("daily-ans-2"),
        draw: canvas.toDataURL("image/png"),
        achievement: earnedAchievement,
    };
    localStorage.setItem("entries",JSON.stringify(entries));
    $("achievement").innerHTML='<img src="achievements/${earnedAchievement}" alt="achievement!"/>';
};

function loadPrevious(){
    hideAll();
    $("previous-page").style.display="block";
    const userEntries = JSON.parse(localStorage.getItem("entries")||"{}")[currentUser.name]||{};
    $("entries-list").innerHTML='';
    Object.keys(userEntries).forEach(d=>{
        const li=document.createElement("li");
        li.innerHTML=`${d} - ${userEntries[d].mood}`;
        $("entries-list").append(li);
    })
}

function loadAchievements(){
    hideAll();
    $("achievements-page").style.display="block";
    const userEntries = JSON.parse(localStorage.getItem("entries")||"{}")[currentUser.name]||{};
    const set = new Set(Object.values(userEntries).map(value => value.achievement));
    $("achievements-list").innerHTML='';
    set.forEach(s => {
        const img=document.createElement("img");
        img.src=`achievements/${s}`
        img.width=100;
        $("achievements-list").append(img);
    });
}

$("back-journal-btn").onclick=()=>$("selection-page").style.display="block";
$("back-from-previous").onclick=()=>$("selection-page").style.display="block";
$("back-from-achievements").onclick=()=>$("selection-page").style.display="block";
