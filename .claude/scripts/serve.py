"""Static file dev server that respects the PORT env var.

The Claude Preview harness assigns a port via PORT when autoPort is on, but
`python -m http.server` only takes a positional arg. This wrapper bridges
the two so the launch config remains simple.
"""

import os
import sys
from functools import partial
from http.server import HTTPServer, SimpleHTTPRequestHandler

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def main():
    port = int(os.environ.get('PORT', sys.argv[1] if len(sys.argv) > 1 else '8000'))
    handler = partial(SimpleHTTPRequestHandler, directory=ROOT)
    server = HTTPServer(('127.0.0.1', port), handler)
    print(f'Serving {ROOT} at http://127.0.0.1:{port}/', flush=True)
    server.serve_forever()


if __name__ == '__main__':
    main()
