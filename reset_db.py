from sqlalchemy import create_engine, text
import os
from sqlalchemy.engine import URL

# Setup Connection
DB_USER = os.environ.get('DB_USER', 'postgres')
DB_PASS = os.environ.get('DB_PASS', 'Luwang2006@')
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_PORT = os.environ.get('DB_PORT', '5432')
DB_NAME = os.environ.get('DB_NAME', 'postgres')

db_url = URL.create("postgresql", username=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT, database=DB_NAME)
engine = create_engine(db_url)

print("Clearing database tables...")
with engine.begin() as conn:
    # CASCADE safely handles foreign key dependencies between tables
    conn.execute(text("TRUNCATE TABLE spatial_conflicts CASCADE;"))
    conn.execute(text("TRUNCATE TABLE ai_buildings CASCADE;"))
    conn.execute(text("TRUNCATE TABLE revenue_records CASCADE;"))
    conn.execute(text("TRUNCATE TABLE cadastral_plots CASCADE;"))
    conn.execute(text("TRUNCATE TABLE municipal_layers CASCADE;"))
    conn.execute(text("TRUNCATE TABLE utility_lines CASCADE;"))
    conn.execute(text("TRUNCATE TABLE gt_surveys CASCADE;"))
    conn.execute(text("TRUNCATE TABLE gnss_cors CASCADE;"))
    conn.execute(text("DROP TABLE IF EXISTS topology_metrics;"))

print("✅ Database cleared cleanly! Ready for fresh test inputs.")