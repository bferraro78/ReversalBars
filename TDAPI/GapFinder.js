const https = require('https'), request = require("request"), fs = require('fs');


/* SETTINGS */
var GET_OAUTH_URL = "https://auth.tdameritrade.com/auth?response_type=code&redirect_uri=https%3A%2F%2F127.0.0.1%3A8443&client_id=VRLNCS0KJDABZSERJPM0VQASLPY5GIK7%40AMER.OAUTHAP"
var client_id = "VRLNCS0KJDABZSERJPM0VQASLPY5GIK7@AMER.OAUTHAP";

const tokens = {
  "current_access_token": JSON.parse(fs.readFileSync(__dirname + '/AccessKey/NewlyGeneratedAccessToken.txt'))["access_token"],
  "refresh_token": "pb0WwG/G6Aef7MufpIedsVYzq2bDs0x9CgPzkP2BOfTwAk/CU5cHJ8QEuFS8R7Hzra+Ybv4vfIEGN6//l8+xhCtC7ASHojJ8AMiiSV9eyAdp046hrJ4ifqrRh5FqBTsrFgJjB8Z87uw2+3WJrMxOMGdfdXRVFMAbwIPmopYhAjhiZy2pZ45ti3jBn0vkVsjPzxXjYBY/cEEfB2g8UCScRaqavzPKDskZqXE7M1EnkyPMXr0BM5LPeqA1em7To5JljERiXhuvZ24yOT/gQ8xNKEDGDlcIgToBvLE14NNFT8kQOlT47zd73pUHmIpkrlnOoZmhve/8XOkDVHJtJtFRKeXoOgzgsUruvA7Wbg496SMDlHWm1fZwLwG8fj6em9+8kjdRNw8pNgzX4iHgHQB2QRCywRizWrVm9OCjPp8ltOd2a8fqnQo4T4ctaFo100MQuG4LYrgoVi/JHHvlgasoIaqSNKFmWAlGYBDjTREJhCmNPQrIfR/vLGr1uV3surkFtSeNb+qW2HhgXXWMNLk4w39ddK538noqBbxnUUHoq4SSUbjBE8xUMth8QSjdOXycUDPFPXzUDc+5QVRmQwPiURSWP70IVzj1VXCeSlOlnRJIWsBmjHJV+U1JnUUgyqxV19rFa8BXgSkHQeDebIJtx6lQaA4+TyiSYjXy5GDPw6os8oyZUn/o4Z4/gC7xkOlLue/EB+NjMVz+rKtGlgUBYSfhy2cXAYcSFbWBCTOfTM1vdHRG4lma0uuF/V+sxxMWhg1k3rQDY5ORb4n7wdF5AbeYWmaWdkNMRE/66d5f66sOQWdZ3IcSJ0tc2EyNCKNpNUreg3o2av+WnleBWWblnXsDCKI1aBb4QqNUs+n6H0k4iHq0lUq9X5QcQPvLcy2Pl1UoQN7rEJ4=212FD3x19z9sWBHDJACbC00B75E",
}


/** GLOBALS */
const DATE = new Date();
const READLINE = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const NUM_BARS_ABOVE_AVERAGE = 6; // 1.5 hours @ 15min
var WINNERS = {};
var TICKER_COUNT = 0;

/** GETTING NEW ACCESS TOKEN USING OUR ONE refresh_token */
var refresh_options = {
  url: 'https://api.tdameritrade.com/v1/oauth2/token',
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  form: {
      'grant_type': 'refresh_token',
      'refresh_token': tokens["refresh_token"], 
      'client_id': client_id
  }
}

/** Candle Stick Request Options */
var periodType = "day";
var howManyPeriods = 2;
var frequencyType = "minute"; // The type of frequency with which a new candle is formed.
var frequency = 15; //The number of the frequencyType to be included in each candle.
var needExtendedHoursData = "false";
const candleStickPriceHistoryOptions = {
  method: "GET",
  headers: { "Authorization": 'Bearer '+ tokens["current_access_token"] }
}

