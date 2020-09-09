const Candle = require('./Candle');

/** GLOBALS */
const PERCENTAGE_HIGH_ALLOWED_INTRO_BAR = 1.45; // 3
const PERCENTAGE_HEIGHT_ALLOWED_INTRO_BAR = -45.0; // 60
const PERCENTAGE_HEIGHT_ALLOWED_WRB = 95.0; // 100
const PERCENTAGE_PRICE_HIGH_ALLOWED_WRB = .85; // was not using
const PERCENTAGE_PRICE_LOW_ALLOWED_WRB = .60;

const NUM_BARS_ABOVE_AVERAGE = 4;
const DEBUG = false;

CandleChart = function(candles, tickerSymbol, timeFrame) {
    this.candles = candles;
    this.tickerSymbol = tickerSymbol;
    this.timeFrame = timeFrame;
}

CandleChart.prototype.findAllWideRangeGreenCandles = function() {
    var wideRangeGreenCandles = [];
    for (var moneyBarTimeStampKey in this.candles) {
        var moneyBar = this.getCandleData(moneyBarTimeStampKey);
        var moneyBarIndex = this.getCandleIndex(moneyBarTimeStampKey);

        var wrCandle = new Candle();
        wrCandle.setCandleProperties(this.tickerSymbol, moneyBarTimeStampKey, this.timeFrame, 
            moneyBar["1. open"], moneyBar["2. high"], moneyBar["3. low"], moneyBar["4. close"], moneyBar["5. volume"]);

        // Check if it is green wide range bar
        if (wrCandle.isGreenCandle() && this.isWideRangeCandleLong(wrCandle, moneyBarIndex)) {
            wideRangeGreenCandles.push(wrCandle);
        }
    }
    return wideRangeGreenCandles;
}

CandleChart.prototype.findAllWideRangeRedCandles = function() {
    var wideRangeGreenCandles = [];
    for (var moneyBarTimeStampKey in this.candles) {
        var moneyBar = this.getCandleData(moneyBarTimeStampKey);
        var moneyBarIndex = this.getCandleIndex(moneyBarTimeStampKey);

        var wrCandle = new Candle();
        wrCandle.setCandleProperties(this.tickerSymbol, moneyBarTimeStampKey, this.timeFrame, 
            moneyBar["1. open"], moneyBar["2. high"], moneyBar["3. low"], moneyBar["4. close"], moneyBar["5. volume"]);

        // Check if it is red wide range bar
        if (!wrCandle.isGreenCandle() && this.isWideRangeCandleShort(wrCandle, moneyBarIndex)) {
            wideRangeGreenCandles.push(wrCandle);
        }
    }
    return wideRangeGreenCandles;
}

/** Comapres the HIGH and HEIGHT of the money bar and its next candle */
CandleChart.prototype.isCandleThreeBarPlayIntroLong = function(candle) {
    var candleIndex = this.getCandleIndex(candle.timeStamp);
    var nextCandleIndex = (candleIndex > 0) ? --candleIndex : 0;
    var nextCandleTimeStamp = this.getCandleAtIndex(nextCandleIndex);
    var nextCandleData = this.getCandleData(nextCandleTimeStamp);
    
    // % Difference in height
    var percentageDifferenceHeightNextCandle = this.candleHeightPercentageDifference(candle.getCandleHeight(), this.getCandleHeight(nextCandleData));
    
    // % Difference in Price high
    var percentageDifferenceHighNextCandle = Math.abs(this.pricePercentageDifference(candle.high, nextCandleData["2. high"]));

    if (DEBUG) {
        console.log(`${candle.timeStamp}`)
        console.log(`${percentageDifferenceHeightNextCandle} Percentage Height Next Candle`);
        console.log(`${percentageDifferenceHighNextCandle} Percentage High Next Candle\n`);
    }

    if (percentageDifferenceHeightNextCandle <= PERCENTAGE_HEIGHT_ALLOWED_INTRO_BAR && 
        percentageDifferenceHighNextCandle <= PERCENTAGE_HIGH_ALLOWED_INTRO_BAR)
         {
        candle.setTrendReversalCandleProperties(percentageDifferenceHeightNextCandle, percentageDifferenceHighNextCandle);
        return true;
    }
    return false;
}

