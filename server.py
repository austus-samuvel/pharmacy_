import http.server
import socketserver
import os

PORT = int(os.environ.get("PORT", 8000))

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and caching headers for static assets
        self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving ColdChain IoT Platform at port {PORT}")
        httpd.serve_forever()
