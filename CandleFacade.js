const CandleChart = require('./CandleChart').CandleChart, Candle = require('./Candle');

/** GLOBALS */

CandleFacade = function() { }

CandleFacade.prototype.setCandleChart = function(candlesDTO, tickerSymbol, timeFrame) {
    this.candleChart = new CandleChart(candlesDTO, tickerSymbol, timeFrame);

    /* DEBUG */
    // this.candleChart.prettyPrintCandlePriceHistory();

}

/** API */

/** LONG */

/** Find all Wide Ranging Igniting bars WITH 3/4 Bar Play Intro in Price Recent History */
CandleFacade.prototype.findThreeBarPlayIntrosPriceHistoryLong = function() {
    var threeBarPlayIntros = [];
    var wrCandles = this.candleChart.findAllWideRangeGreenCandles();
    wrCandles.forEach(wrCandle => {
        if (this.candleChart.isCandleThreeBarPlayIntroLong(wrCandle)) {
            threeBarPlayIntros.push(wrCandle);
        }
    });
    return threeBarPlayIntros;
}

/** Find all Wide Ranging Igniting bars WITH 3/4 Bar Play Intro in TODAYS DATE */
CandleFacade.prototype.findThreeBarPlayIntrosTodayLong = function() {    
    var threeBarPlayIntros = [];
    var wrCandles = this.candleChart.findAllWideRangeGreenCandles();

    wrCandles = this.candleChart.filterDatesNotFromToday(wrCandles);
    // wrCandles = this.candleChart.filterHoursLessThanHours(wrCandles, 2);

    wrCandles.forEach(wrCandle => {
        if (this.candleChart.isCandleThreeBarPlayIntroLong(wrCandle)) {
            threeBarPlayIntros.push(wrCandle);
        }
    });
    return threeBarPlayIntros;
}

CandleFacade.prototype.isMostRecentCandleWideRanging = function(timeFrame) {
    /** Is Specific Bar a Wide Ranging Igniting Bar */
    var moneyBarTimeStampKey = this.candleChart.getMostRecentCandle();
    var moneyBar = this.candleChart.getCandleData(moneyBarTimeStampKey);
    var moneyBarIndex = this.candleChart.getCandleIndex(moneyBarTimeStampKey);
    var wrCandle = new Candle();
    wrCandle.setCandleProperties(this.candleChart.tickerSymbol, moneyBarTimeStampKey, timeFrame, 
        moneyBar["1. open"], moneyBar["2. high"], moneyBar["3. low"], moneyBar["4. close"], moneyBar["5. volume"]);
    if (this.candleChart.isWideRangeCandle(wrCandle, moneyBarIndex) && wrCandle.isGreenCandle()) {
        return wrCandle;
    }
    return null;
}

CandleFacade.prototype.isMostRecentCandleGap = function(timeFrame) {
    /** Is Specific Bar a Gap Bar */
    var moneyBarTimeStampKey = this.candleChart.getMostRecentCandle();
    var moneyBar = this.candleChart.getCandleData(moneyBarTimeStampKey);
    var moneyBarIndex = this.candleChart.getCandleIndex(moneyBarTimeStampKey);
    var wrCandle = new Candle();
    wrCandle.setCandleProperties(this.candleChart.tickerSymbol, moneyBarTimeStampKey, timeFrame, 
        moneyBar["1. open"], moneyBar["2. high"], moneyBar["3. low"], moneyBar["4. close"], moneyBar["5. volume"]);
    if (this.candleChart.isGapCandle(wrCandle, moneyBarIndex)) {
        return wrCandle;
    }
    return null;
}

/** SHORT */

/** Find all Wide Ranging Igniting bars WITH 3/4 Bar Play Intro in Price Recent History */
CandleFacade.prototype.findThreeBarPlayIntrosPriceHistoryShort = function() {
    var threeBarPlayIntros = [];
    var wrCandles = this.candleChart.findAllWideRangeRedCandles();
    wrCandles.forEach(wrCandle => {
        if (this.candleChart.isCandleThreeBarPlayIntroShort(wrCandle)) {
            threeBarPlayIntros.push(wrCandle);
        }
    });
    return threeBarPlayIntros;
}

/** Find all Wide Ranging Igniting bars WITH 3/4 Bar Play Intro in TODAYS DATE */
CandleFacade.prototype.findThreeBarPlayIntrosTodayShort = function() {    
    var threeBarPlayIntros = [];
    var wrCandles = this.candleChart.findAllWideRangeRedCandles();

    wrCandles = this.candleChart.filterDatesNotFromToday(wrCandles);
    // wrCandles = this.candleChart.filterHoursLessThanHours(wrCandles, 2);

    wrCandles.forEach(wrCandle => {
        if (this.candleChart.isCandleThreeBarPlayIntroShort(wrCandle)) {
            threeBarPlayIntros.push(wrCandle);
        }
    });
    return threeBarPlayIntros;
}




exports.CandleFacade = CandleFacade;
