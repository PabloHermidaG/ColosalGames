let datosTitulo, datosResena, datosPersonal, datosGrupos;  // Variables para almacenar los datos

const API_KEY= "AIzaSyCYy0cBGhwgAVU_DR8wdvghTewZ0tPha1g";

import { google } from 'googleapis';
import fs from 'fs';
import readline from 'readline';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const TOKEN_PATH = 'token.json'; // Ruta al archivo donde se almacenará el token

const hojaID = "1V6b5HglQo_NMjtRlgb8MLJr1AU_JWdgKVEUfgnm5rDc"; // ID de tu archivo en Google Drive

async function cargarDatosDesdeExcel() {
    const auth = await authorize();
    const drive = google.drive({ version: 'v3', auth });

    try {
        const response = await drive.files.get({
            fileId: hojaID,
            alt: 'media',
        });

        const archivoData = response.data;
        const dataBuffer = Buffer.from(archivoData);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(dataBuffer);

        const hojaPersonal = workbook.getWorksheet('PERSONAL');
        datosPersonal = hojaPersonal.getSheetValues();

        const hojaGrupos = workbook.getWorksheet('GRUPOS');
        datosGrupos = hojaGrupos.getSheetValues();

        const hojaResena = workbook.getWorksheet('RESEÑA');
        datosResena = hojaResena.getSheetValues();

        const hojaTitulo = workbook.getWorksheet('TÍTULO');
        datosTitulo = hojaTitulo.getSheetValues();

        console.log('Datos de PERSONAL:', datosPersonal);
        console.log('Datos de GRUPOS:', datosGrupos);
        console.log('Datos de RESEÑA:', datosResena);
        console.log('Datos de TÍTULO:', datosTitulo);
    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }
}

async function authorize() {
    const oAuth2Client = new google.auth.OAuth2(API_KEY, '', '');
    oAuth2Client.setCredentials({ refresh_token: 'TU_REFRESH_TOKEN' }); // Cambia por tu Refresh Token

    return oAuth2Client;
}

cargarDatosDesdeExcel();

let mensajes = "";

let mensajesAUtilizar = "";

window.addEventListener('load', async function() {
    
    mensajesAUtilizar = await obtenerMensajes();

    document.getElementById("boton").innerHTML = mensajesAUtilizar[0];
    document.getElementById("instructions").innerHTML = mensajesAUtilizar[1];

    document.getElementById("form").style.display = "flex";
    

    let instructions = document.getElementById('instructions');
    let botonReset = document.getElementById('botonReset');
    var cuadroDeTexto = document.getElementById('answerBox');
    cuadroDeTexto.focus();

    let boton = document.getElementById("boton");
    boton.addEventListener("click", function(){
        document.getElementById('form').style.display = 'flex';
        instructions.style.display = 'block';
        botonReset.style.display = 'none';
        document.getElementById('result').innerHTML = "";
        document.getElementById('personal').innerHTML = "";
        document.getElementById('clubResults').innerHTML = '';
    });
});

async function obtenerMensajes(){
  let aux = [datosTitulo[5][1],datosTitulo[6][1]]

  return aux;
}

function extraerInformacion(email_input) {  
  mensajes = [datosTitulo[5][1],datosTitulo[6][1],datosTitulo[7][1],datosTitulo[8][1]]
  //email_input = "lfhg0001@gmail.com"; //Utilizar para hacer pruebas de ejecucion en el logger

  email_input = email_input.toUpperCase();

  if(!esEmailValido(email_input)){
    return "<p class='error'>"+ mensajes[2] +"</p>";
  }

  var registroResena = obtenerRegistro(datosResena, email_input);

  var registroPersonal = obtenerRegistro(datosPersonal, email_input);

  if (!registroResena) {
    return "<p class='error'>"+ mensajes[3] +"</p>";
  }

  var resenaHTML = formatearTablaResena(registroResena);

  var personalHTML = formatearTablaPersonal(registroPersonal);

  var clubesInput = obtenerClubesInput(datosGrupos, email_input);

  var tablasClubes = obtenerTablasClubes(datosGrupos, clubesInput);

  //Logger.log(tablasClubes);

  var tablasHTMLClubes = formatearTablasClubes(tablasClubes,email_input);

  //Logger.log(tablasHTMLClubes);

  var resultado = {
    resena: resenaHTML,
    personal: personalHTML,
    clubes: tablasHTMLClubes
  };

  return resultado;
}

/*
  return [tablaHTML, ...tablasHTMLClubes];
}
*/

