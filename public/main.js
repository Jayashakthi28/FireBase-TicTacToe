import { authStatus, db_del, db_get, db_insert, firebaseConfig, signIn, signOut } from "./firebase.js";

firebase.initializeApp(firebaseConfig);
firebase.analytics();
const boards = Array.from(document.querySelectorAll(".board div"));
let box;
let winflag = 0;
let coin = "O";
let enable = false;
let x_s = 0;
let o_s = 0;
let userPhoto;
let userName;
let userId;
let high_obj = {};
let user;
let room_no;
let userLogin=false;
let userHasRoom;
const host_btn=document.querySelector('.host-game');
const login_btn = document.querySelector(".login-btn");
const user_cont = document.querySelector(".user-det-cont");
const auth = firebase.auth();
const textBox=document.querySelector('.join-game');
const provider = new firebase.auth.GoogleAuthProvider();
const db=firebase.database();
let opponent_player;
let currentCoin;
let playCheck=false;

function randomNoGen(){
  return (Math.floor(Math.random()*(99999-10000)+10000));
}

host_btn.addEventListener("click",async ()=>{
  if(!userLogin) return;
  room_no=randomNoGen();
  await CheckRoom(userId);
  document.querySelector('.code-shower').textContent=`Your game code is ${room_no}`;
  UpdateRoom(userId);
  db_insert(db,`connection/${room_no}`,{
    'status':"open",
    'p1':["active",userName,userPhoto,userId],
    'p2':["inactive","null","null","null"]
  });
  dbtrigger();
  currentCoin='X';
  host_btn.style.display=`none`;
  textBox.style.display=`none`;
});

textBox.addEventListener("keypress",async (e)=>{
  if(e.key!=='Enter' || !userLogin) return;
  console.log(textBox.value);
  let data=await db_get(db,`connection/${textBox.value}`);
  if(!data.val()) return;
  if(data.val().status==='close') return;
  room_no=textBox.value;
  opponent_player=data.val().p1;
  let temp={
    'status':'close',
    'p1':opponent_player,
    'p2':['active',userName,userPhoto,userId]
  }
  db_insert(db,`connection/${room_no}`,temp);
  db_insert(db,`roomlink/${userId}`,{'rid':room_no});
  host_btn.style.display='none';
  currentCoin='O';
  dbtrigger();
});


async function signInUtil(auth, provider) {
  try{
      signIn(auth, provider);
  }
  catch(e){
    console.clear();
  }
}

async function CheckRoom(userid){
  userHasRoom=await db_get(db,`roomlink/${userId}`);
  userHasRoom=userHasRoom.val();
  console.log(userHasRoom);
  DelRoom(userId);
}

async function UpdateRoom(userId){
  db_insert(db,`roomlink/${userId}`,{'rid':room_no});
}

async function DelRoom(userId){
  if(!userHasRoom) return;
  db_del(db,`connection/${userHasRoom.rid}`);
  db_del(db,`roomlink/${userId}`);
}


function fillUser(user){
  userPhoto = user.photoURL;
  userName = user.displayName;
  userId = user.uid;
  login_btn.classList.add("none");
  user_cont.innerHTML = ` <div class="user-img-cont">
  <img src=${userPhoto} alt="Profile Pic">
  </div>
  <div class="user-name-cont">${userName}</div>`;
  user_cont.classList.remove("none");
}

firebase.auth().onAuthStateChanged((user) => {
  console.log(user);
  if (user) {
    fillUser(user);
    CheckRoom(userId);
    userLogin=true;
  } else {
    // if(userId) CheckRoom(userId);
    user_cont.classList.add("none");
    login_btn.classList.remove('none');
    // userLogin=false;
    // document.querySelector('.code-shower').textContent="";
  }
});


async function playerDetUpdate(){
  const cont=document.querySelectorAll('.players-cont .user-det-cont');
  let opponent_Data=await db_get(db, `connection/${room_no}`);
  opponent_Data=opponent_Data.val();
    cont[1].innerHTML=`<div class="user-img-cont">
    <img src=${opponent_Data.p2[2]} alt="">
    </div>
    <div class="user-name-cont">${opponent_Data.p2[1]}</div>`

    cont[0].innerHTML=`<div class="user-img-cont">
    <img src=${opponent_Data.p1[2]} alt="">
    </div>
    <div class="user-name-cont">${opponent_Data.p1[1]}</div>`
}


