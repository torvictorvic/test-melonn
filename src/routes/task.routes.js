const express = require('express');
const axios = require('axios');
const router = express.Router();


// Data Local Melonn
let dataMelonn = []


// Melonn
const melonnUrl = "https://yhua9e1l30.execute-api.us-east-1.amazonaws.com/sandbox/"
const melonnKey = "oNhW2TBOlI1t4kWb3PEad1K1S1KxKuuI3GX6rGvT"
let businessDay = true
let nextBusinessDays = []

let dataNull = {}
dataNull.packPromiseMin = "NULL"
dataNull.packPromiseMax = "NULL"
dataNull.shipPromiseMin = "NULL"
dataNull.shipPromiseMax = "NULL"
dataNull.deliveryPromiseMin = "NULL"
dataNull.deliveryPromiseMax = "NULL"
dataNull.readyPickupPromiseMin = "NULL"
dataNull.readyPickupPromiseMax = "NULL"

let dataJson = {}


// Melonn: Get all ShippingMethods
router.get('/melonnShippingMethods', async (req, res) => {

    var config = {
      method: 'get',
      url: melonnUrl + "/shipping-methods",
      headers: { 
        'x-api-key': melonnKey
      }
    };

    axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
          res.json(response.data);
        })
        .catch(function (error) {
          console.log(error);
        });

});


// GET all dataMelonn
router.get('/', async (req, res) => {
    res.json(dataMelonn);
});


// ADD a new task
router.post('/addOrder', async (req, res) => {

    let dataJ = req.body

    if ( parseInt(dataJ.shippingMethod) > 0  ) {
      var config = {
        method: 'get',
        url: melonnUrl + "/shipping-methods/"+dataJ.shippingMethod,
        headers: { 
          'x-api-key': melonnKey
        }
      };

      axios(config)
        .then(function (response) {

          let day = new Date()
          let dateFull = day.getFullYear() + "-" + (String(day.getMonth()+1).padStart(2, "0")) + "-" + (String(day.getDate()).padStart(2, "0"))
          
          dataJson = dataJ
          dataJson.creationDate = dateFull
          dataJson.internalOrder = "MSE" + String(Math.round(day.getTime() / 1000)) + String(getRandomInt(0, 100)).padStart(3, "0")

          // Do validations
          findDateBusinessVal(dateFull, day.getHours(), response.data)
          
          // Note: Replaced "async / await" by problems
          nIntervId = setInterval(function () {
            if (dataJson.promise !== undefined ) {
              // v.displayFirstDayCalendar();
              console.log( new Date() )
              console.log( JSON.stringify(dataJson.promise) )
              dataMelonn.push(dataJson)
              clearInterval(nIntervId);
              res.json({status: 'Order Saved'});
            }
          }, 100);

          
          
        })
        .catch(function (error) {
          console.log(error);
      });
    } else {
        console.log("Error: shipping methods = 0");
    }

});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// Validations of time && Business day
function findDateBusinessVal(dateFull, hour, shippingM) {

    var config = {
      method: 'get',
      url: melonnUrl + "off-days/",
      headers: { 
        'x-api-key': melonnKey
      }
    };

    
    axios(config)
      .then(function (response) {

        // Validate if business day
        businessDay = businessDayValidate(dateFull, response.data)
        nextBusinessDays = nextBusinessDaysGenerate(dateFull, response.data)
        // dataJson.productsTotalWeight = 10000

        if ( parseInt(dataJson.productsTotalWeight) >= parseInt(shippingM.rules.availability.byWeight.min) && parseInt(dataJson.productsTotalWeight) <= parseInt(shippingM.rules.availability.byWeight.max)  ) {
          if ( shippingM.rules.availability.byRequestTime.dayType === "BUSINESS" && businessDay === false ) {
            dataJson.promise = dataNull
          } else {

              if ( shippingM.rules.availability.byRequestTime.dayType === "ANY" || (shippingM.rules.availability.byRequestTime.dayType === "BUSINESS" && businessDay === true) ) {
                
                if ( parseInt(hour) >= parseInt(shippingM.rules.availability.byRequestTime.fromTimeOfDay) && parseInt(hour) <= parseInt(shippingM.rules.availability.byRequestTime.toTimeOfDay) ) {

                  if ( shippingM.rules.promisesParameters.cases[0].priority === 1 && typeof(shippingM.rules.promisesParameters.cases[0]) === "object" ) {
                    
                    // businessDay = false
                    // shippingM.rules.promisesParameters.cases[0].condition.byRequestTime.dayType = "BUSINESS"

                    if ( shippingM.rules.promisesParameters.cases[0].condition.byRequestTime.dayType === "ANY" || (shippingM.rules.promisesParameters.cases[0].condition.byRequestTime.dayType === "BUSINESS" && businessDay === true ) ) {

                      // Validations of time && pack. "priority": 1
                      findDatePackVal(0, dateFull, hour, shippingM)
                      
                    } else {
                      if ( shippingM.rules.promisesParameters.cases.length === 2 && typeof(shippingM.rules.promisesParameters.cases[1]) === "object" ) {
                        // Validations of time && pack. "priority": 2
                        findDatePackVal(1, dateFull, hour, shippingM)
                      } else {
                        dataJson.promise = dataNull
                      }
                    }
                  } else {
                    dataJson.promise = dataNull
                  }
                } else {
                  dataJson.promise = dataNull
                }
              } else {
                dataJson.promise = dataNull
              }
          }
        } else {
          dataJson.promise = dataNull
        }

      
      })
      .catch(function (error) {
        console.log(error);
    });
}

