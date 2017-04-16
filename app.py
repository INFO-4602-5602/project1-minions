# ----------------------------------------------------------------------------#
# Imports
# ----------------------------------------------------------------------------#

from flask import Flask, render_template, jsonify, send_from_directory
from models import db_session, Building, Accounts, Sites, BuildingSchema2, BuildingSchema, AccountSchema,\
    AccountSchema2, SitesSchema, CPQSchema, OpportunitySchema, ServiceSchema
import csv
import os
from re import sub
from decimal import Decimal
import sys

# ----------------------------------------------------------------------------#
# App Config.
# ----------------------------------------------------------------------------#

app = Flask(__name__)
app.config.from_object('config')


# Automatically tear down SQLAlchemy.
@app.teardown_request
def shutdown_session(exception=None):
    db_session.remove()


# ----------------------------------------------------------------------------#
# Controllers.
# ----------------------------------------------------------------------------#


def calculate_cpq_profit(r_list):
    d_profit = 0
    for r in r_list:
        d_profit += reduce((lambda x, y: x + y.x36_npv_list), r.cpqs, 0)
    return d_profit


@app.route('/building_profits/<market>')
def building_profits(market):
    result = Building().query.filter(Building.market == market) \
        .filter(Building.on_zayo_network_status == "Not on Zayo Network") \
        .all()
    bs = BuildingSchema2()
    building_profits_json = []
    for r in result:
        try:
            cpqs_building = r.cpqs
            b_json = bs.dump(r).data
            b_json[u'profit'] = 0
            for c in cpqs_building:
                if r.building_id in b_json:
                    b_json['profit'] += c.x36_npv_list
                else:
                    b_json['profit'] = c.x36_npv_list
            building_profits_json.append(b_json)
        except Exception as e:
            print "Unexpected Exception occurred while building profits json"+ str(e)

    return jsonify(result=building_profits_json)


@app.route('/account_profits/<market>')
def account_profits(market):
    result = Accounts().query.join(Sites, Accounts.account_id == Sites.account_id).join(Building, Building.building_id == Sites.building_id).filter(Building.market == market).filter(Building.on_zayo_network_status == 'Not on Zayo Network').all()
    acs = AccountSchema2()
    accounts_profits_json = []

    for account in result:
        try:
            acc_json = acs.dump(account).data
            acc_json[u'profit'] = 0
            acc_json[u'building_list'] = {}
            for site in account.sites:
                acc_json['building_list'][site.building.building_id] = str(site.building.latitude)+","+str(site.building.longitude)
                if len(site.building.cpqs) > 0:
                    for cpq in site.building.cpqs:
                        if cpq.account_id in acc_json:
                            acc_json['profit'] += cpq.x36_npv_list
                        else:
                            acc_json['profit'] = cpq.x36_npv_list
            accounts_profits_json.append(acc_json)
        except:
            print "Unexpected Exception occurred while building Accounts json"

    return jsonify(result=accounts_profits_json)


@app.route('/market_profits')
def market_profits():
    markets = ['Denver', 'Atlanta', 'Dallas']
    profits_json = {}
    for m in markets:
        result = Building().query.filter(Building.market == m) \
            .filter(Building.on_zayo_network_status == "Not on Zayo Network").all()
        profits_json[m] = calculate_cpq_profit(result)

    return jsonify(profits_json)


@app.route('/initialize')
def initialize():
    initialize_buildings()
    initialize_accounts()
    initialize_sites()
    initialize_cpq()
    initialize_opportunity()
    initialize_services()
    return render_template('pages/placeholder.home.html')


def initialize_buildings():
    bs = BuildingSchema()
    base_dir = os.path.dirname(os.path.realpath(__file__))
    with open(base_dir + os.path.sep + 'static' + os.path.sep + 'data' + os.path.sep + 'ZayoHackathonData_Buildings.csv', 'rU') as building_file:
        reader = csv.DictReader(building_file, ['building_id', 'market', 'street_address',
                                                'city', 'state', 'postal_code', 'longitude',
                                                'latitude', 'on_zayo_network_status',
                                                'net_classification', 'type', 'network_proximity',
                                                'estimated_build_cost'])
        next(reader)
        for l in reader:
            l["estimated_build_cost"] = Decimal(sub(r'[^\d.]', '', l["estimated_build_cost"]))
            try:
                b = bs.load(l, session=db_session, partial=True).data
                db_session.add(b)
            except:
                print "a data format exception occurred"
                l["postal_code"] = sub(r'[^\x00-\x7F]+', '', l["postal_code"])
                print l
                if not l["network_proximity"]:
                    l["network_proximity"] = 0
                if not l["latitude"]:
                    l["latitude"] = 0
                if not l["longitude"]:
                    l["longitude"] = 0
                b = bs.load(l, session=db_session, partial=True).data
                db_session.add(b)

    db_session.commit()


def initialize_accounts():
    acs = AccountSchema()
    base_dir = os.path.dirname(os.path.realpath(__file__))
    with open(base_dir + os.path.sep + 'static' + os.path.sep + 'data' + os.path.sep + 'ZayoHackathonData_Accounts.csv', 'rU') as account_file:
        reader = csv.DictReader(account_file, ['account_id', 'industry', 'vertical', 'total_brr', 'annual_revenue',
                                               'number_of_employees', 'dandb_revenue', 'dandb_total_employees'])
        next(reader)
        for l in reader:
            l["total_brr"] = Decimal(sub(r'[^\d.]', '', l["total_brr"]))
            l["annual_revenue"] = Decimal(sub(r'[^\d.]', '', l["annual_revenue"]))
            l["dandb_revenue"] = Decimal(sub(r'[^\d.]', '', l["dandb_revenue"]))
            try:
                b = acs.load(l, session=db_session, partial=True).data
                db_session.add(b)
            except:
                print "a data format exception occurred"
                print l

    db_session.commit()