/** Comapres the LOW and HEIGHT of the money bar and its next candle */
CandleChart.prototype.isCandleThreeBarPlayIntroShort = function(candle) {
    var candleIndex = this.getCandleIndex(candle.timeStamp);
    var nextCandleIndex = (candleIndex > 0) ? --candleIndex : 0;
    var nextCandleTimeStamp = this.getCandleAtIndex(nextCandleIndex);
    var nextCandleData = this.getCandleData(nextCandleTimeStamp);
    
    // % Difference in height
    var percentageDifferenceHeightNextCandle = this.candleHeightPercentageDifference(candle.getCandleHeight(), this.getCandleHeight(nextCandleData));
    
    // % Difference in Price high
    var percentageDifferencePriceNextCandle = Math.abs(this.pricePercentageDifference(candle.low, nextCandleData["3. low"]));

    if (DEBUG) {
        console.log(`${candle.timeStamp}`)
        console.log(`${percentageDifferenceHeightNextCandle} Percentage Height Next Candle`);
        console.log(`${percentageDifferencePriceNextCandle} Percentage Low Next Candle\n`);
    }

    if (percentageDifferenceHeightNextCandle <= PERCENTAGE_HEIGHT_ALLOWED_INTRO_BAR && 
        percentageDifferencePriceNextCandle <= PERCENTAGE_HIGH_ALLOWED_INTRO_BAR)
         {
        candle.setTrendReversalCandleProperties(percentageDifferenceHeightNextCandle, percentageDifferencePriceNextCandle);
        return true;
    }
    return false;
}


/**
 * averageHeightOfCandlesFromIndex - average candle BODY height of last NUM_BARS_ABOVE_AVERAGE candles
 * averagePriceHighOfCandlesFromIndex - average HIGH of last NUM_BARS_ABOVE_AVERAGE candles
 */
CandleChart.prototype.isWideRangeCandleLong = function(candle, moneyBarIndex) {
    // Is is above average in height/price ;) 
    var averageHeight = this.averageHeightOfCandlesFromIndex(moneyBarIndex);
    var averagePriceHigh = this.averagePriceHighOfCandlesFromIndex(moneyBarIndex);

    var percentageHeightComparedAverage = this.candleHeightPercentageDifference(averageHeight, candle.getCandleBodyHeight()); // height above average
    var percentagePriceComparedHigh = this.pricePercentageDifference(averagePriceHigh, candle.high); // price above average
    var gapLevel = this.getGapLevelFromCandleHigh(candle.high, moneyBarIndex);

    if (DEBUG) {
        console.log(this.tickerSymbol + " - " + candle.timeStamp);
        console.log("avg. candle height: " + averageHeight);
        console.log("avg. candle high: " + averagePriceHigh);
        console.log("MB height: " + candle.getCandleBodyHeight());
        console.log("MB high: " + candle.high);
        console.log(`Gappage: ${gapLevel}`);
        console.log(`${percentageHeightComparedAverage} Percentage Above Average Height`);
        console.log(`${percentagePriceComparedHigh} Percentage Above Average Price`);
        console.log(`_______________________________________\n\n`);
    }

    // Check if it is wide range bar
    if (percentageHeightComparedAverage >= PERCENTAGE_HEIGHT_ALLOWED_WRB && 
        percentagePriceComparedHigh >= PERCENTAGE_PRICE_HIGH_ALLOWED_WRB) {
        candle.setWideRangeCandleProperties(percentageHeightComparedAverage, percentagePriceComparedHigh, gapLevel);
        return true;
    }
    return false;
}

