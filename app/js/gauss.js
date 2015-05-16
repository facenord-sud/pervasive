jQuery.GaussData = {
    2: [0.0108, 0.9784, 0.0108],
    5: [0.0269, 0.2334, 0.4794, 0.2334, 0.0269],
    10: [0.0136, 0.0477, 0.1172, 0.2011, 0.2808, 0.2011, 0.1172, 0.0477, 0.0136],
    15: [0.0090, 0.0218, 0.0448, 0.0784, 0.1169, 0.1486, 0.1610, 0.1486, 0.1169, 0.0784, 0.0448, 0.0218, 0.0090],
    20: [0.0067, 0.0133, 0.0240, 0.0393, 0.0589, 0.0807, 0.1010, 0.1156, 0.1209, 0.1156, 0.1010, 0.0807, 0.0589, 0.0393, 0.0240, 0.0133, 0.0067],
    30: [0.0072, 0.0110, 0.0161, 0.0227, 0.0306, 0.0397, 0.0494, 0.0592, 0.0681, 0.0753, 0.0799, 0.0815, 0.0799, 0.0753, 0.0681, 0.0592, 0.0494, 0.0397, 0.0306, 0.0227, 0.0161, 0.0110, 0.0072]
};
jQuery.Gauss = function (array, inputProperties, outputProperties, max, select) {
    //var select = '15';
    var gauss_weight = jQuery.GaussData;
    var gauss_weight_length = Math.floor(gauss_weight[select].length / 2);

    var calc = function (array, inputProperties, outputProperties, max) {
        var returnedObject = {};
        returnedObject.items = [];
        for (var i = gauss_weight_length; i < array.length - gauss_weight_length; i++) {
            var item = {};
            for (var j = 0; j < inputProperties.length; j++) {
                item[outputProperties[j]] = gaussianWeight(array, inputProperties[j], i);
                if (max) {
                    var max_prop = 'max_' + outputProperties[j];
                    if (returnedObject[max_prop] == undefined || returnedObject[max_prop] < item[outputProperties[j]]) {
                        returnedObject[max_prop] = item[outputProperties[j]]
                    }
                }
            }
            returnedObject.items.push(item);
        }
        returnedObject.weight_length = gauss_weight_length;
        return returnedObject;
    };

    var getProperty = function (obj, desc) {
        var arr = desc.split(".");

        //while (arr.length && (obj = obj[arr.shift()]));

        while (arr.length && obj) {
            var comp = arr.shift();
            var match = new RegExp("(.+)\\[([0-9]*)\\]").exec(comp);
            if ((match !== null) && (match.length == 3)) {
                var arrayData = {arrName: match[1], arrIndex: match[2]};
                if (obj[arrayData.arrName] != undefined) {
                    obj = obj[arrayData.arrName][arrayData.arrIndex];
                } else {
                    obj = undefined;
                }
            } else {
                obj = obj[comp]
            }
        }

        return obj;
    };

    var gaussianWeight = function (array, property, index) {
        var gaussian_calc = 0;
        for (var j = -gauss_weight_length; j <= gauss_weight_length; j++) {
            gaussian_calc = gaussian_calc + parseInt(getProperty(array[index + j], property)) * gauss_weight[select][j + gauss_weight_length];
        }
        return gaussian_calc;
    };

    return calc(array, inputProperties, outputProperties, max);
};

