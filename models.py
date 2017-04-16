from sqlalchemy import ForeignKey
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker, relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float, Date, Boolean
from marshmallow_sqlalchemy import ModelSchema
from marshmallow import fields

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
    sites = relationship("Sites", back_populates="building")
    cpqs = relationship("CPQ", back_populates="building")

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
    sites = relationship("Sites", back_populates="account")
    opportunities = relationship("Opportunity", back_populates="account")
    services = relationship("Services", back_populates="account")

    def __repr__(self):
        return "<Accounts: " + self.account_id + ">"


class Sites(Base):
    __tablename__ = 'Sites'

    site_id = Column(String(120), primary_key=True)
    account_id = Column(String(120), ForeignKey('Accounts.account_id'))
    building_id = Column(String(120), ForeignKey('Building.building_id'))
    building = relationship("Building", back_populates="sites")
    account = relationship("Accounts", back_populates="sites")

    def __repr__(self):
        return "<Sites: " + self.site_id + ">"


class CPQ(Base):
    __tablename__ = 'CPQ'

    id = Column(Integer, primary_key=True)
    cpq_id = Column(String(120))
    account_id = Column(String(120), ForeignKey('Accounts.account_id'))
    created_date = Column(Date())
    product_group = Column(String(120))
    x36_mrc_list = Column(Float)
    x36_nrr_list = Column(Float)
    x36_npv_list = Column(Float)
    building_id = Column(String(120), ForeignKey('Building.building_id'))
    building = relationship("Building", back_populates="cpqs")

    def __repr__(self):
        return "<CPQ: " + self.cpq_id + ">"


class Opportunity(Base):
    __tablename__ = 'Opportunity'

    id = Column(Integer, primary_key=True)
    opportunity_id = Column(String(120))
    account_id = Column(String(120), ForeignKey('Accounts.account_id'))
    stage_name = Column(String(120))
    is_closed = Column(Boolean)
    is_won = Column(Boolean)
    created_date = Column(Date)
    terms_in_month = Column(Integer)
    service = Column(String(120))
    opportunity_type = Column(String(120))
    product_group = Column(String(120))
    building_id = Column(String(120), ForeignKey('Building.building_id'))
    account = relationship("Accounts", back_populates="opportunities")

    def __repr__(self):
        return "<Opportunity: " + self.opportunity_id + ">"


class Services(Base):
    __tablename__ = 'Services'

    service_id = Column(String(120), primary_key=True)
    account_id = Column(String(120), ForeignKey('Accounts.account_id'))
    total_mrr = Column(Float)
    netx_mrc = Column(Float)
    product_group = Column(String(120))
    status = Column(String(120))
    building_id = Column(String(120), ForeignKey('Building.building_id'))
    account = relationship("Accounts", back_populates="services")

# Schema


class AccountSchema(ModelSchema):
    class Meta:
        model = Accounts
    sites = fields.Nested("SitesSchema", many=True, exclude=('account',))
    opportunities = fields.Nested("OpportunitySchema", many=True, exclude=('account',))
    services = fields.Nested("ServiceSchema", many=True, exclude=('account',))


class SitesSchema(ModelSchema):
    class Meta:
        model = Sites
    account = fields.Nested(AccountSchema)
    building = fields.Nested("BuildingSchema")


class BuildingSchema(ModelSchema):
    class Meta:
        model = Building
    cpqs = fields.Nested("CPQSchema", many=True, exclude=('building',))
    sites = fields.Nested(SitesSchema, many=True, exclude=('account', 'building'))


class BuildingSchema2(ModelSchema):
    class Meta:
        model = Building


class AccountSchema2(ModelSchema):
    class Meta:
        model = Accounts


class CPQSchema(ModelSchema):
    class Meta:
        model = CPQ


class OpportunitySchema(ModelSchema):
    class Meta:
        model = Opportunity


class ServiceSchema(ModelSchema):
    class Meta:
        model = Services

# Create tables.
Base.metadata.create_all(bind=engine)
