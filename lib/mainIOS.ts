(async () => {
    //@ts-ignore
    const bridge = window.WebViewJavascriptBridge;
    if (!bridge) {
        console.log("window.WebViewJavascriptBridge 没有挂载成功！！");
        return;
    } else {
        console.log("window.WebViewJavascriptBridge 挂载成功！！");
    }
    bridge.callHandler('DeviceLoadJavascriptSuccess', {key: 'JSValue'}, function(response) {
        let result = response.result
        if (result === "iOS") {
            console.log("Javascript was loaded by IOS and successfully loaded.");
            window.iOSLoadJSSuccess = true;
        } else if (result === "Android") {
            console.log("Javascript was loaded by Android and successfully loaded.");
            window.AndroidLoadJSSuccess = true;
        }
    });

    bridge.registerHandler('PlayLOL', function (data, responseCallback) {
        let ret = {result: false, txid: "err"};
        //JS拿到数据，返回给原生
        responseCallback(ret);
    });

    bridge.registerHandler('PlayDNF', function (data, responseCallback) {
            let ret = {result: false, txid: "e"};
            //JS拿到数据，返回给原生
            responseCallback(ret);

    });
})();


