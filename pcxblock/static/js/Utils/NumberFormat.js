//Filename : NumberFormat.js
//NumberFormatter V1.0

//Author: Luc Veronneau 
//Email: hurlemonde@hotmail.com

//This script is release under The Code Project Open License (CPOL) 
//see: http://www.codeproject.com/info/cpol10.aspx
//Under no circomstances remove or modify this header

(function () {

    //Declaring namespace
    var _formatting = window.Formatting = {};
    _formatting.__namespace = true;

    //Enum representing negative patterns used by .net
    var _numberNegativePattern = _formatting.NumberNegativePattern = {
        //Negative is reprensented by enclosing parentheses ex: (1500) corresponds to -1500
        Pattern0: 0,
        //Negative is represented by leading "-"
        Pattern1: 1,
        //Negative is represented by leading "- "
        Pattern2: 2,
        //Negative is represented by following "-"
        Pattern3: 3,
        //Negative is represented by following " -"
        Pattern4: 4
    };

    var _numberFormatInfo = _formatting.NumberFormatInfo = function () {
        ///<summary>Information class passed to the NumberFormat class to be used to format text for numbers properly</summary>
        ///<returns type="Formatting.NumberFormatInfo" />
        if (arguments.length === 1) {
            for (var item in this) {
                if (typeof this[item] != "function") {
                    if (typeof this[item] != typeof arguments[0][item])
                        throw "Argument does not match NumberFormatInfo";
                }
            }
            return arguments[0];
        }
    };

    _numberFormatInfo.prototype = {
        //Negative sign property
        NegativeSign: "-",
        //Default number of digits used by the numberformat
        NumberDecimalDigits: 2,
        //Seperator used to seperate digits from integers
        NumberDecimalSeparator: ",",
        //Seperator used to split integer groups (ex: official US formatting of a number is 1,150.50 where "," if the group seperator)
        NumberGroupSeparator: "",
        //Group sizes originally an array in .net but normally groups numbers are either by 3 or not grouped at all
        NumberGroupSizes: 3,
        //Negative patterns used by .net
        NumberNegativePattern: Formatting.NumberNegativePattern.Pattern1
    };
    _numberFormatInfo.__class = true;
})();