/**
 * averageHeightOfCandlesFromIndex - average candle BODY height of last NUM_BARS_ABOVE_AVERAGE candles
 * averagePriceLowOfCandlesFromIndex - average HIGH of last NUM_BARS_ABOVE_AVERAGE candles
 */
CandleChart.prototype.isWideRangeCandleShort = function(candle, moneyBarIndex) {
    // Is is above average in height/price ;) 
    var averageHeight = this.averageHeightOfCandlesFromIndex(moneyBarIndex);
    var averagePriceLow = this.averagePriceLowOfCandlesFromIndex(moneyBarIndex);

    var percentageHeightComparedAverage = this.candleHeightPercentageDifference(averageHeight, candle.getCandleBodyHeight()); // height above average
    var percentageLowComparedLow = this.pricePercentageDifference(candle.low, averagePriceLow); // price above average
    var gapLevel = this.getGapLevelFromCandleLow(candle.low, moneyBarIndex);

    if (DEBUG) {
        console.log(this.tickerSymbol + " - " + candle.timeStamp);
        console.log("avg. candle height: " + averageHeight);
        console.log("avg. candle Low: " + averagePriceLow);
        console.log("MB height: " + candle.getCandleBodyHeight());
        console.log("MB Low: " + candle.low);
        console.log(`Gappage: ${gapLevel}`);
        console.log(`${percentageHeightComparedAverage} Percentage Above Average Height`);
        console.log(`${percentageLowComparedLow} Percentage Below Average Price`);
        console.log(`_______________________________________\n\n`);
    }

    // Check if it is wide range bar
    if (percentageHeightComparedAverage >= PERCENTAGE_HEIGHT_ALLOWED_WRB && 
        percentageLowComparedLow >= PERCENTAGE_PRICE_LOW_ALLOWED_WRB) {
        candle.setWideRangeCandleProperties(percentageHeightComparedAverage, percentageLowComparedLow, gapLevel);
        return true;
    }
    return false;
}

/**
 * Check if most recent candle is a gap candle
 * 1. Checks if the candles lowest body is higher than
 *    the previous candle's high 
 */
CandleChart.prototype.isGapCandle = function(candle, moneyBarIndex) {
    var lowestBody = candle.getCandleLowestBody();
    var previousCandleIndex = ++moneyBarIndex;
    var previousCandleTimeStamp = this.getCandleAtIndex(previousCandleIndex);
    var previousCandleData = this.getCandleData(previousCandleTimeStamp);
    var isGapCandle = lowestBody >= previousCandleData["2. high"];

    var percentageHighAboveHigh = this.pricePercentageDifference(previousCandleData["2. high"], lowestBody); // price above previous
    candle.percentageDifferenceHigh = percentageHighAboveHigh;
    
    if (DEBUG) {
        console.log(lowestBody);
        console.log(previousCandleTimeStamp);
        console.log(previousCandleData["2. high"]);
        console.log(`% Above Previous Candle ${percentageHighAboveHigh}`)
    }

    if (isGapCandle) {
        return true;
    }
    return false;
}


/** CALCULATIONS */

/** From a bar, how many bars are below its high (check its gap level) */
CandleChart.prototype.getGapLevelFromCandleHigh = function(candleHigh, candleIndex) {
    var chartIndex = 0;
    var gapLevel = 0;

    for (var candleTimeStamp in this.candles) {
        if (chartIndex > candleIndex) {
            var chartCandle = this.candles[candleTimeStamp];
            if (candleHigh >= chartCandle["2. high"]) {
                gapLevel++;
            } else {
                break;
            }
        }
        chartIndex++;
    }
    return gapLevel;
}

