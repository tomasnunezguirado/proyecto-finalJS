const URL = "https://min-api.cryptocompare.com/data/pricehistorical?tsyms=USD&fsym="

const inversionUsuario = {
    fechaInicio: '',
    fechaFin: '',
    montoUSD: '',
    periodoTiempo: '',
    criptoOpcion: ''
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

const inputFormFechaInicio = document.getElementById('formFechaInicio')
const inputFormFechaFin = document.getElementById('formFechaFin')
const inputFormMontoUSD = document.getElementById('formMontoUSD')
const inputFormPeriodo = document.getElementById('formPeriodo')
const inputFormCripto = document.getElementById('formCripto')
const inputFormCalcular = document.getElementById('formCalcularInversion')
const inputFormReiniciar = document.getElementById('formReiniciarFormulario')
const outputFormROI = document.getElementById('formOutputROI')
const outputFormDCA = document.getElementById('formOutputDCA')
const outputFormCripto = document.getElementById('formOutputCripto')
const outputFormUSD = document.getElementById('formOutputUSD')

function buscarPrecio(fecha, activo) {
    
    let horaUnix=fecha.getTime().toString().substr(0,10)
    let URLFinal = URL + activo + "&ts="+ horaUnix
    let precio = 0
    
    console.log('Consultando API para '+fecha + " y " + activo + " en hora unix " + horaUnix)

    //Configuramos el modo asincrono de ajax porque la API tiene tiempos de respuesta muy lentos
    $.ajaxSetup({
        async:false
      })

    $.get(URLFinal,(response,status) => {
        if(status === 'success') {
            try {

                if(activo=='BTC'){
                    console.log(response.BTC.USD)
                    precio=response.BTC.USD
                }
                if(activo=='ETH'){
                    console.log(response.ETH.USD)
                    precio=response.ETH.USD
                }
                if(activo=='ADA'){
                    console.log(response.ADA.USD)
                    precio=response.ADA.USD
                }
            } catch (error) {
                console.log("Problemas con la conexión al Api...")
                Swal.fire({
                    icon:'error',
                    title:'Error de conexión con el API',
                    text:'Hubo un problema de conexión con el API de precios, por favor vuelva a intentarlo.'
                })
                throw new Error(response)
            }
        }
    })
    return precio;
}

function pedirDatos(){

    if (isNaN(inversionUsuario.fechaInicio) || (inversionUsuario.fechaInicio < new Date ("07/18/2010")) || (inversionUsuario.fechaInicio > new Date())){ //Si la fecha parseada no es o mayor a 18 de julio de 2010, sale del ciclo y continua
        Swal.fire({
            icon:'error',
            title:'Ingrese una fecha válida',
            text:'Para BTC debe ser superior a 18/07/2010. Para ETH debe ser superior a 16/03/2016. Para ADA debe ser superior a 31/12/2017. En ningún caso puede ser superior a la fecha actual.'
        })
        
        throw new Error(`Fecha inicio ingresada ${inversionUsuario.fechaInicio} no es correcta.`)
    }
          
    if (isNaN(inversionUsuario.fechaFin) || (inversionUsuario.fechaFin < new Date ("07/18/2010")) || (inversionUsuario.fechaInicio > new Date())){ //Si la fecha parseada no es NaN, sale del ciclo
        Swal.fire({
            icon:'error',
            title:'Ingrese una fecha válida',
            text:'Para BTC debe ser superior a 18/07/2010. Para ETH debe ser superior a 16/03/2016. Para ADA debe ser superior a 31/12/2017. En ningún caso puede ser superior a la fecha actual.'
        })
        throw new Error(`Fecha fin ingresada ${inversionUsuario.fechaFin} no es correcta.`)
    }
        
    if (isNaN(inversionUsuario.montoUSD) || inversionUsuario.montoUSD <=0){
        Swal.fire({
            icon:'error',
            title:'Ingrese un monto en dólares realista',
            text:'Para poder calcular la inversión, es necesario que ingrese un monto en dólares realista.'
        })
        throw new Error(`Monto ingresado ${inversionUsuario.montoUSD} no es correcto.`)
    }
    
    if ((inversionUsuario.periodoTiempo==="Semanal") || (inversionUsuario.periodoTiempo==="Bi-Semanal") || (inversionUsuario.periodoTiempo==="Mensual") ) {
    
    } else {
        Swal.fire({
            icon:'error',
            title:'Seleccione un período de tiempo',
            text:'Para poder calcular la inversion, es necesario que seleccione un período de tiempo.'
        })

        throw new Error(`El periodo de tiempo ingresado ${inversionUsuario.periodoTiempo} no es correcto.`)
    }
    
    if ((inversionUsuario.criptoOpcion==="BTC") || (inversionUsuario.criptoOpcion==="ETH") || (inversionUsuario.criptoOpcion==="ADA")){
    
    } else {
        Swal.fire({
            icon:'error',
            title:'Seleccione la criptomoneda preferida',
            text:'Para poder calcular la inversion, es necesario que seleccione la criptomoneda preferida.'
        })
        throw new Error(`La inversion seleccionada ${inversionUsuario.criptoOpcion} no es correcta.`)
    }
}

function consultaPrecioActivo(fecha, activo){    
    if(activo=="BTC") {
        if(fecha< new Date("07/18/2010")) {  
            Swal.fire({
                icon:'error',
                title:'No existe data historica',
                text:'No existe data historica de precios para la fecha indicada.'
            })
            
            throw new Error(`No existe data historica de BTC antes de la fecha ${fecha}.`)
        }else{
            return buscarPrecio(fecha,"BTC")  
        }
    }else if(activo=="ETH") {
        if(fecha< new Date("03/16/2016")) { 
            Swal.fire({
                icon:'error',
                title:'No existe data historica',
                text:'No existe data historica de precios para la fecha indicada.'
            })
            throw new Error(`No existe data historica de ETH antes de la fecha ${fecha}.`)
        }else{
            return buscarPrecio(fecha,"ETH")
        }
    }else if(activo=="ADA"){
        if(fecha< new Date("12/31/2017")) {
            Swal.fire({
                icon:'error',
                title:'No existe data historica',
                text:'No existe data historica de precios para la fecha indicada.'
            })
            throw new Error(`No existe data historica de ADA antes de la fecha ${fecha}.`)
        }else{
            return buscarPrecio(fecha,"ADA")
        }
    }else{
        throw new Error(`No existe el activo ${activo}.`)
    }
}

async function calcularInversion(fechainicial, fechafinal, monto, periodo, activo){
    let fechaActual=new Date(fechainicial)
    let valorDCACripto=0
    let valorDCAUSD=0
    let outputDCAHoy=0

    $("body").addClass("loading");
    console.log("loading.....")

    await sleep(200)

    switch(periodo){
        case "Semanal": 
            while(fechaActual<fechafinal){ 
                valorDCACripto=valorDCACripto+(parseFloat(monto)/consultaPrecioActivo(fechaActual,activo)) 
                valorDCAUSD=valorDCAUSD+parseFloat(monto) 
                console.log(valorDCACripto)
                fechaActual.setDate(fechaActual.getDate()+7) 
                
                if(fechaActual>=fechafinal){
                    break
                }
            }
            break;
        case "Bi-Semanal": 
            while(fechaActual<fechafinal){ 
                
                valorDCACripto=valorDCACripto+(parseFloat(monto)/consultaPrecioActivo(fechaActual,activo)) 
                valorDCAUSD=valorDCAUSD+parseFloat(monto) 
                            
                fechaActual.setDate(fechaActual.getDate()+14) 
            
                if(fechaActual>=fechafinal){ 
                    break
                }
            }
            break
        case "Mensual": 
            while(fechaActual<fechafinal){ 
                    
                valorDCACripto=valorDCACripto+(parseFloat(monto)/consultaPrecioActivo(fechaActual,activo)) 
                valorDCAUSD=valorDCAUSD+parseFloat(monto)
                            
                fechaActual.setDate(fechaActual.getDate()+30) 
            
                if(fechaActual>=fechafinal){ 
                    break
                }
            
            }
            break
        }
        
        outputDCAHoy=valorDCACripto*consultaPrecioActivo(new Date(),activo)
    
    await sleep(200)
    console.log("quitando loading")
    $("body").removeClass("loading");
    mostrarResultados(fechainicial, fechafinal, monto, periodo, activo, valorDCAUSD, valorDCACripto, outputDCAHoy)
}

function mostrarResultados(fechaInicio, fechaFin, montoUSD, periodoTiempo, criptoOpcion, outputUSD, outputCriptoDCA, outputDCAHoy){
    let ROI = ((outputDCAHoy - outputUSD)/outputUSD) * 100

    outputFormROI.innerHTML = `${ROI.toFixed(2)} %`
    outputFormDCA.innerHTML = `${outputDCAHoy.toFixed(2)} $`
    outputFormCripto.innerHTML = `${outputCriptoDCA.toFixed(4)} ${criptoOpcion}`
    outputFormUSD.innerHTML = `${outputUSD.toFixed(2)} $`
   
    const historicoInversion = {
        inicio:fechaInicio,
        fin:fechaFin,
        monto:montoUSD,
        periodo:periodoTiempo,
        moneda:criptoOpcion,
        cripto:outputCriptoDCA,
        dca:outputDCAHoy
    }
    localStorage.setItem(Date.now(), JSON.stringify(historicoInversion))
}

$("#formCalcularInversion").on('click', () => {
    inversionUsuario.fechaInicio=new Date(inputFormFechaInicio.value)
    inversionUsuario.fechaFin=new Date(inputFormFechaFin.value)
    inversionUsuario.montoUSD=inputFormMontoUSD.value
    inversionUsuario.periodoTiempo=inputFormPeriodo.value
    inversionUsuario.criptoOpcion=inputFormCripto.value

    pedirDatos()

    //Probamos que el acceso al API este correcto. Si esta OK, continuamos, sino, mandamos mensaje de error
    $.get(URL).done(function () {
        calcularInversion(inversionUsuario.fechaInicio,inversionUsuario.fechaFin,inversionUsuario.montoUSD,inversionUsuario.periodoTiempo,inversionUsuario.criptoOpcion)
      }).fail(function () {
        Swal.fire({
            icon:'error',
            title:'Error de conexión con el API',
            text:'Hubo un problema de conexión con el API de precios, por favor vuelva a intentarlo mas tarde.'
        })
      });
})

$("#formReiniciarFormulario").on('click', ()  => {
    inputFormFechaInicio.value=""
    inputFormFechaFin.value=""
    inputFormMontoUSD.value=""
    inputFormPeriodo.value=inputFormPeriodo.firstElementChild.value
    inputFormCripto.value=inputFormCripto.firstElementChild.value
})

if(localStorage.length>0) {
    for (let i=0; i<localStorage.length;i++ ){
        let clave = localStorage.key(i)
        let historial = JSON.parse(localStorage.getItem(clave))
        let fechaHistorialInicio = (historial.inicio+"").substr(0,10)
        let fechaHistorialFin = (historial.fin+"").substr(0,10)
        let dcaHistorial = historial.dca+0

        $('#calculoHistorico').append(`
        <div id="calculoHistorico" class="alert alert-primary d-flex align-items-center" role="alert">
            <svg class="bi flex-shrink-0 me-2" width="24" height="24"><use xlink:href="#info-fill"/></svg>
                <div>
                  Invirtiendo ${historial.monto} USD de forma ${historial.periodo} en ${historial.moneda} desde ${fechaHistorialInicio} hasta ${fechaHistorialFin} habrias tenido un beneficio de ${dcaHistorial.toFixed(2)} dólares.
                </div>
            </div>`)

    }
    
}else{
    $('#calculoHistorico').append(`
    <div id="calculoHistorico" class="alert alert-warning d-flex align-items-center" role="alert">
        <svg class="bi flex-shrink-0 me-2" width="24" height="24"><use xlink:href="#exclamation-triangle-fill"/></svg>
            <div>
              No hay calculos históricos realizados. Por favor, realiza un calculo de inversión y cuando vuelvas a cargar la página, apareceran aquí.
            </div>
        </div>`)
}
