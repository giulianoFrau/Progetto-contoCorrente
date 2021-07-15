'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//RACCHIUDERE IN UNA FUNZIONE PER RICHIAMARLA IN PIU FUNZIONI

const updateUI = function (i) {
  displayMovements(i.movements); //movements xk è l'array di importi dell oggetto account
  calcPrintBalance(i);
  CalcDisplaySummary(i);
};

//VEDERE LISTA MOVIMENTI
const displayMovements = function (movements,sort=false) {
  //mettiamo tutto in una funzione in modo da non dover copiare il codice tante volte
  containerMovements.innerHTML = ''; //svuotiamo le prime righe di default
  const move=sort ? movements.slice().sort((a, b) => a - b) : movements;
  move.forEach(function (valore, chiave) { //prima del sort il foreach era su movements
    const type = valore > 0 ? 'deposit' : 'withdrawal'; // per la classe
    //in questa var html mettiamo il blocco html che deve variare con chiave e valora
    const html = `<div class="movements__row"> 
    <div class="movements__type movements__type--${type}">${
      chiave + 1
    } ${type}</div>

    <div class="movements__value">${valore}</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html); //inserisci blocco html appena creato sopra il blocco che gia esisteva
  });
};

//AGGIUNGERE OWNER ALL'OGGETTO E FILTRARE IL NOME
const createUsername = function (accounts) {
  // stessa cosa della precedente funzione riguardo a non copiare il codice
  accounts.forEach(function (i) {
    //iteriamo sull account che passiamo come parametro
    i.username = i.owner //creiamo un nuovo campo che sarà il nome.tutto minuscolo.senza spazi.mappando la sua prima lettera
      .toLocaleLowerCase()
      .split(' ')
      .map(function (name) {
        return name[0];
      })
      .join('');
  });
};

createUsername(accounts);

//PATRIMONIO TOTALE
const calcPrintBalance = function (i) {
  i.balance = i.movements.reduce(function (a, i) {
    return a + i;
  });
  labelBalance.textContent = `${i.balance} EUR`;
};

//ENTRATE,USCITE,INTERESSI
const CalcDisplaySummary = function (account) {
  const entrate = account.movements
    .filter(function (i) {
      return i > 0;
    })
    .reduce(function (a, i) {
      return a + i;
    }, 0);
  labelSumIn.textContent = `${entrate} EUR`;

  const uscite = account.movements
    .filter(function (i) {
      return i < 0;
    })
    .reduce(function (a, i) {
      return a + i;
    }, 0);
  labelSumOut.textContent = `${Math.abs(uscite)} EUR`;

  const interessi = account.movements
    .filter(function (i) {
      return i > 0;
    })
    .map(function (i) {
      return (i * account.interestRate) / 100;
    })
    .filter(function (valore) {
      return valore >= 1;
    })
    .reduce(function (a, i) {
      return a + i;
    }, 0);
  labelSumInterest.textContent = interessi;
};
//CalcDisplaySummary(account1.movements);

//CHANGE USER DISPLAY GENERAL e LOGIN
let currentAccount; //creo il current account nel global scope
btnLogin.addEventListener('click', function (e) {
  e.preventDefault(); //fa si che quando clicco non si ricarichi la pagina,inoltre il pulsante è un pulsante di submit dentro un form e la prevent ne impedisce questo comportamento
  currentAccount = accounts.find(i => i.username === inputLoginUsername.value); // assegno al current account username=al valore inserito nella input
  if (currentAccount && currentAccount.pin === Number(inputLoginPin.value)) {
    //se anche il pin è uguale
    labelWelcome.textContent = `Benvenuto ${currentAccount.owner}`; //mostra dati current account
    containerApp.style.opacity = 100; //vengono richiamate tutte le funzioni
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    updateUI(currentAccount);
  } else {
    alert('wrong credentials');
  }

  /*alternativa
  for (let i in accounts) {
    if (
      accounts[i].username === inputLoginUsername.value &&
      accounts[i].pin === Number(inputLoginPin.value)
    ) {
      labelWelcome.textContent = `Benvenuto ${accounts[i].owner}`;
      containerApp.style.opacity = 100;
      displayMovements(accounts[i].movements); //movements xk è l'array di importi dell oggetto account
      calcPrintBalance(accounts[i]);
      CalcDisplaySummary(accounts[i]);
    }
  }*/
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(function (i) {
    return i.username === inputTransferTo.value;
  });

  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    receiverAccount &&
    amount > 0 &&
    currentAccount.balance >= amount &&
    receiverAccount.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);
    updateUI(currentAccount);
  } else {
    alert('Errore nel trasferimento');
  }

 
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
  
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
    labelWelcome.textContent="Log in to get started"
  }

  inputCloseUsername.value = inputClosePin.value = '';
}); 



btnLoan.addEventListener("click",function(e){
  e.preventDefault();
  const amount=Number(inputLoanAmount.value)
 if(amount>0 && currentAccount.movements.some(i=>i>=amount*0.1)){
   currentAccount.movements.push(amount)
   updateUI(currentAccount);
   inputLoanAmount.value=" ";
 }
});


let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});



/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

//const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
/*
- push: aggiunge in coda elementi
- unshift: aggiunge elementi all'inizio dell'array
- pop: rimuove l'ultimo elemento definitivamente
- shift: rimuove il primo elemento definitvamente
- index of: restituisce l'indice dell' elemento che viene passato
- include: restitusisce true o false se l'elemento passato è presente o no

let arr = ['a', 'b', 'c', 'd', 'e'];
// SLICE: estrapola elementi array e crea solo una copia dell'originale
console.log(arr.slice(2)); //dove inizia
console.log(arr.slice(2, 4)); //dove inizia e finisce
console.log(arr.slice(-1)); //prende sempre l'ultimo elemento
console.log(arr.slice(1, -2));
console.log(arr.slice()); // copia array come con lo spread operat :=> let copiaArr[...arr]

//SPLICE: estrapola elementi array e cambia anche l'originale, lasciandolo senza gli elementi estrapolati
console.log(arr.splice(2)); //dove inizia l'estrapolazione,possiamo anche decidere inizio e fine dell'estrapolazione
console.log(arr); //modificato senza i paramentri tolti

//REVERSE:inverte l'ordine degli array cambiando l'originale
arr = ['a', 'b', 'c', 'd', 'e'];
let arr2 = ['j','i','h','g','f']; 
console.log(arr2.reverse());

//CONCAT:concatenare 2 array
let arrConcat=arr.concat(arr2);//stessa cosa fatta con lo spread operator => arrConcat=[...arr,...arr2]

//JOIN : aggiunge qualcosa tra un elemento e l'altro
console.log(arrConcat);
console.log(arrConcat.join('-').toLocaleUpperCase( ));


//FOR-EACH

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// FOR OF KEY VALUE (CON UN PARAMETRO NEL FOR POSSO OTTENERE SOLO LA KEY,QUINDE DEVO METTERNE 2+ ENTRIES())
for(let [i,movement] of movements.entries()){ //chiave,valore
  if(movement >0){
    console.log(`movimento n° ${i} : hai accreditato ${movement}`)
  }else{
    console.log(`movimento n° ${i} : hai prelevato ${movement}`)
  }
}

// FOR IN CHIAVE-VALORE CON SOLO I COME PARAMETRO
console.log("----- FOR arr[i] con for in ------");
for(let i in movements){ //chiave,valore
  if(i >0){
    console.log(`movimento n° ${i} : hai accreditato ${movements[i]}`)
  }else{
    console.log(`movimento n° ${i} : hai prelevato ${movements[i]}`)
  }
}


//FOR CLASSICO CON CHIAVE VALORE E 1 PARAMETRO
console.log("----- FOR CLASSICO ------");
for(let i=0;i<movements.length;i++){ //chiave,valore
  if(i >0){
    console.log(`movimento n° ${i} : hai accreditato ${movements[i]}`)
  }else{
    console.log(`movimento n° ${i} : hai prelevato ${movements[i]}`)
  }
}


//FOR EACH VALORE-CHIAVE ++++ OCCHIO CHE SONO INVERTITI NEL FOREACH ++++
console.log("----- FOR EACH ------");
movements.forEach(function(movement,i,movements){//valore,chiave
  if(movement >0){
    console.log(`movimento n° ${i} : hai accreditato ${movement}`)
  }else{
    console.log(`movimento n° ${i} : hai prelevato ${movement}`)
  }
})

 // for each nelle mappe : uguale agli array
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

currencies.forEach(function(valore,chiave){
  console.log(`${chiave} sta per ${valore}`)
})


for(let [chiave,valore] of currencies.entries()){
  console.log(`${chiave} sta per ${valore}`)
}
*/

/*   CHALLENGE N°1

Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners about their dog's age, 
and stored the data into an array (one array for each). For now, they are just interested in knowing whether a dog
 is an adult or a puppy. A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years old.

Create a function 'checkDogs', which accepts 2 arrays of dog's ages ('dogsJulia' and 'dogsKate'), and does the following things:

1. Julia found out that the owners of the FIRST and the LAST TWO dogs actually have cats, not dogs! 
So create a shallow copy of Julia's array, and remove the cat ages from that copied array 
(because it's a bad practice to mutate function parameters)


2. Create an array with both Julia's (corrected) and Kate's data


3. For each remaining dog, log to the console whether it's an adult ("Dog number 1 is an adult, and is 5 years old")
 or a puppy ("Dog number 2 is still a puppy 🐶")


4. Run the function for both test datasets

HINT: Use tools from all lectures in this section so far 😉

TEST DATA 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3]
TEST DATA 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]

GOOD LUCK 😀
*/
/*


function check(dogsJulia,dogsKate){
  dogsJulia.splice(0,1)
  dogsJulia.splice(-2)
  console.log(dogsJulia);
  let dogs=dogsJulia.concat(dogsKate);
  console.log(dogs);

  dogs.forEach(function(valore,chiave){
    if(valore>3){
     console.log( `il cane numero ${chiave+1}  e adulto perchè ha ${valore} anni`)
    }
    else{
      console.log(`il cane numero ${chiave+1}  e un cucciolo perchè ha ${valore} anni`)
    }
   })
 
}


check([3, 5, 2, 12, 7],[4, 1, 15, 8, 3])

****alternativa *****
console.log("--- togliere dall'array 1 e 4/5 ---");
let dogsJulia=[3, 5, 2, 12, 7];
console.log(dogsJulia);
dogsJulia.splice(0,1)
dogsJulia.splice(-2)
console.log(dogsJulia);
console.log("--- cani kate ---");
let dogsKate=[4, 1, 15, 8, 3];
console.log(dogsKate);
console.log("--- unione 2 array ---");
console.log(dogsJulia.concat(dogsKate));

function checkEta(params1,params2){
 params1.forEach(function(valore,chiave){
  if(valore>3){
   console.log( `il cane numero ${chiave+1}  e adulto perchè ha ${valore} anni`)
  }
  else{
    console.log(`il cane numero ${chiave+1}  e un cucciolo perchè ha ${valore} anni`)
  }
 })


 params2.forEach(function(valore,chiave){
  if(valore>3){
   console.log( `il cane numero ${chiave+1}  e adulto perchè ha ${valore} anni`)
  }
  else{
    console.log(`il cane numero ${chiave+1}  e un cucciolo perchè ha ${valore} anni`)
  }
 })
}

checkEta(dogsJulia,dogsKate);

 /* CHALLENGE N°2
const calcAverageHuman = function (arr) {
  alternativa alla prima funz
const newArr= arr.map(i=>(i<=2 ? i*2:i*4));
   console.log(newArr);

  const newArr = arr.map(function (i) {
    if(i<=2){
      return i*2
    }else{
      return 16+i*4
    }
  });
  console.log(newArr);
  let newArr2=newArr.filter(function(i){
    return i>=18;
  })
  console.log(newArr2);

  let average=newArr2.reduce(function(a,i){
  
    return a+i/newArr2.length;
  },0)
  console.log(average);
};

calcAverageHuman([5, 2, 4, 1, 15, 8, 3]);
*/
/*
CHALLENGE 3
const calcAverageHuman = arr =>
  arr
    .map(i => (i <= 2 ? i * 2 :16+ i * 4))
    .filter(i => i >= 18)
    .reduce((a, i,age,arr) => a + i / arr.length, 0);
console.log(calcAverageHuman([5, 2, 4, 1, 15, 8, 3]));

const a=calcAverageHuman([5, 2, 4, 1, 15, 8, 3]);
console.log(a);*/
/*
// METODO FLAT PER CALCOLARE LA SOMMA DI TUTTI I CONTI 
const accountMovement=accounts.map(i=>i.movements)
console.log(accountMovement);
const a=accountMovement.flat();
console.log(a);
let b=a.reduce((a,i)=>i+a,0)
console.log(b);

//Alternativa

const c=[...account1.movements,...account2.movements,...account3.movements,...account4.movements]
console.log(c);
let d=a.reduce((a,i)=>i+a,0)
console.log(d);

//Alternativa 2 

const acc2=accounts.flatMap(i=>i.movements)
console.log(acc2);
let e=a.reduce((a,i)=>i+a,0)
console.log(e);

//Alternativa 3

let a= account1.movements.concat(account2.movements,account3.movements,account4.movements)
console.log(a);

*/

