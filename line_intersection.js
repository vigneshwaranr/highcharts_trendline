/*!
 * line_intersection.js javascript library
 * https://github.com/vigneshwaranr/line_intersection.js
 *
 * Includes code extracted from highcharts_trendline library
 * https://github.com/virtualstaticvoid/highcharts_trendline/blob/65d53dd1ce64648d97a2dbb49444bbb522cec313/regression.js
 *
 * Copyright (c) 2013 Vigneshwaran Raveendran <vigneshwaran2007@gmail.com>
 * Copyright (c) 2011-2013 Chris Stefano <virtualstaticvoid@gmail.com>
 *
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */


/**
 * Given two straight line data each of the form [[x1, y1], [x2, y2], ... [xn, yn]]
 * this method will return an object that contains the intersection point and two "new line data"
 * with the intersection point added. (Does not modify the input data!)
 * 
 * @param line1_data - Mandatory argument that contains the data of line1 of the form 
 *                      [[x1, y1], [x2, y2], ... [xn, yn]]
 * 
 * @param line2_data - Mandatory argument that contains the data of line2 of the form 
 *                      [[x1, y1], [x2, y2], ... [xn, yn]]
 * 
 * @param user_options - Optional argument that is an object containing custom options that overrides the default
 *                      behavior of the method. Refer the comments for each option in the opt object for the valid
 *                      values for that option.
 * 
 * @returns
 * > an object with the following properties
 *     icptX - The intersection point X
 *     icptY - The intersection point Y
 *     line1_data - The new line1 data with intersection point added
 *     line2_data -  // The new line2 data with intersection point added
 * > or returns undefined
 *     if the lines are parallel, 
 *     if the lines are already intersecting (you'll still get the points as arguments to 
 *          onLinesAlreadyMeet callback you passed in user_options),
 *     if any of the first two arguments are not in the form [[x1, y1], [x2, y2], ... [xn, yn]]
 *     if any of the line data has less than 2 points (it's not a line then)
 *     if the user_options argument or any of the options inside it is not in the required format.
 */
