const boards = Array.from(document.querySelectorAll(".board div"));
let box;
let winflag = 0;
let coin = "O";
let enable = false;
let x_s = 0;
let o_s = 0;
let high_obj = {};

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
  if(winflag !==1){
      let f=0;
      box.forEach(data=>{
          if(data==='-'){
              f=1;
          }
      });
      if(!f){
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
    setTimeout(()=>{
        reseter();
    },1000);
  }
}

function gamelogic(i) {
  if (winflag) return;
  if (boards[i].textContent === "X" || boards[i].textContent=== "O"){
       return;
  }
  coin === "X" ? (coin = "O") : (coin = "X");
  boards[i].textContent = `${coin}`;
  winner();
}

boards.forEach((data, i) => {
  data.addEventListener("click", () => {
    if (enable) gamelogic(i);
    tag_updater();
  });
});

function reseter() {
  let i = 1;
  boards.forEach(data=>{
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
