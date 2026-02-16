const today = new Date().toISOString().slice(0, 10);
let currentUser = null;
let questions = [];
let mood = [];
let currentQuestions = [];
let achievements = [
    "1.jpeg", "2.jpeg", "3.jpeg", "4.jpeg", "5.jpeg", "6.jpeg", "7.png", "8.png", "9.jpeg", "10.jpeg", "11.jpeg",
    "12.jpeg", "13.jpeg", "14.jpeg"
];
var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

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
    $("user-select").innerHTML='';
    const blankOption = document.createElement("option");
    blankOption.textContent = "--Select--";
    blankOption.value = "none";
    $("user-select").appendChild(blankOption);
    
    const users = JSON.parse(localStorage.getItem("users")||"[]");
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
    $("new-user-form").style.display="none";
};

$("user-select").onchange=()=>{
    if($("user-select").value==="none")return;
    const users=JSON.parse(localStorage.getItem("users")||"[]");
    currentUser = users.find(user=>user.name===$("user-select").value);
    hideAll();
    $("selection-page").style.display="block";
    $("welcome-msg").innerText=`Welcome ${currentUser.name}!`;
};

$("add-page-btn").onclick=()=>{
    if(hasEntryToday(currentUser.name)){
        alert("You've already done today's entry")
        return;
    }
    startJournal();
};

$("draw-btn").onclick=()=>{
    var newDisplayStyle = "none"
    const displayStyle = $("draw-area").style.display;
    if(displayStyle === "none")newDisplayStyle = "block";
    $("draw-area").style.display=newDisplayStyle; clearCanvas();
}

$("previous-pages-btn").onclick=()=>{ loadPreviousList(); }
$("achievements-btn").onclick=()=>{ loadAchievements(); }

function startJournal(){
    hideAll();
    $("journal-page").style.display="block";
    const formattedToday = new Date(today).toLocaleDateString("en-GB", options);
    $("journal-welcome").innerText=`Welcome ${currentUser.name} - ${formattedToday}`;

    const pool=questions.filter(p=>p.ageMin<=currentUser.age&&p.ageMax>=currentUser.age);
    currentQuestions = pool.sort(() => 0.5 - Math.random()).slice(0, 2);

    $("daily-qu-1").textContent=currentQuestions[0].text;
    $("daily-answer-1").style.display="block";
    $("daily-qu-2").textContent=currentQuestions[1].text;
    $("daily-answer-2").style.display="block";
}

const canvas = $("draw-canvas");
const ctx = canvas.getContext("2d");
let drawing = false;
let colour = "black";

function selectCorrectBgColorForText(textColour) {
    const temp = document.createElement('div')
    temp.style.color = textColour;
    document.body.appendChild(temp);
    const rgb = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    
    const [r,g,b] = rgb.match(/\d+/g).map(Number);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 125 ? '#000' : '#fff'
}

document.querySelectorAll(".colours button").forEach(b => {
    b.onclick = ()=>{ colour = b.id; };
    b.style.color = b.id
    b.style.backgroundColor = selectCorrectBgColorForText(b.id)
});
canvas.width=window.innerWidth * 0.8;
canvas.height=window.innerHeight * 0.8;
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

window.addEventListener('resize', () => {
   canvas.width=window.innerWidth * 0.8; 
   canvas.height=window.innerHeight * 0.8;
});

$("clear-canvas").onclick=clearCanvas;

function clearCanvas(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
}

document.querySelectorAll("#mood-picker button").forEach(b => {
    b.onchange = ()=>{ mood.includes(b.id) ? mood.filter(item => item !== b.id) : [...mood, b.id]; console.log("Mood: " + mood);}
});

$("other-emotion").addEventListener("blur", (event) => {
    if (event.target.value) {
        console.log("Mood: " + mood);
        mood.push(event.target.value);
    }
});

function getRandomAchievement() {
    const index = Math.floor(Math.random()*(achievements.length-1));
    return achievements[index];
}

$("save-entry-btn").onclick=() => {
    if(!mood.length) return alert("You've not selected how you feel");
    if(!$("good-thing-1").value || !$("good-thing-2").value || !$("good-thing-3").value || !$("daily-answer-1").value || !$("daily-answer-2").value) return alert("Please complete the questions");
    const earnedAchievement = getRandomAchievement();
    const entries=JSON.parse(localStorage.getItem("entries")||"{}");
    entries[currentUser.name]=entries[currentUser.name]||{};
    entries[currentUser.name][today]= {
        mood: mood,
        goodThing1: $("good-thing-1").value,
        goodThing2: $("good-thing-2").value,
        goodThing3: $("good-thing-3").value,
        dailyQu1: currentQuestions[0].value,
        dailyAns1: $("daily-answer-1").value,
        dailyQu2: currentQuestions[1].value,
        dailyAns2: $("daily-answer-2").value,
        draw: canvas.toDataURL("image/png"),
        achievement: earnedAchievement,
    };
    localStorage.setItem("entries",JSON.stringify(entries));
    const imageSrc = "achievements/" + earnedAchievement;
    console.log("ImageSrc: " + imageSrc);
    $("achievement").innerHTML="<img src" + imageSrc + " alt='achievement!'/>";
};

function loadPreviousList(){
    hideAll();
    $("previous-page").style.display="block";
    const userEntries = JSON.parse(localStorage.getItem("entries")||"{}")[currentUser.name]||{};

    const container = $("entries-list");
    const ul = document.createElement("ul");
    
    Object.entries(userEntries).forEach(([date, data]) => {
        const li = document.createElement("li");
        const formattedDate = new Date(date).toLocaleDateString("en-GB", options);
        const link = document.createElement("a");
        link.href = "#";
        link.textContext = formattedDate;
        link.addEventListener("click", (e) => {
            e.preventDefault();
            loadPrevious(date, data);
        });
        ul.appendChild(link);
    });
    container.replaceChildren(ul);
}

function loadPrevious(date, data) {
    hideAll();
    $("journal-page").style.display="block";
    const formattedToday = new Date(date).toLocaleDateString("en-GB", options);
    $("journal-welcome").innerText=`Welcome ${currentUser.name} - ${formattedToday}`;

    data.mood.forEach(selectedMood => {
        const checkbox = $(selectedMood);
        if (checkbox) {
            checkbox.checked = true;
        } else {
            $("other-emotion").innerText = selectedMood;
        }
    });
    
    $("good-thing-1").innerText=data.goodThing1;
    $("good-thing-2").innerText=data.goodThing2;
    $("good-thing-3").innerText=data.goodThing3;
    
    $("daily-qu-1").textContent=data.dailyQu1;
    $("daily-answer-1").innerText=data.dailyAns1;
    $("daily-qu-2").textContent=data.dailyQu2;
    $("daily-answer-2").innerText=data.dailyAns2;
    
    const imageSrc = "achievements/" + data.achievement;
    $("achievement").innerHTML="<img src" + imageSrc + " alt='achievement!'/>";

    const img = new Image();
    img.src = data.draw;
    img.onload = () => {
        ctx.drawImage(img, 0, 0);
    }
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
        img.width=window.innerWidth * 0.2;
        $("achievements-list").append(img);
    });
}

$("back-journal-btn").onclick=()=>$("selection-page").style.display="block";
$("back-from-previous").onclick=()=>$("selection-page").style.display="block";
$("back-from-achievements").onclick=()=>$("selection-page").style.display="block";