// Validations of time && pack
function findDatePackVal(pos, dateFull, hour, shippingM) {

    let data = {}
    data.packPromiseMin = "NULL"
    data.packPromiseMax = "NULL"
    data.shipPromiseMin = "NULL"
    data.shipPromiseMax = "NULL"
    data.deliveryPromiseMin = "NULL"
    data.deliveryPromiseMax = "NULL"
    data.readyPickupPromiseMin = "NULL"
    data.readyPickupPromiseMax = "NULL"

    if ( parseInt(hour) >= parseInt(shippingM.rules.promisesParameters.cases[pos].condition.byRequestTime.fromTimeOfDay) && parseInt(hour) <= parseInt(shippingM.rules.promisesParameters.cases[pos].condition.byRequestTime.toTimeOfDay) ) {

        let time1 = new Date();
        let time2 = time1.getHours() + ":" + time1.getMinutes() + ":" + time1.getSeconds()

        let minType = shippingM.rules.promisesParameters.cases[pos].packPromise.min.type
        let maxType = shippingM.rules.promisesParameters.cases[pos].packPromise.max.type
        let minTypeS = shippingM.rules.promisesParameters.cases[pos].shipPromise.min.type
        let maxTypeS = shippingM.rules.promisesParameters.cases[pos].shipPromise.max.type
        let minTypeD = shippingM.rules.promisesParameters.cases[pos].deliveryPromise.min.type
        let maxTypeD = shippingM.rules.promisesParameters.cases[pos].deliveryPromise.max.type
        let minTypeP = shippingM.rules.promisesParameters.cases[pos].readyPickUpPromise.min.type
        let maxTypeP = shippingM.rules.promisesParameters.cases[pos].readyPickUpPromise.max.type


        // Min packPromise
        if ( minType === "NULL" ) {
          data.packPromiseMin = minType
        }

        if ( minType === "DELTA-HOURS" ) {
          let dateFull0 = transformDateTimeZone(dateFull + " " + time2 , "+0")
          data.packPromiseMin = dateFull + " " + addHoursToDateTime(dateFull + " "+ dateFull0, shippingM.rules.promisesParameters.cases[pos].packPromise.min.deltaHours)
        }

        if ( minType === "DELTA-BUSINESSDAYS" ) {
          let datei = nextBusinessDays[shippingM.rules.promisesParameters.cases[pos].packPromise.min.deltaBusinessDays]
          let dateFull0 = transformDateTimeZone(datei + " " + time2, "+0")
          data.packPromiseMin = datei + " " + addHoursToDateTime(datei + " "+ dateFull0, shippingM.rules.promisesParameters.cases[pos].packPromise.min.deltaHours)
        }

        // Max packPromise
        if ( maxType === "NULL" ) {
          data.packPromiseMax = maxType
        }

        if ( maxType === "DELTA-HOURS" ) {
          let dateFull0 = transformDateTimeZone(dateFull + " " + time2 , "+0")
          data.packPromiseMax = dateFull + " " + addHoursToDateTime(dateFull + " "+ dateFull0, shippingM.rules.promisesParameters.cases[pos].packPromise.max.deltaHours)
        }

        if ( maxType === "DELTA-BUSINESSDAYS" ) {
          let datei = nextBusinessDays[shippingM.rules.promisesParameters.cases[pos].packPromise.max.deltaBusinessDays]
          let dateFull0 = transformDateTimeZone(datei + " " + time2, "+0")
          // console.log( addDaysToDateTime(datei + " "+ dateFull0, shippingM.rules.promisesParameters.cases[pos].packPromise.max.timeOfDay) )
          data.packPromiseMax = addDaysToDateTime(datei + " "+ dateFull0, shippingM.rules.promisesParameters.cases[pos].packPromise.max.timeOfDay)
        }


        // Min shipPromise
        if ( minTypeS === "NULL" ) {
          data.shipPromiseMin = minTypeS
        }

        if ( minTypeS === "DELTA-HOURS" ) {
          let dateFull0 = transformDateTimeZone(dateFull + " " + time2 , "+0")
          data.shipPromiseMin = dateFull + " " + addHoursToDateTime(dateFull + " "+ dateFull0, shippingM.rules.promisesParameters.cases[pos].shipPromise.min.deltaHours)
        }

        if ( minTypeS === "DELTA-BUSINESSDAYS" ) {
          let datei = nextBusinessDays[shippingM.rules.promisesParameters.cases[pos].shipPromise.min.deltaBusinessDays]
          let dateFull0 = transformDateTimeZone(datei + " " + time2, "+0")
          data.shipPromiseMin = datei + " " + addHoursToDateTime(datei + " "+ dateFull0, shippingM.rules.promisesParameters.cases[pos].shipPromise.min.deltaHours)
        }


        // Max shipPromise
        if ( maxTypeS === "NULL" ) {
          data.shipPromiseMax = maxTypeS
        }

        if ( maxTypeS === "DELTA-HOURS" ) {
          let dateFull0 = transformDateTimeZone(dateFull + " " + time2 , "+0")
          data.shipPromiseMax = dateFull + " " + addHoursToDateTime(dateFull + " "+ dateFull0, shippingM.rules.promisesParameters.cases[pos].shipPromise.max.deltaHours)
        }

        if ( maxTypeS === "DELTA-BUSINESSDAYS" ) {
          let datei = nextBusinessDays[shippingM.rules.promisesParameters.cases[pos].shipPromise.max.deltaBusinessDays]
          let dateFull0 = transformDateTimeZone(datei + " " + time2, "+0")
          data.shipPromiseMax = addDaysToDateTime(datei + " "+ dateFull0, shippingM.rules.promisesParameters.cases[pos].shipPromise.max.timeOfDay)
        }


        // Min deliveryPromise
        if ( minTypeD === "NULL" ) {
          data.deliveryPromiseMin = minTypeD
        }

        if ( minTypeD === "DELTA-HOURS" ) {
          let dateFull0 = transformDateTimeZone(dateFull + " " + time2 , "+0")
          data.deliveryPromiseMin = dateFull + " " + addHoursToDateTime(dateFull + " "+ dateFull0, shippingM.rules.promisesParameters.cases[pos].deliveryPromise.min.deltaHours)
        }

        if ( minTypeD === "DELTA-BUSINESSDAYS" ) {
          let datei = nextBusinessDays[shippingM.rules.promisesParameters.cases[pos].deliveryPromise.min.deltaBusinessDays]
          let dateFull0 = transformDateTimeZone(datei + " " + time2, "+0")
          data.deliveryPromiseMin = datei + " " + addHoursToDateTime(datei + " "+ dateFull0, shippingM.rules.promisesParameters.cases[pos].deliveryPromise.min.deltaHours)
        }


        // Max deliveryPromise
        if ( maxTypeD === "NULL" ) {
          data.deliveryPromiseMax = maxTypeD
        }

        if ( maxTypeD === "DELTA-HOURS" ) {
          let dateFull0 = transformDateTimeZone(dateFull + " " + time2 , "+0")
          data.deliveryPromiseMax = dateFull + " " + addHoursToDateTime(dateFull + " "+ dateFull0, shippingM.rules.promisesParameters.cases[pos].deliveryPromise.max.deltaHours)
        }

        if ( maxTypeD === "DELTA-BUSINESSDAYS" ) {
          let datei = nextBusinessDays[shippingM.rules.promisesParameters.cases[pos].deliveryPromise.max.deltaBusinessDays]
          let dateFull0 = transformDateTimeZone(datei + " " + time2, "+0")
          data.deliveryPromiseMax = addDaysToDateTime(datei + " "+ dateFull0, shippingM.rules.promisesParameters.cases[pos].deliveryPromise.max.timeOfDay)
        }


        // Min deliveryPromise
        if ( minTypeP === "NULL" ) {
          data.readyPickPromiseMin = minTypeP
        }

        if ( minTypeP === "DELTA-HOURS" ) {
          let dateFull0 = transformDateTimeZone(dateFull + " " + time2 , "+0")
          data.readyPickPromiseMin = dateFull + " " + addHoursToDateTime(dateFull + " "+ dateFull0, shippingM.rules.promisesParameters.cases[pos].readyPickUpPromise.min.deltaHours)
        }

        if ( minTypeP === "DELTA-BUSINESSDAYS" ) {
          let datei = nextBusinessDays[shippingM.rules.promisesParameters.cases[pos].readyPickUpPromise.min.deltaBusinessDays]
          let dateFull0 = transformDateTimeZone(datei + " " + time2, "+0")
          data.readyPickPromiseMin = datei + " " + addHoursToDateTime(datei + " "+ dateFull0, shippingM.rules.promisesParameters.cases[pos].readyPickUpPromise.min.deltaHours)
        }


        // Max deliveryPromise
        if ( maxTypeP === "NULL" ) {
          data.readyPickPromiseMax = maxTypeP
        }

        if ( maxTypeP === "DELTA-HOURS" ) {
          let dateFull0 = transformDateTimeZone(dateFull + " " + time2 , "+0")
          data.readyPickPromiseMax = dateFull + " " + addHoursToDateTime(dateFull + " "+ dateFull0, shippingM.rules.promisesParameters.cases[pos].readyPickUpPromise.max.deltaHours)
        }

        if ( maxTypeP === "DELTA-BUSINESSDAYS" ) {
          let datei = nextBusinessDays[shippingM.rules.promisesParameters.cases[pos].readyPickUpPromise.max.deltaBusinessDays]
          let dateFull0 = transformDateTimeZone(datei + " " + time2, "+0")
          data.readyPickPromiseMax = addDaysToDateTime(datei + " "+ dateFull0, shippingM.rules.promisesParameters.cases[pos].readyPickUpPromise.max.timeOfDay)
        }

        dataJson.promise = data
        /*
        console.log( "pos: " + pos )
        console.log( "packPromiseMin: " + data.packPromiseMin )
        console.log( "packPromiseMax: " + data.packPromiseMax )
        console.log( "shipPromiseMin: " + data.shipPromiseMin )
        console.log( "shipPromiseMax: " + data.shipPromiseMax )
        console.log( "deliveryPromiseMin: " + data.deliveryPromiseMin )
        console.log( "deliveryPromiseMax: " + data.deliveryPromiseMax )
        console.log( "readyPickPromiseMin: " + data.readyPickPromiseMin )
        console.log( "readyPickPromiseMax: " + data.readyPickPromiseMax )
        */
        
    } else {
        dataJson.promise = dataNull
    }
}

