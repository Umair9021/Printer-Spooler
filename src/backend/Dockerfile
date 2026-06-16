FROM ubuntu:22.04

# Avoid tzdata interactive prompt during build
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    gcc \
    make \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip3 install -r requirements.txt

COPY . .

# Compile the C backend
RUN make

# Expose WebSocket port (Render dynamically sets PORT)
EXPOSE 8765

CMD ["python3", "bridge.py"]
