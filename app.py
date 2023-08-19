from flask import Flask, request, render_template

app = Flask(__name__)

@app.route("/")
def show_index():
    """Index page"""

    return render_template("main.html")

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)