/** From a bar, how many bars are below its low (check its gap level) */
CandleChart.prototype.getGapLevelFromCandleLow = function(candleLow, candleIndex) {
    var chartIndex = 0;
    var gapLevel = 0;

    for (var candleTimeStamp in this.candles) {
        if (chartIndex > candleIndex) {
            var chartCandle = this.candles[candleTimeStamp];
            if (candleLow <= chartCandle["3. low"]) {
                gapLevel++;
            } else {
                break;
            }
        }
        chartIndex++;
    }
    return gapLevel;
}

CandleChart.prototype.averageHeightOfCandlesFromIndex = function(candleIndex) {
    var chartIndex = 0;
    var candlesIterated = 0;
    var sumOfCandlesHeight = 0;

    for (var candleTimeStamp in this.candles) {
        if (chartIndex > candleIndex) {
            var candle = this.getCandleData(candleTimeStamp);
            if (candle) {
                sumOfCandlesHeight += this.getCandleBodyHeight(candle);
            }
            candlesIterated++;
            if (candlesIterated == NUM_BARS_ABOVE_AVERAGE) break;
        }
        chartIndex++;
    }

    var averageCandleHeight = (sumOfCandlesHeight / candlesIterated);
    return averageCandleHeight;
}

CandleChart.prototype.averagePriceHighOfCandlesFromIndex = function(candleIndex) {
    var chartIndex = 0;
    var candlesIterated = 0;
    var sumOfCandlesLow = 0;

    for (var candleTimeStamp in this.candles) {
        if (chartIndex > candleIndex) {
            var candle = this.getCandleData(candleTimeStamp);
            if (candle) {
                sumOfCandlesLow += parseFloat(candle["3. low"]);
            }
            candlesIterated++;
            if (candlesIterated == NUM_BARS_ABOVE_AVERAGE) break;
        }
        chartIndex++;
    }

    var averageCandleHigh = (sumOfCandlesLow / candlesIterated);
    return averageCandleHigh.toFixed(2);
}

CandleChart.prototype.averagePriceLowOfCandlesFromIndex = function(candleIndex) {
    var chartIndex = 0;
    var candlesIterated = 0;
    var sumOfCandlesHigh = 0;

    for (var candleTimeStamp in this.candles) {
        if (chartIndex > candleIndex) {
            var candle = this.getCandleData(candleTimeStamp);
            if (candle) {
                sumOfCandlesHigh += parseFloat(candle["2. high"]);
            }
            candlesIterated++;
            if (candlesIterated == NUM_BARS_ABOVE_AVERAGE) break;
        }
        chartIndex++;
    }

    var averageCandleHigh = (sumOfCandlesHigh / candlesIterated);
    return averageCandleHigh.toFixed(2);
}


/** moneyBar percentage greater than baseCandle   */
CandleChart.prototype.candleHeightPercentageDifference = function(baseCandleHeight, moneyBarHeight) {
    var difference = moneyBarHeight - baseCandleHeight;
    return ((difference / baseCandleHeight) * 100).toFixed(2);
}

/** moneyBar percentage greater than baseCandle   */
CandleChart.prototype.pricePercentageDifference = function(baseCandle, moneyBarPrice) {
    var difference = moneyBarPrice - baseCandle;
    var divisor = (difference >= 0) ? baseCandle : moneyBarPrice;
    return ((difference / divisor) * 100.0).toFixed(2);
}




/** GETTERS / BOOLEANS */

// For finding the 2nd bar in 3/4 play 
CandleChart.prototype.getCandleHeight = function(candle) {
    return candle["2. high"] - candle["3. low"];
}

// For finding the WRB
CandleChart.prototype.getCandleBodyHeight = function(candle) {
    var open = candle["1. open"];
    var close = candle["4. close"];
    if (open >= close) {
        return open - close;
    } else {
        return close - open;
    }
}

CandleChart.prototype.getCandleFromMostRecent = function(numOfBarsFromRecent) {
    if (this.candles == null) return void 0;
    var barCounter = 0;
    for (var candleTimeStampKey in this.candles) {
        if (barCounter == numOfBarsFromRecent) {
            return candleTimeStampKey;
        }
        barCounter++;
    }
}

