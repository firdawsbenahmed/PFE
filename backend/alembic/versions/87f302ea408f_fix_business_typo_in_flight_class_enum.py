from alembic import op
import sqlalchemy as sa

revision: str = '87f302ea408f'
down_revision = 'ecacf57b0681'
branch_labels = None
depends_on = None

def upgrade():
    op.execute("ALTER TABLE flight_class ALTER COLUMN flight_class TYPE VARCHAR")
    op.execute("DROP TYPE IF EXISTS flight_class_enum")
    op.execute("CREATE TYPE flight_class_enum AS ENUM ('economy', 'business', 'first')")
    op.execute("""
        ALTER TABLE flight_class 
        ALTER COLUMN flight_class TYPE flight_class_enum 
        USING flight_class::text::flight_class_enum
    """)

def downgrade():
    op.execute("ALTER TABLE flight_class ALTER COLUMN flight_class TYPE VARCHAR")
    op.execute("DROP TYPE IF EXISTS flight_class_enum")
    op.execute("CREATE TYPE flight_class_enum AS ENUM ('economy', 'buisness', 'first')")
    op.execute("""
        ALTER TABLE flight_class 
        ALTER COLUMN flight_class TYPE flight_class_enum 
        USING flight_class::text::flight_class_enum
    """)