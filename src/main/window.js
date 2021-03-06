import { BrowserWindow } from 'electron';
import windowStateKeeper from 'electron-window-state';
import MenuBuilder from './menu-builder';

export default class Window {
  constructor(application) {
    this.application = application;
  }
  open() {
    const windowState = windowStateKeeper({
      defaultWidth: 820,
      defaultHeight: 600,
    });

    let options = windowState;
    if (process.platform !== 'win32') {
      options = { ...windowState, titleBarStyle: 'hidden' };
    }

    this.browserWindow = new BrowserWindow(options);
    this.browserWindow.loadURL(`file://${__dirname}/app/index.html`);

    windowState.manage(this.browserWindow);

    const builder = new MenuBuilder(this.browserWindow);
    builder.build();

    this.handleEvents();
  }
  handleEvents() {
    this.browserWindow.on('closed', () => {
      this.browserWindow = null;
      this.application.removeWindow();
    });
  }
}
