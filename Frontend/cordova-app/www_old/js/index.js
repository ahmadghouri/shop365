const $navigator = navigator

document.addEventListener('deviceready', onDeviceReady, false);
document.addEventListener('resume', init, false);
document.addEventListener("backbutton", function () { navigator.app.exitApp() }, false);

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    cordova.plugins.notification.local.schedule({
        title: 'The Shop 365',
        text: 'Welcome to The Shop 365',
        trigger: { at: new Date(new Date().getTime() + 100) },
        icon: "file://img/logo.png",  // Customize with an icon (optional)
        smallIcon: "file://img/logo-small.png",
        sound: true,  // Play sound when the notification appears
        foreground: true,  // Show notification even if app is in foreground
    });

    init()
}

function init() {
    // navigator.splashscreen.hide();
    // StatusBar.hide();

    askForNotificationPermission()

    // cordova.plugins.notification.local.schedule({
    //     title: 'Orders alert!',
    //     text: 'May be you missing some orders, Just a reminder!',
    //     trigger: { every: { minute: 15 } },
    //     icon: "file://img/logo.png",  // Customize with an icon (optional)
    //     smallIcon: "file://img/logo-small.png",
    //     sound: true,  // Play sound when the notification appears
    //     foreground: true,  // Show notification even if app is in foreground
    // });

    openBrowser('https://theshop365.com')

}

function openBrowser(url) {
    try {
        const ref = cordova.InAppBrowser.open(url, '_blank', 'location=no,hidden=no,fullscreen=no,zoom=no,clearcache=no,clearsessioncache=no,closebuttoncaption=Close,toolbar=no');

        ref.show();

        ref.addEventListener('exit', function () {
            $navigator.app.exitApp();
        });
        ref.addEventListener('loadstart', function (event) {
            console.log(event, ref);
        });
        ref.addEventListener('loadstop', function (event) {
            console.log(event, ref);
            // ref.insertCSS({ code: "body { background-color: red; }" });
            // ref.executeScript({ code: 'prompt("Hello world!");' });
        });
        ref.addEventListener('message', function (event) {
            console.log("message received", event);
            alert('new message event received');
        });

        window.addEventListener("cordovacallbackerror", function (event) {
            // event.error contains the original error object
        });
    } catch (e) {
        console.log(e)
        alert("Error opening browser" + e.message);
    }
}

function askForNotificationPermission() {
    try {

        let permissionPlugin = window.cordova.notifications_permission;
        let rationaleTitle = "Notification Permission";
        let rationaleMsg = "You really need to give permission!";
        let rationaleOkButton = "OK";
        let rationaleCancelButton = "Not now";
        let rationaleTheme = permissionPlugin.themes.Theme_DeviceDefault_Dialog_Alert;
        let lastResortTitle = "Notification Permission!";
        let lastResortMsg = "You really need to give permission! Now the only way left is through system settings.";
        let lastResortOkButton = "Settings";
        let lastResortCancelButton = "No thanks";
        let lastResortTheme = permissionPlugin.themes.Theme_DeviceDefault_Dialog_Alert;
        permissionPlugin.maybeAskPermission(
            function (status) {
                /* Permission is either granted, denied, or not needed. */
                switch (status) {
                    case permissionPlugin.GRANTED_NEWLY_WITHOUT_RATIONALE:
                    case permissionPlugin.GRANTED_NEWLY_AFTER_RATIONALE:
                    case permissionPlugin.GRANTED_NEWLY_AFTER_SETTINGS:
                    case permissionPlugin.GRANTED_ALREADY:
                    case permissionPlugin.NOT_NEEDED:
                        /* Notification shows the same as it did before Android 13 (API Level 33). */
                        break;
                    case permissionPlugin.DENIED_NOT_PERMANENTLY_NEWLY:
                    case permissionPlugin.DENIED_PERMANENTLY_NEWLY:
                    case permissionPlugin.DENIED_NOT_PERMANENTLY_ALREADY:
                    case permissionPlugin.DENIED_PERMANENTLY_ALREADY:
                    case permissionPlugin.DENIED_PERMANENTLY_ALREADY_AFTER_SETTINGS:
                    case permissionPlugin.DENIED_THROUGH_RATIONALE_DIALOG:
                    case permissionPlugin.DENIED_THROUGH_LAST_RESORT_DIALOG:
                    case permissionPlugin.NOT_ANDROID:
                        /* The notification does not show. */
                        break;
                    case permissionPlugin.ERROR:
                        /* See console for error message */
                        break;
                }
            },
            {
                show: true,
                title: rationaleTitle,
                msg: rationaleMsg,
                okButton: rationaleOkButton,
                cancelButton: rationaleCancelButton,
                theme: rationaleTheme
            },
            {
                show: true,
                title: lastResortTitle,
                msg: lastResortMsg,
                okButton: lastResortOkButton,
                cancelButton: lastResortCancelButton,
                theme: lastResortTheme
            }
        );


    } catch (e) {
        console.log(e)
        alert("Error asking for permission" + e.message);
    }
}