CandleChart.prototype.getMostRecentCandle = function() {
    if (this.candles == null) return void 0;
    for (var candleTimeStampKey in this.candles) {
        return candleTimeStampKey;
    }
}

CandleChart.prototype.getCandleData = function(candleTimeStampKey) {
    return this.candles[candleTimeStampKey];
}


CandleChart.prototype.getCandleIndex = function(moneyBarTimeStamp) {
    if (this.candles == null) return void 0;
    var barCounter = 0;
    for (var candleTimeStampKey in this.candles) {
        if (moneyBarTimeStamp === candleTimeStampKey) {
            return barCounter++;
        }
        barCounter++;
    }
}

CandleChart.prototype.getCandleAtIndex = function(candleIndex) {
    if (this.candles == null) return void 0;
    var barCounter = 0;
    for (var candleTimeStampKey in this.candles) {
        if (barCounter === candleIndex) {
            return candleTimeStampKey;
        }
        barCounter++;
    }
}

CandleChart.prototype.getCandleDataAtIndex = function(candleIndex) {
    if (this.candles == null) return void 0;
    var barCounter = 0;
    for (var candleTimeStampKey in this.candles) {
        if (barCounter === candleIndex) {
            return this.getCandleData(candleTimeStampKey);
        }
        barCounter++;
    }
}

CandleChart.prototype.getOldestCandle = function() {
    if (this.candles.length > 0) {
        return this.candles[this.candles.length-1];
    }
    return null;
}

/** UTILITIES */
CandleChart.prototype.epochSecondsToDateTime = function(epochSeconds) {
    DATE.setTime(epochSeconds);
    var dateTimeStr = DATE.toLocaleString();
    return dateTimeStr;
}

CandleChart.prototype.prettyPrintCandlePriceHistory = function() {
    for (var candleTimeStampKey in this.candles) {
        var candleData = this.candles[candleTimeStampKey];
        this.prettyPrintCandleStick(candleData, candleTimeStampKey);
    }
}

CandleChart.prototype.filterDatesNotFromToday = function(wrCandles) {
    var date = new Date();
    var todaysDay = date.getDate();
    var todaysMonth = date.getMonth();
    var wrCandlesToday = [];

    wrCandles.forEach(wrCandle => {
        var epochSeconds = Date.parse(wrCandle.timeStamp);
        date.setTime(epochSeconds);
        var candleDay = date.getDate();
        var candlesMonth = date.getMonth();
        if (candleDay === todaysDay && candlesMonth === todaysMonth) {
            wrCandlesToday.push(wrCandle);
        }
    });
    return wrCandlesToday;
}

CandleChart.prototype.filterHoursLessThanHours = function(wrCandles, limitHours) {
    var date = new Date();
    var currentHour = date.getHours();
    var wrCandlesToday = [];

    wrCandles.forEach(wrCandle => {
        var epochSeconds = Date.parse(wrCandle.timeStamp);
        date.setTime(epochSeconds);
        var candleHour = date.getHours();
        if (currentHour-candleHour < limitHours) {
            wrCandlesToday.push(wrCandle);
        }
    });
    return wrCandlesToday;
}

CandleChart.prototype.prettyPrintCandleStick = function(candleData, candleTimeStampKey) {
    // { '1. open': '136.6900',
    // '2. high': '136.9600',
    // '3. low': '135.7000',
    // '4. close': '136.8300',
    // '5. volume': '426173' }

    if (candleData) {
        console.log(candleTimeStampKey);
        console.log("   High: " + candleData["2. high"]);
        console.log("   Open: " + candleData["1. open"]);
        console.log("   Close: " + candleData["4. close"]);
        console.log("   Low: " + candleData["3. low"]);
        console.log("   Volume: " + candleData["5. volume"] + '\n');
    } else {
        console.log(candleData);
    }
}

exports.CandleChart = CandleChart;
