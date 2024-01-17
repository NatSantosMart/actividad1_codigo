/***** INICIO DECLARACIÓN DE VARIABLES GLOBALES *****/
// Array de palos
let palos = ["viu", "cua", "hex", "cir"];
// Array de número de cartas
//let numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
// En las pruebas iniciales solo se trabajará con cuatro cartas por palo:
let numeros = [9, 10, 11, 12];

// paso (top y left) en pixeles de una carta a la siguiente en un mazo
let paso = 5;

// Tapetes				
let tapeteInicial   = document.getElementById("inicial");
let tapeteSobrantes = document.getElementById("sobrantes");
let tapeteReceptor1 = document.getElementById("receptor1");
let tapeteReceptor2 = document.getElementById("receptor2");
let tapeteReceptor3 = document.getElementById("receptor3");
let tapeteReceptor4 = document.getElementById("receptor4");

// Mazos
let mazoInicial   = [];
let mazoSobrantes = [];
let mazoReceptor1 = [];
let mazoReceptor2 = [];
let mazoReceptor3 = [];
let mazoReceptor4 = [];

// Contadores de cartas
let contInicial     = document.getElementById("contador_inicial");
let contSobrantes   = document.getElementById("contador_sobrantes");
let contReceptor1   = document.getElementById("contador_receptor1");
let contReceptor2   = document.getElementById("contador_receptor2");
let contReceptor3   = document.getElementById("contador_receptor3");
let contReceptor4   = document.getElementById("contador_receptor4");
let contMovimientos = document.getElementById("contador_movimientos");

// Tiempo
let contTiempo; // span cuenta tiempo
let segundos 	 = 0;    // cuenta de segundos
let temporizador = null; // manejador del temporizador
let contador     = 0;    // contador de cartas

/***** FIN DECLARACIÓN DE VARIABLES GLOBALES *****/
document.addEventListener("DOMContentLoaded", comenzarJuego);

//Drag & Drop

//Objeto que se mueve
configurarDragAndDropEmisor(); 

//Objeto que recibe la carta
configurarDragAndDropReceptor(tapeteSobrantes, mazoSobrantes, contSobrantes, 'Sobrante')
configurarDragAndDropReceptor(tapeteReceptor1, mazoReceptor1, contReceptor1, 'Receptor')
configurarDragAndDropReceptor(tapeteReceptor2, mazoReceptor2, contReceptor2, 'Receptor')
configurarDragAndDropReceptor(tapeteReceptor3, mazoReceptor3, contReceptor3, 'Receptor')
configurarDragAndDropReceptor(tapeteReceptor4, mazoReceptor4, contReceptor4, 'Receptor')

function configurarDragAndDropEmisor() {
    tapeteInicial.ondragstart = al_mover; 
	tapeteInicial.ondrag = function(e) { }; 
	tapeteInicial.ondragend = function() { }; 
}
function configurarDragAndDropReceptor(tapete_receptor, mazo_receptor, cont_receptor, tipoTapete) {
    tapete_receptor.ondragenter = function(e) { e.preventDefault(); };
	tapete_receptor.ondragover = function(e) { e.preventDefault(); };
	tapete_receptor.ondragleave = function(e) { e.preventDefault(); };
	tapete_receptor.ondrop = function (e) {
		soltar(e,  tapeteInicial, tapete_receptor, mazoInicial, mazo_receptor, contInicial, cont_receptor, tipoTapete);
	};
}

// Rutina asociada a boton reset
/*** !!!!!!!!!!!!!!!!!!! CODIGO !!!!!!!!!!!!!!!!!!!! **/


// El juego arranca ya al cargar la página: no se espera a reiniciar
/*** !!!!!!!!!!!!!!!!!!! CODIGO !!!!!!!!!!!!!!!!!!!! **/

