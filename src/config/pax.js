//HEX TO BASE64
	function hexToBase64(str) {
	  return $.base64.btoa(String.fromCharCode.apply(null,
	    str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
	  );
	}

	//BASE64 TO HEX
	function base64ToHex(str) {
	  for (var i = 0, bin = $.base64.atob(str), hex = []; i < bin.length; ++i) {
	    var tmp = bin.charCodeAt(i).toString(16);
	    if (tmp.length === 1) tmp = "0" + tmp;
	    hex[hex.length] = tmp;
	  }
	  return hex.join(" ");
	}

	function StringToHex(response){
		var responseHex = "";
		for(var i=0; i<response.length; i++){
			if(responseHex == "")
				responseHex = response.charCodeAt(i).toString(16).length<2?'0'+response.charCodeAt(i).toString(16):response.charCodeAt(i).toString(16);
			else
				responseHex += response.charCodeAt(i).toString(16).length<2?" " + '0'+response.charCodeAt(i).toString(16):" " + response.charCodeAt(i).toString(16);
		}
		return responseHex;
			
	}

	function HexToString(response){
		var responseHex = "";
		var arr = response.split(" ");
		for(var i=0; i<arr.length; i++){
			if(arr[i] == "")
				continue;
			responseHex += String.fromCharCode(parseInt(arr[i],16));
		}
		return responseHex;	
	}

	exports.PAX = {
		//IP of the POS
		mDestinationIP : "http://127.0.0.1:10009", // - OLD "http://192.167.2.100:10009";       //http://112.199.49.146:8181

		mStx : {
			hex: 0x02,
			code: "02"
		},
		
		mFS : {
			hex : 0x1c,
			code : "1c"
		},
		
		mEtx : {
			hex : 0x03,
			code : "03"
		},

		mUS : {
			hex : 0x1F,
			code : "1F"
		},

		//var _this : this;
		customData : '',

		timeout : {
			"Initialize":120*1000,
			"GetSignature":120*1000,
			"DoSignature":120*1000,
			"DoCredit":120*1000
		},

		//Set ip and port
		Settings : function(ip,port){
			this.mDestinationIP = "http://" + ip + ":" + port;
			console.log("New service address: "+this.mDestinationIP);
		},

		AjaxTimeOut : function(command,timeout){
			this.timeout[command]= timeout;
		},

		SetCustomData : function(custom_data){
			this.customData = custom_data;
			console.log(custom_data);
		},

		//Get LRC
		getLRC : function(params){
			var lrc = 0;
			for(i=1; i< params.length; i++){
				var type_of = typeof(params[i]);
				if(type_of == "string"){
					var element = params[i].split("");
					for(ii=0; ii<element.length; ii++){
						lrc ^= element[ii].charCodeAt(0);
					}
				}else{
					lrc ^= params[i];
				}
			}
			return (lrc>0)?String.fromCharCode(lrc):0;
		},
		
		

		//Connect to the server
		HttpCommunication : function(commandType,url,callback,timeout){
			var xhr = null;
		    if(window.XMLHttpRequest) {
		        xhr = new XMLHttpRequest();
		    } else {
		        try{
		            xhr = new ActiveXObject('Microsoft.XMLHttp');
		        }catch(e){
		            xhr = new ActiveXObject('msxml2.xmlhttp');
		        }
		    }
		    //get请求
	     
 			xhr.open("GET", url,true);
 			xhr.timeout = timeout;
 			xhr.onabort = function(e){
				alert("abort");
 				console.log(e);
				callback(e.type);
			};

 			xhr.ontimeout = function(e){
 				console.log("timeout error");
 				console.log(e);
 				callback(e.type);
 			};

 			xhr.onerror = function(e) {
				console.log("error");
 				console.log(e);
				callback(e.type);
			};

 			xhr.onload = function(e) { 
				if(this.status == 200){
					var response = xhr.responseText;
					console.log("Raw response: "+response);

					var checkParams = StringToHex(response).split(" ").pop();
					var RedundancyCheck = StringToHex(response).split(" ").pop().substring(1);
					
					var check = PAX.getLRC(checkParams);

					if(check == RedundancyCheck){
						//get package detail info
						var packetInfo = [];
						var len = StringToHex(response).indexOf("03");
						var hex = StringToHex(response).slice(0,len).split(/02|1c/);

						console.log(hex);
						if(commandType == "DoCredit"){
							var subHex=[], subPacketInfo=[];
							for(var i=0; i<hex.length; i++){
								if(hex[i] != ""){
									if(hex[i].indexOf("1f")>0){
										subHex = hex[i].split("1f");
										console.log(subHex);
										subPacketInfo = [];
										for(var j=0; j<subHex.length; j++){
											if(subHex[j]!=''){
												subPacketInfo.push(HexToString(subHex[j]));
											}
										}
										console.log(subPacketInfo);
										packetInfo.push(subPacketInfo);
									}else{
										packetInfo[i] = HexToString(hex[i]);
									}
								}
							}

						}else{
							for(var i=0; i<hex.length; i++){
								if(hex[i] != ""){
									packetInfo[i] = HexToString(hex[i]);
								}
							}
						}
						
						console.log("Separate package info: ");
						console.log(packetInfo);
						callback(packetInfo);	
					}	
				}
				else{
					console.log("error");
	 				console.log(e);
					callback("error");
				}
			};
         	xhr.send(null);
         	
			// $.ajax({
			// 	url: url,  
			// 	timeout: timeout,  
			// 	error: function (xmlHttpRequest, error) {  
			// 		console.log("Ajax error info: "+error);  
			// 		callback(error);
			// 	},
			// 	success:function(response){
			// 		console.log("success");
			// 		console.log("Raw response: "+response);

			// 		var checkParams = StringToHex(response).split(" ").pop();
			// 		var RedundancyCheck = StringToHex(response).split(" ").pop().substring(1);
					
			// 		var check = PAX.getLRC(checkParams);

			// 		if(check == RedundancyCheck){
			// 			//get package detail info
			// 			var packetInfo = [];
			// 			var len = StringToHex(response).indexOf("03");
			// 			var hex = StringToHex(response).slice(0,len).split(/02|1c/);

			// 			console.log(hex);
			// 			if(commandType == "DoCredit"){
			// 				var subHex=[], subPacketInfo=[];
			// 				for(var i=0; i<hex.length; i++){
			// 					if(hex[i] != ""){
			// 						if(hex[i].indexOf("1f")>0){
			// 							subHex = hex[i].split("1f");
			// 							console.log(subHex);
			// 							subPacketInfo = [];
			// 							for(var j=0; j<subHex.length; j++){
			// 								if(subHex[j]!=''){
			// 									subPacketInfo.push(HexToString(subHex[j]));
			// 								}
			// 							}
			// 							console.log(subPacketInfo);
			// 							packetInfo.push(subPacketInfo);
			// 						}else{
			// 							packetInfo[i] = HexToString(hex[i]);
			// 						}
			// 					}
			// 				}

			// 			}else{
			// 				for(var i=0; i<hex.length; i++){
			// 					if(hex[i] != ""){
			// 						packetInfo[i] = HexToString(hex[i]);
			// 					}
			// 				}
			// 			}
						
			// 			console.log("Separate package info: ");
			// 			console.log(packetInfo);
			// 			callback(packetInfo);	
			// 		}	
			// 	}
			// });  
		},

		Initialize : function(initialInfo,callback){
			var params = [this.mStx.hex,initialInfo.command,this.mFS.hex, initialInfo.version, this.mEtx.hex];
			//[02]A08[1c]1.28[1c]0[1c]90000[03]
			//var params = [0x02,"A08",0x1c,"1.28",0x1c, "0", 0x1c,"90000",0x03];
			var lrc = this.getLRC(params);
			var command_hex = base64ToHex($.base64.btoa(initialInfo.command));
			var version_hex = base64ToHex($.base64.btoa(initialInfo.version));
			//var elements = [this.mStx, command_hex, this.mFS, version_hex, this.mEtx, base64ToHex($.base64.btoa(lrc))];
			var elements = [this.mStx.code, command_hex, this.mFS.code, version_hex, this.mEtx.code, base64ToHex($.base64.btoa(lrc))];

			var final_string = elements.join(" ");
			//console.log("final_string: " + final_string);

			var final_b64 = hexToBase64(final_string);
			console.log("LRC: " + lrc);
			console.log("Base64: " + final_b64);
			var url = this.mDestinationIP + '?' + final_b64;
			console.log("URL: " + url);

			this.HttpCommunication('Initialize',url,function(response){
				callback(response);
			},PAX.timeout.Initialize);

		},
		//GET SIGNATURE
		GetSignature : function(getSignatureInfo,callback){
		
			var params = [this.mStx.hex,getSignatureInfo.command,this.mFS.hex,getSignatureInfo.version,this.mFS.hex, getSignatureInfo.offset, this.mFS.hex,getSignatureInfo.requestlength,this.mEtx.hex];
			var lrc = this.getLRC(params);

			//prepare for base64 encoding.
			var command_hex = base64ToHex($.base64.btoa(getSignatureInfo.command));
			var version_hex = base64ToHex($.base64.btoa(getSignatureInfo.version));
			var offset_hex = base64ToHex($.base64.btoa(getSignatureInfo.offset));
			var requestlength_hex = base64ToHex($.base64.btoa(getSignatureInfo.requestlength));
			//var elements = [this.mStx.code, command_hex, this.mFS.code, version_hex, this.mFS.code, offset_hex, this.mFS.code, requestlength_hex, this.mEtx.code, base64ToHex($.base64.btoa(lrc))];
			var elements = [this.mStx.code];
			elements.push(command_hex);
			elements.push(this.mFS.code);
			elements.push(version_hex);
			elements.push(this.mFS.code);
			if(offset_hex != ''){
				elements.push(offset_hex);
			}
			elements.push(this.mFS.code);
			if(requestlength_hex != ''){
				elements.push(requestlength_hex);
			}
			elements.push(this.mEtx.code);
			elements.push(base64ToHex($.base64.btoa(lrc)));
			
			var final_string = elements.join(" ");
			var final_b64 = hexToBase64(final_string);
			console.log("LRC: " + lrc);
			console.log("Base64: " + final_b64);
			var url = this.mDestinationIP + '?' + final_b64;
			console.log("URL: " + url);

			this.HttpCommunication('GetSignature',url,function(response){
				callback(response);
			},PAX.timeout.GetSignature);
			
		},
		
		//DO SIGNATURE
		DoSignature : function(doSignatureInfo,callback){
			var params = [this.mStx.hex,doSignatureInfo.command, this.mFS.hex, doSignatureInfo.version, this.mFS.hex, doSignatureInfo.uploadFlag, this.mFS.hex,doSignatureInfo.hostReferenceNumber, this.mFS.hex, doSignatureInfo.edcType, this.mFS.hex, doSignatureInfo.timeout, this.mEtx.hex];
			var lrc = this.getLRC(params);

			//prepare for base64 encoding.
			var command_hex = base64ToHex($.base64.btoa(doSignatureInfo.command));
			var version_hex = base64ToHex($.base64.btoa(doSignatureInfo.version));
			var uploadFlag_hex = base64ToHex($.base64.btoa(doSignatureInfo.uploadFlag));
			var hostReferenceNumber_hex = base64ToHex($.base64.btoa(doSignatureInfo.hostReferenceNumber));
			var edcType_hex = base64ToHex($.base64.btoa(doSignatureInfo.edcType));
			var timeout_hex = base64ToHex($.base64.btoa(doSignatureInfo.timeout));
			var elements = [this.mStx.code];
			elements.push(command_hex);
			elements.push(this.mFS.code);
			elements.push(version_hex);
			elements.push(this.mFS.code);
			if(uploadFlag_hex != ''){
				elements.push(uploadFlag_hex);
			}
			elements.push(this.mFS.code);
			if(hostReferenceNumber_hex != ''){
				elements.push(hostReferenceNumber_hex);
			}
			elements.push(this.mFS.code);
			if(edcType_hex != ''){
				elements.push(edcType_hex);
			}
			elements.push(this.mFS.code);
			if(timeout_hex != ''){
				elements.push(timeout_hex);
			}
			elements.push(this.mEtx.code);
			elements.push(base64ToHex($.base64.btoa(lrc)));
			
			var final_string = elements.join(" ");
			var final_b64 = hexToBase64(final_string);
			console.log("LRC: " + lrc);
			console.log("Base64: " + final_b64);
			var url = this.mDestinationIP + '?' + final_b64;
			console.log("URL: " + url);

			this.HttpCommunication('DoSignature',url,function(response){
				callback(response);
			},PAX.timeout.DoSignature);
			
		},
		

		PushParams : function(params,type,objectInfo){
			var empty = 0;
			var arr = [];
			arr = arr.concat(params);
			for(name in objectInfo){
				if(objectInfo[name] == '' && type!="additionalInformation")
				{
					arr.push(this.mUS.hex);
					continue;
				}

				if(type == "additionalInformation"){
					if(objectInfo[name] == ''){
						continue;
					}
					empty++;
					arr.push(name+"="+objectInfo[name].toString());
				}else{
					empty++;
					arr.push(objectInfo[name].toString());
				}
				arr.push(this.mUS.hex);
			}
			arr.pop();
			if(empty==0 && type!="additionalInformation"){
				arr = params;
			}
			if(empty==0 && type=="additionalInformation"){
				arr.push(this.mFS.hex);
			}
			//console.log(params);
			return arr;
		},
		AddBase64 : function(elements,type,objectInfo){
			//console.log(objectInfo);
			var empty = 0;
			var arr = [];
			arr = arr.concat(elements);
			for(name in objectInfo){
				if(objectInfo[name] == '' && type!="additionalInformation")
				{
					arr.push(this.mUS.code);
					continue;
				}
				if(type == "additionalInformation"){
					if(objectInfo[name] == '')
						continue;
					empty++;
					arr.push(base64ToHex($.base64.btoa(name+"="+objectInfo[name].toString())));
				}else{
					empty++;
					arr.push(base64ToHex($.base64.btoa(objectInfo[name].toString())));
				}
				arr.push(this.mUS.code);
			}
			arr.pop();
			if(empty==0 && type!="additionalInformation"){
				arr = elements;
			}
			if(empty==0 && type=="additionalInformation"){
				arr.push(this.mFS.code);
			}
			//console.log(arr);
			return arr;
		},
		//DO Credit
		DoCredit : function(doCreditInfo,callback){
			var amountInformation,accountInformation,traceInformation,avsInformation,cashierInformation,commercialInformation,motoEcommerce,additionalInformation;
			var params = [this.mStx.hex,doCreditInfo.command, this.mFS.hex, doCreditInfo.version];
			params.push(this.mFS.hex);
			if(doCreditInfo.transactionType != ''){
				params.push(doCreditInfo.transactionType);
			}
			params.push(this.mFS.hex);
			params = this.PushParams(params,"amountInformation",doCreditInfo.amountInformation);

			params.push(this.mFS.hex);
			params = this.PushParams(params,"accountInformation",doCreditInfo.accountInformation);
			
			params.push(this.mFS.hex);
			params = this.PushParams(params,"traceInformation",doCreditInfo.traceInformation);
			
			params.push(this.mFS.hex);
			params = this.PushParams(params,"avsInformation",doCreditInfo.avsInformation);
			
			params.push(this.mFS.hex);
			params = this.PushParams(params,"cashierInformation",doCreditInfo.cashierInformation);
			
			params.push(this.mFS.hex);
			params = this.PushParams(params,"commercialInformation",doCreditInfo.commercialInformation);
			
			params.push(this.mFS.hex);
			params = this.PushParams(params,"motoEcommerce",doCreditInfo.motoEcommerce);
			
			params.push(this.mFS.hex);
			params = this.PushParams(params,"additionalInformation",doCreditInfo.additionalInformation);

			params.push(this.mEtx.hex);
			
			var lrc = this.getLRC(params);

			console.log(params);

			//prepare for base64 encoding.
			var command_hex = base64ToHex($.base64.btoa(doCreditInfo.command));
			var version_hex = base64ToHex($.base64.btoa(doCreditInfo.version));
			var transactionType_hex = base64ToHex($.base64.btoa(doCreditInfo.transactionType));
			var amountInformation_hex = base64ToHex($.base64.btoa(doCreditInfo.amountInformation));
			var accountInformation_hex = base64ToHex($.base64.btoa(doCreditInfo.accountInformation));
			var traceInformation_hex = base64ToHex($.base64.btoa(doCreditInfo.traceInformation));
			var avsInformation_hex = base64ToHex($.base64.btoa(doCreditInfo.avsInformation));
			var cashierInformation_hex = base64ToHex($.base64.btoa(doCreditInfo.cashierInformation));
			var commercialInformation_hex = base64ToHex($.base64.btoa(doCreditInfo.commercialInformation));
			var motoEcommerce_hex = base64ToHex($.base64.btoa(doCreditInfo.motoEcommerce));
			var additionalInformation_hex = base64ToHex($.base64.btoa(doCreditInfo.additionalInformation));
			
			//var elements = [this.mStx.code, command_hex, this.mFS.code, version_hex, this.mFS.code, uploadFlag_hex, this.mFS.code, timeout, this.mEtx.code, base64ToHex($.base64.btoa(lrc))];
			var elements = [this.mStx.code];
			elements.push(command_hex);
			elements.push(this.mFS.code);
			elements.push(version_hex);
			elements.push(this.mFS.code);
			
			if(transactionType_hex != ''){
				elements.push(transactionType_hex);
			}
			elements.push(this.mFS.code);

			elements = this.AddBase64(elements,"amountInformation",doCreditInfo.amountInformation);
			elements.push(this.mFS.code);
			elements = this.AddBase64(elements,"accountInformation",doCreditInfo.accountInformation);
			elements.push(this.mFS.code);
			elements = this.AddBase64(elements,"traceInformation",doCreditInfo.traceInformation);
			elements.push(this.mFS.code);
			elements = this.AddBase64(elements,"avsInformation",doCreditInfo.avsInformation);
			elements.push(this.mFS.code);
			elements = this.AddBase64(elements,"cashierInformation",doCreditInfo.cashierInformation);
			elements.push(this.mFS.code);
			elements = this.AddBase64(elements,"commercialInformation",doCreditInfo.commercialInformation);
			elements.push(this.mFS.code);
			elements = this.AddBase64(elements,"motoEcommerce",doCreditInfo.motoEcommerce);
			elements.push(this.mFS.code);
			elements = this.AddBase64(elements,"additionalInformation",doCreditInfo.additionalInformation);

			elements.push(this.mEtx.code);
			elements.push(base64ToHex($.base64.btoa(lrc)));
			console.log("elements");
			console.log(elements);

			var final_string = elements.join(" ");
			var final_b64 = hexToBase64(final_string);
			console.log("LRC: " + lrc);
			console.log("Base64: " + final_b64);

			// if(customData != ''){
			// 	final_b64 = hexToBase64(final_string+"&custom_data=<PAX>"+customData+"</PAX>");
			// }


			var url = this.mDestinationIP + '?' + final_b64;
					console.log("URL: " + url);

			this.HttpCommunication('DoCredit',url,function(response){
				callback(response);
			},PAX.timeout.DoCredit);
		}
	};