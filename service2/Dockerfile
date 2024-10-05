FROM rust:latest

WORKDIR /usr/src/app

COPY . .
RUN cargo build --release

EXPOSE 8200

CMD ["./target/release/service2"]