// Desarrollo del comienzo de juego
function comenzarJuego() {
	/* Crear baraja, es decir crear el mazoInicial. Este será un array cuyos 
	elementos serán elementos HTML <img>, siendo cada uno de ellos una carta.
	Sugerencia: en dos bucles for, bárranse los "palos" y los "numeros", formando
	oportunamente el nombre del fichero png que contiene a la carta (recuérdese poner
	el path correcto en la URL asociada al atributo src de <img>). Una vez creado
	el elemento img, inclúyase como elemento del array mazoInicial. 
	*/

	//Crear mazoInicial
	cargarMazoInicial(); 
	
    document.getElementById('reset').addEventListener('click', resetGame);

	contTiempo = document.getElementById("contador_tiempo"); 

	document.getElementById('reset-end').addEventListener('click', () => {document.getElementById('modal-endgame').style.display = "none"; resetGame()});
	
	// Barajar y dejar mazoInicial en tapete inicial
	barajar(mazoInicial); 
	cargarTapeteInicial(mazoInicial);

	// Puesta a cero de contadores de mazos
	setContador(contSobrantes, 0)
	setContador(contReceptor1, 0)
	setContador(contReceptor2, 0)
	setContador(contReceptor3, 0)
	setContador(contReceptor4, 0)
	setContador(contMovimientos, 0)

	
	// Arrancar el conteo de tiempo
	arrancarTiempo();

} 

//Drag & Drop
function al_mover(e) {
	e.dataTransfer.setData( "text/plain/numero", e.target.dataset["numero"] ); 
	e.dataTransfer.setData( "text/plain/palo", e.target.dataset["palo"] ); 
	e.dataTransfer.setData( "text/plain/id", e.target.id );
}
function soltar(e, tapete_origen, tapete_destino, mazo_origen, mazo_destino, cont_origen, cont_destino, tipoTapete) {
    e.preventDefault();

    let numero = e.dataTransfer.getData("text/plain/numero");
    let palo = e.dataTransfer.getData("text/plain/palo");
    let carta_id = e.dataTransfer.getData("text/plain/id");

    // Obtener la carta que se está moviendo
    let carta = getCartaFromId(carta_id, numero, palo); 

    // Estilos CSS de la carta en tapete destino
    carta.style.position = "absolute";
    carta.style.top = "50%";
    carta.style.left = "50%";
    carta.style.transform = "translate(-50%, -50%)";
    carta.style.width = '62%';

	// Comprobar que existe carta en mazo origen
	let index = mazo_origen.findIndex(c => c.id === carta_id);
	if (index !== -1) {

		// Comprobar si la carta movida es la última del mazo original
		if (index === mazo_origen.length - 1) {
			validarCondicionesMovimiento(carta, tapete_origen, tapete_destino, mazo_origen, 
										mazo_destino, cont_origen, cont_destino, tipoTapete)
		}
	}
}

function validarCondicionesMovimiento (carta, tapete_origen, tapete_destino, mazo_origen, mazo_destino, cont_origen, cont_destino, tipoTapete) {

	let numeroNuevaCarta = carta.getAttribute('data-numero'); 
	let paloNuevaCarta = carta.getAttribute('data-palo'); 

	//Se quiere depositar en mazo receptor
	if(tipoTapete == 'Receptor'){
		//los tapetes receptores vacíos solo aceptan cartas con el número 12
		if(mazo_destino.length == 0){
			if(numeroNuevaCarta == 12){
				insertarCartaEnTapete(carta, tapete_destino, mazo_destino, cont_destino)
				eliminarCartaEnTapete (carta, tapete_origen, mazo_origen, cont_origen)
			}
		} else {
			let ultimaCartaMazo = mazo_destino[mazo_destino.length -1];
			let numeroUltimaCartaMazo = ultimaCartaMazo.getAttribute('data-numero'); 
			let paloUltimaCartaMazo = ultimaCartaMazo.getAttribute('data-palo'); 

			let tieneColorGrisUltimaCarta = (paloUltimaCartaMazo == "hex" || paloUltimaCartaMazo == "cir") ? true : false; 
			let tieneColorGrisNuevaCarta = (paloNuevaCarta == "hex" || paloNuevaCarta == "cir") ? true : false; 

			//Número inmediatamente inferior y color diferente al del mazo destino
			if((numeroUltimaCartaMazo - 1 == numeroNuevaCarta) && (tieneColorGrisUltimaCarta != tieneColorGrisNuevaCarta)){
				insertarCartaEnTapete(carta, tapete_destino, mazo_destino, cont_destino)
				eliminarCartaEnTapete (carta, tapete_origen, mazo_origen, cont_origen)
			}
		}
	} 
	
	//Se quiere depositar en mazo sobrante
	else {
		insertarCartaEnTapete(carta, tapete_destino, mazo_destino, cont_destino)
		eliminarCartaEnTapete (carta, tapete_origen, mazo_origen, cont_origen)
	}
}


