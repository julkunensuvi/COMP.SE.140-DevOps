#[macro_use] extern crate rocket;
use rocket::serde::json::Json;
use std::process::Command;
use std::str;

// Openai:
#[derive(serde::Serialize)]
struct ProcessInfo {
    pid: String,
    tty: String,
    stat: String,
    time: String,
    cmd: String,
}

#[derive(serde::Serialize)]
struct Info {
    ip_address: String,
    processes: Vec<ProcessInfo>,
    disk_space: String,
    uptime: String,
}

// Openai: Helper function to run a command and get output as a String
fn run_command(command: &str, args: &[&str]) -> String {
    let output = Command::new(command)
        .args(args)
        .output()
        .expect("Failed to execute command");
    str::from_utf8(&output.stdout).unwrap().trim().to_string()
}

// Openai: Function to parse the process list and convert it into a Vec of ProcessInfo
fn parse_processes(raw_processes: String) -> Vec<ProcessInfo> {
    let process_lines = raw_processes.trim().split('\n').skip(1); // Skip header
    process_lines.map(|line| {
        let parts: Vec<&str> = line.split_whitespace().collect();
        ProcessInfo {
            pid: parts[0].to_string(),
            tty: parts[1].to_string(),
            stat: parts[2].to_string(),
            time: parts[3].to_string(),
            cmd: parts[4..].join(" "), 
        }
    }).collect()
}

fn get_info() -> Info {
    let ip_address = run_command("hostname", &["-I"]);
    let raw_processes = run_command("ps", &["-ax", "--format", "pid,tty,stat,time,cmd"]);
    let processes = parse_processes(raw_processes); 
    let disk_space = run_command("df", &["-h", "/", "--output=size,used,avail,pcent"]);
    let uptime = run_command("uptime", &["-p"]);

    Info {
        ip_address,
        processes,
        disk_space,
        uptime
    }
}

#[get("/info")]
fn info() -> Json<Info> {
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
