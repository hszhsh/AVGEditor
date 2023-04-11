Fist, install all the `node_modules` needed by executing the following command:
```sh
cd folder-containing-avg-editor
npm install
```
Then, execute the following command to start Webpack dev server in development mode and
watch the changes on source files for live rebuild on code changes.
```sh
npm run dev-server
```
To start your app, execute the following command:
```sh
npm start
```
## Building the installer for your Electron app
The boilerplate is currently configured to package & build the installer of
your app for macOS & Windows using `electron-builder`.

For macOS, execute:
```sh
npm run package:mac
```

For Windows, execute:
```sh
npm run package:win
```