/**
	Se debe encargar de arrancar el temporizador: cada 1000 ms se
	debe ejecutar una función que a partir de la cuenta autoincrementada
	de los segundos (segundos totales) visualice el tiempo oportunamente con el 
	format hh:mm:ss en el contador adecuado.

	Para descomponer los segundos en horas, minutos y segundos pueden emplearse
	las siguientes igualdades:

	segundos = truncar (   segundos_totales % (60)                 )
	minutos  = truncar ( ( segundos_totales % (60*60) )     / 60   )
	horas    = truncar ( ( segundos_totales % (60*60*24)) ) / 3600 )

	donde % denota la operación módulo (resto de la división entre los operadores)

	Así, por ejemplo, si la cuenta de segundos totales es de 134 s, entonces será:
	   00:02:14

	Como existe la posibilidad de "resetear" el juego en cualquier momento, hay que 
	evitar que exista más de un temporizador simultáneo, por lo que debería guardarse
	el resultado de la llamada a setInterval en alguna variable para llamar oportunamente
	a clearInterval en su caso.   
*/

function resetGame(){
	[contInicial, contSobrantes, contReceptor1, contReceptor2, contReceptor3, contReceptor4, contMovimientos].forEach((contador) => setContador(contador, 0));

    // Restablecimiento de mazos
    [mazoInicial, mazoSobrantes, mazoReceptor1, mazoReceptor2, mazoReceptor3, mazoReceptor4].forEach((mazo) => mazo.length = 0);

	// Restablecimiento de tapetes borrando las posibles cartas que tengan asociadas
    [tapeteInicial, tapeteSobrantes, tapeteReceptor1, tapeteReceptor2, tapeteReceptor3, tapeteReceptor4].forEach((tapete) => {
        while (tapete.lastChild && tapete.lastChild.tagName === "IMG") {
            tapete.removeChild(tapete.lastChild)
        }
    });

	// Creación del mazo inicial de juego
    cargarMazoInicial()

    // Barajar y cargar el mazoInicial en el tapete inicial
    barajar(mazoInicial);
    cargarTapeteInicial(mazoInicial);

	arrancarTiempo();
}

function cargarMazoInicial(){
	palos.forEach(palo => {
        numeros.forEach(numero => {
            let imgElement = new Image();
            imgElement.src = `imagenes/baraja/${numero}-${palo}.png`;
            imgElement.id = `${numero}-${palo}`;
            imgElement.alt = `${numero}-${palo}`;
            imgElement.setAttribute('data-numero', numero.toString());
            imgElement.setAttribute('data-palo', palo);

            mazoInicial.push(imgElement);
        });
    });
	
}
function getCartaFromId(carta_id, numero, palo) {
	let carta = new Image();
    carta.src = 'imagenes/baraja/' + carta_id + '.png';
    carta.id = carta_id;
    carta.alt = carta_id;
    carta.setAttribute('data-numero', numero.toString());
    carta.setAttribute('data-palo', palo);

	return carta; 
}

