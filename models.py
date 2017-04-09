from sqlalchemy import ForeignKey
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


class Accounts(Base):
    __tablename__ = 'Accounts'

    account_id = Column(String(120), primary_key=True)
    industry = Column(String(120))
    vertical = Column(String(120))
    total_brr = Column(Float)
    annual_revenue = Column(Float)
    number_of_employees = Column(Integer)
    dandb_revenue = Column(Float)
    dandb_total_employees = Column(Integer)

    def __repr__(self):
        return "<Accounts: " + self.account_id + ">"


class Sites(Base):
    __tablename__ = 'Sites'

    site_id = Column(String(120), primary_key=True)
    account_id = Column(String(120), ForeignKey('Accounts.account_id'))
    building_id = Column(String(120), ForeignKey('Building.building_id'))

    def __repr__(self):
        return "<Sites: " + self.site_id + ">"


# Schema

class BuildingSchema(ModelSchema):
    class Meta:
        model = Building


class AccountSchema(ModelSchema):
    class Meta:
        model = Accounts


class SitesSchema(ModelSchema):
    class Meta:
        model = Sites


# Create tables.
Base.metadata.create_all(bind=engine)