from math import gcd, isqrt
import random


def is_prime(n):
    """Return True if n is a prime number, False otherwise."""
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    for i in range(3, isqrt(n) + 1, 2):
        if n % i == 0:
            return False
    return True


def mod_inverse(a, m):
    """Return the modular inverse of a mod m, or -1 if none exists."""
    for x in range(1, m):
        if (a * x) % m == 1:
            return x
    return -1


def generate_keypair(keysize):
    """
    Generate an RSA public/private key pair for a key of the given bit length.

    Returns:
        ((e, n), (d, n)) — public key and private key as tuples.
    """
    nMin = 1 << (keysize - 1)
    nMax = (1 << keysize) - 1

    # Select p and q from a range that keeps their bit lengths similar,
    # making n harder to factor.
    start = 1 << (keysize // 2 - 1)
    stop  = 1 << (keysize // 2 + 1)

    if start >= stop:
        raise ValueError("Key size too small to generate distinct primes.")

    primes = [n for n in range(start, stop + 1) if is_prime(n)]

    # Find a valid (p, q) pair whose product falls within [nMin, nMax].
    p = q = 0
    candidates = list(primes)
    random.shuffle(candidates)
    for candidate_p in candidates:
        q_values = [
            candidate_q for candidate_q in primes
            if candidate_q != candidate_p
            and nMin <= candidate_p * candidate_q <= nMax
        ]
        if q_values:
            p = candidate_p
            q = random.choice(q_values)
            break

    if p == 0:
        raise ValueError("Could not find suitable prime pair for the given key size.")

    n   = p * q
    phi = (p - 1) * (q - 1)

    # Find public exponent e: 1 < e < phi(n), gcd(e, phi(n)) = 1.
    # Derive private exponent d as the modular inverse of e mod phi(n).
    while True:
        e = random.randrange(2, phi)
        if gcd(e, phi) == 1:
            d = mod_inverse(e, phi)
            if d != -1 and e != d:
                break

    # Public key: (e, n)  |  Private key: (d, n)
    return (e, n), (d, n)


def encrypt(plaintext, public_key):
    """Encrypt a plaintext string using the given public key."""
    e, n = public_key
    return [pow(ord(c), e, n) for c in plaintext]


def decrypt(ciphertext, private_key):
    """Decrypt a list of ciphertext integers using the given private key."""
    d, n = private_key
    return ''.join(chr(pow(c, d, n)) for c in ciphertext)


# -----------------------------------------------------------------------------
# Driver
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    bit_length = int(input("Enter bit length: "))
    keysize = 2 ** bit_length

    print("Generating RSA key pair...")
    public_key, private_key = generate_keypair(keysize)
    print(f"  Public Key:  {public_key}")
    print(f"  Private Key: {private_key}")

    message = input("Enter message: ")

    encrypted = encrypt(message, public_key)
    print(f"Encrypted: {' '.join(map(str, encrypted))}")

    decrypted = decrypt(encrypted, private_key)
    print(f"Decrypted: {decrypted}")
