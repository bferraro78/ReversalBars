const fs = require('fs');

class Candle {

    /** timeStamp -> key in candleChart */

    setCandleProperties(tickerSymbol, timeStamp, timeFrame, open, high, low, close, volume) {
        this.open = open;
        this.close = close;
        this.high = high;
        this.low = low;
        this.volume = volume;
        this.tickerSymbol = tickerSymbol;
        this.timeStamp = timeStamp;
        this.timeFrame = timeFrame;
    }

    setTrendReversalCandleProperties(percentageDifferenceHeight, percentageDifferencePrice) {
        this.percentageDifferenceHeight = percentageDifferenceHeight;
        this.percentageDifferencePrice = percentageDifferencePrice;
    }

    setWideRangeCandleProperties(percentageHeightComparedAverage, percentagePriceComparedAverage, gapLevel) {
        this.percentageHeightComparedAverage = percentageHeightComparedAverage;
        this.percentagePriceComparedAverage = percentagePriceComparedAverage;
        this.gapLevel = gapLevel;
    }



    isGreenCandle() {
        return (this.close > this.open) ? true : false;
    }

    getCandleBodyHeight() {
        if (this.open >= this.close) {
            return this.open - this.close;
        } else {
            return this.close - this.open;
        }
    }

    getCandleLowestBody() {
        if (this.open >= this.close) {
            return this.close;
        } else {
            return this.open;
        }
    }

    getCandleHeight() {
        return this.high - this.low;
    }

    printThreeBarCandleLong() {
        var path = __dirname + "/Backtesting.txt";

        // fs.unlinkSync(path)
        console.log(`${this.tickerSymbol} - Money Bar Time: ${this.timeStamp} on ${this.timeFrame} min chart`);
        console.log("2nd Bar Percentage Shorter: " + this.percentageDifferenceHeight);
        console.log("Price High % Difference: " + this.percentageDifferencePrice);
        console.log("Height % Above Average: " + this.percentageHeightComparedAverage);
        console.log("Price High % Above Average: " + this.percentagePriceComparedAverage);
        console.log("Gap Level: " + this.gapLevel + "\n");

        var str = `${this.tickerSymbol} - Money Bar Time: ${this.timeStamp} on ${this.timeFrame} min chart\n`;
        str+="2nd Bar Percentage Shorter: " + this.percentageDifferenceHeight+"\n";
        str+="Price High % Difference: " + this.percentageDifferencePrice+"\n";
        str+="Height % Above Average: " + this.percentageHeightComparedAverage+"\n";
        str+="Price High % Above Average:" +this.percentagePriceComparedAverage+"\n";
        str+="Gap Level: " + this.gapLevel + "\n\n";

        fs.appendFile(path, str, function (err) {
            if (err) {
                return console.log(err);
            }
        });
    }

    printThreeBarCandleShort() {
        var path = __dirname + "/Backtesting.txt";

        // fs.unlinkSync(path)
        console.log(`${this.tickerSymbol} - Money Bar Time: ${this.timeStamp} on ${this.timeFrame} min chart`);
        console.log("2nd Bar Percentage Shorter: " + this.percentageDifferenceHeight);
        console.log("Price Low % Difference: " + this.percentageDifferencePrice);
        console.log("Height % Below Average: " + this.percentageHeightComparedAverage);
        console.log("Price Low % Below Average: " + this.percentagePriceComparedAverage);
        console.log("Gap Level: " + this.gapLevel + "\n");

        var str = `${this.tickerSymbol} - Money Bar Time: ${this.timeStamp} on ${this.timeFrame} min chart\n`;
        str+="2nd Bar Percentage Shorter: " + this.percentageDifferenceHeight+"\n";
        str+="Price Low % Difference: " + this.percentageDifferencePrice+"\n";
        str+="Height % Below Average: " + this.percentageHeightComparedAverage+"\n";
        str+="Price Low % Below Average:" +this.percentagePriceComparedAverage+"\n";
        str+="Gap Level: " + this.gapLevel + "\n\n";

        fs.appendFile(path, str, function (err) {
            if (err) {
                return console.log(err);
            }
        });
    }

    printWideRangeCandle() {
        console.log(`${this.tickerSymbol} - Money Bar Time: ${this.timeStamp} on ${this.timeFrame} min chart`);
        console.log(`Height % Above Average: ${this.percentagePriceComparedAverage}`);
        console.log(`Height % Above Average: ${this.percentageHeightComparedAverage}\n`);
    }

    printGapCandle() {
        console.log(`${this.tickerSymbol} - Money Bar Time: ${this.timeStamp} on ${this.timeFrame} min chart`);
        console.log("Price High % Difference: " + this.percentageDifferencePrice+"\n");
    }

}

module.exports = Candle;