from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float
from marshmallow_sqlalchemy import ModelSchema

engine = create_engine('mysql+pymysql://root:root@localhost:3306/zayo', echo=False)
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))
Base = declarative_base()
Base.query = db_session.query_property()


# Models


class Building(Base):
    __tablename__ = 'Building'

    building_id = Column(String(120), primary_key=True)
    market = Column(String(120))
    street_address = Column(String(120))
    city = Column(String(120))
    state = Column(String(120))
    postal_code = Column(String(120), nullable=True)
    longitude = Column(Float)
    latitude = Column(Float)
    on_zayo_network_status = Column(String(120))
    net_classification = Column(String(120))
    type = Column(String(120))
    network_proximity = Column(Float)
    estimated_build_cost = Column(Float)

    def __repr__(self):
        return "<Building: " + self.building_id + ">"


# Schema

class BuildingSchema(ModelSchema):
    class Meta:
        model = Building


# Create tables.
Base.metadata.create_all(bind=engine)
