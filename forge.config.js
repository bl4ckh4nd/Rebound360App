const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: {
      unpack: "**/node_modules/{sharp,@img}/**/*"
    },
      icon: 'src/public/rebound360_1.ico',
    
    env: {
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
      ENCRYPTION_SALT: process.env.ENCRYPTION_SALT
    },
  entryPoints: [
    {
      // Main process entry point (output from `build:electron` or `tsc`)
      name: 'main_window', // Corresponds to the variable name convention
      js: 'dist/main/main.js', // Path to your built main process file
    },
    {
      // Preload script entry point (output from `build:preload`)
      name: 'mainWindowPreload', // Name for the preload script
      js: 'dist/main/preload.js', // Path to your built preload file
      preload: {
        // Associate this preload script with the 'main_window' entry point
        // This name should ideally match the name used in the main entry point config
        // but Forge uses a convention MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY based on the window name
        // Let's try 'main_window' first. If issues persist, try matching the name from main.ts directly if possible.
        // **Correction:** Forge expects this structure based on the window creation. Let's stick to the variable name convention.
        // We'll use `MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY` in main.ts, which Forge generates.
      }
    }
  ],
},
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        setupIcon: 'src/public/rebound360_1.ico',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
