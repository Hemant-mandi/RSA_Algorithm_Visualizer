# RSA-Python

A Python implementation of the RSA public-key cryptosystem, demonstrating key generation, encryption, and decryption from scratch using only the standard library.


## Algorithm Overview

RSA is an asymmetric cryptographic algorithm based on the mathematical difficulty of factoring large integers.

| Step | Description |
|------|-------------|
| 1 | Choose two large primes $p$ and $q$ |
| 2 | Compute $n = pq$ and $\varphi(n) = (p-1)(q-1)$ |
| 3 | Select public exponent $e$ such that $1 < e < \varphi(n)$ and $\gcd(e,\, \varphi(n)) = 1$ |
| 4 | Compute private exponent $d$ such that $de \equiv 1 \pmod{\varphi(n)}$ |
| 5 | **Encrypt:** $c \equiv m^e \pmod{n}$ |
| 6 | **Decrypt:** $m \equiv c^d \pmod{n}$ |

The public key is the pair $(e, n)$ and the private key is $(d, n)$.

---

## Requirements

- Python 3.8 or higher
- No third-party packages — only the standard library (`math`, `random`)

---

## Usage

```bash
python RSA_Python.py
```

You will be prompted for:

1. **Bit length** — controls the size of the key (e.g., enter `4` for a 16-bit key; higher values are more secure but slower for this prototype)
2. **Message** — the plaintext string to encrypt and decrypt

### Example Session

```
Enter bit_length: 4
Running RSA...
Generating public/private keypair...
Public Key:  (e, n)
Private Key: (d, n)
Write msg: hello
Encrypted msg: 12345 67890 ...
Decrypted msg: hello
```

---

## Project Structure

```
RSA-Python/
├── RSA_Python.py   # Core implementation (key generation, encrypt, decrypt)
├── requirements.txt
└── README.md
```

---

## Notes

- This is an **educational prototype**. It is not suitable for production use.
- The `mod_inverse` function uses a brute-force search, which is acceptable for small key sizes demonstrated here.
- For real-world RSA, use a well-audited library such as [`cryptography`](https://cryptography.io).
