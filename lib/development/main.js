window.boot = function (done) {
    var settings = window._CCSettings;
    window._CCSettings = undefined;
    // var onProgress = null;

    let { RESOURCES, INTERNAL } = cc.AssetManager.BuiltinBundleName;

    var onStart = function () {

        cc.view.enableRetina(true);
        cc.view.resizeWithBrowserSize(true);

        done && done();
    };

    var canvas = document.createElement("canvas");
    canvas.setAttribute("id", 'GameCanvas');
    var container = document.createElement("div");
    container.setAttribute("id", "GameContainer");
    container.appendChild(canvas);

    var option = {
        id: canvas,
        debugMode: settings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
        showFPS: settings.debug,
        frameRate: 60,
        groupList: settings.groupList,
        collisionMatrix: settings.collisionMatrix,
    };

    cc.assetManager.init({
        bundleVers: settings.bundleVers,
        remoteBundles: settings.remoteBundles,
        server: settings.server
    });

    let bundleRoot = [INTERNAL];
    // settings.hasStartSceneBundle && bundleRoot.push(START_SCENE);
    settings.hasResourcesBundle && bundleRoot.push(RESOURCES);

    var count = 0;
    function cb(err) {
        if (err) return console.error(err.message, err.stack);
        count++;
        if (count === bundleRoot.length + 1) {
            cc.game.run(option, onStart);
        }
    }

    cc.assetManager.loadScript(settings.jsList.map(function (x) { return 'src/' + x; }), cb);

    for (let i = 0; i < bundleRoot.length; i++) {
        cc.assetManager.loadBundle(bundleRoot[i], cb);
    }
};
