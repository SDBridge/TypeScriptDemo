import { addBridgeForAndroidWebView } from 'sdbridge-android';

(async () => {
    //@ts-ignore
    let bridge = window.WebViewJavascriptBridge;
    if (!bridge) {
        console.log("window.WebViewJavascriptBridge 没有挂载成功！！,TS正在尝试挂载");
        console.log("TypeScript正在尝试挂载");
        addBridgeForAndroidWebView();
        //@ts-ignore
        bridge = window.WebViewJavascriptBridge;
        if (bridge){
            console.log("window.WebViewJavascriptBridge, 已经被TypeScript挂载成功！！");
        }
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

    bridge.registerHandler('GetToken', function (data, responseCallback) {
        let result = {token: "I am javascript's token"}
        //JS gets the data and returns it to the native
        responseCallback(result)
    });

    bridge.registerHandler('AsyncCall', function (data, responseCallback) {
        // Call await function must with  (async () => {})();
        (async () => {
            const callback = await generatorLogNumber(1);
            let result = {token: callback};
            responseCallback(result);
        })();
    });

    function generatorLogNumber(n){
        return new Promise(res => {
            setTimeout(() => {
                res("Javascript async/await callback Ok");
            }, 1000);
        })
    }
})();


