import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from server import app
from database.database import get_db
from database.models import Base

# DB Test
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_api.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    # Setup test db
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    # Teardown test db
    session.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        yield db_session
    # Override the fastApi dependency
    app.dependency_overrides[get_db] = override_get_db
    # Désactiver le limiteur de débit slowapi pour les tests
    app.state.limiter.enabled = False
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
