function addBridgeAndroid() {
    ;(function(window) {
        console.log("addBridgeAndroid...");
        // @ts-ignore
        if (window.WebViewJavascriptBridge) {
            return;
        }
        // @ts-ignore
        window.WebViewJavascriptBridge = {
            registerHandler: registerHandler,
            callHandler: callHandler,
            handleMessageFromNative: handleMessageFromNative
        };
        var messageHandlers = {};
        var responseCallbacks = {};
        var uniqueId = 1;
        function registerHandler(handlerName, handler) {
            messageHandlers[handlerName] = handler;
        }
        function callHandler(handlerName, data, responseCallback) {
            if (arguments.length === 2 && typeof data == 'function') {
                responseCallback = data;
                data = null;
            }
            doSend({ handlerName:handlerName, data:data }, responseCallback);
        }
        function doSend(message, responseCallback) {
            if (responseCallback) {
                var callbackId = 'cb_'+(uniqueId++)+'_'+new Date().getTime();
                responseCallbacks[callbackId] = responseCallback;
                message['callbackId'] = callbackId;
            }
            // @ts-ignore
            window.normalPipe.postMessage(JSON.stringify(message));
        }
        function handleMessageFromNative(messageJSON) {
            var message = JSON.parse(messageJSON);
            var responseCallback;
            if (message.responseId) {
                responseCallback = responseCallbacks[message.responseId];
                if (!responseCallback) {
                    return;
                }
                responseCallback(message.responseData);
                delete responseCallbacks[message.responseId];
            } else {
                if (message.callbackId) {
                    var callbackResponseId = message.callbackId;
                    responseCallback = function(responseData) {
                        // @ts-ignore
                        doSend({ handlerName:message.handlerName, responseId:callbackResponseId, responseData:responseData });
                    };
                }
                var handler = messageHandlers[message.handlerName];
                if (!handler) {
                    console.log("WebViewJavascriptBridge: WARNING: no handler for message from Kotlin:", message);
                } else {
                    handler(message.data, responseCallback);
                }
            }
        }
    })(window);
}

(async () => {
    //@ts-ignore
    const bridge = window.WebViewJavascriptBridge;
    if (!bridge) {
        console.log("window.WebViewJavascriptBridge 没有挂载成功！！,TS正在尝试挂载");
        console.log("TypeScript正在尝试挂载");
        addBridgeAndroid();
        //@ts-ignore
        const bridge = window.WebViewJavascriptBridge;
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


