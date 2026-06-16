import asyncio
import websockets
import json
import subprocess
import os
import sys

# Maintain connected clients
clients = set()
spooler_process = None

async def broadcast(message):
    if not clients:
        return
    # Run broadcast concurrently for all clients
    await asyncio.gather(*[client.send(message) for client in clients], return_exceptions=True)

async def read_stdout(process):
    """Read from the C process stdout and broadcast to WebSockets."""
    while True:
        line = await process.stdout.readline()
        if not line:
            break
        try:
            decoded_line = line.decode('utf-8').strip()
            if decoded_line:
                print(f"[C->Bridge] {decoded_line}")
                await broadcast(decoded_line)
        except Exception as e:
            print(f"Error reading stdout: {e}")

async def handle_client(websocket):
    """Handle incoming WebSocket commands and forward to C process."""
    clients.add(websocket)
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                cmd = data.get("cmd")
                print(f"[WS->Bridge] {data}")
                
                pipe_msg = ""
                if cmd == "SUBMIT_JOB":
                    prio_map = {"Low": 1, "Medium": 2, "High": 3}
                    prio = prio_map.get(data.get("priority", "Low"), 1)
                    pipe_msg = f"SUBMIT_JOB|{data['user']}|{data['doc']}|{prio}|{data['pages']}\n"
                elif cmd == "SET_POLICY":
                    policy_map = {"priority": 0, "fcfs": 1, "sjf": 2}
                    p = policy_map.get(data.get("policy", "priority"), 0)
                    pipe_msg = f"SET_POLICY|{p}\n"
                elif cmd == "RESET":
                    pipe_msg = "RESET\n"
                elif cmd == "RUN_SAFETY":
                    pipe_msg = "RUN_SAFETY\n"
                
                if pipe_msg and spooler_process:
                    spooler_process.stdin.write(pipe_msg.encode('utf-8'))
                    await spooler_process.stdin.drain()
            except json.JSONDecodeError:
                print("Invalid JSON received from client")
            except Exception as e:
                print(f"Error handling message: {e}")
    finally:
        clients.remove(websocket)

import http

def health_check(connection_or_path, request_or_headers):
    # Handle both legacy (path, headers) and new asyncio (connection, request) APIs
    path = getattr(request_or_headers, "path", None)
    if path is None and isinstance(connection_or_path, str):
        path = connection_or_path
        
    if path in ["/", "/health"]:
        if isinstance(connection_or_path, str):
            return (http.HTTPStatus.OK, [], b"OK\n")
        else:
            try:
                return connection_or_path.respond(http.HTTPStatus.OK, "OK\n")
            except AttributeError:
                from websockets.http11 import Response
                return Response(200, "OK", [], b"OK\n")
    return None

async def main():
    global spooler_process
    
    # Compile the C program if it hasn't been compiled
    if not os.path.exists("./spooler"):
        print("Compiling spooler...")
        os.system("make")
        
    print("Starting Spooler Process...")
    spooler_process = await asyncio.create_subprocess_exec(
        "./spooler",
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.DEVNULL
    )
    
    # Start task to read stdout from C process
    asyncio.create_task(read_stdout(spooler_process))
    
    # Start WebSocket server
    port = int(os.environ.get("PORT", 8765))
    print(f"Starting WebSocket server on port {port}...")
    async with websockets.serve(handle_client, "0.0.0.0", port, process_request=health_check):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Shutting down...")
        if spooler_process:
            try:
                spooler_process.terminate()
            except ProcessLookupError:
                pass
