# Rebound360 - Supplier Returns & Procurement Management (Beta)

[![Status](https://img.shields.io/badge/status-beta-orange.svg)](https://shields.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.md)

**⚠️ Beta Software:** This application is currently in beta. Expect bugs, incomplete features, and potential changes. Use with caution.

DOCS: [Handbuch(German)](https://docs.google.com/document/d/1-GPRXB8ypdeiFf4Ja4HsdQDjnMNmcEXyak7AtBQQpjU/edit?usp=sharing)

## Overview

Rebound360 is a desktop application built with Electron, React, and TypeScript, designed to streamline supplier returns management and internal procurement processes, with integration capabilities for JTL-Wawi.


## ✨ Key Features

*   **Supplier Return Management:** Track and manage returns to suppliers efficiently.
*   **JTL-Wawi Order Integration:** View and process returns based on JTL orders.
*   **Procurement Module:** Manage internal purchase requisitions and orders.
*   **Approval Workflows:** Define and manage approval processes for procurement.
*   **Supplier Management:** Keep track of supplier information synced from JTL.
*   **Document Handling:** Upload and view documents related to returns.
*   **Customizable Settings:** Configure database connections, workflows, and custom fields.
*   **Modern UI:** Built with Shadcn/ui and Tailwind CSS.
*   **Cross-Platform:** Runs on Windows, macOS, and Linux thanks to Electron.

## 🖼️ Screenshots

COMING SOON

## 🛠️ Tech Stack

*   **Framework:** Electron
*   **Frontend:** React, TypeScript, Vite
*   **UI:** Shadcn/ui, Tailwind CSS
*   **State Management:** TanStack Query, TanStack Router
*   **Database (Local):** better-sqlite3
*   **Database (External):** MSSQL (for JTL-Wawi Integration)
*   **Build Tool:** Electron Forge

## 🚀 Getting Started (Development)

Follow these steps to set up the development environment:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/bl4ckh4nd/rebound360App.git
    cd rebound360
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    *   Create a `.env` file in the root directory.
    *   Copy the contents of `.env.example` (if it exists) or add the necessary variables (like `ENCRYPTION_KEY`, `ENCRYPTION_SALT`, JTL Database credentials if needed for direct dev access, etc.).
    *   *Note:* Sensitive keys like `ENCRYPTION_KEY` should ideally be handled securely, especially for production builds.

4.  **Run the application in development mode:**
    ```bash
    npm run dev
    ```
    This command typically starts the Vite dev server for the renderer and runs Electron, enabling hot-reloading.

## 📦 Building the Application

To build the application for production or create installers:

1.  **Build the application components:**
    ```bash
    npm run build
    ```
    This compiles TypeScript for main/preload/shared and builds the renderer using Vite.

2.  **Package the application:**
    *   Creates an unpackaged application (e.g., in the `out` directory).
    ```bash
    npm run package
    ```

3.  **Create installers:**
    *   Creates platform-specific installers (e.g., `.exe`, `.dmg`, `.deb`).
    ```bash
    npm run make
    ```
    The installers will be located in the `out/make` directory.

## 📄 License

This project is licensed under a custom License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙌 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

*Happy returning!*