(function () {

    //Main constructor for the NumberFormatter
    var _numberFormatter = window.Formatting.NumberFormatter = function (formatInfo) {
        ///<summary> Manages number formatting using format infos </summary>
        ///<param name="formatInfo" type="Formatting.NumberFormatInfo" />
        this.FormatInfo = formatInfo;

        var groupSeperatorReg = this.GetRegexPartForChar(this.FormatInfo.NumberGroupSeparator);
        this.GroupSeperatorReg = new RegExp(groupSeperatorReg,"g");

        var decimalSeperator = this.GetRegexPartForChar(this.FormatInfo.NumberDecimalSeparator);
        this.DecimalSeperatorReg = new RegExp(decimalSeperator,"g");

        //Creating regex from the format info to validate input text
        var str = "";
//        if (this.FormatInfo.NumberGroupSeparator != null
//            && this.FormatInfo.NumberGroupSeparator.length > 0) {
//            //The group seperator regex must take into account the possibility of having incomplete groups at the beginning 
//            //once complete, this regex part should look like (\d{1,3}){0,1}
//            str += "(\\d{1," + this.FormatInfo.NumberGroupSizes.toString() + "}){0,1}";
//            str += "(" + groupSeperatorReg + "\\d{" + this.FormatInfo.NumberGroupSizes.toString() + "}){0,}";
//        }
//        else {
            str += "(\\d+)";
//        }
        str += "(" + decimalSeperator+ "\\d+)?";
        this.BaseRegexText = str;
        str = "^" + str + "$";
        this.NumberTester = new RegExp(str);

    };

    //Prototype for the NumberFormatter class
    _numberFormatter.prototype = {
        //FormatInfo property containing localized number informations
        FormatInfo: new Formatting.NumberFormatInfo(),
        //Regex used to validate text prior to parsing
        NumberTester: new RegExp(),
        //Base regex used to concatenate with other regex
        BaseRegexText: "",
        //Regex used to find decimal seperator
        DecimalSeperatorReg : new RegExp(),
        //Regex used to find group seperator
        GroupSeperatorReg : new RegExp(),
        Parse: function (value) {
            ///<summary>Parses a string and converts it to numeric, throws if the format is wrong</summary>
            ///<param name="value" type="string" />
            ///<returns type="Number" />
            return this.TryParse(value, function (errormessage, val) {
                throw errormessage + "ArgumentValue:" + val;
            });
        },
        TryParse: function (value, parseFailure) {
            ///<summary>Parses a string and converts it to numeric and calls a method if validation fails</summary>
            ///<param name="value" type="string">The value to parse</param>
            ///<param name="parseFailure" type="function">A function(ErrorMessage, parsedValue) delegate to call if the string does not respect the format</param>
            ///<returns type="Number" />
            if (!isNaN(parseFloat(value)) && isFinite(value)) return value;
            var isNegative = this.GetNegativeRegex().test(value);
            var val = value;
            if (isNegative)
                val = this.GetNegativeRegex().exec(value)[1];

            if (!this.NumberTester.test(val)) {
                parseFailure("The number passed as argument does not respect the correct culture format.", val);
                return null;
            }

            var matches = this.NumberTester.exec(val);
            var decLen = 0;
            if (matches[matches.length - 1]!==undefined) {
                decLen = matches[matches.length - 1].length - 1;
            } 

            var partial = val.replace(this.GroupSeperatorReg, "").replace(this.DecimalSeperatorReg, "");

            if (isNegative)
                partial = "-" + partial;
            
            return (parseInt(partial) / (Math.pow(10,decLen)));
        },
        ToString: function (value) {
            ///<summary>Converts a number to string</summary>
            ///<param name="value" type="Number" />
            ///<returns type="String" />
            var result = "";
            var isNegative = false;
            if (value < 0)
                isNegative = true;

            var baseString = value.toString();
            //Remove the default negative sign
            baseString = baseString.replace("-", "");

            //Split digits from integers
            var values = baseString.split(".");

            //Fetch integers and digits
            var ints = values[0];
            var digits = "";
            if (values.length > 1)
                digits = values[1];

            //Format the left part of the number according to grouping char and size
            if (this.FormatInfo.NumberGroupSeparator != null
                && this.FormatInfo.NumberGroupSeparator.length > 0) {

                //Verifying if a first partial group is present
                var startLen = ints.length % this.FormatInfo.NumberGroupSizes;
                if (startLen == 0 && ints.length > 0)
                    startLen = this.FormatInfo.NumberGroupSizes;
                //Fetching the total number of groups
                var numberOfGroups = Math.ceil(ints.length / this.FormatInfo.NumberGroupSizes);
                //If only one, juste assign the value 
                if (numberOfGroups == 1) {
                    result += ints;
                }
                else {
                    // More than one group
                    //If a startlength is present, assign it so the rest of the string is a multiple of the group size
                    if (startLen > 0) {
                        result += ints.substring(0, startLen);
                        ints = ints.slice(-(ints.length - startLen));
                    }
                    //Group up the rest of the integers into their full groups
                    while (ints.length > 0) {
                        result += this.FormatInfo.NumberGroupSeparator + ints.substring(0, this.FormatInfo.NumberGroupSizes);
                        if (ints.length == this.FormatInfo.NumberGroupSizes)
                            break;
                        ints = ints.slice(-(ints.length - this.FormatInfo.NumberGroupSizes));
                    }
                }
            }
            else
                result += ints; //Left part is not grouped

            //If digits are present, concatenate them
            if (digits.length > 0)
                result += this.FormatInfo.NumberDecimalSeparator + digits;

            //If number is negative, decorate the number with the negative sign
            if (isNegative)
                result = this.FormatNegative(result);

            return result;
        },
        GetRegexPartForChar: function (part) {
            switch (part.charCodeAt(0)) {
                case 160:
                case 32:
                    return "[\\s\\xa0]";
                case 46:
                    return "[\\.]";
                default:
                    return "[" + part + "]";
            }
        },
        GetNegativeRegex: function () {
            ///<summary>Method creating a regex used to test if a number is negative or not</summary>
            ///<returns type="RegExp" />
            switch (this.FormatInfo.NumberNegativePattern) {
                case 0:
                    return new RegExp("^[(](" + this.BaseRegexText + ")[)]$");
                case 1:
                    return new RegExp("^" + this.FormatInfo.NegativeSign + "(" + this.BaseRegexText + ")$");
                case 2:
                    return new RegExp("^[" + this.FormatInfo.NegativeSign + " ](" + this.BaseRegexText + ")$");
                case 3:
                    return new RegExp("^(" + this.BaseRegexText + ")[-]$");
                case 4:
                    return new RegExp("^(" + this.BaseRegexText + ")[\s][-]$");
                default:
                    return null;
            }
        },
        FormatNegative: function (numberString) {
            ///<summary>Method used to format an unsigned string into un negative localized number</summary>
            ///<returns type="String" />
            switch (this.FormatInfo.NumberNegativePattern) {
                case 0:
                    return "(" + numberString + ")";
                case 1:
                    return this.FormatInfo.NegativeSign + numberString;
                case 2:
                    return this.FormatInfo.NegativeSign + " " + numberString;
                case 3:
                    return numberString + "-";
                case 4:
                    return numberString + " -";
                default:
                    return null;
            }
        }
    };
    _numberFormatter.__class = true;
})();