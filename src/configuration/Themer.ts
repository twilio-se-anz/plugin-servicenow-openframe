import { Flex } from '@twilio/flex-ui/src/FlexGlobal';
import { ThemerParameters } from './ThemerParameters';

export class Themer {
  static generateTheme(params: ThemerParameters) {
    const { lightText, darkText, background, themeName } = params;

    const newThemeConfig = {
      theme: {
        baseName: themeName || 'FlexLight',
        colors: {
          lightText: lightText,
          darkText: darkText,
        },
        overrides: {
          MainHeader: {
            Container: {
              color: lightText,
              background: background,
            },
            Button: {
              color: lightText,
              background: background,
            },
          },

          SideNav: {
            Container: {
              background: lightText,
            },
            Button: {
              background: lightText,
              color: darkText,
            },
            Icon: {
              color: darkText,
            },
          },

          TaskCanvasHeader: {
            WrapupTaskButton: {
              background: background,
              color: lightText,
            },
            EndTaskButton: {
              background: background,
              color: lightText,
            },
          },
          TaskList: {
            Item: {
              Icon: {
                background: background,
                color: lightText,
              },
            },
          },
        },
      },
    };

    return newThemeConfig as Flex.Config;
  }
}
