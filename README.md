# line_intersection.js

A JavaScript library to find the intersection of two straight lines (useful for charting libraries). Also includes a function that generate trendline from a chart data.

## Methods
* **getLineIntersectionData(line1_data, line2_data, user_options)**

  Given two straight line data each of the form `[[x1, y1], [x2, y2], ... [xn, yn]]` this method will return an object that contains the intersection point and two "new line data" with the intersection point added. (Does not modify the input data!)
  
  If your data is not from a straight line but some chart data, use `getTrendlineData` to generate a straight trendline out of that data using Linear Regression.
  
* **getTrendlineData(data)**

  Given any linear chart data of the form `[[x1, y1], [x2, y2], ... [xn, yn]]` this method will generate a straight trendline using linear regression.

## Usage

#### getLineIntersectionData(line1_data, line2_data, /*optional*/ user_options)

```javascript
/**
 * @param line1_data - Mandatory argument that contains the data of line1 of the form 
 *                      [[x1, y1], [x2, y2], ... [xn, yn]]
 * 
 * @param line2_data - Mandatory argument that contains the data of line2 of the form 
 *                      [[x1, y1], [x2, y2], ... [xn, yn]]
 * 
 * @param user_options - Optional argument that is an object containing custom options that overrides the default
 *                      behavior of the method. Refer the comments for each option in the opt object for the valid
 *                      values for that option.
 */
 ```

**Basic example**
```javascript
var line1 = [[0, 1], [2, 1]];
var line2 = [[1, 0], [1, 2]];
var forecast = getLineIntersectionData(line1, line2);
JSON.stringify(forecast)
>> {"icptX": 1, "icptY": 1, "line1_data": [[0,1],[1,1],[2,1]], "line2_data": [[1,0],[1,1],[1,2]]}
```