function getLineIntersectionData(line1_data, line2_data, user_options) {
    var opt = {
        /**
         * The point array/object for the intersection points that will be inserted to the line arrays.
         * By default the point will be inserted as [icptX, icptY] to both the new lines "that will be returned".
         * (This method won't modify supplied line arrays)
         * 
         * If you are using this method for highcharts, You may customize this by setting icptPoint to a custom object.
         * Set any custom parameters except x and y which will be set/overridden with the intersection point
         * (Refer: http://api.highcharts.com/highcharts#series.data for the parameters supported by highcharts)
         * 
         * Ignore this if you are using a charting library other than highcharts
         */
        icptPoint: [],

        /**
         * Override this method to customize the behavior
         * if the lines are parallel (never meets). 
         * 
         * (like =, ||, //)
         * 
         * Does not proceed further after this method is called.
         */
        onParallel: function () {
            console.log('Parallel lines can never meet');
        },

        /**
         * Override this method to customize the behavior
         * if the lines already meet.
         * 
         * (like X, >, <)
         * 
         * Does not proceed further after this method is called.
         * 
         * @param icptX - intersection point X
         * @param icptY - intersection point Y         
         */
        onLinesAlreadyMeet: function (icptX, icptY) {
            console.log('Lines already meet at (' + icptX + ',' + icptY + ')');
        },

        /**
         * Accepts a callback function that returns true or false
         * 
         * Use this to validate the intersection points before connecting the lines.
         *
         * For example, you might not want the connect the lines if the 
         * intersection point is too far away.
         * 
         * Does not proceed further if the function does not return true
         * 
         * @param icptX - intersection point X
         * @param icptY - intersection point Y         
         */
        validateIntersection: function (icptX, icptY) {
            return true;
        },

        /**
         * Accepts a boolean value or a function that returns 
         * a boolean value.
         *
         * For example, If you don't want the lines to meet beyond the left side
         * of the first point of either of the lines, 
         * set canConvergeLeft to false
         *
         * Setting both of them to false has no use.
         */
        canConvergeLeft: true,
        canConvergeRight: true
    };

    // Validate whether the first two arguments are of the form:
    // [[x1, y1], [x2, y2], ... [xn, yn]]
    var _tmp_arr = [line1_data, line2_data, line1_data[0], line2_data[0]];
    for (var i = 0; i < _tmp_arr.length; i++) {
        if (Object.prototype.toString.call(_tmp_arr[i]) !== "[object Array]") {
            console.error('The first two arguments should each be of ' +
                          'the form: [[x1, y1], [x2, y2], ... [xn, yn]]');
            return;
        }
    }
    

    if (line1_data.length <= 1 || line2_data.length <= 1) {
        console.error('Each line must have at least two point');
        return;
    }

    user_options = user_options || {};
    if (Object.prototype.toString.call(user_options) !== '[object Object]') {
        console.error('user_options argument must be an object');
        return;
    }

    for (var key in user_options) {
        if (opt.hasOwnProperty(key)) { // If the user given options contain any valid option, ...
            opt[key] = user_options[key]; // ..that option will be put in the opt object.
        }
    }

    // NOTE: Shallow copying. Lets do only insertion and not modify any inner arrays
    var line1 = line1_data.slice(),
        line2 = line2_data.slice();

    // First and last points of line1
    var x1 = line1[0][0],
        y1 = line1[0][1],
        x2 = line1[line1.length - 1][0],
        y2 = line1[line1.length - 1][1];
    
    // First and last points of line2
    var x3 = line2[0][0],
        y3 = line2[0][1],
        x4 = line2[line2.length - 1][0],
        y4 = line2[line2.length - 1][1];

    var denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (denom == 0) {
        // denom == 0 means lines are parallel or coincident
        // (Refer: http://en.wikipedia.org/wiki/Line-line_intersection#Mathematics)
        if (typeof opt.onParallel === 'function') {
            opt.onParallel();
        } else {
            console.log('onParallel must be a function');
        }
        return;
    } else if (denom > 0) {
        // denom > 0 means lines converge towards right 
        // (like > or X)
        if (typeof opt.canConvergeRight === 'boolean' && !opt.canConvergeRight) {
            return;
        }
        if (typeof opt.canConvergeRight === 'function' && !opt.canConvergeRight()) {
            return;
        }
    } else {
        // denom < 0 means lines converge towards left
        // (like <)
        if (typeof opt.canConvergeLeft === 'boolean' && !opt.canConvergeLeft) {
            return;
        }
        if (typeof opt.canConvergeLeft === 'function' && !opt.canConvergeLeft()) {
            return;
        }
    }

    var line1DX = (x2 - x1),
        line1DY = (y2 - y1),
        line2DX = (x4 - x3),
        line2DY = (y4 - y3),
        line1M = line1DY / line1DX,
        line2M = line2DY / line2DX,
        line1C = y1 - line1M * x1,
        line2C = y3 - line2M * x3,
        icptX = -1 * (line1C - line2C) / (line1M - line2M),
        icptY = line1M * icptX + line1C;

    if (icptX >= x1 && icptX <= x2 && icptX >= x3 && icptX <= x4) {
        // The two lines already meet (like X, > or <)
        if (typeof opt.onLinesAlreadyMeet === 'function') {
            opt.onLinesAlreadyMeet(icptX, icptY);
        } else {
            console.error('onLinesAlreadyMeet must be a function');
        }
        return;
    }

    // Validate the intersection points before proceeding further
    if (typeof opt.validateIntersection === 'function') {
        if (!opt.validateIntersection(icptX, icptY)) {
            return;
        }
    } else {
        console.error('validateIntersection must be a function');
    }

    var point_type = Object.prototype.toString.call(opt.icptPoint);
    if (point_type === '[object Array]') {
        opt.icptPoint = [icptX, icptY];
    } else if (point_type === '[object Object]') {
        opt.icptPoint.x = icptX;
        opt.icptPoint.y = icptY;
    } else {
        console.error('Invalid icptPoint');
        return;
    }

    var lines = [line1, line2];
    if (icptX > x1) {
        // x values must always be sorted in highcharts and many other chart libraries
        for (var idx = 0; idx < lines.length; idx++) {
            var line = lines[idx];
            for (var i = line.length - 1; i >= 0; i--) {
                if (line[i][0] < icptX) {
                    line.splice(i + 1, 0, opt.icptPoint);
                    break;
                }
            }
        }
    } else {
        for (var idx = 0; idx < lines.length; idx++) {
            var line = lines[idx];
            for (var i = 0; i < line.length; i++) {
                if (line[i][0] > icptX) {
                    line.splice(i, 0, opt.icptPoint);
                    break;
                }
            }
        }
    }

    return {
        icptX: icptX,      // The intersection point X
        icptY: icptY,      // The intersection point Y
        line1_data: line1, // The new line1 data with intersection point added
        line2_data: line2  // The new line2 data with intersection point added
    };

}


/**
 * Given any linear chart data of the form [[x1, y1], [x2, y2], ... [xn, yn]]
 * this method will generate a straight trendline using linear regression.
 * 
 * @returns an object containing the following properties
 *      data - new array containing the data for the straight trendline
 *      slope - slope of the trendline
 *      intercept - intercept of the trendline
 * 
 */
function getTrendlineData(data) {
 
    var regression = function(x, y) {
        var N = x.length;
        var slope;
        var intercept;
        var SX = 0;
        var SY = 0;
        var SXX = 0;
        var SXY = 0;
        var SYY = 0;
        var Y = y;
        var X = x;
        
        for (var i = 0; i < N; i++) {
            SX = SX + X[i];
            SY = SY + Y[i];
            SXY = SXY + X[i] * Y[i];
            SXX = SXX + X[i] * X[i];
            SYY = SYY + Y[i] * Y[i];
        }
        
        slope = (N * SXY - SX * SY) / (N * SXX - SX * SX);
        intercept = (SY - slope * SX) / N;
        
        return [slope, intercept];
    }

    var ret;
    var res;
    var x = [];
    var y = [];
    var ypred = [];

    for (i = 0; i < data.length; i++) {
        if (data[i] != null && Object.prototype.toString.call(data[i]) === '[object Array]') {
            if (data[i] != null && data[i][0] != null && data[i][1] != null) {
                x.push(data[i][0]);
                y.push(data[i][1]);
            }
        }
        else if(data[i] != null && typeof data[i] === 'number' ) { // If type of X axis is category
            x.push(i);
            y.push(data[i]);
        }
    }

    ret = regression(x, y);
    for (var i = 0; i < x.length; i++) {
        res = ret[0] * x[i] + ret[1];
        ypred.push([x[i], res]);
    }

    return {
        data: ypred,
        slope: ret[0],
        intercept: ret[1]
    };
}