function arrancarTiempo(){
	
	if (temporizador) clearInterval(temporizador);
    let hms = function (){
			let seg = Math.trunc( segundos % 60 );
			let min = Math.trunc( (segundos % 3600) / 60 );
			let hor = Math.trunc( (segundos % 86400) / 3600 );
			let tiempo = ( (hor<10)? "0"+hor : ""+hor ) 
						+ ":" + ( (min<10)? "0"+min : ""+min )  
						+ ":" + ( (seg<10)? "0"+seg : ""+seg );
			setContador(contTiempo, tiempo);
            segundos++;
		}
	segundos = 0;
    hms(); // Primera visualización 00:00:00
	temporizador = setInterval(hms, 1000);    	
}


/**
	Si mazo es un array de elementos <img>, en esta rutina debe ser
	reordenado aleatoriamente. Al ser un array un objeto, se pasa
	por referencia, de modo que si se altera el orden de dicho array
	dentro de la rutina, esto aparecerá reflejado fuera de la misma.
*/
function barajar(mazo) {	
	mazo.sort(() => Math.random() - 0.5);
} // barajar



/**
 	En el elemento HTML que representa el tapete inicial (variable tapeteInicial)
	se deben añadir como hijos todos los elementos <img> del array mazo.
	Antes de añadirlos, se deberían fijar propiedades como la anchura, la posición,
	coordenadas top y left, algun atributo de tipo data-...
	Al final se debe ajustar el contador de cartas a la cantidad oportuna
*/
function cargarTapeteInicial(mazo) {
	
	mazo.forEach((carta, index) => {
        carta.style.position = 'absolute';
        carta.style.left = index * paso * 1.5  + 'px';
		carta.style.top = index * paso *2.5 + 'px';
		
		carta.style.width = '20%'; 
        if(tapeteInicial){
			tapeteInicial.appendChild(carta);
		}
    });

    // Ajustar el contador de cartas en el tapete inicial
    setContador(contInicial, mazo.length);	
} 

function actualizarTapeteInicial() {
    // Limpiar el tapeteInicial
    tapeteInicial.innerHTML = '';

    // Cargar las cartas restantes del mazoInicial en el tapeteInicial
    cargarTapeteInicial(mazoInicial);
}

/**
 	Esta función debe incrementar el número correspondiente al contenido textual
   	del elemento que actúa de contador
*/
function incContador(){
	contador ++;	
} 

/**
	Idem que anterior, pero decrementando 
*/
function decContador(){
	contador --;
} 

/**
	Similar a las anteriores, pero ajustando la cuenta al
	valor especificado
*/
function setContador(contador, valor) {
	if(contador){
		contador.textContent = valor.toString();
	}	
} 

function insertarCartaEnTapete(carta, tapete_destino, mazo_destino, cont_destino){
	tapete_destino.appendChild(carta);
	mazo_destino.push(carta);
	cont_destino.incContador = function() {
		incContador();
	};
	contMovimientos.textContent = (parseInt(contMovimientos.textContent) + 1).toString();
	setContador(cont_destino, mazo_destino.length);
	console.log(mazoSobrantes.length)
	if (mazoInicial.length === 0 && mazoSobrantes.length === 0) {
        finalizarJuego();
		console.log("ha entrado")
    } else if (mazoInicial.length === 1) {
		console.log("ha entrado aqui")
        // Si no quedan cartas en el tapete sobrante pero aún no ha finalizado el juego se barajan y se disponen en el tapete incial de nuevo
        mazoInicial = [...mazoSobrantes];
		console.log(mazoInicial)
        mazoSobrantes = [];
        setContador(contSobrantes, 0);
        barajar(mazoInicial);
        cargarTapeteInicial(mazoInicial);
    }
}
function eliminarCartaEnTapete (carta, tapete_origen, mazo_origen, cont_origen){
	mazo_origen.pop();
	cont_origen.decContador = function() {
		decContador();
	};
	setContador(cont_origen, mazo_origen.length);
	
	actualizarTapeteInicial();
}

function finalizarJuego(){
	if(temporizador) clearInterval(temporizador)
    document.getElementById('modal-endgame').style.display = "block";
    document.getElementById('resumen-movimientos').innerText = contMovimientos.innerText;
    document.getElementById('resumen-tiempo').innerText = contTiempo.innerText;
}