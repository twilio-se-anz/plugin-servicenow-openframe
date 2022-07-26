import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';

import reducers, { namespace } from './states';
import { Themer } from './configuration/Themer';

const PLUGIN_NAME = 'ServicenowOpenframePlugin';

const serviceNowInstance = "dev126338.service-now.com";
const openFrameConfig = { height: 600, width: 400 };

export default class ServicenowOpenframePlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof Flex }
   * @param manager { Flex.Manager }
   */
  async init(flex: typeof Flex, manager: Flex.Manager): Promise<void> {
    this.registerReducers(manager);

    // Load Openframe library
    var script = document.createElement("script");
    script.src = `https://${serviceNowInstance}/scripts/openframe/latest/openFrameAPI.min.js`;
    console.log('Eli says ' + script.src);
    script.async = true;
    document.head.appendChild(script);

    // Default layout
    flex.AgentDesktopView.defaultProps.showPanel2 = false;
    flex.AgentDesktopView.defaultProps.splitterOptions = { initialFirstPanelSize: "400px", minimumFirstPanelSize: "400px" };
    flex.RootContainer.Content.remove("project-switcher")

    flex.MainHeader.defaultProps.logoUrl = "https://servicenow-6893.twil.io/officeworks_logo.png"

    const config = Themer.generateTheme({ lightText: '#FFFFFF', darkText: '#005bb1', background: '#005bb1' });

    manager.updateConfig(config);

    let openFrame: any = null;

    // TODO: Update with customer name or similar
    manager.strings.NoTasks = "Officeworks IT";

    function handleCommunicationEvent(context: any) {
      console.log("Communication from Topframe", context);
    }
    function initSuccess(snConfig: any) {
      console.log("openframe configuration", snConfig);
      //register for communication event from TopFrame
      openFrame.subscribe(openFrame.EVENTS.COMMUNICATION_EVENT,
        handleCommunicationEvent);
    }
    function initFailure(error: any) {
      console.log("OpenFrame init failed: ", error);
    }

    setTimeout(() => {
      openFrame = window.openFrameAPI;
      openFrame.init(openFrameConfig, initSuccess, initFailure)
    }, 1000);

    manager.workerClient.on("reservationCreated", () => openFrame.show());

    // Invoke CTI.do when a reservation is accepted
    flex.Actions.addListener('beforeAcceptTask', (payload) => {
      console.log('beforeAcceptTask', payload.task);
      let callerId = payload.task.attributes.from;
      console.log('callerId', callerId);
      // let customerId = payload.task.attributes.customerId;
      // let incidentId = payload.task.attributes.incidentId;

      openFrame.openServiceNowForm({ entity: 'cti', query: `sysparm_caller_phone=${callerId}` });

      // if (incidentId) {
      //   openFrame.openServiceNowForm({ entity: 'incident', query: `sys_id=${incidentId}` });
      // } else if (customerId) {
      //   openFrame.openServiceNowForm({ entity: 'customer_account', query: `sys_id=${customerId}` });
      // }
    });
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  private registerReducers(manager: Flex.Manager) {
    if (!manager.store.addReducer) {
      // eslint-disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${Flex.VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
