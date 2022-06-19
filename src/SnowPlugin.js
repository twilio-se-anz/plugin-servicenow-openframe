import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';
import CustomTheme from './components/CustomTheme'


const PLUGIN_NAME = 'SnowPlugin';
const serviceNowInstance = "dev126338.service-now.com";
const openFrameConfig = { height: 600, width: 400 };

export default class SnowPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  async init(flex, manager) {
    var script = document.createElement("script");
    script.src = `https://${serviceNowInstance}/scripts/openframe/latest/openFrameAPI.min.js`;
    console.log('Eli says ' + script.src);
    script.async = true;
    document.head.appendChild(script);

    flex.AgentDesktopView.defaultProps.showPanel2 = false;
    flex.RootContainer.Content.remove("project-switcher")
    flex.MainHeader.defaultProps.logoUrl = "https://servicenow-6893.twil.io/officeworks_logo.png"
    flex.AgentDesktopView.defaultProps.splitterOptions = { initialFirstPanelSize: "400px", minimumFirstPanelSize: "400px" }
    
    manager.strings.NoTasks = 'OfficeWorks IT';
    manager.updateConfig({colorTheme: CustomTheme});

    function handleCommunicationEvent(context) {
    console.log("Communication from Topframe", context);
    }
    function initSuccess(snConfig) {
    console.log("openframe configuration",snConfig);
    //register for communication event from TopFrame
    openFrameAPI.subscribe(openFrameAPI.EVENTS.COMMUNICATION_EVENT,
    handleCommunicationEvent);
    }
    function initFailure(error) {
    console.log("OpenFrame init failed..", error);
    }

    setTimeout(() => window.openFrameAPI.init(openFrameConfig, initSuccess, initFailure), 1000);

    manager.workerClient.on("reservationCreated", () => window.openFrameAPI.show());  
  
    flex.Actions.addListener('beforeAcceptTask', (payload) => {
      let customerId = payload.task.attributes.customerId;
      let incidentId = payload.task.attributes.incidentId;

      if(incidentId) {
        window.openFrameAPI.openServiceNowForm({entity:'incident', query:`sys_id=${incidentId}`});
      } else if (customerId) {
        window.openFrameAPI.openServiceNowForm({entity:'customer_account', query:`sys_id=${customerId}`});
      }  
    });

  }
}
