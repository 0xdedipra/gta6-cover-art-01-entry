// app.js — Vice Panels entry point. Boots the editor once the page is ready.
import { initEditor } from "./editorControls.js";
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initEditor);
else initEditor();
