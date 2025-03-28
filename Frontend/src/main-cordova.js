const generateRandInt = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
}

export default class cordovaApp {
    constructor() {
        this.init();
    }

    init() {
        // navigator.splashscreen.hide();
        // StatusBar.hide();

        this.registerEvents();

        this.askForNotificationPermission();
        this.keepAwake();
    }
    showPushNotification(title, message) {
        // cordova.plugins.notification.local.schedule({
        //     title: title,
        //     text: message,
        //     trigger: { at: new Date(new Date().getTime() + 100) },
        //     icon: "file://Appicon.png", // Customize with an icon (optional)
        //     smallIcon: "file://Appicon.png",
        //     sound: true, // Play sound when the notification appears
        //     foreground: true, // Show notification even if app is in foreground
        // });

        console.log("notification fired");

        cordova.plugins.notification.local.schedule({
            id: generateRandInt(10000000, 999999999), // Unique ID for the notification
            title: title,
            text: message,
            // trigger: { in: 1, unit: "second" },
            icon: "file://Appicon.png", // Customize with an icon (optional)
            priority: 2,
            sound: true, // Play sound when the notification appears
            foreground: true,
            launch: true,
            wakeup: true,
            groupSummary: true,
            launch: true,
            lockscreen: true,
        });

    }
    keepAwake() {
        cordova.plugins.foregroundService.start('Shop365', 'Running!', null, 3, generateRandInt());

        // // 1) set background defaults
        // cordova.plugins.backgroundMode.setDefaults({
        //     title: 'App Running in Background',
        //     text: 'Your app is still active and monitoring notifications',
        //     color: 'FF0000'
        // });

        // // 1) Request background execution
        // cordova.plugins.backgroundMode.enable();

        // // 2) Now the app runs ins background but stays awake
        // cordova.plugins.backgroundMode.on('activate', function () {
        //     setInterval(function () {
        //         console.log("Running in background");
        //         // cordova.plugins.notification.badge.increase();
        //     }, 1000);
        // });

        // // 3) App is back to foreground
        // cordova.plugins.backgroundMode.on('deactivate', function () {
        //     console.log("Stopped running in background");
        //     // cordova.plugins.notification.badge.clear();
        // });
    }
    registerEvents() {
        // document.addEventListener(
        //     "backbutton",
        //     function () {
        //         navigator.app.exitApp();
        //     },
        //     false
        // );
        document.addEventListener("offline", function () {
            console.log("offline");
            alert("You are offline! please connect to the internet and try again");
        }, false);

        document.addEventListener("online", function () {
            console.log("online");
            window.location.reload();
        }, false);
    }
    askForNotificationPermission() {
        try {
            let permissionPlugin = window.cordova.notifications_permission;
            let rationaleTitle = "Notification Permission";
            let rationaleMsg = "You really need to give permission!";
            let rationaleOkButton = "OK";
            let rationaleCancelButton = "Not now";
            let rationaleTheme =
                permissionPlugin.themes.Theme_DeviceDefault_Dialog_Alert;
            let lastResortTitle = "Notification Permission!";
            let lastResortMsg =
                "You really need to give permission! Now the only way left is through system settings.";
            let lastResortOkButton = "Settings";
            let lastResortCancelButton = "No thanks";
            let lastResortTheme =
                permissionPlugin.themes.Theme_DeviceDefault_Dialog_Alert;
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
                    theme: rationaleTheme,
                },
                {
                    show: true,
                    title: lastResortTitle,
                    msg: lastResortMsg,
                    okButton: lastResortOkButton,
                    cancelButton: lastResortCancelButton,
                    theme: lastResortTheme,
                }
            );
        } catch (e) {
            console.log(e);
            alert("Error asking for permission" + e.message);
        }
    }
}
