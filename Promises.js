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
var PRINT_CANDLE = "ThreeBarPlay";

/** Candle Stick Request Options */
var historyLength = "compact";

const candleStickPriceHistoryOptions = {
    method: "GET"
}

/** START */


var symbolLookUp = process.argv[2];


var symbols = [];
if (symbolLookUp === "1") { // Midday Trades
    symbols = ["MGM",
      "BAC", "F", "AMD", "USO", "SBUX",
      "INTC", "GE", "W", "AAL", "UAL", "DAL",
      "XOM", "M", "C", "DENN", "ROKU", "PUMP", "CHK",
      "MFA", "OXY", "F", "VAL", "MRO", "APA",
      "SHIP", "HAL", "T", "UCO", "MBRX", "PLAY"];
} else if (symbolLookUp === "2") { // Morning Trades
    symbols = ["TRV", "TWTR", "PSNL", "DE",
     "CAT", "MGM", "BAC", "F",
     "AMD", "USO", "PFE", "SBUX",
     "SPY", "APRN", "WHF", "INTC",
     "GE", "W", "AAL", "UAL", "DAL",
     "DK", "T", "NIO", "XOM",
     "M", "C", "DENN", "ROKU",
     "DFFN", "CCL", "TOPS", "AMRN",
     "BA", "WFC", "UBER", "MU", 
     "ACB", "X", "NCLH", "BP", 
     "PTON", "CPE", "VEA", "JPM", 
     "NLY", "VALE", "SNAP", "UGAZ",
     "BBY", "ADMA", "PLT", "BSGM", 
     "ARNC", "UCO", "SRNE", "ENIA",
     "BNO", "APA", "OIL", "PAYS", 
     "EQT", "PUMP", "BBBY", "NUS"];
} else {
    symbols = ["AMD"]; // DEBUG SYMBOL
}

console.log(`\nTicker Length:  ${symbols.length}\n`);

var timeFrame = 15;

var PROMISES = [];

symbols.forEach((tickerSymbol) => {
    PROMISES.push(createPromise(tickerSymbol));
});

function createPromise(tickerSymbol) {
    return new Promise((resolve, reject) => {
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
                        resolve(calculateStonks(candles, tickerSymbol, timeFrame));
                    }
                } else {
                    var errorMsg = `Error: ${tickerSymbol} - ${candlesData["Error Message"]}`
                    console.log(errorMsg);
                    if (retries <= NUM_RETRIES_ALLOWED) {
                        console.log("Retrying...");
                        retries++;
                        createPromise(tickerSymbol);
                    } else {
                        reject(errorMsg);
                    }
                }
            }
            if (error) {
                console.log("ERROR: " + error);
                reject(`ERROR: ${error}`);
            }
        });
    });
}

Promise.all(PROMISES).then((results) => {
    printResult(results)
})


/**
 * Callback function from REST call
 * @param {} candlesData 
 * @param {} tickerSymbol 
 * @param {} timeFrame
 * 
 * PRIORITIES 
 * Height > Price/Volume > Gappage
 * 
 * 
 */
function calculateStonks(candlesDTO, tickerSymbol, timeFrame) {
    var candleFacade = new CandleFacade();
    candleFacade.setCandleChart(candlesDTO, tickerSymbol, timeFrame);
    var bars = [];

    bars = isMostRecentCandleGap(candleFacade, timeFrame);
    // bars = isMostRecentCandleWideRanging(candleFacade, timeFrame);
    // bars = findThreeBarPlays(candleFacade);
    return bars;
}

function findThreeBarPlays(candleFacade) {
    var bars = [];
    // bars = findThreeBarPlayIntrosPriceHistory(candleFacade);
    bars = findThreeBarPlayIntrosToday(candleFacade);
    return bars;
}

function findThreeBarPlayIntrosToday(candleFacade) {
    return candleFacade.findThreeBarPlayIntrosToday();
}

function findThreeBarPlayIntrosPriceHistory(candleFacade) {
    return candleFacade.findThreeBarPlayIntrosPriceHistory();
}

function isMostRecentCandleWideRanging(candleFacade, timeFrame) {
    PRINT_CANDLE = "WIDE_RANGE";
    var wrCandle = candleFacade.isMostRecentCandleWideRanging(timeFrame);
    if (wrCandle != null) return [wrCandle];
    return [];
}

function isMostRecentCandleGap(candleFacade, timeFrame) {
    PRINT_CANDLE = "GAP";
    var wrCandle = candleFacade.isMostRecentCandleGap(timeFrame);
    if (wrCandle != null) return [wrCandle];
    return [];
}

/*---------------------------------------------------------------------------------*/

function printResult(threeBarPlaysIntros) {
    console.log("Tickers Counted!!\n");
    var flattendedThreeBarPlays = [].concat.apply([], threeBarPlaysIntros);
    sortByDate(flattendedThreeBarPlays);
    flattendedThreeBarPlays.forEach(tbp => {
        if (PRINT_CANDLE === "GAP") {
            tbp.printGapCandle();
        } else if (PRINT_CANDLE === "WIDE_RANGE") {
            tbp.printWideRangeCandle();
        } else {
            tbp.printThreeBarCandle();
        }
    });
    console.log(`Found ${flattendedThreeBarPlays.length} Barz\n`);
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