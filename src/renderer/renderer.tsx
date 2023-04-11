/**
 * React renderer.
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './theme';
import { Provider } from 'react-redux';
import store from './store/store';
import { GraphicsGL } from './editor/GraphicsGL';

(window as any)["AVGEDITOR"] = true;

GraphicsGL.load().then(async () => {
    const App = (await import('./app')).default;

    const render = (Component: typeof App) => {
        ReactDOM.render(<Provider store={store}><Component /></Provider>, document.getElementById('app'));
    }

    render(App);

    if (module.hot) {
        module.hot.accept("./app", () => {
            render(App);
        });
    }
})
