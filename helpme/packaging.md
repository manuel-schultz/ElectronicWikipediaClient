# Create linux Package (.deb)
1. RUN `npm run package-lin` to create a folder called `distribution/release-builds-lin` with your App-Data inside.
2. RUN `npm run create-deb` to create a .deb file in `distribution/release-builds-lin/installers/`.

# Test the .deb File
1. Navigate to the .deb-file with your file-manager.
2. Open it with "Software-Installation" (snap store).
3. Install the package, after checking, that the data shown is correct.
4. Search the installed app in your App-Space and start it to see if it is working.

## If it doesn't work:
1. Start up a terminal and type the name of the app in it to start it via console. (example: `$ electronicwikipediaclient`)
2. Study the error and fix it in your source code.
3. Uninstall the app eighter via snap-store or the terminal (example: `$ sudo apt remove electronicwikipediaclient`)
4. Remove the entire release-builds folder.
5. Start again with creating the linux package (package-lin).


# Create windows Package (.exe) (WIP - Doesn't Work Yet -)
1. RUN `npm run package-win` to create a folder called `distribution/release-builds-win` with your App-Data inside.
2. 


# What scripts does your package.json File include for distribution?
For the distribution of your Electron-App for windows and linux you need the following scripts inside your  `package.json` file:
```
"package-lin": "electron-packager . {APPNAME} --overwrite --asar=true --platform=linux --arch=x64 --icon={ICONPATH} --prune=true --out=distribution/release-builds-lin",
"package-win": "electron-packager . {APPNAME} --overwrite --asar=true --platform=win32 --arch=x64 --icon={ICONPATH} --prune=true --out=distribution/release-builds-win"
"create-deb": "electron-installer-debian --src distribution/release-builds-lin/{APPNAME}-linux-x64/ --arch amd64 --config debian.json",
```
> [!NOTE]
> Replace {APPNAME} with the Name of your App, using pascal case.
> Replace {ICONPATH} with the path of your application's icon. (windows will only accept .ico icons)

# What Files do you need for distribution?
First you need a file called `debian.json` or whatever you define in the `--config` option in the `create-deb`-script.
The debian.json file should look something like that:

File: `./debian.json`
```
{
    "dest": "distribution/installers/",
    "icon": "assets/img/logo/logosizes/96x96.png",
    "categories": [
        "Education",
        "Office"
    ],
    "name": "ElectronicWikipediaClient",
    "maintainer": "Manuel Schultz <manuel@schultz.ch>",
    "homepage": "https://github.com/manuel-schultz/ElectronicWikipediaClient",
    "description": "A client for Wikipedia",
    "license": "ISC",
    "lintianOverrides": [
        "changelog-file-missing-in-native-package"
    ]
}
```
> The `dest` option is where your .deb file will be created.

> The `icon` option is the path to your icon. You can use jpg and png here.

> In the `categories` section, you define what linux categories your app should be in. (These include: `Accessibility`, `Development`, `Education`, `Game`, `Graphics`, `Network`, `Office`, `Science`, `System`, `Utility`, `AudioVideo`)

> The `name` option describes the name of your package in snap store. (it gets downcased and replaces spaces with minuses) 

> The `homepage` option describes the homepage, that is being shown in the snap store as project site.

> The `description` option marks the short description in the snap store.
