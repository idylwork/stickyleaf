use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::Manager;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_notification::NotificationExt;

#[tauri::command]
fn update_opacity(window: tauri::WebviewWindow, opacity: f64) {
    #[cfg(target_os = "macos")]
    {
        use objc2::msg_send;
        use objc2::runtime::AnyObject;
        if let Ok(ns_window) = window.ns_window() {
            unsafe {
                let ns_window = ns_window as *mut AnyObject;
                let _: () = msg_send![ns_window, setAlphaValue: opacity];
            }
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = (window, opacity);
    }
}

#[tauri::command]
fn notify(app: tauri::AppHandle, message: String) {
    let _ = app.notification().builder().body(&message).silent().show();
}

#[tauri::command]
fn save_file(app: tauri::AppHandle, data: String) {
    // 場所とファイル名を選択
    let path = app
        .dialog()
        .file()
        .add_filter("Text", &["md", "txt", "text"])
        .blocking_save_file();
    // キャンセルで閉じた場合
    let Some(path) = path else {
        return;
    };

    // ファイルの内容を返却
    if let Ok(path) = path.into_path() {
        if let Err(error) = std::fs::write(path, data) {
            eprintln!("{error}");
        }
    }
}

#[tauri::command]
fn load_file(app: tauri::AppHandle) -> serde_json::Value {
    // ファイルを選択
    let paths = app
        .dialog()
        .file()
        .add_filter("Text", &["md", "txt", "text"])
        .blocking_pick_files();
    // キャンセルで閉じた場合
    let Some(paths) = paths else {
        return serde_json::json!({ "ok": false, "data": null });
    };

    match paths
        .into_iter()
        .map(|path| {
            let path = path.into_path().map_err(|error| error.to_string())?;
            std::fs::read_to_string(path).map_err(|error| error.to_string())
        })
        .collect::<Result<Vec<_>, _>>()
    {
        Ok(data) => serde_json::json!({ "ok": true, "data": data.join("\n") }),
        Err(error) => serde_json::json!({ "ok": false, "data": null, "message": error }),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .menu(|app| {
            Menu::with_items(
                app,
                &[
                    &Submenu::with_items(
                        app,
                        "Stickleaf",
                        true,
                        &[
                            &MenuItem::with_id(app, "reload", "Reload", true, Some("CmdOrCtrl+R"))?,
                            &MenuItem::with_id(app, "force-reload", "Force Reload", true, Some("CmdOrCtrl+Shift+R"))?,
                            &PredefinedMenuItem::hide(app, None)?,
                            &PredefinedMenuItem::separator(app)?,
                            &PredefinedMenuItem::quit(app, None)?,
                        ],
                    )?,
                    &Submenu::with_items(
                        app,
                        "Edit",
                        true,
                        &[
                            &PredefinedMenuItem::undo(app, None)?,
                            &PredefinedMenuItem::redo(app, None)?,
                            &PredefinedMenuItem::separator(app)?,
                            &PredefinedMenuItem::cut(app, None)?,
                            &PredefinedMenuItem::copy(app, None)?,
                            &PredefinedMenuItem::paste(app, None)?,
                            &MenuItem::with_id(app, "delete", "Delete", true, None::<&str>)?,
                            &PredefinedMenuItem::select_all(app, None)?,
                        ],
                    )?,
                    &Submenu::with_items(
                        app,
                        "Action",
                        true,
                        &[&MenuItem::with_id(
                            app,
                            "clear-local-storage",
                            "Clear Local Storage",
                            true,
                            None::<&str>,
                        )?],
                    )?,
                ],
            )
        })
        .on_menu_event(|app, event| {
            let Some(window) = app.get_webview_window("main") else {
                return;
            };
            match event.id().as_ref() {
                "reload" | "force-reload" => {
                    let _ = window.eval("location.reload()");
                }
                "delete" => {
                    let _ = window.eval("document.execCommand('delete')");
                }
                "clear-local-storage" => {
                    let _ = window.eval("localStorage.clear(); location.reload();");
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            update_opacity,
            notify,
            save_file,
            load_file
        ])
        .setup(|app| {
            let window = app.get_webview_window("main").expect("main window");
            #[cfg(debug_assertions)]
            window.open_devtools();
            #[cfg(not(debug_assertions))]
            let _ = window.set_always_on_top(true);
            update_opacity(window, 0.9);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
