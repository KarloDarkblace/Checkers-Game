FROM ubuntu:22.04

RUN apt-get update && apt-get install -y wget git build-essential

RUN wget https://go.dev/dl/go1.22.3.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go1.22.3.linux-amd64.tar.gz && \
    rm go1.22.3.linux-amd64.tar.gz

ENV PATH="/usr/local/go/bin:${PATH}"

WORKDIR /app

COPY . .

RUN go build -o app main.go

CMD ["./app"]