/** START */
READLINE.question(`1 - Get New Token\n2. - Candlesticks\n`, (choice) => {
  
  
  if (choice === "1") {
    console.log(`\nSelected input ${choice}!\n`);
    /** Get new access_token with refresh token */
    request(refresh_options, function (error, response, body) {

      let data = JSON.parse(body);
      console.log(data);
      data.created_on = Date.now(); 

      fs.writeFile(__dirname + "/AccessKey/NewlyGeneratedAccessToken.txt", JSON.stringify(data), function (err) {
          if (err) {
              return console.log(err);
          }
          console.log("Access Token updated. Expires in " + data.expires_in + " seconds");
      });
    });

  } else if (choice === "2") {
    console.log(`\nSelected input ${choice}!\n`);
    console.log(`\n${NUM_BARS_ABOVE_AVERAGE} looking Back!\n`);

    var symbols = ["MSFT"];

    console.log("Ticker Length: " + symbols.length);

    symbols.forEach(tickerSymbol => {
      getStockPriceHisotry(tickerSymbol, symbols.length);
    });    
  }
  READLINE.close();
})


function getStockPriceHisotry(tickerSymbol, numOftickers) {
  var candleStickUrl = `https://api.tdameritrade.com/v1/marketdata/${tickerSymbol}/pricehistory?apikey=${client_id}&periodType=${periodType}&period=${howManyPeriods}&frequencyType=${frequencyType}&frequency=${frequency}&needExtendedHoursData=${needExtendedHoursData}`;
  candleStickPriceHistoryOptions.url = candleStickUrl;

  request(candleStickPriceHistoryOptions, function (error, response, body) {
    if (body) {
      let candlesData = JSON.parse(body);
      if (candlesData && candlesData["error"] == undefined) {
        calculateStock(candlesData, tickerSymbol, numOftickers);
      } else {
        console.log("Get that new new token ya bishhhh");
        console.log(candlesData["error"]);
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
function calculateStock(candlesData, tickerSymbol, numOftickers) {
  var candles = candlesData["candles"];
  prettyPrintCandlePriceHistory(candles);
  var moneyBar = getMoneyBar(candles, null);

  console.log(`MoneyBar - ${tickerSymbol}`);
  prettyPrintCandleStick(moneyBar);

  // Is is above average in height/price ;) 
  var averageHeight = averageHeightOfCandlesFromMoneyBar(candles);
  var averagePriceHigh = averagePriceHighOfCandlesFromMoneyBar(candles);
  var isAboveAverageHeight = isMoneyBarAboveAverageHeight(averageHeight, moneyBar);  
  var isAboveAveragePrice = isMoneyBarAboveAverageHigh(averagePriceHigh, moneyBar);  

  // console.log("candle height: " + averageHeight);
  // console.log("candle high: " + averagePriceHigh);
  // console.log("MB height: " + getCandleHeight(moneyBar));
  // console.log("MB high: " + moneyBar["high"]);

  var percentageHeight = percentageAboveAverageHeight(averageHeight, moneyBar);
  console.log(`${percentageHeight} Percentage Above Average Height`);

  var percentageHigh = percentageAboveAverageHigh(averagePriceHigh, moneyBar);
  console.log(`${percentageHigh} Percentage Above Average Price`);

  // Get Gap level
  var gapLevel = getGapLevelFromCandle(candles, moneyBar);
  console.log(`Gappage: ${gapLevel}`);
  console.log(`_______________________________________\n\n`);

  

  // Check if it is igniting wide range bar
  if (percentageHeight >= 100) {
    WINNERS[tickerSymbol] = moneyBar;
  }

  TICKER_COUNT++;
  console.log(TICKER_COUNT);
  console.log(numOftickers);

  if (TICKER_COUNT >= numOftickers-1) {
    console.log(`\nWINNERS:\n`);
    for (var ticker in WINNERS) {
      var mb = WINNERS[ticker];
      console.log(ticker);
      prettyPrintCandleStick(mb);
    }
  }

}


/** CALCULATIONS */
/** From last recieved bar, how mnay bars are below its high (check its gap level) */
function getGapLevelFromCandle(candles, moneyBar) {
  var gapLevel = 0;
  for (var i = candles.length-2; i >= 0; i--) {
    var candleData = candles[i];
    if (moneyBar["high"] >= candleData["high"]) {
      gapLevel++;
    } else {
      break;
    }
  }
  return gapLevel;
}

function averageHeightOfCandlesFromMoneyBar(candles) {
  var candleIterationCounter = 0;
  var candleIndex = 2;
  var sumOfCandlesSize = 0;

  while (candleIterationCounter < NUM_BARS_ABOVE_AVERAGE) {
    var candle = candles[candles.length-candleIndex];
    if (candle) {
      // console.log(epochSecondsToDateTime(candle["datetime"]));
      sumOfCandlesSize += getCandleHeight(candle);
    } 
    candleIndex++;
    candleIterationCounter++;
  }

  var averageCandleSize = (sumOfCandlesSize/NUM_BARS_ABOVE_AVERAGE);
  return averageCandleSize;
}

function averagePriceHighOfCandlesFromMoneyBar(candles) {
  var candleIterationCounter = 0;
  var candleIndex = 2;
  var sumOfCandlesHigh = 0;

  while (candleIterationCounter < NUM_BARS_ABOVE_AVERAGE) {
    var candle = candles[candles.length-candleIndex];
    if (candle) {
      // console.log(epochSecondsToDateTime(candle["datetime"]));
      sumOfCandlesHigh += candle["high"];
    }
    candleIndex++;
    candleIterationCounter++;
  }

  var averageCandleSize = (sumOfCandlesHigh/NUM_BARS_ABOVE_AVERAGE);
  return averageCandleSize;
}

function isMoneyBarAboveAverageHeight(averageCandleHeight, moneyBar) {
  var moneyBarHeight = getCandleHeight(moneyBar);
  return (moneyBarHeight >= averageCandleHeight) ? true : false;
}

function percentageAboveAverageHeight(candlesAverageHeight, moneyBar) {
  var moneyBarHeight = getCandleHeight(moneyBar);
  var difference = moneyBarHeight - candlesAverageHeight;
  return ((difference/candlesAverageHeight)*100).toFixed(2);
}

function isMoneyBarAboveAverageHigh(averageCandlePrice, moneyBar) {
  var moneyBarHigh = moneyBar["high"];
  return (moneyBarHigh >= averageCandlePrice) ? true : false;
}

function percentageAboveAverageHigh(candlesAverageHigh, moneyBar) {
  var moneyBarHigh = moneyBar["high"];
  var difference = moneyBarHigh - candlesAverageHigh;
  var divisor = (difference >= 0) ? candlesAverageHigh : moneyBarHigh;
  return ((difference/divisor)*100.0).toFixed(2);
}



function getCandleHeight(candle) {
  return candle["high"] - candle["low"];
}

function getMoneyBar(candles, numOfBars) {
  if (candles == null) return void 0;
  if (numOfBars == null) return candles[candles.length - 1];
  return candles.slice(Math.max(candles.length - numOfBars, 0));
};





/** UTILITIES */
function epochSecondsToDateTime(epochSeconds) {
  DATE.setTime(epochSeconds);
  var dateTimeStr = DATE.toLocaleString(); 
  return dateTimeStr;
}

function prettyPrintCandlePriceHistory(candles) {
  candles.forEach(candleData => {
    prettyPrintCandleStick(candleData);
  });
}

function prettyPrintCandleStick(candleData) {
  // { open: 140.64,
  //   high: 141.74,
  //   low: 140.12,
  //   close: 141.44,
  //   volume: 26448,
  //   datetime: 1584615600000 }
  if (candleData) {
    var epochSeconds = candleData["datetime"]; // Seconds after the epoch in 1970
    var dateTimeStr = epochSecondsToDateTime(epochSeconds);
    console.log(dateTimeStr);
    console.log("   High: " + candleData["high"]);
    console.log("   Open: " + candleData["open"]);
    console.log("   Close: " + candleData["close"]);
    console.log("   Low: " + candleData["low"]);
    console.log("   Volume: " + candleData["volume"]+'\n');
  } else {
    console.log(candleData);
  }
}