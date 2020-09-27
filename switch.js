// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ freeboard-switch-plugin                                            │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ http://blog.onlinux.fr/?tag=freeboard                              │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                    │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Freeboard widget plugin for Highcharts.                            │ \\
// └────────────────────────────────────────────────────────────────────┘ \\
(function()
{
    //
    // DECLARATIONS
    //
    var LOADING_INDICATOR_DELAY = 1000;
    var SWITCH_ID = 0;
    //
   
    
    freeboard.loadWidgetPlugin({
        type_name: "switch_plugin",
        display_name: "Switch",
        description : "Interactive on-off switch",
        settings: [
            {
                name: "title",
                display_name: "Title",
                type: "text"
            },
            {
                name: "value",
                display_name: "Value",
                type: "calculated"
            },
            {
                name: "urlOn",
                display_name: "url On ",
                type: "calculated"
            },
            {
                name: "urlOff",
                display_name: "url Off ",
                type: "calculated"
            },
            {
                name: "on_text",
                display_name: "On Text",
                type: "text",
                default_value: 'On'
            },
            {
                name: "off_text",
                display_name: "Off Text",
                type: "text",
                default_value: 'Off'
            },

        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new wswitch(settings));
        }
    });

     freeboard.addStyle ('.floating-box',"display: inline-block; vertical-align: top; width: 78px; background-color: #222;margin-top: 10px; margin-right: 5px;");
     
     freeboard.addStyle ('.onoffswitch-title',"font-size: 17px; line-height: 29px; width: 65%; height: 29px; padding-left: 10px;border: 1px solid #3d3d3d;");
     freeboard.addStyle ('.round' ,"border-radius: 50%;");
    var wswitch = function (settings) {
        var self = this;    
        var thisWidgetId = "onoffswitch-" + SWITCH_ID++;
        var currentSettings = settings;

        var box1 =  $('<div class="floating-box"></div>');
        var box2 =  $('<div class="floating-box onoffswitch-title">' + settings.title + '</div>');
        
        var onOffSwitch = $('<div class="onoffswitch"><label class="onoffswitch-label" for="'+ thisWidgetId +'"><div class="onoffswitch-inner"><span class="on"></span><span class="off"></span></div><div class="onoffswitch-switch round"></div></label></div>');
        
        
        //onOffSwitch.find("span.on").text("True");
        
        onOffSwitch.prependTo(box1);
        
        var isOn = false;
        var onText;
        var offText;
        var url;
        
        function updateState() {
            console.log("isOn: " + isOn);
            $('#'+thisWidgetId).prop('checked', isOn);
            console.log(onOffSwitch.find("span.on"));
            onOffSwitch.find("span.on").text(onText);
            onOffSwitch.find("span.off").text(offText);
        }
        
        var alertContents = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    console.log(request.responseText);
                    setTimeout(function(){
                        freeboard.showLoadingIndicator(false);
                        //freeboard.showDialog($("<div align='center'>Request response 200</div>"),"Success!","OK",null,function(){});
                    }, LOADING_INDICATOR_DELAY);
                } else {
                    console.log('There was a problem with the request.');
                    setTimeout(function(){
                        freeboard.showLoadingIndicator(false);
                        freeboard.showDialog($("<div align='center'>There was a problem with the request. Code " + request.status  + request.responseText + " </div>"),"Error!","OK",null,function(){});
                    }, LOADING_INDICATOR_DELAY);  
                }
                
            }
            
        }
         
        var request;
        
        var sendValue = function (url, options) {
            console.log(url, options);
            request = new XMLHttpRequest();
            if (!request) {
                console.log('Giving up :( Cannot create an XMLHTTP instance');
                return false;
            }
            request.onreadystatechange = alertContents;
            request.open('GET', url, true);
            freeboard.showLoadingIndicator(true);
            request.send();
        }

        this.render = function (element) {
           
            $(element).append(box1).append(box2);
             var input = $('<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="'+ thisWidgetId +'">').prependTo(onOffSwitch).change(function()
                {
                    isOn =!isOn;
                    console.log( thisWidgetId + ": toogled " + isOn);
                    url = (isOn) ? currentSettings.urlOn: currentSettings.urlOff;
                    if ( _.isUndefined(url) )
                        freeboard.showDialog($("<div align='center'>url undefined</div>"),"Error!","OK",null,function(){});
                    else {
                        sendValue(url, isOn);
                 
                    }
                    
                });
        }

        this.onSettingsChanged = function (newSettings) {
            currentSettings = newSettings;
            box2.html((_.isUndefined(newSettings.title) ? "" : newSettings.title));
            console.log( "isUndefined on_text: " + _.isUndefined(newSettings.on_text) );
            onText = newSettings.on_text;
            offText = newSettings.off_text;
            updateState();
        }

        this.onCalculatedValueChanged = function (settingName, newValue) {
            console.log(settingName, newValue);
            
            if (settingName == "value") {
                isOn = Boolean(newValue);
            }
            if (settingName == "urlOn") {
                urlOn = newValue;
            }
            if (settingName == "urlOff") {
                urlOff = newValue;
            }
            updateState();
        }
        
       
        

        
        this.onDispose = function () {
        }

        this.getHeight = function () {
            return 1;
        }

        this.onSettingsChanged(settings);
    };

}());
