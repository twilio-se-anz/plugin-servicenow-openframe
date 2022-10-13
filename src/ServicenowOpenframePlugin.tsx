import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { FlexPlugin, loadJS } from '@twilio/flex-plugin';

import { Activity } from 'twilio-taskrouter';

import { ServiceNowMessage } from 'types/ServiceNowMessage';

const PLUGIN_NAME = 'ServicenowOpenframePlugin';

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
    // Load Openframe library
    loadJS(manager.serviceConfiguration.attributes.openframe_url);

    // Default layout
    flex.AgentDesktopView.defaultProps.showPanel2 = false;
    flex.AgentDesktopView.defaultProps.splitterOptions = { initialFirstPanelSize: "400px", minimumFirstPanelSize: "400px" };
    flex.RootContainer.Content.remove("project-switcher");
    flex.MainHeader.defaultProps.logoUrl = manager.serviceConfiguration.attributes.logo_url;

    // This will hold a reference to the Openframe Object once it is loaded.
    let openFrame: any = null;

    // Function to process messages from SNOW.
    function handleCommunicationEvent(context: any) {
      console.log("Communication from Topframe", context);
      const message = context as ServiceNowMessage;

      // Click to Dial
      if (message.type === "OUTGOING_CALL") {
        const interationQuery = message.data.data.find(d => d.entity === 'interaction')?.query;

        Flex.Actions.invokeAction("StartOutboundCall", {
          destination: message.data.metaData.phoneNumber,
          taskAttributes: {
            interationQuery: interationQuery
          }
        });
      }
    }

    function initSuccess(snConfig: any) {
      console.log("openframe configuration", snConfig);
      // Wire up agent state to SNOW agent state
      manager.events.addListener("workerActivityUpdated", (activity: Activity, allActivities: Map<string, Activity>) => {
        openFrame.setPresenceIndicator(activity.name, activity.available ? 'green' : 'red');
      });

      // Set initial agent state in SNOW
      openFrame.setPresenceIndicator(manager.workerClient?.activity.name, manager.workerClient?.activity.available ? 'green' : 'red');

      // Register for communication event from TopFrame
      openFrame.subscribe(openFrame.EVENTS.COMMUNICATION_EVENT,
        handleCommunicationEvent);

      // Open the phone panel when were are assigned a task
      manager.workerClient?.on("reservationCreated", () => openFrame.show());

      // Invoke CTI.do when a reservation is accepted
      flex.Actions.addListener('afterAcceptTask', (payload) => {
        console.log('afterAcceptTask', payload.task);

        // Open the interaction created by OpenFrame for Click2Dial
        if (payload.task.attributes.direction === 'outbound') {
          console.log('outbound call accepted');
          openFrame.openServiceNowForm({ entity: 'interaction', query: payload.task.attributes.interationQuery });
        } else {


          let callerId = payload.task.attributes.from;
          let channelType = payload.task.attributes.channelType;
          console.log('callerId', callerId);
          // let customerId = payload.task.attributes.customerId;
          let incidentId = payload.task.attributes.incidentId;

          // openFrame.openServiceNowForm({ entity: 'cti', query: `sysparm_caller_phone=${callerId}` });
          // openFrame.openServiceNowForm({
          //   entity: 'interaction',
          //   query: `sys_id=-1&sysparm_query=type=Phone^short_description=${channelType} from ${callerId}^work_notes=Speech to text result goes here`
          // });
          // openFrame.openServiceNowForm({ entity: '', query: 'sys_id=1204b56797f411103bc079100153afbe' });

          if (incidentId) {
            openFrame.openServiceNowForm({ entity: 'incident', query: `sys_id=${incidentId}` });
          }
          //   openFrame.openServiceNowForm({ entity: 'incident', query: `sys_id=${incidentId}` });
          // } else if (customerId) {
          //   openFrame.openServiceNowForm({ entity: 'customer_account', query: `sys_id=${customerId}` });
          // }
        }
      });
    }
    function initFailure(error: any) {
      console.log("OpenFrame init failed: ", error);
    }

    // Try to init OpenFrame, may not be loaded yet so delay it and retry if required.
    setTimeout(() => {
      console.log(window.openFrameAPI);
      openFrame = window.openFrameAPI;
      openFrame.init(openFrameConfig, initSuccess, initFailure)
    }, 3000);
  }
}
