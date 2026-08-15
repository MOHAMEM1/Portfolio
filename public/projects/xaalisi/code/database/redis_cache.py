import redis # pyright: ignore [missing-import]

class RedisCache:
    def __init__(self, host='localhost', port=6379, db=0):
        self.client = redis.Redis(host=host, port=port, db=db, decode_responses=True)

    def set_session(self, token, user_id, expiry=3600):
        self.client.setex(f"session:{token}", expiry, str(user_id))

    def get_session(self, token):
        return self.client.get(f"session:{token}")

    def cache_balance(self, wallet_id, balance):
        self.client.set(f"balance:{wallet_id}", balance)

    def get_cached_balance(self, wallet_id):
        return self.client.get(f"balance:{wallet_id}")
