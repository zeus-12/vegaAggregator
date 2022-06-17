const {app, BrowserWindow} = require('electron')
const electron = require('electron')
const path = require('path')
const { dialog } = require('electron')

app.showExitPrompt = true

const os = require('os')
const ipc = electron.ipcMain;

let mainWindow
let workerWindow //Printer Preview Window

function createWindow () {

    /************ MAIN WINDOW ************/

    mainWindow = new BrowserWindow({
        width: 1150,
        height: 760,
        icon: path.join(__dirname, '/assets/icons/png/64.png'),
        title: app.getName()
    })

    mainWindow.loadURL("file://" + __dirname + "/index.html")

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function () {
        mainWindow = null
        if(workerWindow != null)
            workerWindow.close();
    })



    /************ WORKER WINDOW ************/

    workerWindow = new BrowserWindow({show : false, icon: path.join(__dirname, '/assets/icons/png/64x64.png')});
    workerWindow.loadURL("file://" + __dirname + "/templates/print-template.html");

    workerWindow.on("closed", () => {
        workerWindow = null;
    });
    workerWindow.hide();


    //Do not close warning for PRINTER Window
    workerWindow.on('close', (e) => {
        if (app.showExitPrompt && mainWindow != null) {
            e.preventDefault() // Prevents the window from closing
            dialog.showMessageBox({
                type: 'question',
                buttons: ['Close Window','Keep Open'],
                title: 'Caution',
                message: 'Please do not Close this Window, Printing will be affected. Do you still want to Close?'
            }, function (response) {
                if (response === 0) { // Runs the following if 'Yes' is clicked
                    app.showExitPrompt = false
                    workerWindow.close()
                }
            })
        }
    })

}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})



/* Printer Processes */

// retransmit it to workerWindow
ipc.on("printBillDocument", (event, content, selected_printer) => {

    if(!workerWindow){
        alert('Error CLOSED.')
        return '';
    }
    workerWindow.webContents.send("printBillDocument", content, selected_printer);
});

// when worker window is ready
ipc.on("readyToPrintBillDocument", (event, selected_printer) => {

    var pageSettingsSilent = selected_printer.settings;
    pageSettingsSilent.deviceName = selected_printer.target;

    workerWindow.webContents.print(pageSettingsSilent);
});
