from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL

url = URL.create('postgresql', username='postgres', password='Luwang2006@', host='localhost', port='5432', database='postgres')
e = create_engine(url)
with e.connect() as conn:
    result = conn.execute(text(
        "SELECT pg_terminate_backend(pid) FROM pg_stat_activity "
        "WHERE pid != pg_backend_pid() AND state = 'idle'"
    ))
    terminated = result.fetchall()
    print(f"Terminated {len(terminated)} stale idle connections.")
