/**
 * Code for regression extracted from jqplot.trendline.js
 *
 * Version: 1.0.0a_r701
 *
 * Copyright (c) 2009-2011 Chris Leonello
 * jqPlot is currently available for use in all personal or commercial projects
 * under both the MIT (http://www.opensource.org/licenses/mit-license.php) and GPL
 * version 2.0 (http://www.gnu.org/licenses/gpl-2.0.html) licenses. This means that you can
 * choose the license that best suits your project and use it accordingly.
 *
 **/
function fitData(data) {
  
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
    else if(data[i] != null && typeof data[i] === 'number' ){//If type of X axis is category
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