function formatearTablaPersonal(valores){
  var outputHtml = "<table class='tabla-club'><tr>";

  var fechas = datosPersonal[1].slice(1);
  
  // Agregar los títulos de las columnas (primer elemento del array)
  var titles = valores[0].slice(1); // Excluir el primer elemento
  for (var i = 0; i < titles.length; i++) {
    if(titles[i] != ""){
      outputHtml += "<th>" + titles[i] + "</th>";
    }
  }
  outputHtml += "</tr>";
  
  // Procesar el resto del array en grupos de 3
  var dataRow = valores[1].slice(1); // Excluir el primer elemento
  for (var j = 0; j < dataRow.length; j += 3) {
    if(esFechaPasada(fechas[j])){
      if(j > dataRow.length-4){
      outputHtml += "<tr class='bold'>";
      }else{
        outputHtml += "<tr>";
      }
      for (var k = j; k < j + 3; k++) {
        if (dataRow[k] !== undefined) {
          outputHtml += "<td>" + dataRow[k] + "</td>";
        } else {
          outputHtml += "<td></td>"; // Agregar celdas vacías si no hay más elementos
        }
      }
      outputHtml += "</tr>";
    }
  }
  
  outputHtml += "</table>";
  
  return outputHtml;
}

function obtenerRegistro(datos, email_input) {
  var encabezados = datos[0];
  
  var registro = [];

  registro.push(encabezados);

  for (var i = 1; i < datos.length; i++) {
    var fila = datos[i];
    var email_form = fila[0];

    email_form = email_form.toUpperCase();

    if (email_form === email_input) {
      registro.push(fila);
    }
  }

  //Comprobamos si es mayor que 1 para devolver nulo en vez de 0 ya que al meter los encabezados siempre va a ser mayor que 0
  return registro.length > 1 ? registro : null;
}

function obtenerTituloResena(){
  //Si esta fecha es pasado, se muestra el título de A2. Si es presente o futuro, se muestra el de A3.
  let aux = esFechaPasada(datosTitulo[0][0]);

  if (aux) {
    return datosTitulo[1][0];
  } else {
    return datosTitulo[2][0];
  }
}

function esFechaPasada(fecha){
  fecha = new Date(fecha);

  let fechaActual = new Date();

 // Comparar las fechas
  if (fecha < fechaActual) {
    return true;
  } else {
    return false;
  } 
}


function formatearTablaResena(registro) {
  //No hace falta que utilicemos 

  var nombre = registro[1][1];
  var estrellas = registro[1][2];
  var comentario = registro[1][3];
  var disfrute = registro[1][4];
  //var frase = registro[1][5];

  var tablaHTML = '<table class="tabla-club">';

  let titulo = obtenerTituloResena();

  tablaHTML += '<caption class="captionTitle">'+titulo+'</caption>';

  let aux = esFechaPasada(datosResena[0][0])
  
  //Si es fecha futura no mostramos la reseña
  if(aux){
    tablaHTML += '<tr>';
    tablaHTML += '<td class="first" style="font-weight:bold;">' + nombre + '</td>';
    tablaHTML += '</tr>';
    
    tablaHTML += '<tr>';
    tablaHTML += '<td class="p0"><span class="estrellas">' + estrellas + ' </span><b>' + comentario+ '</b></td>';
    tablaHTML += '</tr>';
    
    tablaHTML += '<tr>';
    tablaHTML += '<td class="sub">' + disfrute + '</td>';
    tablaHTML += '</tr>';
    
    /*
    tablaHTML += '<tr>';
    tablaHTML += '<td class="p0">' + frase + '</td>';
    tablaHTML += '</tr>';
    */
  }

  tablaHTML += '</table>';
  
  return tablaHTML;
}


function obtenerClubesInput(registro, email_input) {
  let aux = false;

  for(var i = 2; i < registro.length; i++){
    if(email_input == registro[i][0].toUpperCase()){
      aux = registro[i];
    }
  }

  if(!aux){
    return aux;
  }else{
      var clubesInput = aux[1];
      if (typeof clubesInput !== 'string') {
        clubesInput = String(clubesInput);
      };
      return clubesInput.split(" ");
  }
}

/*function obtenerTablasClubes(valores, clubesInput) {
  var tablasClubes = {};

  for (var j = 0; j < valores.length; j++) {
    var fila = valores[j];
    //var correo = fila[0];
    var clubesFila = fila[1] ? fila[1].split(" ") : [];
    
    if (clubesFila.length > 0 && clubesFila.some(club => clubesInput.some(inputClub => inputClub.toLowerCase() === club.toLowerCase()))) {
      var encabezados = valores[0]; // Encabezados de la tabla
      var registro = fila.slice(0, encabezados.length); // Obtener solo los valores correspondientes a los encabezados

      //Logger.log(clubesFila);//Imprime en los logs por si os es de utilidad

      clubesFila.forEach(club => {
        var clubEnClubInput = clubesInput.find(inputClub => inputClub.toLowerCase() === club.toLowerCase()); // Buscar el club con la misma grafía en clubesInput

        if (clubEnClubInput) {
          //var tituloTabla = clubEnClubInput; // Utilizar el mismo nombre del club del jugador como título de la tabla
          if (!tablasClubes[clubEnClubInput]) {
            tablasClubes[clubEnClubInput] = [];
            tablasClubes[clubEnClubInput].push(encabezados); // Agregar encabezados a la tabla del club
          }

          tablasClubes[clubEnClubInput].push(registro); // Agregar registro a la tabla del club
        }
      });
    }
  }

  return tablasClubes;
}*/

