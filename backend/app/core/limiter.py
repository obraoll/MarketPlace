"""
Instance SlowAPI : n’utilise pas de limite par défaut sur toutes les routes sans middleware
(les routes à limiter peuvent être décorées avec @limiter.limit plus tard).
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
