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

    setTrendReversalCandleProperties(percentageDifferenceHeight, percentageDifferenceHigh) {
        this.percentageDifferenceHeight = percentageDifferenceHeight;
        this.percentageDifferenceHigh = percentageDifferenceHigh;
    }

    setWideRangeCandleProperties(percentageHeightAboveAverage, percentageHighAboveHigh, gapLevel) {
        this.percentageHeightAboveAverage = percentageHeightAboveAverage;
        this.percentageHighAboveHigh = percentageHighAboveHigh;
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

    
    getCandleHeight() {
        return this.high - this.low;
    }

    printCandle() {
        var path = __dirname + "/Backtesting.txt";

        // fs.unlinkSync(path)
        console.log(`${this.tickerSymbol} - Money Bar Time: ${this.timeStamp} on ${this.timeFrame} min chart`);
        console.log("2nd Bar Percentage Shorter: " + this.percentageDifferenceHeight);
        console.log("Price High % Difference: " + this.percentageDifferenceHigh);
        console.log("Height % Above Average: " + this.percentageHeightAboveAverage);
        console.log("Price High % Above Average: " + this.percentageHighAboveHigh);
        console.log("Gap Level: " + this.gapLevel + "\n");

        var str = `${this.tickerSymbol} - Money Bar Time: ${this.timeStamp} on ${this.timeFrame} min chart\n`;
        str+="2nd Bar Percentage Shorter: " + this.percentageDifferenceHeight+"\n";
        str+="Price High % Difference: " + this.percentageDifferenceHigh+"\n";
        str+="Height % Above Average: " + this.percentageHeightAboveAverage+"\n";
        str+="Price High % Above Average:" +this.percentageHighAboveHigh+"\n";
        str+="Gap Level: " + this.gapLevel + "\n\n";

        fs.appendFile(path, str, function (err) {
            if (err) {
                return console.log(err);
            }
        });
    }

}

module.exports = Candle;