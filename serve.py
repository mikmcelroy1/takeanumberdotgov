# Local test server for the game files in public/. Same as `python3 -m http.server`, but tells the
# browser not to keep old copies of files, so edits show up on a normal reload.
# This server has no scoreboard; the game falls back to a leaderboard kept in the browser.
# To test the real scoreboard locally, use `npm run dev` instead (see README.md).
import functools
import http.server
import os
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8731
public = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")
handler = functools.partial(NoCacheHandler, directory=public)
http.server.ThreadingHTTPServer(("", port), handler).serve_forever()
