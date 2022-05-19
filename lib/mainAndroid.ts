import { Connection, Keypair, PublicKey} from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';
import { decode} from 'micro-base58';

function addBridgeAndroid() {
    ;(function(window) {
        console.log("bridge11111111111111");
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

setTimeout(()=>{
    (async ()=>{
        //@ts-ignore
        const bridge = window.WebViewJavascriptBridge;
        if (!bridge){
            console.log("window.WebViewJavascriptBridge 没有挂载成功！！");
            addBridgeAndroid();
        } else {
            console.log("window.WebViewJavascriptBridge 挂载成功！！");
        }
        bridge.callHandler('generateSolanaWeb3', {'key': 'value'}, function(response) {
            console.log("solanaWeb3 初始化成功");
        });
        // solana主链币转账
        bridge.registerHandler('solanaMainTransfer',async function(data, responseCallback) {
            console.log("solanaMainTransfer---------->>>>>>");
        });
        // solana代币转账
        bridge.registerHandler('solanaTokenTransfer',  function(data, responseCallback) {
            (async ()=>{
                try {
                // ["secretKey": "231,191,64,41,87,172,66,114,26,9,197,223,69,18,108,118,27,196,58,13,158,179,240,37,29,174,65,94,75,71,29,141,205,251,48,22,55,59,127,205,24,19,152,10,39,65,168,161,84,99,0,24,56,100,177,174,254,155,4,178,36,171,142,212",
                // "decimals": 6, "amount": 1, "mintAuthority": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "toPublicKey": "36MjPHq5C2MLLMtQ3tCSUom6vUCjLruV5aUWta6EP4KL", "endpoint": "https://solana-mainnet.phantom.tech"]
                // const data = {toPublicKey:'36MjPHq5C2MLLMtQ3tCSUom6vUCjLruV5aUWta6EP4KL',amount:1,endpoint:'https://solana-mainnet.phantom.tech',mintAuthority:'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',secretKey:'231,191,64,41,87,172,66,114,26,9,197,223,69,18,108,118,27,196,58,13,158,179,240,37,29,174,65,94,75,71,29,141,205,251,48,22,55,59,127,205,24,19,152,10,39,65,168,161,84,99,0,24,56,100,177,174,254,155,4,178,36,171,142,212'};
                const connection = new Connection(data.endpoint, 'confirmed');
                console.log("connection--->");
                let toPublicKey = new PublicKey(data.toPublicKey);
                console.log("toPublicKey--->");
                console.log(data.secretKey);
                const finalSecret = decode(data.secretKey);
                let fromWallet = Keypair.fromSecretKey(finalSecret);
                console.log("fromWallet--->");
                console.log("createMint  begin--->");
                const mint =  new PublicKey(data.mintAuthority);
                console.log("createMint  end--->");

                // Get the token account of the fromWallet address, and if it does not exist, create it
                const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
                    connection,
                    fromWallet,
                    mint,
                    fromWallet.publicKey
                ) ;
                console.log("fromTokenAccount ->>>getOrCreateAssociatedTokenAccount----->>>>>>>");

                // Get the token account of the toWallet address, and if it does not exist, create it
                const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toPublicKey);
                console.log("toTokenAccount ->>>getOrCreateAssociatedTokenAccount----->>>>>>>");

                console.log('transfer begin:');
                let signature = await transfer(
                    connection,
                    fromWallet,
                    fromTokenAccount.address,
                    toTokenAccount.address,
                    fromWallet.publicKey,
                    Number(data.amount),
                );
                console.log('transfer tx:');
                console.log(signature);
                let ret = {result:"true",tx:signature};
                //JS拿到数据，返回给原生
                responseCallback(ret)
                }catch (err) {
                let ret = {result:"false",tx:err};
                //JS拿到数据，返回给原生
                responseCallback(ret)
                }
            })();
        });
    })();
},1500);


