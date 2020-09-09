const https = require('https'), request = require("request"), fs = require('fs');
var CandleFacade = require('./CandleFacade').CandleFacade;


/* SETTINGS */
const VANTAGE_API_KEY = "D0Y9ZR02DFYZ0HAN";
const VANTAGE_PREMIUM_KEY = "TW8HYCEY4TNMDIMR"


/** GLOBALS */
var TICKER_COUNT = 0;
var NUM_RETRIES_ALLOWED = 7;
var retries = 0;
var threeBarPlaysIntros = [];

/** Candle Stick Request Options */
var historyLength = "compact";

const candleStickPriceHistoryOptions = {
    method: "GET"
}

/** START */


var symbolLookUp = process.argv[2];



var symbols = [];
if (symbolLookUp === "1") {
    symbols = ["TRV", "TWTR", "PSNL",
     "DE", "CAT", "MGM", "QD",
      "BAC", "F", "AMD", "USO",
      "PFE", "SBUX",
      "SPY", "APRN", "WHF",
      "INTC", "GE", "W", "AAL", "UAL", "DAL",
      "DK", "T", "NIO", 
      "XOM", "M", "C", "DENN", "ROKU", "DFFN", "CCL", "TOPS", "AMRN",
      "BA", "WFC", "UBER", "MU", "ACB", "X", "NCLH",
      "BP", "PTON", "CPE", "VEA", "JPM", "NLY", "VALE", "SNAP", "UGAZ",
      "IFRX", "BBY", "ADMA", "PLT", "BSGM", "ARNC", "UCO", "SRNE", "ENIA",
      "BNO", "APA", "OIL", "PAYS", "LB", "LVGO", "EQT", "PUMP", "BBBY", "NUS"];
} else if (symbolLookUp === "2") {
    symbols = ["DFFN", "CCL", "TOPS", "AMRN",
    "BA", "WFC", "UBER", "MU", "ACB", "X", "NCLH",
    "BP", "PTON", "CPE", "VEA", "JPM", "NLY", "VALE", "SNAP", "UGAZ"];
} else {
    symbols = ["PUMP"]; // DEBUG SYMBOL
}


console.log(`\nTicker Length:  ${symbols.length}\n`)
symbols.forEach(tickerSymbol => {
    // getStockCandleChart(tickerSymbol, symbols.length, 1);
    getStockCandleChart(tickerSymbol, symbols.length, 5);
    // getStockCandleChart(tickerSymbol, symbols.length, 15)cls;
    // getStockCandleChart(tickerSymbol, symbols.length, 30);

});

