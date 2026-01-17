const { app, BrowserWindow, Tray, Menu, screen, globalShortcut } = require("electron")
const path = require("path")

let mainWindow = null
let tray = null
let isClickThrough = false

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width: 300,
    height: 350,
    x: width - 320,
    y: height - 370,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Load the Next.js app
  const isDev = process.env.NODE_ENV !== "production"
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000/desktop")
  } else {
    mainWindow.loadFile(path.join(__dirname, "../out/desktop.html"))
  }

  // Make window draggable from anywhere
  mainWindow.setIgnoreMouseEvents(false)

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

function createTray() {
  // Use a simple icon (you can replace with your own)
  tray = new Tray(path.join(__dirname, "icon.png"))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Toggle Click-Through",
      click: () => {
        isClickThrough = !isClickThrough
        mainWindow?.setIgnoreMouseEvents(isClickThrough, { forward: true })
      },
    },
    {
      label: "Reset Position",
      click: () => {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize
        mainWindow?.setPosition(width - 320, height - 370)
      },
    },
    { type: "separator" },
    {
      label: "Quit Vibe Buddy",
      click: () => {
        app.quit()
      },
    },
  ])

  tray.setToolTip("Vibe Buddy")
  tray.setContextMenu(contextMenu)
}

app.whenReady().then(() => {
  createWindow()
  createTray()

  // Global shortcut to toggle visibility
  globalShortcut.register("CommandOrControl+Shift+V", () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
    }
  })

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("will-quit", () => {
  globalShortcut.unregisterAll()
})
