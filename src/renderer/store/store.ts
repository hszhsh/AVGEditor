import { createStore } from "redux";
import rootReducer from "../reducers/root-reducer";

// let enhancer = process.env.NODE_ENV == 'development' ? (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__() : undefined;
const store = createStore(rootReducer);

if (module.hot) {
    module.hot.accept(() => {
        store.replaceReducer(rootReducer);
    });
}

export default store;