function obtenerTablasClubes(valores, clubesInput) {
  var tablasClubes = {};

  let fechaViernes = valores[0][3];
  let fechaSabado = valores[0][4];
  let fechaDomingo = valores[0][5];

  let fechas = [fechaViernes,fechaSabado,fechaDomingo];

  let aux = 0;

  for(let i = 0; i < fechas.length; i++){
    if(esFechaPasada(fechas[i])){
      aux = i;
    }
  }

  //Para que coincida con la columna a los puntos correspondientes le sumamos 3
  aux += 3;

  for (var j = 0; j < valores.length; j++) {
    var fila = valores[j];
    //var correo = fila[0];
    var clubesFila = fila[1] ? fila[1].split(" ") : [];
    
    if (clubesFila.length > 0 && clubesFila.some(club => clubesInput.some(inputClub => inputClub.toLowerCase() === club.toLowerCase()))) {
      var encabezados = valores[0]; // Encabezados de la tabla
      //Menos 3 para quitar los puntos
      var registro = fila.slice(0, encabezados.length-3);
      //Añadimos los puntos correspondientes al dia
      registro.push(fila[aux]);
      //registro.push(fechas);

      //Logger.log(clubesFila);//Imprime en los logs por si os es de utilidad

      clubesFila.forEach(club => {
        var clubEnClubInput = clubesInput.find(inputClub => inputClub.toLowerCase() === club.toLowerCase()); // Buscar el club con la misma grafía en clubesInput

        if (clubEnClubInput) {
          //var tituloTabla = clubEnClubInput; // Utilizar el mismo nombre del club del jugador como título de la tabla
          if (!tablasClubes[clubEnClubInput]) {
            tablasClubes[clubEnClubInput] = [];
          }

          tablasClubes[clubEnClubInput].push(registro); // Agregar registro a la tabla del club
        }
      });
    }
  }

  return tablasClubes;
}

function formatearTablasClubes(tablasClubes, email_input) {
  var tablasHTMLClubes = {};

  for (var club in tablasClubes) {
    var registrosClub = tablasClubes[club];
    var tablaHTMLClub = '<table class="tabla-club">';

    club = club.replace("#", "");

    club = club.toUpperCase();

    tablaHTMLClub += '<th>' + club + '</th> <th> Pts </th>';

    /* Encabezados en una sola columna con separación
    tablaHTMLClub += '<tr>';
    tablaHTMLClub += '<th>' + registrosClub[0].slice(2).join(' / ') + '</th>';
    tablaHTMLClub += '</tr>';*/

    // Registros en una sola columna con separación
    for (var n = 0; n < registrosClub.length; n++) {
      var registroNombre = registrosClub[n][2];
      var registroPts = registrosClub[n][3];

      var registroParaResaltar = registrosClub[n];
      var resaltar = false;

      // Verificar si el correo electrónico del registro coincide con el email_input
      if (registroParaResaltar[0].toLowerCase() === email_input.toLowerCase()) {
        resaltar = true;
      }

      tablaHTMLClub += '<tr' + (resaltar ? ' class="resaltado"' : '') + '>';
      tablaHTMLClub += '<td>' + registroNombre + '</td><td>' + registroPts + '</td>';
      tablaHTMLClub += '</tr>';
    }

    tablaHTMLClub += '</table>';
    tablasHTMLClubes[club] = tablaHTMLClub;
  }

  return tablasHTMLClubes;
}

function esEmailValido(email) {
  var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/*
function extraerInformacion_save(email_input) {
  var hoja = SpreadsheetApp.openById('1u1BFla7n-XYkLA0JWp9vi585-DvutFkif4UsmSKlj5I').getSheetByName('Hoja 1');
  var rango = hoja.getDataRange();
  var valores = rango.getValues();
  var registros = [];

  // Obtener los encabezados de la tabla
  var encabezados = valores[0];

  for (var i = 1; i < valores.length; i++) {
    var fila = valores[i];
    var email_form = fila[0]; // Suponiendo que el email está en la primera columna (índice 0)
    if (email_form === email_input) {
      registros.push(fila);
    }
  }

  // Formatear registros y encabezados como una tabla HTML
  var tablaHTML = '<table>';
  
  // Encabezados
  tablaHTML += '<tr>';
  for (var j = 0; j < encabezados.length; j++) {
    tablaHTML += '<th style="font-weight:bold;">' + encabezados[j] + '</th>';
  }
  tablaHTML += '</tr>';

  // Registros
  for (var k = 0; k < registros.length; k++) {
    tablaHTML += '<tr>';
    for (var l = 0; l < registros[k].length; l++) {
      tablaHTML += '<td>' + registros[k][l] + '</td>';
    }
    tablaHTML += '</tr>';
  }
  
  tablaHTML += '</table>';

  return tablaHTML;
}
*/
