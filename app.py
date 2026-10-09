from flask import Flask, render_template, request, jsonify, send_from_directory
import sys
import os
# go to  demo.js line 48
sys.path.insert(0, os.path.dirname(__file__))
from RSA_Python import generate_keypair, encrypt, decrypt


app = Flask(__name__)

KEY_BIT_LENGTH = 4
KEY_SIZE = 2 ** KEY_BIT_LENGTH


def _validate_plaintext(text: str) -> bool:
    if not text:
        return False
    return all(32 <= ord(c) <= 126 for c in text)


@app.route("/")
def demo():
    return render_template("demo.html")


@app.route("/formula")
def formula():
    return render_template("formula.html")


@app.route("/ravi.mp3")
def ravi_sound():
    return send_from_directory(os.path.dirname(__file__), "ravi.mp3")


@app.route("/encrypt", methods=["POST"])
def encrypt_route():
    data = request.get_json(force=True)
    plaintext = data.get("text", "").strip()

    if not _validate_plaintext(plaintext):
        return jsonify({"error": "chotee achhe se baat kar, kuuurrrr kups"}), 400

    public_key, private_key = generate_keypair(KEY_SIZE)
    e, n = public_key
    d, _ = private_key

    p, q = _factor_n(n)
    phi = (p - 1) * (q - 1)

    per_char = []
    cipher_ints = []
    for ch in plaintext:
        m_val = ord(ch)
        c_val = pow(m_val, e, n)
        per_char.append({"char": ch, "M": m_val, "C": c_val})
        cipher_ints.append(c_val)

    return jsonify({
        "p": p,
        "q": q,
        "n": n,
        "phi": phi,
        "e": e,
        "d": d,
        "per_char": per_char,
        "cipher_ints": cipher_ints,
        "d_key": d,
        "n_key": n,
    })


@app.route("/decrypt", methods=["POST"])
def decrypt_route():
    data = request.get_json(force=True)
    cipher_ints = data.get("cipher_ints", [])
    d_key = data.get("d_key")
    n_key = data.get("n_key")

    if not cipher_ints or d_key is None or n_key is None:
        return jsonify({"error": "Invalid request payload"}), 400

    private_key = (int(d_key), int(n_key))

    per_char = []
    decrypted_chars = []
    for c_val in cipher_ints:
        m_val = pow(int(c_val), private_key[0], private_key[1])
        ch = chr(m_val)
        per_char.append({"C": c_val, "M": m_val, "char": ch})
        decrypted_chars.append(ch)

    decrypted_text = "".join(decrypted_chars)

    return jsonify({
        "per_char": per_char,
        "decrypted_text": decrypted_text,
    })


def _factor_n(n: int):
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return i, n // i
    return 1, n


if __name__ == "__main__":
    app.run(debug=True)