function dbtrigger(){
  db.ref(`connection/${room_no}`).on("value",async ()=>{
    let data=await db_get(db,`connection/${room_no}`);
    if(data.val().p2[0]==="active" && data.val().p1[0]==="active"){
      playCheck=true;
    }
    else{
      playCheck=false;
    }
    if(data.val().p2[0]==='inactive')return;
    playerDetUpdate();
    db_insert(db,`/move/${room_no}`,{"currMove":-1});
    db.ref(`/move/${room_no}`).on("value",db_player_move);
  });
}


async function signOutUtil(auth) {
  if (await signOut(auth)) {
    user_cont.classList.add("none");
    login_btn.classList.remove("none");
  }
}

user_cont.addEventListener("click", () => {
  signOutUtil(auth);
});

login_btn.addEventListener("click", () => {
  signInUtil(auth, provider);
});

function box_mapper() {
  box = boards.map((data) => {
    return data.textContent;
  });
}

function winner() {
  box_mapper();
  for (let i = 0; i < 7; i++) {
    if (
      box[i] !== "-" &&
      box[i] === box[i + 1] &&
      box[i] === box[i + 2] &&
      i % 3 == 0
    ) {
      console.log(`${box[i]} wins`);
      winflag = 1;
      box[i] === "X" ? x_s++ : o_s++;
      high_obj = {
        0: "row",
        i: `${i}`,
      };
      break;
    }
  }
  for (let i = 0; i < 3; i++) {
    if (box[i] !== "-" && box[i] === box[i + 3] && box[i] === box[i + 6]) {
      console.log(`${box[i]} wins`);
      winflag = 1;
      box[i] === "X" ? x_s++ : o_s++;
      high_obj = {
        0: "col",
        i: `${i}`,
      };
      break;
    }
  }
  if (box[0] !== "-" && box[0] === box[4] && box[0] === box[8]) {
    console.log(`${box[0]} wins`);
    winflag = 1;
    box[0] === "X" ? x_s++ : o_s++;
    high_obj = {
      0: "dia",
      i: `0`,
    };
  }
  if (box[2] !== "-" && box[2] === box[4] && box[2] === box[6]) {
    console.log(`${box[2]} wins`);
    winflag = 1;
    box[2] === "X" ? x_s++ : o_s++;
    high_obj = {
      0: "diarev",
      i: `2`,
    };
  }
  if (winflag !== 1) {
    let f = 0;
    box.forEach((data) => {
      if (data === "-") {
        f = 1;
      }
    });
    if (!f) {
      reseter();
    }
  }

}

function tag_updater() {
  if (winflag === 1) {
    console.log("Entering here");
    document.querySelector(".player1").textContent = `${x_s}`;
    document.querySelector(".player2").textContent = `${o_s}`;
    let i = +high_obj["i"];
    console.log(i);
    if (high_obj["0"] === "col") {
      boards[i].classList.add("highlighter");
      boards[i + 3].classList.add("highlighter");
      boards[i + 6].classList.add("highlighter");
    } else if (high_obj["0"] === "row") {
      console.log("Entering here");
      boards[i].classList.add("highlighter");
      boards[i + 1].classList.add("highlighter");
      boards[i + 2].classList.add("highlighter");
    } else if (high_obj["0"] === "dia") {
      boards[0].classList.add("highlighter");
      boards[4].classList.add("highlighter");
      boards[8].classList.add("highlighter");
    } else if (high_obj["0"] === "diarev") {
      boards[2].classList.add("highlighter");
      boards[4].classList.add("highlighter");
      boards[6].classList.add("highlighter");
    }
    setTimeout(() => {
      reseter();
    }, 1000);
  }
}

function db_player_move(snapshot){
  let val=snapshot.val().currMove;
  console.log("before");
  if(val==-1)return;
  console.log("after");
  gamelogic(val);
  tag_updater();
}

function gamelogic(i) {
  if (winflag) return;
  if (boards[i].textContent === "X" || boards[i].textContent === "O") {
    return;
  }
  coin === "X" ? (coin = "O") : (coin = "X");
  boards[i].textContent = `${coin}`;
  winner();
}

boards.forEach((data, i) => {
  data.addEventListener("click", () => {
    if (enable && playCheck && coin!==currentCoin){
    db_insert(db,`/move/${room_no}`,{"currMove":i});
    }
  });
});

function reseter() {
  let i = 1;
  boards.forEach((data) => {
    data.classList.remove("highlighter");
  });
  setTimeout(() => {
    boards.forEach((data) => {
      setTimeout(() => {
        data.textContent = "-";
      }, 100 * i);
      i++;
    });
  }, 300);
  setTimeout(() => {
    enable = true;
  }, 1200);
  winflag = 0;
  coin = "O";
  enable = false;
}

window.addEventListener("load", reseter);
