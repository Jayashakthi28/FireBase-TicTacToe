export const firebaseConfig = {
  apiKey: "AIzaSyCO86NqB0vsompjnIF5GaiPmNXt_cAHRnU",
  authDomain: "tictactoe-14958.firebaseapp.com",
  projectId: "tictactoe-14958",
  storageBucket: "tictactoe-14958.appspot.com",
  messagingSenderId: "582575721999",
  appId: "1:582575721999:web:7c2658d947f7f5911c9d7a",
  measurementId: "G-LD0RK1527B",
  databaseURL:'https://tictactoe-14958-default-rtdb.asia-southeast1.firebasedatabase.app/'
};


export async function signIn(auth, provider) {
  let res = await auth.signInWithPopup(provider);
  return res.user;
}

export async function signOut(auth) {
  let res = await auth.signOut();
  return true;
}
export async function authStatus(auth) {
  const user = await auth.currentUser;
  return user;
}

export function db_insert(db,path,val){
    db.ref(path).set(val);
}

export async function db_get(db,path){
    let data=await db.ref(path).get();
    return data;
}

export function db_del(db,path){
    db.ref(path).remove();
}