// Trans Dates to TimeZone specific
function transformDateTimeZone(date, offset) {
      
  // Create Date object for date + time
  let d = new Date(date);

  // Convert to msec
  // Add local time zone offset
  // Get UTC time in msec
  let utc = d.getTime() + d.getTimezoneOffset() * 60000;

  // Create new Date object for different city
  // Using supplied offset
  let nd = new Date(utc + 3600000 * offset);

  // Return time as a string
  // let time = String(nd.toLocaleString()).split(" ")
  let time = String(nd).split(" ");
  let time2 = String(time[4]).split(":");
  let time3 = time2[0] + ":" + time2[1];
  return time3;
}

// Add Hours To Date Time
function addHoursToDateTime(date, hours) {
  let day = new Date(date);
  day.setHours(day.getHours() + hours);

  // Return time as a string
  let time = String(day).split(" ");
  let time2 = String(time[4]).split(":");
  let time3 = time2[0] + ":" + time2[1];
  return time3;
}

// Add Days To Date Time
function addDaysToDateTime(date, days) {
  let day = new Date(date);
  day.setDate(day.getDate() + days);
  let DateTime = day.getFullYear() + "-" + String(day.getMonth()+ 1).padStart(2, "0") + "-" + String(day.getDate()).padStart(2, "0") +" "+ String(day.getHours()).padStart(2, "0") + ":" + String(day.getMinutes()).padStart(2, "0")
  return DateTime;
}

function businessDayValidate(dateFull, dates) {
  if ( dates.findIndex( (data) => data === dateFull ) >= 0 ) {
      return false
  }
  return true
}

function nextBusinessDaysGenerate(dateFull, dates) {

  let foundDayPos = -1;
  let dateI = dateFull;
  let d = new Date(dateFull);
  let cont = 0
  let datesGen = [] 
  
  do {
    d.setDate(d.getDate() + 1);
    dateI = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    if ( dates.findIndex( (data) => data === dateI ) === -1 ) {
        datesGen.push(dateI)
        cont++
    } 
  } while (cont < 10);
  return datesGen
}

/*
const packNull = async function() {
  let dataNull = {}
  dataNull.packPromiseMin = null
  dataNull.packPromiseMax = null
  dataNull.shipPromiseMin = null
  dataNull.shipPromiseMax = null
  dataNull.deliveryPromiseMin = null
  dataNull.deliveryPromiseMax = null
  dataNull.readyPickupPromiseMin = null
  dataNull.readyPickupPromiseMax = null
  return dataNull
}
*/


module.exports = router;
