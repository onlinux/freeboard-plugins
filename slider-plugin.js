// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ freeboard-slider-plugin                                            │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ http://blog.onlinux.fr/?tag=freeboard                              │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                    │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Freeboard widget plugin.                                           │ \\
// └────────────────────────────────────────────────────────────────────┘ \\
(function()
{
    //
    // DECLARATIONS
    //
    var LOADING_INDICATOR_DELAY = 1000;
    var SLIDER_ID = 0;
        
    freeboard.addStyle ('.slider',"border: 2px solid #3d3d3d;background-color: #222;margin: 10px;");
    freeboard.addStyle ('.slider-label','margin-left: 10px; margin-top: 10px; text-transform: capitalize;');
    freeboard.addStyle ('.myui-slider-handle', "width: 1.5em !important; height: 1.5em !important; border-radius: 50%; top: -.4em !important; margin-left:-1.0em !important;");
    freeboard.addStyle ('.ui-slider-range', 'background: #F90;');

	// ## A Widget Plugin
	//
	// -------------------
	// ### Widget Definition
	//
	// -------------------
	// **freeboard.loadWidgetPlugin(definition)** tells freeboard that we are giving it a widget plugin. It expects an object with the following:
	freeboard.loadWidgetPlugin({
		// Same stuff here as with datasource plugin.
		"type_name"   : "slider_plugin",
		"display_name": "Slider",
                "description" : "Interactive Slider Plugin",
		// **external_scripts** : Any external scripts that should be loaded before the plugin instance is created.
		"external_scripts": [
                    "https://code.jquery.com/ui/1.12.0/jquery-ui.js",
                    "https://code.jquery.com/ui/1.12.0/themes/base/jquery-ui.css"
		],
		// **fill_size** : If this is set to true, the widget will fill be allowed to fill the entire space given it, otherwise it will contain an automatic padding of around 10 pixels around it.
		"fill_size" : true,
		"settings"    : [
			{
				"name"        : "title",
				"display_name": "Title",
				"type"        : "text"
			},
                        {
				"name"        : "min",
				"display_name": "Min",
				"type"        : "calculated",
                                "default_value": "0"
			},
                        {
				"name"        : "max",
				"display_name": "Max",
				"type"        : "calculated",
                                "default_value": "100"
			},
			{
				"name"        : "value",
				"display_name": "Value",
				"type"        : "calculated"
			},
                        {
                                name: "url",
                                display_name: "url On Changed %VALUE% ",
                                type: "calculated"
                        }
		],
		// Same as with datasource plugin, but there is no updateCallback parameter in this case.
		newInstance   : function(settings, newInstanceCallback)
		{
			newInstanceCallback(new slider(settings));
		}
	});


	// ### Widget Implementation
	//
	// -------------------
	// Here we implement the actual widget plugin. We pass in the settings;
	var slider = function(settings)
	{
		var self = this;
		var currentSettings = settings;
                
                var thisWidgetId = "slider-" + SLIDER_ID++;
                var thisWidgetContainer = $('<div class="slider-widget slider-label" id="__' + thisWidgetId + '"></div>');
                
                
                var titleElement = $('<h2 class="section-title slider-label"></h2>');
                var valueElement = $('<div id="value-' + thisWidgetId + '" style="display:inline-block; padding-left: 10px; font-weight:bold; color: #d3d4d4" ></div>');
                var sliderElement = $('<div class="slider" id="' + thisWidgetId + '"></div>');
                var theSlider = '#' + thisWidgetId;
                
                //console.log( "theSlider ", theSlider);
                
                var value = (_.isUndefined(currentSettings.value) ? 50: currentSettings.value);
                titleElement.html( (_.isUndefined(currentSettings.title) ? "": currentSettings.title) );
                var min = (_.isUndefined(currentSettings.min) ? 0: currentSettings.min);
                var max = (_.isUndefined(currentSettings.max) ? 100: currentSettings.max);
                
                var requestChange = false;
                var url;
                
		// Here we create an element to hold the text we're going to display. We're going to set the value displayed in it below.
		
		// **render(containerElement)** (required) : A public function we must implement that will be called when freeboard wants us to render the contents of our widget. The container element is the DIV that will surround the widget.
		self.render = function(containerElement)
		{
                        $(containerElement)
                        .append(thisWidgetContainer);
                        titleElement.appendTo(thisWidgetContainer);
                        $(titleElement).append(valueElement);
                        sliderElement.appendTo(thisWidgetContainer);

                        $( theSlider ).slider({
                            classes: {
				"ui-slider-range": "ui-corner-all",
                                "ui-slider-handle" : "myui-slider-handle"
                            },
                            value: value,
                            min: min,
                            max: max,
                            orientation: "horizontal",
                            range: "min",
                            animate: "slow",
                            slide: function( event, ui ) {
                                //console.log("slide: ", ui.value);
                                $( "#value-" + thisWidgetId ).html( ui.value );
                            },
                            stop:  function( event, ui ) {
                                console.log("stop: ", ui.value);
                                    
                                if ( _.isUndefined(currentSettings.url) )
                                    freeboard.showDialog($("<div align='center'>url undefined</div>"),"Error!","OK",null,function(){});
                                else 
                                    self.sendValue(currentSettings.url,ui.value);
                            }
                            
                        })
                        .removeClass( "ui-widget-content");
		}

		// **getHeight()** (required) : A public function we must implement that will be called when freeboard wants to know how big we expect to be when we render, and returns a height. This function will be called any time a user updates their settings (including the first time they create the widget).
		//
		// Note here that the height is not in pixels, but in blocks. A block in freeboard is currently defined as a rectangle that is fixed at 300 pixels wide and around 45 pixels multiplied by the value you return here.
		//
		// Blocks of different sizes may be supported in the future.
		self.getHeight = function()
		{
			if(currentSettings.size == "big")
			{
				return 2;
			}
			else
			{
				return 1;
			}
		}

		// **onSettingsChanged(newSettings)** (required) : A public function we must implement that will be called when a user makes a change to the settings.
		self.onSettingsChanged = function(newSettings)
		{
			// Normally we'd update our text element with the value we defined in the user settings above (the_text), but there is a special case for settings that are of type **"calculated"** -- see below.
			currentSettings = newSettings;
                        titleElement.html( (_.isUndefined(newSettings.title) ? "": newSettings.title) );
                        $(titleElement).append(valueElement);
		}

		// **onCalculatedValueChanged(settingName, newValue)** (required) : A public function we must implement that will be called when a calculated value changes. Since calculated values can change at any time (like when a datasource is updated) we handle them in a special callback function here.
		self.onCalculatedValueChanged = function(settingName, newValue)
		{
                        console.log( "valueChanged:", settingName, newValue);
                                
			// Remember we defined "the_text" up above in our settings.
			if(settingName == "value")
			{
                                 $(valueElement).html(newValue);
				 $( theSlider ).slider( "value", newValue);

			}
			if(settingName == "max")
			{
                                if (newValue > min ) {
                                    max = newValue;
                                    $( theSlider ).slider( "option", "max", newValue);
                                } else {
                                    currentSettings.max = max; // Keep it unchanged
                                    freeboard.showDialog($("<div align='center'> Max value cannot be lower than Min value!</div>"),"Warning!","OK",null,function(){});
                                }
			}
			if(settingName == "min")
			{
                                if (newValue < max ) {
                                    min = newValue;
                                    $( theSlider ).slider( "option", "min", newValue);
                                } else {
                                    currentSettings.min= min;// Keep it unchanged
                                    freeboard.showDialog($("<div align='center'> Min value cannot be greater than Max value!</div>"),"Warning!","OK",null,function(){});                  
                                }
			}
		}
                var request;

                self.sendValue = function (url, options) {
                    console.log(url, options);
                    request = new XMLHttpRequest();
                    if (!request) {
                        console.log('Giving up :( Cannot create an XMLHTTP instance');
                        return false;
                    }
                    
                    request.onreadystatechange = this.alertContents;
                    //request.open('GET', url + ' ' + options, true);
                    request.open('GET', url.replace("%VALUE%", options), true);
                    freeboard.showLoadingIndicator(true);
                    request.send();
                }
                        
                this.alertContents = function () {
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
		// **onDispose()** (required) : Same as with datasource plugins.
		self.onDispose = function()
		{
		}
	}
}());