function getStockCandleChart(tickerSymbol, numOftickers, timeFrame) {

    var frequency = getFrequencyApi(timeFrame); //The number of the frequencyType to be included in each candle.
    var frequencyKey = getFrequencyKey(timeFrame);

    var candleStickUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${tickerSymbol}&interval=${frequency}&outputsize=${historyLength}&apikey=${VANTAGE_PREMIUM_KEY}`;
    candleStickPriceHistoryOptions.url = candleStickUrl;

    request(candleStickPriceHistoryOptions, function (error, response, body) {
        if (body) {
            let candlesData = JSON.parse(body);
            if (candlesData && candlesData["error"] === undefined && 
                candlesData["Note"] === undefined &&
                candlesData["Error Message"] === undefined) {
                var candles = candlesData[frequencyKey];  
                if (candles) {
                    calculateStonks(candles, tickerSymbol, numOftickers, timeFrame);
                }
            } else {
                console.log("Error: " + tickerSymbol + " - " + candlesData["Error Message"]);
                if (retries <= NUM_RETRIES_ALLOWED) {
                    console.log("Retrying...");
                    retries++;
                    getStockCandleChart(tickerSymbol, numOftickers, timeFrame);
                }
            }
        }
        if (error) {
            console.log("ERROR: " + error);
        }
    });
}


/**
 * Callback function from REST call
 * @param {} candlesData 
 * @param {} tickerSymbol 
 * @param {} numOftickers
 * 
 * PRIORITIES 
 * Height > Price/Volume > Gappage
 * 
 * 
 */
function calculateStonks(candlesDTO, tickerSymbol, numOftickers, timeFrame) {
    var candleFacade = new CandleFacade();
    candleFacade.setCandleChart(candlesDTO, tickerSymbol, timeFrame);

    // isMostRecentCandleWideRanging(candleFacade, timeFrame, numOftickers);

    // findIgnitingBars(candleFacade, numOftickers);

    findThreeBarPlays(candleFacade, numOftickers);
}

function findThreeBarPlays(candleFacade, numOftickers) {
    // findThreeBarPlayIntrosPriceHistory(candleFacade, numOftickers);
    findThreeBarPlayIntrosToday(candleFacade, numOftickers);
}


function findThreeBarPlayIntrosToday(candleFacade, numOftickers) {
    threeBarPlaysIntros.push(candleFacade.findThreeBarPlayIntrosToday());

    TICKER_COUNT++; 
    if (TICKER_COUNT == numOftickers) {
        console.log("Tickers Counted!!\n");
        var flattendedThreeBarPlays = [].concat.apply([], threeBarPlaysIntros);
        sortByDate(flattendedThreeBarPlays);
        flattendedThreeBarPlays.forEach(tbp => {
            tbp.printCandle();
        });
        console.log(`Found ${flattendedThreeBarPlays.length} Three Bar Play Introz\n`);
    }
}

function findThreeBarPlayIntrosPriceHistory(candleFacade, numOftickers) {
    threeBarPlaysIntros.push(candleFacade.findThreeBarPlayIntrosPriceHistory());

    TICKER_COUNT++; 
    if (TICKER_COUNT == numOftickers) {
        console.log("Tickers Counted!!\n");
        var flattendedThreeBarPlays = [].concat.apply([], threeBarPlaysIntros);
        sortByDate(flattendedThreeBarPlays);
        flattendedThreeBarPlays.forEach(tbp => {
            tbp.printCandle();
        });
        console.log(`Found ${flattendedThreeBarPlays.length} Three Bar Play Introz\n`);
    }
}


// function findIgnitingBars(candleFacade, numOftickers) {
//     threeBarPlaysIntros = candleFacade.findAllIgnitingBars();

//     TICKER_COUNT++; 
//     if (TICKER_COUNT == numOftickers) {
//         console.log("Tickers Counted!!\n");
//         var flattendedIgnitingBars = [].concat.apply([], ignitingBarsTimeStamps);
//         sortByDateOnlyTimeStamps(flattendedIgnitingBars);
//         flattendedIgnitingBars.forEach(tbp => {
//            console.log(tbp);
//         });
//         console.log(`Found ${flattendedIgnitingBars.length} Igniting\n`);
//     }
// }

function isMostRecentCandleWideRanging(candleFacade, timeFrame, numOftickers) {
    var wrCandle = candleFacade.isMostRecentCandleWideRanging(timeFrame);
    
    if (wrCandle) {
        threeBarPlaysIntros.push(wrCandle);
    }

    TICKER_COUNT++; 
    if (TICKER_COUNT == numOftickers) {
        console.log("Tickers Counted!!\n");
        if (threeBarPlaysIntros.length > 0) {
            sortByDateOnlyTimeStamps(threeBarPlaysIntros);
            threeBarPlaysIntros.forEach(tbp => {
                console.log(`${tbp.tickerSymbol} - ${tbp.timeStamp} - ${tbp.timeFrame}`);
                console.log(`% High Above Average: ${tbp.percentageHighAboveHigh}`);
                console.log(`% Height Above Average: ${tbp.percentageHeightAboveAverage}\n`);
            });
        }
        console.log(`Found ${threeBarPlaysIntros.length} WRB\n`);
    }
}

function sortByDate(array) {
    array.sort((a, b) => new Date(b.timeStamp) - new Date(a.timeStamp))
}

function sortByDateOnlyTimeStamps(array) {
    array.sort((a, b) => new Date(b) - new Date(a))
}

function getFrequencyKey(timeFrame) {
    switch(timeFrame) {
        case 1:
            return "Time Series (1min)";
        case 5:
            return "Time Series (5min)";
        case 15:
            return "Time Series (15min)";
        case 30:
            return "Time Series (30min)";
    }
}

function getFrequencyApi(timeFrame) {
    switch(timeFrame) {
        case 1:
            return "1min"
        case 5:
            return "5min";
        case 15:
            return "15min";
        case 30:
            return "30min";
    }
}