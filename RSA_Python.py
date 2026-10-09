from math import gcd, isqrt
import random


def karatsuba(x, y):
    if x < 1024 or y < 1024:
        return x * y

    n = max(x.bit_length(), y.bit_length())
    m = n // 2

    mask = (1 << m) - 1
    x1, x0 = x >> m, x & mask
    y1, y0 = y >> m, y & mask

    z2 = karatsuba(x1, y1)
    z0 = karatsuba(x0, y0)
    z1 = karatsuba(x1 + x0, y1 + y0) - z2 - z0

    return (z2 << (2 * m)) + (z1 << m) + z0


def is_prime(n):
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
    for x in range(1, m):
        if karatsuba(a, x) % m == 1:
            return x
    return -1


def generate_keypair(keysize):
    nMin = 1 << (keysize - 1)
    nMax = (1 << keysize) - 1

    start = 1 << (keysize // 2 - 1)
    stop = 1 << (keysize // 2 + 1)

    if start >= stop:
        raise ValueError("Key size too small to generate distinct primes.")

    primes = [n for n in range(start, stop + 1) if is_prime(n)]

    p = q = 0
    candidates = list(primes)
    random.shuffle(candidates)
    for candidate_p in candidates:
        q_values = [
            candidate_q for candidate_q in primes
            if candidate_q != candidate_p
            and nMin <= karatsuba(candidate_p, candidate_q) <= nMax
        ]
        if q_values:
            p = candidate_p
            q = random.choice(q_values)
            break

    if p == 0:
        raise ValueError("Could not find suitable prime pair for the given key size.")

    n = karatsuba(p, q)
    phi = karatsuba(p - 1, q - 1)

    while True:
        e = random.randrange(2, phi)
        if gcd(e, phi) == 1:
            d = mod_inverse(e, phi)
            if d != -1 and e != d:
                break

    return (e, n), (d, n)


def encrypt(plaintext, public_key):
    e, n = public_key
    return [pow(ord(c), e, n) for c in plaintext]


def decrypt(ciphertext, private_key):
    d, n = private_key
    return ''.join(chr(pow(c, d, n)) for c in ciphertext)


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
