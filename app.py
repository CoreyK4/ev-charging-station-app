from flask import Flask, request

app = Flask(__name__)

@app.route('/')
def show_index():
    """Index page"""

    return """
    <!doctype html>
    <html>
      <head>
        <title>Testing Server Setup</title>
      </head>
      <body>
        <h1>Hooray! The server is working!</h1>
      </body>
    </html>
    """

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5001)