def initialize_sites():
    ss = SitesSchema()
    base_dir = os.path.dirname(os.path.realpath(__file__))
    with open(base_dir + os.path.sep + 'static' + os.path.sep + 'data' + os.path.sep + 'ZayoHackathonData_Sites.csv', 'rU') as site_file:
        reader = csv.DictReader(site_file, ['site_id', 'account_id', 'building_id'])
        next(reader)
        for l in reader:
            del l[None]
            try:
                b = ss.load(l, session=db_session, partial=True).data
                b.account_id = l['account_id']
                b.building_id = l['building_id']
                db_session.add(b)
            except:
                print "a data format exception occurred"
                print l

    db_session.commit()


def initialize_cpq():
    cs = CPQSchema()
    base_dir = os.path.dirname(os.path.realpath(__file__))
    with open(base_dir + os.path.sep + 'static' + os.path.sep + 'data' + os.path.sep + 'ZayoHackathonData_CPQs.csv', 'rU') as cpq_file:
        reader = csv.DictReader(cpq_file, ['cpq_id', 'account_id', 'created_date', 'product_group', 'x36_mrc_list',
                                           'x36_nrr_list', 'x36_npv_list', 'building_id'])
        next(reader)
        for l in reader:
            if len(Accounts().query.filter(Accounts.account_id == l['account_id']).all()) == 0:
                continue
            del l[None]
            l['x36_mrc_list'] = Decimal(sub(r'[^\d.]', '', l['x36_mrc_list']))
            l['x36_nrr_list'] = Decimal(sub(r'[^\d.]', '', l['x36_nrr_list']))
            l['x36_npv_list'] = Decimal(sub(r'[^\d.]', '', l['x36_npv_list']))
            try:
                b = cs.load(l, session=db_session, partial=True).data
                b.account_id = l['account_id']
                b.building_id = l['building_id']
                db_session.add(b)
            except:
                print "a data format exception occurred"
                print l

    db_session.commit()


def initialize_opportunity():
    ops = OpportunitySchema()
    base_dir = os.path.dirname(os.path.realpath(__file__))
    with open(base_dir + os.path.sep + 'static' + os.path.sep + 'data' + os.path.sep + 'ZayoHackathonData_Opportunities.csv',
              'rU') as opportunity_file:
        reader = csv.DictReader(opportunity_file, ['opportunity_id', 'account_id', 'stage_name', 'is_closed',
                                                   'is_won', 'created_date', 'terms_in_month', 'service',
                                                   'opportunity_type', 'product_group', 'building_id'])
        next(reader)
        for l in reader:
            del l[None]
            if not l['terms_in_month']:
                l['terms_in_month'] = 0
            try:
                b = ops.load(l, session=db_session, partial=True).data
                if len(Accounts().query.filter(Accounts.account_id == l['account_id']).all()) == 0:
                    continue
                b.account_id = l['account_id']
                b.building_id = l['building_id']
                db_session.add(b)
            except:
                print "a data format exception occurred"
                print l

    db_session.commit()


def initialize_services():
    ss = ServiceSchema()
    base_dir = os.path.dirname(os.path.realpath(__file__))
    with open(base_dir + os.path.sep + 'static' + os.path.sep + 'data' + os.path.sep + 'ZayoHackathonData_Services.csv', 'rU') as services_file:
        reader = csv.DictReader(services_file, ['service_id', 'account_id', 'total_mrr', 'netx_mrc',
                                                'product_group', 'status', 'building_id'])
        next(reader)
        for l in reader:
            if not l['building_id'] or len(
                    Building().query.filter(Building.building_id == l['building_id']).all()) == 0:
                continue
            del l[None]
            l['total_mrr'] = Decimal(sub(r'[^\d.]', '', l['total_mrr']))
            l['netx_mrc'] = Decimal(sub(r'[^\d.]', '', l['netx_mrc']))
            try:
                b = ss.load(l, session=db_session).data
                b.account_id = l['account_id']
                b.building_id = l['building_id']
                db_session.add(b)
            except:
                print "a data format exception occurred"
                print l
        db_session.commit()


@app.route('/')
def home():
    return render_template('pages/placeholder.home.html')


@app.route('/about')
def about():
    return render_template('pages/placeholder.about.html')


# Error handlers.


@app.errorhandler(500)
def internal_error(error):
    db_session.rollback()
    return render_template('errors/500.html'), 500


@app.errorhandler(404)
def not_found_error(error):
    return render_template('errors/404.html'), 404


"""
if not app.debug:
    file_handler = FileHandler('error.log')
    file_handler.setFormatter(
        Formatter('%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]')
    )
    app.logger.setLevel(logging.INFO)
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.info('errors')
"""
# ----------------------------------------------------------------------------#
# Launch.
# ----------------------------------------------------------------------------#

# Default port:
if __name__ == '__main__':
    app.run()

# Or specify port manually:
'''
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
'''
