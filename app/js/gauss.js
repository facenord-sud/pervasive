jQuery.Gauss = function (array, inputProperties, outputProperties, max) {
    var gauss_weight = [0.0269, 0.2334, 0.4794, 0.2334, 0.0269];
    var gauss_weight_length = Math.floor(gauss_weight.length / 2);

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
            gaussian_calc = gaussian_calc + parseInt(getProperty(array[index + j], property)) * gauss_weight[j + gauss_weight_length];
        }
        return gaussian_calc;
    };

    return calc(array, inputProperties, outputProperties, max);
};

