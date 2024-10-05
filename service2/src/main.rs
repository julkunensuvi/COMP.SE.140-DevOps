#[macro_use] extern crate rocket;
use rocket::serde::json::Json;
use std::process::Command;

#[derive(serde::Serialize)]
struct Info {
    ip_address: String,
    processes: String,
    disk_space: String,
    uptime: String,
}

fn get_info() -> Info {
    let ip_address = "dummy".to_string();
    let processes =  "dummy".to_string();
    let disk_space =  "dummy".to_string();
    let uptime =  "dummy".to_string();

    Info {
        ip_address,
        processes,
        disk_space,
        uptime,
    }
}

#[get("/info")]
fn info() -> Json<Info> {
    println!("INFO: /info endpoint called");
    Json(get_info())
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![info])
        .configure(rocket::Config {
            port: 8300,
            address: "0.0.0.0".parse().unwrap(),
            ..rocket::Config::default()
        })
}
